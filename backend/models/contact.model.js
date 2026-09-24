const { query } = require('../common/db');

async function findAll() {
  return query(
    `
      SELECT
        MaLH AS id,
        HoTen AS fullName,
        SDT AS phone,
        Email AS email,
        NoiDung AS message,
        TrangThai AS status,
        CreatedAt AS createdAt
      FROM LienHe
      ORDER BY CreatedAt DESC
    `,
  );
}

async function findById(id) {
  const rows = await query(
    `
      SELECT
        MaLH AS id,
        HoTen AS fullName,
        SDT AS phone,
        Email AS email,
        NoiDung AS message,
        TrangThai AS status,
        CreatedAt AS createdAt
      FROM LienHe
      WHERE MaLH = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function create(payload) {
  const result = await query(
    `
      INSERT INTO LienHe (
        HoTen,
        SDT,
        Email,
        NoiDung,
        TrangThai
      ) VALUES (?, ?, ?, ?, 'Mới')
    `,
    [payload.fullName, payload.phone, payload.email, payload.message],
  );

  return findById(result.insertId);
}

async function updateStatus(id, status) {
  await query(
    `
      UPDATE LienHe
      SET TrangThai = ?
      WHERE MaLH = ?
    `,
    [status, id],
  );

  return findById(id);
}

module.exports = {
  findAll,
  findById,
  create,
  updateStatus,
};
