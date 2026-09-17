const {
  CAR_STATUS_AVAILABLE,
  CAR_STATUS_BOOKED,
  CAR_STATUS_RENTING,
  CONTRACT_STATUS_ACTIVE,
  CONTRACT_STATUS_COMPLETED,
  CONTRACT_STATUS_PENDING,
  INSPECTION_STATUS_EXPIRED,
} = require('../common/constants');
const { query } = require('../common/db');

const carSelect = `
  SELECT
    xe.MaXe AS id,
    xe.BienSo AS licensePlate,
    xe.TenXe AS name,
    xe.LoaiXe AS type,
    xe.HangXe AS brand,
    xe.NamSanXuat AS year,
    xe.GiaThue AS price,
    xe.NhienLieu AS fuelType,
    xe.SoCho AS seatCount,
    xe.TrangThai AS status,
    xe.HinhAnh AS image,
    xe.GhiChu AS notes,
    dk.MaDK AS inspectionId,
    dk.NgayDK AS inspectionDate,
    dk.HanDK AS inspectionExpiryDate,
    dk.TrangThai AS inspectionStatus
  FROM Xe xe
  LEFT JOIN DangKiem dk
    ON dk.MaXe = xe.MaXe
    AND dk.NgayDK = (
      SELECT MAX(dk2.NgayDK)
      FROM DangKiem dk2
      WHERE dk2.MaXe = xe.MaXe
    )
`;

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function toDateKey(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value.slice(0, 10);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return formatDateKey(parsed);
}

function buildRequestedRange(filters = {}) {
  const startDate = toDateKey(filters.startDate || filters.date || filters.bookingDate);
  const endDate = toDateKey(filters.endDate);
  const resolvedStartDate = startDate || endDate;

  if (!resolvedStartDate) {
    return null;
  }

  return {
    startDate: resolvedStartDate,
    endDate: endDate && endDate >= resolvedStartDate ? endDate : resolvedStartDate,
  };
}

function hasScheduleOverlap(schedule, requestedRange) {
  if (!requestedRange) {
    return false;
  }

  return schedule.startDate <= requestedRange.endDate && schedule.endDate >= requestedRange.startDate;
}

async function findOpenSchedulesByCarIds(carIds = []) {
  if (!carIds.length) {
    return new Map();
  }

  const placeholders = carIds.map(() => '?').join(', ');
  const rows = await query(
    `
      SELECT
        hd.MaXe AS carId,
        hd.MaHD AS contractId,
        hd.NgayThue AS startDate,
        hd.NgayTraDuKien AS endDate,
        hd.TrangThai AS status
      FROM HopDongThue hd
      LEFT JOIN TraXe tx ON tx.MaHD = hd.MaHD
      WHERE hd.MaXe IN (${placeholders})
        AND hd.TrangThai IN (?, ?)
        AND tx.MaHD IS NULL
      ORDER BY hd.NgayThue ASC
    `,
    [...carIds, CONTRACT_STATUS_PENDING, CONTRACT_STATUS_ACTIVE],
  );

  return rows.reduce((accumulator, row) => {
    const currentSchedules = accumulator.get(row.carId) || [];

    currentSchedules.push({
      contractId: row.contractId,
      startDate: toDateKey(row.startDate),
      endDate: toDateKey(row.endDate),
      status: row.status,
    });

    accumulator.set(row.carId, currentSchedules);
    return accumulator;
  }, new Map());
}

function enrichCars(cars, scheduleMap, requestedRange = null) {
  const today = toDateKey(new Date());

  return cars.map((car) => {
    const bookingSchedules = (scheduleMap.get(car.id) || []).filter(
      (schedule) => schedule.startDate && schedule.endDate,
    );
    const currentSchedules = bookingSchedules.filter(
      (schedule) => schedule.startDate <= today && schedule.endDate >= today,
    );
    const upcomingSchedules = bookingSchedules.filter((schedule) => schedule.startDate > today);
    const nextBooking = upcomingSchedules[0] || null;
    const hasBookingConflict = requestedRange
      ? bookingSchedules.some((schedule) => hasScheduleOverlap(schedule, requestedRange))
      : false;
    const isInspectionExpired = car.inspectionStatus === INSPECTION_STATUS_EXPIRED;

    let publicStatus = car.status;

    if (car.status === CAR_STATUS_AVAILABLE && currentSchedules.length > 0) {
      publicStatus = CAR_STATUS_RENTING;
    } else if (car.status === CAR_STATUS_AVAILABLE && upcomingSchedules.length > 0) {
      publicStatus = CAR_STATUS_BOOKED;
    }

    return {
      ...car,
      publicStatus,
      bookingSchedules,
      nextBookedStartDate: nextBooking?.startDate || null,
      nextBookedEndDate: nextBooking?.endDate || null,
      hasBookingConflict,
      isInspectionExpired,
      canBook:
        car.status === CAR_STATUS_AVAILABLE &&
        currentSchedules.length === 0 &&
        !isInspectionExpired &&
        !hasBookingConflict,
    };
  });
}

