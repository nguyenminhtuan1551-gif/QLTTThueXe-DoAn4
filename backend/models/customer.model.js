const { query } = require('../common/db');

const customerSelect = `
  SELECT
    kh.MaKH AS id,
    kh.MaND AS userId,
    kh.HoTen AS fullName,
    kh.CCCD AS cccd,
    kh.SDT AS phone,
    kh.Email AS email,
    kh.DiaChi AS address,
    kh.BangLai AS driverLicense,
    nd.MatKhau AS password,
    kh.CreatedAt AS createdAt,
    kh.UpdatedAt AS updatedAt
  FROM KhachHang kh
  LEFT JOIN NguoiDung nd ON nd.MaND = kh.MaND
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(kh.MaKH LIKE ? OR kh.HoTen LIKE ? OR kh.CCCD LIKE ? OR kh.SDT LIKE ? OR kh.Email LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${customerSelect} ${whereClause} ORDER BY kh.CreatedAt DESC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${customerSelect}
      WHERE kh.MaKH = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByUserId(userId) {
  const rows = await query(
    `
      ${customerSelect}
      WHERE kh.MaND = ?
      LIMIT 1
    `,
    [userId],
  );

  return rows[0] || null;
}

async function findByEmail(email) {
  const rows = await query(
    `
      ${customerSelect}
      WHERE kh.Email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] || null;
}

async function findByCredential(identifier) {
  const rows = await query(
    `
      ${customerSelect}
      WHERE kh.Email = ? OR kh.SDT = ? OR nd.TenDangNhap = ?
      LIMIT 1
    `,
    [identifier, identifier, identifier],
  );

  return rows[0] || null;
}

async function findByLookup({ contractId, cccd, phone }) {
  const rows = await query(
    `
      SELECT
        kh.MaKH AS id,
        kh.HoTen AS fullName,
        kh.CCCD AS cccd,
        kh.SDT AS phone,
        kh.Email AS email,
        kh.DiaChi AS address,
        kh.BangLai AS driverLicense
      FROM KhachHang kh
      INNER JOIN HopDongThue hd ON hd.MaKH = kh.MaKH
      WHERE hd.MaHD = ? OR kh.CCCD = ? OR kh.SDT = ?
      LIMIT 1
    `,
    [contractId || '', cccd || '', phone || ''],
  );

  return rows[0] || null;
}

async function create(payload) {
  await query(
    `
      INSERT INTO KhachHang (
        MaKH,
        MaND,
        HoTen,
        CCCD,
        SDT,
        Email,
        DiaChi,
        BangLai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.userId || null,
      payload.fullName,
      payload.cccd || null,
      payload.phone,
      payload.email,
      payload.address || null,
      payload.driverLicense || null,
    ],
  );

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE KhachHang
      SET
        HoTen = ?,
        CCCD = ?,
        SDT = ?,
        Email = ?,
        DiaChi = ?,
        BangLai = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaKH = ?
    `,
    [
      payload.fullName,
      payload.cccd || null,
      payload.phone,
      payload.email,
      payload.address || null,
      payload.driverLicense || null,
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  const cust = await findById(id);
  await query('DELETE FROM KhachHang WHERE MaKH = ?', [id]);
  if (cust?.userId) {
    await query('DELETE FROM NguoiDung WHERE MaND = ?', [cust.userId]);
  }
}

async function findRentalHistory(id) {
  return query(
    `
      SELECT
        hd.MaHD AS id,
        hd.NgayThue AS startDate,
        hd.NgayTraDuKien AS expectedReturnDate,
        hd.TienCoc AS deposit,
        hd.TongTien AS totalAmount,
        hd.TrangThai AS status,
        xe.MaXe AS carId,
        xe.TenXe AS carName,
        xe.BienSo AS carPlate,
        xe.HinhAnh AS carImage
      FROM HopDongThue hd
      INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
      WHERE hd.MaKH = ?
      ORDER BY hd.NgayThue DESC
    `,
    [id],
  );
}

module.exports = {
  findAll,
  findById,
  findByUserId,
  findByEmail,
  findByCredential,
  findByLookup,
  findRentalHistory,
  create,
  update,
  remove,
};
