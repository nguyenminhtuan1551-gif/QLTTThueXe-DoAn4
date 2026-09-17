const {
  CONTRACT_STATUS_ACTIVE,
  CONTRACT_STATUS_CANCELLED,
  CONTRACT_STATUS_PENDING,
} = require('../common/constants');
const { generateId } = require('../common/generateId');
const { getConnection, query } = require('../common/db');

const contractSelect = `
  SELECT
    hd.MaHD AS id,
    hd.MaKH AS customerId,
    kh.HoTen AS customerName,
    kh.SDT AS customerPhone,
    kh.Email AS customerEmail,
    kh.CCCD AS cccd,
    kh.DiaChi AS customerAddress,
    kh.BangLai AS driverLicense,
    hd.MaXe AS carId,
    xe.TenXe AS carName,
    xe.BienSo AS carPlate,
    xe.HinhAnh AS carImage,
    xe.GiaThue AS pricePerDay,
    hd.NgayThue AS startDate,
    hd.NgayTraDuKien AS expectedReturnDate,
    hd.DiemDon AS pickupPoint,
    hd.TienCoc AS deposit,
    hd.TongTien AS totalAmount,
    hd.TrangThai AS status,
    hd.GhiChu AS notes
  FROM HopDongThue hd
  INNER JOIN KhachHang kh ON kh.MaKH = hd.MaKH
  INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
`;

async function findPickupImagesByContractIds(contractIds = []) {
  if (!contractIds.length) {
    return new Map();
  }

  const placeholders = contractIds.map(() => '?').join(', ');
  const rows = await query(
    `
      SELECT
        MaAnh AS id,
        MaHD AS contractId,
        DuongDan AS path,
        TenTep AS fileName,
        CreatedAt AS createdAt
      FROM AnhDatXe
      WHERE MaHD IN (${placeholders})
      ORDER BY CreatedAt ASC, MaAnh ASC
    `,
    contractIds,
  );

  return rows.reduce((accumulator, row) => {
    const currentImages = accumulator.get(row.contractId) || [];
    currentImages.push(row);
    accumulator.set(row.contractId, currentImages);
    return accumulator;
  }, new Map());
}

async function enrichContracts(contracts = []) {
  if (!contracts.length) {
    return [];
  }

  const imageMap = await findPickupImagesByContractIds(contracts.map((contract) => contract.id));
  return contracts.map((contract) => ({
    ...contract,
    pickupImages: imageMap.get(contract.id) || [],
  }));
}

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(hd.MaHD LIKE ? OR kh.HoTen LIKE ? OR kh.SDT LIKE ? OR xe.TenXe LIKE ? OR xe.BienSo LIKE ? OR hd.DiemDon LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword, keyword, keyword);
  }

  if (filters.status) {
    conditions.push('hd.TrangThai = ?');
    params.push(filters.status);
  }

  if (filters.customerId) {
    conditions.push('hd.MaKH = ?');
    params.push(filters.customerId);
  }

  if (filters.carId) {
    conditions.push('hd.MaXe = ?');
    params.push(filters.carId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = await query(`${contractSelect} ${whereClause} ORDER BY hd.NgayThue DESC`, params);
  return enrichContracts(rows);
}

async function findById(id) {
  const rows = await query(
    `
      ${contractSelect}
      WHERE hd.MaHD = ?
      LIMIT 1
    `,
    [id],
  );

  const contracts = await enrichContracts(rows);
  return contracts[0] || null;
}

async function findByLookup({ contractId, cccd, phone }) {
  const conditions = [];
  const params = [];

  if (contractId) {
    conditions.push('hd.MaHD = ?');
    params.push(contractId);
  }

  if (cccd) {
    conditions.push('kh.CCCD = ?');
    params.push(cccd);
  }

  if (phone) {
    conditions.push('kh.SDT = ?');
    params.push(phone);
  }

  if (!conditions.length) {
    return null;
  }

  const rows = await query(
    `
      ${contractSelect}
      WHERE ${conditions.join(' OR ')}
      ORDER BY hd.NgayThue DESC
      LIMIT 1
    `,
    params,
  );

  const contracts = await enrichContracts(rows);
  return contracts[0] || null;
}

async function findByCustomerId(customerId) {
  const rows = await query(
    `
      ${contractSelect}
      WHERE hd.MaKH = ?
      ORDER BY hd.NgayThue DESC
    `,
    [customerId],
  );

  return enrichContracts(rows);
}

async function findConflictingContract({ carId, startDate, expectedReturnDate, excludeId } = {}) {
  if (!carId || !startDate || !expectedReturnDate) {
    return null;
  }

  const conditions = [
    'hd.MaXe = ?',
    'hd.TrangThai IN (?, ?)',
    'tx.MaHD IS NULL',
    'hd.NgayThue <= ?',
    'hd.NgayTraDuKien >= ?',
  ];
  const params = [
    carId,
    CONTRACT_STATUS_PENDING,
    CONTRACT_STATUS_ACTIVE,
    expectedReturnDate,
    startDate,
  ];

  if (excludeId) {
    conditions.push('hd.MaHD <> ?');
    params.push(excludeId);
  }

  const rows = await query(
    `
      SELECT
        hd.MaHD AS id,
        hd.NgayThue AS startDate,
        hd.NgayTraDuKien AS expectedReturnDate,
        hd.TrangThai AS status
      FROM HopDongThue hd
      LEFT JOIN TraXe tx ON tx.MaHD = hd.MaHD
      WHERE ${conditions.join(' AND ')}
      ORDER BY hd.NgayThue ASC
      LIMIT 1
    `,
    params,
  );

  return rows[0] || null;
}

async function create(payload) {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute(
      `
        INSERT INTO HopDongThue (
          MaHD,
          MaKH,
          MaXe,
          NgayThue,
          NgayTraDuKien,
          DiemDon,
          TienCoc,
          TongTien,
          TrangThai,
          GhiChu
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        payload.id,
        payload.customerId,
        payload.carId,
        payload.startDate,
        payload.expectedReturnDate,
        payload.pickupPoint,
        payload.deposit,
        payload.totalAmount,
        payload.status || CONTRACT_STATUS_PENDING,
        payload.notes || '',
      ],
    );

    if (payload.pickupImages?.length) {
      const placeholders = payload.pickupImages.map(() => '(?, ?, ?, ?)').join(', ');
      const params = [];

      payload.pickupImages.forEach((image) => {
        params.push(generateId('IMG'), payload.id, image.path, image.fileName || null);
      });

      await connection.execute(
        `
          INSERT INTO AnhDatXe (
            MaAnh,
            MaHD,
            DuongDan,
            TenTep
          ) VALUES ${placeholders}
        `,
        params,
      );
    }

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE HopDongThue
      SET
        MaKH = ?,
        MaXe = ?,
        NgayThue = ?,
        NgayTraDuKien = ?,
        DiemDon = ?,
        TienCoc = ?,
        TongTien = ?,
        TrangThai = ?,
        GhiChu = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaHD = ?
    `,
    [
      payload.customerId,
      payload.carId,
      payload.startDate,
      payload.expectedReturnDate,
      payload.pickupPoint || null,
      payload.deposit,
      payload.totalAmount,
      payload.status,
      payload.notes || '',
      id,
    ],
  );

  return findById(id);
}

async function cancel(id) {
  await query(
    `
      UPDATE HopDongThue
      SET
        TrangThai = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaHD = ?
    `,
    [CONTRACT_STATUS_CANCELLED, id],
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM HopDongThue WHERE MaHD = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  findByLookup,
  findByCustomerId,
  findConflictingContract,
  create,
  update,
  cancel,
  remove,
};
