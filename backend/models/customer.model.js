const { query } = require('../common/db');

const customerSelect = `
  SELECT
    MaKH AS id,
    HoTen AS fullName,
    CCCD AS cccd,
    SDT AS phone,
    Email AS email,
    DiaChi AS address,
    BangLai AS driverLicense,
    CreatedAt AS createdAt,
    UpdatedAt AS updatedAt
  FROM KhachHang
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(MaKH LIKE ? OR HoTen LIKE ? OR CCCD LIKE ? OR SDT LIKE ? OR Email LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${customerSelect} ${whereClause} ORDER BY CreatedAt DESC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${customerSelect}
      WHERE MaKH = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByEmail(email) {
  const rows = await query(
    `
      SELECT
        MaKH AS id,
        HoTen AS fullName,
        CCCD AS cccd,
        SDT AS phone,
        Email AS email,
        DiaChi AS address,
        BangLai AS driverLicense,
        MatKhau AS password
      FROM KhachHang
      WHERE Email = ?
      LIMIT 1
    `,
    [email],
  );

  return rows[0] || null;
}

async function findByCredential(identifier) {
  const rows = await query(
    `
      SELECT
        MaKH AS id,
        HoTen AS fullName,
        CCCD AS cccd,
        SDT AS phone,
        Email AS email,
        DiaChi AS address,
        BangLai AS driverLicense,
        MatKhau AS password
      FROM KhachHang
      WHERE Email = ? OR SDT = ?
      LIMIT 1
    `,
    [identifier, identifier],
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
        HoTen,
        CCCD,
        SDT,
        Email,
        MatKhau,
        DiaChi,
        BangLai
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.fullName,
      payload.cccd || null,
      payload.phone,
      payload.email,
      payload.password,
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
        MatKhau = COALESCE(?, MatKhau),
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
      payload.password || null,
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM KhachHang WHERE MaKH = ?', [id]);
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
  findByEmail,
  findByCredential,
  findByLookup,
  findRentalHistory,
  create,
  update,
  remove,
};
