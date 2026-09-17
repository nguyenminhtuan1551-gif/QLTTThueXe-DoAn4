const { query } = require('../common/db');

const maintenanceSelect = `
  SELECT
    bt.MaBaoTri AS id,
    bt.MaXe AS carId,
    xe.TenXe AS carName,
    xe.BienSo AS carPlate,
    bt.NgayBaoTri AS date,
    bt.NoiDung AS content,
    bt.ChiPhi AS cost,
    bt.TrangThai AS status
  FROM BaoTri bt
  INNER JOIN Xe xe ON xe.MaXe = bt.MaXe
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(bt.MaBaoTri LIKE ? OR bt.MaXe LIKE ? OR xe.TenXe LIKE ? OR xe.BienSo LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword);
  }

  if (filters.status) {
    conditions.push('bt.TrangThai = ?');
    params.push(filters.status);
  }

  if (filters.carId) {
    conditions.push('bt.MaXe = ?');
    params.push(filters.carId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${maintenanceSelect} ${whereClause} ORDER BY bt.NgayBaoTri DESC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${maintenanceSelect}
      WHERE bt.MaBaoTri = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByCarId(carId) {
  return query(
    `
      ${maintenanceSelect}
      WHERE bt.MaXe = ?
      ORDER BY bt.NgayBaoTri DESC
    `,
    [carId],
  );
}

async function create(payload) {
  await query(
    `
      INSERT INTO BaoTri (
        MaBaoTri,
        MaXe,
        NgayBaoTri,
        NoiDung,
        ChiPhi,
        TrangThai
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.carId,
      payload.date,
      payload.content,
      payload.cost,
      payload.status,
    ],
  );

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE BaoTri
      SET
        MaXe = ?,
        NgayBaoTri = ?,
        NoiDung = ?,
        ChiPhi = ?,
        TrangThai = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaBaoTri = ?
    `,
    [
      payload.carId,
      payload.date,
      payload.content,
      payload.cost,
      payload.status,
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM BaoTri WHERE MaBaoTri = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  findByCarId,
  create,
  update,
  remove,
};
