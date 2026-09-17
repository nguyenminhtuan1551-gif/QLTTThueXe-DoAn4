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
    [result.insertId],
  );

  return rows[0] || null;
}

module.exports = {
  findAll,
  create,
};
