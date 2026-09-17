const { EMPLOYEE_STATUS_ACTIVE } = require('../common/constants');
const { query } = require('../common/db');

const employeeSelect = `
  SELECT
    MaNV AS id,
    HoTen AS fullName,
    SDT AS phone,
    Email AS email,
    ChucVu AS role,
    TrangThai AS status,
    CreatedAt AS createdAt,
    UpdatedAt AS updatedAt
  FROM NhanVien
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(MaNV LIKE ? OR HoTen LIKE ? OR Email LIKE ? OR SDT LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword);
  }

  if (filters.role) {
    conditions.push('ChucVu = ?');
    params.push(filters.role);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${employeeSelect} ${whereClause} ORDER BY CreatedAt DESC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${employeeSelect}
      WHERE MaNV = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByCredential(identifier) {
  const rows = await query(
    `
      SELECT
        MaNV AS id,
        HoTen AS fullName,
        SDT AS phone,
        Email AS email,
        ChucVu AS role,
        TrangThai AS status,
        MatKhau AS password
      FROM NhanVien
      WHERE Email = ? OR SDT = ?
      LIMIT 1
    `,
    [identifier, identifier],
  );

  return rows[0] || null;
}

async function create(payload) {
  await query(
    `
      INSERT INTO NhanVien (
        MaNV,
        HoTen,
        SDT,
        Email,
        ChucVu,
        MatKhau,
        TrangThai
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.fullName,
      payload.phone,
      payload.email,
      payload.role,
      payload.password,
      payload.status || EMPLOYEE_STATUS_ACTIVE,
    ],
  );

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE NhanVien
      SET
        HoTen = ?,
        SDT = ?,
        Email = ?,
        ChucVu = ?,
        TrangThai = ?,
        MatKhau = COALESCE(?, MatKhau),
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaNV = ?
    `,
    [
      payload.fullName,
      payload.phone,
      payload.email,
      payload.role,
      payload.status || EMPLOYEE_STATUS_ACTIVE,
      payload.password || null,
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM NhanVien WHERE MaNV = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  findByCredential,
  create,
  update,
  remove,
};
