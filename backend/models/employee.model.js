const { EMPLOYEE_STATUS_ACTIVE } = require('../common/constants');
const { query } = require('../common/db');

const employeeSelect = `
  SELECT
    nv.MaNV AS id,
    nv.MaND AS userId,
    nv.HoTen AS fullName,
    nv.SDT AS phone,
    nv.Email AS email,
    nv.ChucVu AS role,
    nv.TrangThai AS status,
    nd.MatKhau AS password,
    nv.CreatedAt AS createdAt,
    nv.UpdatedAt AS updatedAt
  FROM NhanVien nv
  LEFT JOIN NguoiDung nd ON nd.MaND = nv.MaND
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(nv.MaNV LIKE ? OR nv.HoTen LIKE ? OR nv.Email LIKE ? OR nv.SDT LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword);
  }

  if (filters.role) {
    conditions.push('nv.ChucVu = ?');
    params.push(filters.role);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${employeeSelect} ${whereClause} ORDER BY nv.CreatedAt DESC, nv.MaNV DESC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${employeeSelect}
      WHERE nv.MaNV = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByUserId(userId) {
  const rows = await query(
    `
      ${employeeSelect}
      WHERE nv.MaND = ?
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] || null;
}

async function findByCredential(identifier) {
  const rows = await query(
    `
      ${employeeSelect}
      WHERE nv.Email = ? OR nv.SDT = ? OR nd.TenDangNhap = ?
      LIMIT 1
    `,
    [identifier, identifier, identifier],
  );

  return rows[0] || null;
}

async function create(payload) {
  await query(
    `
      INSERT INTO NhanVien (
        MaNV,
        MaND,
        HoTen,
        SDT,
        Email,
        ChucVu,
        TrangThai
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.userId,
      payload.fullName,
      payload.phone,
      payload.email,
      payload.role,
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
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaNV = ?
    `,
    [
      payload.fullName,
      payload.phone,
      payload.email,
      payload.role,
      payload.status || EMPLOYEE_STATUS_ACTIVE,
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  const emp = await findById(id);
  await query('DELETE FROM NhanVien WHERE MaNV = ?', [id]);
  if (emp?.userId) {
    await query('DELETE FROM NguoiDung WHERE MaND = ?', [emp.userId]);
  }
}

module.exports = {
  findAll,
  findById,
  findByUserId,
  findByCredential,
  create,
  update,
  remove,
};