async function findAll(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.search) {
    conditions.push('(xe.MaXe LIKE ? OR xe.BienSo LIKE ? OR xe.TenXe LIKE ? OR xe.HangXe LIKE ? OR xe.NhienLieu LIKE ?)');
    const keyword = `%${filters.search}%`;
    params.push(keyword, keyword, keyword, keyword, keyword);
  }

  if (filters.type) {
    conditions.push('xe.LoaiXe = ?');
    params.push(filters.type);
  }

  if (filters.brand) {
    conditions.push('xe.HangXe = ?');
    params.push(filters.brand);
  }

  if (filters.fuelType) {
    conditions.push('xe.NhienLieu = ?');
    params.push(filters.fuelType);
  }

  if (filters.seatCount) {
    conditions.push('xe.SoCho = ?');
    params.push(Number(filters.seatCount));
  }

  if (filters.status) {
    conditions.push('xe.TrangThai = ?');
    params.push(filters.status);
  }

  if (filters.maxPrice) {
    conditions.push('xe.GiaThue <= ?');
    params.push(Number(filters.maxPrice));
  }

  if (filters.availableOnly) {
    conditions.push('xe.TrangThai = ?');
    params.push(CAR_STATUS_AVAILABLE);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const cars = await query(`${carSelect} ${whereClause} ORDER BY xe.CreatedAt DESC`, params);
  const requestedRange = buildRequestedRange(filters);
  const scheduleMap = await findOpenSchedulesByCarIds(cars.map((car) => car.id));
  const enrichedCars = enrichCars(cars, scheduleMap, requestedRange);

  return requestedRange
    ? enrichedCars.filter((car) => !car.hasBookingConflict)
    : enrichedCars;
}

async function findById(id) {
  const rows = await query(
    `
      ${carSelect}
      WHERE xe.MaXe = ?
      LIMIT 1
    `,
    [id],
  );

  if (!rows[0]) {
    return null;
  }

  const scheduleMap = await findOpenSchedulesByCarIds([id]);
  return enrichCars([rows[0]], scheduleMap)[0] || null;
}

async function findFeatured(limit = 6) {
  const normalizedLimit = Number.isFinite(Number(limit))
    ? Math.min(Math.max(Number(limit), 1), 12)
    : 6;
  const cars = await query(
    `
      SELECT
        xe.MaXe AS id,
        xe.BienSo AS licensePlate,
        xe.TenXe AS name,
        xe.LoaiXe AS type,
        xe.HangXe AS brand,
        xe.NamSanXuat AS year,
        xe.GiaThue AS price,
        xe.NhienLieu AS fuelType,
        xe.SoCho AS seatCount,
        xe.TrangThai AS status,
        xe.HinhAnh AS image,
        xe.GhiChu AS notes,
        dk.MaDK AS inspectionId,
        dk.NgayDK AS inspectionDate,
        dk.HanDK AS inspectionExpiryDate,
        dk.TrangThai AS inspectionStatus,
        COALESCE(featuredStats.completedContracts, 0) AS completedContracts,
        COALESCE(featuredStats.completedRevenue, 0) AS completedRevenue
      FROM Xe xe
      LEFT JOIN DangKiem dk
        ON dk.MaXe = xe.MaXe
        AND dk.NgayDK = (
          SELECT MAX(dk2.NgayDK)
          FROM DangKiem dk2
          WHERE dk2.MaXe = xe.MaXe
        )
      LEFT JOIN (
        SELECT
          hd.MaXe,
          COUNT(*) AS completedContracts,
          COALESCE(SUM(hd.TongTien), 0) AS completedRevenue
        FROM HopDongThue hd
        WHERE hd.TrangThai = ?
        GROUP BY hd.MaXe
      ) featuredStats ON featuredStats.MaXe = xe.MaXe
      WHERE xe.TrangThai = ?
      ORDER BY
        COALESCE(featuredStats.completedContracts, 0) DESC,
        COALESCE(featuredStats.completedRevenue, 0) DESC,
        xe.CreatedAt DESC
      LIMIT ${normalizedLimit}
    `,
    [CONTRACT_STATUS_COMPLETED, CAR_STATUS_AVAILABLE],
  );
  const scheduleMap = await findOpenSchedulesByCarIds(cars.map((car) => car.id));
  return enrichCars(cars, scheduleMap);
}

async function create(payload) {
  await query(
    `
      INSERT INTO Xe (
        MaXe,
        BienSo,
        TenXe,
        LoaiXe,
        HangXe,
        NamSanXuat,
        GiaThue,
        NhienLieu,
        SoCho,
        TrangThai,
        HinhAnh,
        GhiChu
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.id,
      payload.licensePlate,
      payload.name,
      payload.type,
      payload.brand,
      payload.year,
      payload.price,
      payload.fuelType,
      payload.seatCount,
      payload.status,
      payload.image || null,
      payload.notes || '',
    ],
  );

  return findById(payload.id);
}

async function update(id, payload) {
  await query(
    `
      UPDATE Xe
      SET
        BienSo = ?,
        TenXe = ?,
        LoaiXe = ?,
        HangXe = ?,
        NamSanXuat = ?,
        GiaThue = ?,
        NhienLieu = ?,
        SoCho = ?,
        TrangThai = ?,
        HinhAnh = ?,
        GhiChu = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaXe = ?
    `,
    [
      payload.licensePlate,
      payload.name,
      payload.type,
      payload.brand,
      payload.year,
      payload.price,
      payload.fuelType,
      payload.seatCount,
      payload.status,
      payload.image || null,
      payload.notes || '',
      id,
    ],
  );

  return findById(id);
}

async function remove(id) {
  await query('DELETE FROM Xe WHERE MaXe = ?', [id]);
}

async function updateImage(id, imagePath) {
  await query(
    `
      UPDATE Xe
      SET
        HinhAnh = ?,
        UpdatedAt = CURRENT_TIMESTAMP
      WHERE MaXe = ?
    `,
    [imagePath, id],
  );

  return findById(id);
}

module.exports = {
  findAll,
  findById,
  findFeatured,
  create,
  update,
  remove,
  updateImage,
};
