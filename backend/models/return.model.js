const { query } = require('../common/db');

const returnSelect = `
  SELECT
    tx.MaTraXe AS id,
    tx.MaHD AS contractId,
    kh.HoTen AS customerName,
    xe.TenXe AS carName,
    xe.BienSo AS carPlate,
    tx.NgayTraXe AS actualReturnDate,
    tx.TinhTrangXe AS carCondition,
    tx.HinhThucThanhToan AS paymentMethod,
    tx.SoNgayThueThucTe AS actualDays,
    tx.TongTienThue AS totalRent,
    tx.TienCoc AS deposit,
    COALESCE(pp.penaltyFee, 0) AS penaltyFee,
    tx.SoTienConLai AS remaining,
    tx.TongTienThanhToan AS totalPayment,
    tx.GhiChu AS notes
  FROM TraXe tx
  INNER JOIN HopDongThue hd ON hd.MaHD = tx.MaHD
  INNER JOIN KhachHang kh ON kh.MaKH = hd.MaKH
  INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
  LEFT JOIN (
    SELECT MaTraXe, SUM(SoTienPhat) AS penaltyFee
    FROM PhiPhat
    GROUP BY MaTraXe
  ) pp ON pp.MaTraXe = tx.MaTraXe
`;

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(tx.MaTraXe LIKE ? OR tx.MaHD LIKE ? OR kh.HoTen LIKE ? OR xe.TenXe LIKE ? OR xe.BienSo LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(`${returnSelect} ${whereClause} ORDER BY tx.NgayTraXe DESC`, params);
}

async function findById(id) {
  const rows = await query(
    `
      ${returnSelect}
      WHERE tx.MaTraXe = ?
      LIMIT 1
    `,
    [id],
  );

  return rows[0] || null;
}

async function findByContractId(contractId) {
  const rows = await query(
    `
      ${returnSelect}
      WHERE tx.MaHD = ?
      LIMIT 1
    `,
    [contractId],
  );

  return rows[0] || null;
}

async function create(payload) {
  await query(
    `
      INSERT INTO TraXe (
        MaTraXe,
        MaHD,
        NgayTraXe,
        TinhTrangXe,
        SoNgayThueThucTe,
        TongTienThue,
        TienCoc,
        SoTienConLai,
        TongTienThanhToan,
        HinhThucThanhToan,
        GhiChu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.contractId,
      payload.actualReturnDate,
      payload.carCondition,
      payload.actualDays,
      payload.totalRent,
      payload.deposit,
      payload.remaining,
      payload.totalPayment,
      payload.paymentMethod,
      payload.notes || '',
    ],
  );

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE TraXe
      SET
        MaHD = ?,
        NgayTraXe = ?,
        TinhTrangXe = ?,
        SoNgayThueThucTe = ?,
        TongTienThue = ?,
        TienCoc = ?,
        SoTienConLai = ?,
        TongTienThanhToan = ?,
        HinhThucThanhToan = ?,
        GhiChu = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaTraXe = ?
    `,
    [
      payload.contractId,
      payload.actualReturnDate,
      payload.carCondition,
      payload.actualDays,
      payload.totalRent,
      payload.deposit,
      payload.remaining,
      payload.totalPayment,
      payload.paymentMethod,
      payload.notes || '',
      id,
    ],
  );

  return findById(id);
}

module.exports = {
  findAll,
  findById,
  findByContractId,
  create,
  update,
};
