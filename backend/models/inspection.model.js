const {
  INSPECTION_STATUS_EXPIRED,
  INSPECTION_STATUS_EXPIRING,
} = require('../common/constants');
const { query } = require('../common/db');

const inspectionSelect = `
  SELECT
    dk.MaDK AS id,
    dk.MaXe AS carId,
    xe.TenXe AS carName,
    xe.BienSo AS carPlate,
    dk.NgayDK AS inspectionDate,
    dk.HanDK AS expiryDate,
    dk.TrangThai AS status,
    dk.GhiChu AS notes
  FROM DangKiem dk
  INNER JOIN Xe xe ON xe.MaXe = dk.MaXe
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(dk.MaDK LIKE ? OR dk.MaXe LIKE ? OR xe.TenXe LIKE ? OR xe.BienSo LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword);
  }

  if (filters.status) {
    conditions.push('dk.TrangThai = ?');
    params.push(filters.status);
  }

  if (filters.carId) {
    conditions.push('dk.MaXe = ?');
    params.push(filters.carId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${inspectionSelect} ${whereClause} ORDER BY dk.HanDK ASC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${inspectionSelect}
      WHERE dk.MaDK = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByCarId(carId) {
  return query(
    `
      ${inspectionSelect}
      WHERE dk.MaXe = ?
      ORDER BY dk.HanDK DESC
    `,
    [carId],
  );
}

async function findExpiring() {
  return query(
    `
      ${inspectionSelect}
      WHERE dk.TrangThai IN (?, ?)
      ORDER BY dk.HanDK ASC
    `,
    [INSPECTION_STATUS_EXPIRING, INSPECTION_STATUS_EXPIRED],
  );
}

async function create(payload) {
  await query(
    `
      INSERT INTO DangKiem (
        MaDK,
        MaXe,
        NgayDK,
        HanDK,
        TrangThai,
        GhiChu
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.carId,
      payload.inspectionDate,
      payload.expiryDate,
      payload.status,
      payload.notes || '',
    ],
  );

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE DangKiem
      SET
        MaXe = ?,
        NgayDK = ?,
        HanDK = ?,
        TrangThai = ?,
        GhiChu = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaDK = ?
    `,
    [
      payload.carId,
      payload.inspectionDate,
      payload.expiryDate,
      payload.status,
      payload.notes || '',
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM DangKiem WHERE MaDK = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  findByCarId,
  findExpiring,
  create,
  update,
  remove,
};
