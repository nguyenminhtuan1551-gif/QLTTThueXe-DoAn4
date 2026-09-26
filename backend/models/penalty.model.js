const { query } = require('../common/db');

const penaltySelect = `
  SELECT
    pp.MaPP AS id,
    pp.MaTraXe AS returnId,
    kh.HoTen AS customerName,
    xe.TenXe AS carName,
    xe.BienSo AS carPlate,
    tx.NgayTraXe AS returnDate,
    pp.LoaiPhiPhat AS type,
    pp.SoTienPhat AS amount,
    pp.GhiChu AS notes,
    pp.CreatedAt AS createdAt
  FROM PhiPhat pp
  INNER JOIN TraXe tx ON tx.MaTraXe = pp.MaTraXe
  INNER JOIN HopDongThue hd ON hd.MaHD = tx.MaHD
  INNER JOIN KhachHang kh ON kh.MaKH = hd.MaKH
  INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(pp.MaPP LIKE ? OR pp.MaTraXe LIKE ? OR kh.HoTen LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword);
  }

  if (filters.type) {
    conditions.push('pp.LoaiPhiPhat = ?');
    params.push(filters.type);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${penaltySelect} ${whereClause} ORDER BY pp.CreatedAt DESC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${penaltySelect}
      WHERE pp.MaPP = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByReturnId(returnId) {
  return query(
    `
      ${penaltySelect}
      WHERE pp.MaTraXe = ?
      ORDER BY pp.CreatedAt ASC
    `,
    [returnId],
  );
}

async function create(payload) {
  await query(
    `
      INSERT INTO PhiPhat (
        MaPP,
        MaTraXe,
        LoaiPhiPhat,
        SoTienPhat,
        GhiChu
      ) VALUES (?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.returnId,
      payload.type,
      payload.amount,
      payload.notes || '',
    ],
  );

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE PhiPhat
      SET
        MaTraXe = ?,
        LoaiPhiPhat = ?,
        SoTienPhat = ?,
        GhiChu = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaPP = ?
    `,
    [
      payload.returnId,
      payload.type,
      payload.amount,
      payload.notes || '',
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM PhiPhat WHERE MaPP = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  findByReturnId,
  create,
  update,
  remove,
};
