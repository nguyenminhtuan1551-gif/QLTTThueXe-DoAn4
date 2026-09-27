const { query } = require('../common/db');

const userSelect = `
  SELECT
    nd.MaND AS id,
    nd.TenDangNhap AS username,
    nd.VaiTro AS role,
    nd.PhanVung AS scope,
    nd.TrangThai AS status,
    nd.CreatedAt AS createdAt,
    nd.UpdatedAt AS updatedAt
  FROM NguoiDung nd
`;

async function findById(id) {
  const rows = await query(
    `
      ${userSelect}
      WHERE nd.MaND = ?
      LIMIT 1
    `,
    [id],
  );
  return rows[0] || null;
}

async function findByUsername(username) {
  const rows = await query(
    `
      SELECT
        nd.MaND AS id,
        nd.TenDangNhap AS username,
        nd.MatKhau AS password,
        nd.VaiTro AS role,
        nd.PhanVung AS scope,
        nd.TrangThai AS status
      FROM NguoiDung nd
      WHERE nd.TenDangNhap = ?
      LIMIT 1
    `,
    [username],
  );
  return rows[0] || null;
}

async function create({ id, username, password, role, scope, status = 'Đang hoạt động' }) {
  await query(
    `
      INSERT INTO NguoiDung (
        MaND,
        TenDangNhap,
        MatKhau,
        VaiTro,
        PhanVung,
        TrangThai
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
    [id, username, password, role, scope, status],
  );
  return findById(id);
}

async function updatePassword(id, hashedPassword) {
  await query(
    `
      UPDATE NguoiDung
      SET MatKhau = ?, UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaND = ?
    `,
    [hashedPassword, id],
  );
}

async function updateStatus(id, status) {
  await query(
    `
      UPDATE NguoiDung
      SET TrangThai = ?, UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaND = ?
    `,
    [status, id],
  );
}

async function updateUsername(id, username) {
  await query(
    `
      UPDATE NguoiDung
      SET TenDangNhap = ?, UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaND = ?
    `,
    [username, id],
  );
}

async function remove(id) {
  await query('DELETE FROM NguoiDung WHERE MaND = ?', [id]);
}

module.exports = {
  findById,
  findByUsername,
  create,
  updatePassword,
  updateStatus,
  updateUsername,
  remove,
};
