const {
  CAR_STATUS_AVAILABLE,
  CAR_STATUS_MAINTENANCE,
  CAR_STATUS_RENTING,
  CONTRACT_STATUS_ACTIVE,
  CONTRACT_STATUS_COMPLETED,
  INSPECTION_STATUS_EXPIRED,
  INSPECTION_STATUS_EXPIRING,
  MAINTENANCE_STATUS_IN_PROGRESS,
} = require('../common/constants');
const { query } = require('../common/db');

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

function padNumber(value) {
  return String(value).padStart(2, '0');
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function parseDateKey(value) {
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

function createDateFromKey(dateKey) {
  const [year, month, day] = String(dateKey).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function getInclusiveDays(startDateKey, endDateKey) {
  const startDate = createDateFromKey(startDateKey);
  const endDate = createDateFromKey(endDateKey);
  return Math.floor((endDate.getTime() - startDate.getTime()) / MILLISECONDS_PER_DAY) + 1;
}

function getMonthStartKey(year, monthIndex) {
  return `${year}-${padNumber(monthIndex)}-01`;
}

function getMonthEndKey(year, monthIndex) {
  return formatDateKey(new Date(year, monthIndex, 0));
}

function getOverlapDays(startDateKey, endDateKey, rangeStartKey, rangeEndKey) {
  const overlapStart = startDateKey > rangeStartKey ? startDateKey : rangeStartKey;
  const overlapEnd = endDateKey < rangeEndKey ? endDateKey : rangeEndKey;

  if (overlapStart > overlapEnd) {
    return 0;
  }

  return getInclusiveDays(overlapStart, overlapEnd);
}

async function buildRevenueByMonth(year = new Date().getFullYear()) {
  const startOfYear = `${year}-01-01`;
  const endOfYear = `${year}-12-31`;
  const contracts = await query(
    `
      SELECT
        hd.MaHD AS id,
        hd.NgayThue AS startDate,
        hd.NgayTraDuKien AS expectedReturnDate,
        hd.TongTien AS totalAmount
      FROM HopDongThue hd
      WHERE hd.TrangThai = ?
        AND hd.NgayThue <= ?
        AND hd.NgayTraDuKien >= ?
    `,
    [CONTRACT_STATUS_COMPLETED, endOfYear, startOfYear],
  );

  const buckets = Array.from({ length: 12 }, (_item, index) => ({
    month: padNumber(index + 1),
    revenue: 0,
    contractIds: new Set(),
  }));

  contracts.forEach((contract) => {
    const startDateKey = parseDateKey(contract.startDate);
    const endDateKey = parseDateKey(contract.expectedReturnDate);
    const totalAmount = Number(contract.totalAmount || 0);

    if (!startDateKey || !endDateKey || endDateKey < startDateKey) {
      return;
    }

    const totalDays = getInclusiveDays(startDateKey, endDateKey);
    if (totalDays <= 0) {
      return;
    }

    const dailyRevenue = totalAmount / totalDays;

    buckets.forEach((bucket, bucketIndex) => {
      const monthStartKey = getMonthStartKey(year, bucketIndex + 1);
      const monthEndKey = getMonthEndKey(year, bucketIndex + 1);
      const overlapDays = getOverlapDays(startDateKey, endDateKey, monthStartKey, monthEndKey);

      if (overlapDays <= 0) {
        return;
      }

      bucket.revenue += dailyRevenue * overlapDays;
      bucket.contractIds.add(contract.id);
    });
  });

  return buckets
    .filter((bucket) => bucket.contractIds.size > 0)
    .map((bucket) => ({
      month: bucket.month,
      revenue: Math.round(bucket.revenue),
      rentals: bucket.contractIds.size,
    }));
}

async function getSummary() {
  const [carStats] = await query(
    `
      SELECT
        COUNT(*) AS totalCars,
        SUM(CASE WHEN TrangThai = ? THEN 1 ELSE 0 END) AS availableCars,
        SUM(CASE WHEN TrangThai = ? THEN 1 ELSE 0 END) AS rentingCars,
        SUM(CASE WHEN TrangThai = ? THEN 1 ELSE 0 END) AS maintenanceCars
      FROM Xe
    `,
    [CAR_STATUS_AVAILABLE, CAR_STATUS_RENTING, CAR_STATUS_MAINTENANCE],
  );

  const [customerStats] = await query('SELECT COUNT(*) AS totalCustomers FROM KhachHang');
  const [contractStats] = await query(
    `
      SELECT
        COUNT(*) AS totalContracts,
        SUM(CASE WHEN TrangThai = ? THEN 1 ELSE 0 END) AS activeContracts
      FROM HopDongThue
    `,
    [CONTRACT_STATUS_ACTIVE],
  );
  const revenueByMonth = await buildRevenueByMonth();
  const currentMonth = padNumber(new Date().getMonth() + 1);
  const currentMonthRevenue = revenueByMonth.find((item) => item.month === currentMonth);

  return {
    totalCars: Number(carStats.totalCars || 0),
    availableCars: Number(carStats.availableCars || 0),
    rentingCars: Number(carStats.rentingCars || 0),
    maintenanceCars: Number(carStats.maintenanceCars || 0),
    totalCustomers: Number(customerStats.totalCustomers || 0),
    totalContracts: Number(contractStats.totalContracts || 0),
    activeContracts: Number(contractStats.activeContracts || 0),
    monthlyRevenue: Number(currentMonthRevenue?.revenue || 0),
  };
}

async function getRevenueByMonth() {
  return buildRevenueByMonth();
}

async function getCarStatusBreakdown() {
  return query(
    `
      SELECT
        TrangThai AS name,
        COUNT(*) AS value
      FROM Xe
      GROUP BY TrangThai
      ORDER BY TrangThai
    `,
  );
}

async function getAlerts() {
  const expiringInspections = await query(
    `
      SELECT
        dk.MaDK AS id,
        dk.MaXe AS carId,
        xe.TenXe AS carName,
        xe.BienSo AS carPlate,
        dk.HanDK AS expiryDate,
        dk.TrangThai AS status
      FROM DangKiem dk
      INNER JOIN Xe xe ON xe.MaXe = dk.MaXe
      WHERE dk.TrangThai IN (?, ?)
      ORDER BY dk.HanDK ASC
      LIMIT 5
    `,
    [INSPECTION_STATUS_EXPIRING, INSPECTION_STATUS_EXPIRED],
  );

  const dueContracts = await query(
    `
      SELECT
        hd.MaHD AS id,
        kh.HoTen AS customerName,
        xe.TenXe AS carName,
        hd.NgayTraDuKien AS expectedReturnDate
      FROM HopDongThue hd
      INNER JOIN KhachHang kh ON kh.MaKH = hd.MaKH
      INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
      WHERE hd.TrangThai = ?
      ORDER BY hd.NgayTraDuKien ASC
      LIMIT 5
    `,
    [CONTRACT_STATUS_ACTIVE],
  );

  const carsInMaintenance = await query(
    `
      SELECT
        bt.MaBaoTri AS id,
        bt.MaXe AS carId,
        xe.TenXe AS carName,
        xe.BienSo AS carPlate,
        bt.NoiDung AS content,
        bt.TrangThai AS status
      FROM BaoTri bt
      INNER JOIN Xe xe ON xe.MaXe = bt.MaXe
      WHERE bt.TrangThai = ?
      ORDER BY bt.NgayBaoTri DESC
      LIMIT 5
    `,
    [MAINTENANCE_STATUS_IN_PROGRESS],
  );

  return {
    expiringInspections,
    dueContracts,
    carsInMaintenance,
  };
}

async function getRecentActivities() {
  const recentContracts = await query(
    `
      SELECT
        'contract' AS type,
        hd.CreatedAt AS createdAt,
        CONCAT(kh.HoTen, ' tạo hợp đồng ', hd.MaHD, ' - ', xe.TenXe) AS message
      FROM HopDongThue hd
      INNER JOIN KhachHang kh ON kh.MaKH = hd.MaKH
      INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
      ORDER BY hd.CreatedAt DESC
      LIMIT 3
    `,
  );

  const recentReturns = await query(
    `
      SELECT
        'return' AS type,
        tx.CreatedAt AS createdAt,
        CONCAT(kh.HoTen, ' đã trả xe ', xe.TenXe, ' (', tx.MaHD, ')') AS message
      FROM TraXe tx
      INNER JOIN HopDongThue hd ON hd.MaHD = tx.MaHD
      INNER JOIN KhachHang kh ON kh.MaKH = hd.MaKH
      INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
      ORDER BY tx.CreatedAt DESC
      LIMIT 3
    `,
  );

  return [...recentContracts, ...recentReturns]
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .slice(0, 6);
}

async function getRevenueReport({ fromDate, toDate }) {
  const contracts = await query(
    `
      SELECT
        hd.MaHD AS id,
        hd.MaXe AS carId,
        xe.TenXe AS carName,
        xe.BienSo AS carPlate,
        hd.NgayThue AS startDate,
        hd.NgayTraDuKien AS expectedReturnDate,
        hd.TongTien AS totalAmount
      FROM HopDongThue hd
      INNER JOIN Xe xe ON xe.MaXe = hd.MaXe
      WHERE hd.TrangThai IN (?, ?)
        AND hd.NgayThue <= ?
        AND hd.NgayTraDuKien >= ?
      ORDER BY xe.MaXe ASC, hd.NgayThue ASC
    `,
    [CONTRACT_STATUS_ACTIVE, CONTRACT_STATUS_COMPLETED, toDate, fromDate],
  );

  const maintenanceRows = await query(
    `
      SELECT
        bt.MaXe AS carId,
        COALESCE(SUM(bt.ChiPhi), 0) AS maintenanceCost,
        COUNT(*) AS maintenanceCount
      FROM BaoTri bt
      WHERE DATE(bt.NgayBaoTri) BETWEEN ? AND ?
      GROUP BY bt.MaXe
    `,
    [fromDate, toDate],
  );

  const penaltyRows = await query(
    `
      SELECT
        hd.MaXe AS carId,
        COALESCE(SUM(pp.SoTienPhat), 0) AS penaltyFee,
        COUNT(*) AS penaltyCount
      FROM PhiPhat pp
      INNER JOIN TraXe tx ON tx.MaTraXe = pp.MaTraXe
      INNER JOIN HopDongThue hd ON hd.MaHD = tx.MaHD
      WHERE DATE(pp.CreatedAt) BETWEEN ? AND ?
      GROUP BY hd.MaXe
    `,
    [fromDate, toDate],
  );

  const maintenanceMap = new Map(
    maintenanceRows.map((row) => [
      row.carId,
      {
        maintenanceCost: Number(row.maintenanceCost || 0),
        maintenanceCount: Number(row.maintenanceCount || 0),
      },
    ]),
  );

  const penaltyMap = new Map(
    penaltyRows.map((row) => [
      row.carId,
      {
        penaltyFee: Number(row.penaltyFee || 0),
        penaltyCount: Number(row.penaltyCount || 0),
      },
    ]),
  );

  const reportMap = new Map();

  contracts.forEach((contract) => {
    const startDateKey = parseDateKey(contract.startDate);
    const endDateKey = parseDateKey(contract.expectedReturnDate);
    const totalAmount = Number(contract.totalAmount || 0);

    if (!startDateKey || !endDateKey || endDateKey < startDateKey) {
      return;
    }

    const totalDays = getInclusiveDays(startDateKey, endDateKey);
    if (totalDays <= 0) {
      return;
    }

    const overlapDays = getOverlapDays(startDateKey, endDateKey, fromDate, toDate);
    if (overlapDays <= 0) {
      return;
    }

    const currentItem = reportMap.get(contract.carId) || {
      carId: contract.carId,
      carName: contract.carName,
      carPlate: contract.carPlate,
      revenue: 0,
      rentals: new Set(),
    };

    currentItem.revenue += (totalAmount / totalDays) * overlapDays;
    currentItem.rentals.add(contract.id);
    reportMap.set(contract.carId, currentItem);
  });

  const items = Array.from(reportMap.values())
    .map((item) => {
      const maintenance = maintenanceMap.get(item.carId) || { maintenanceCost: 0, maintenanceCount: 0 };
      const penalty = penaltyMap.get(item.carId) || { penaltyFee: 0, penaltyCount: 0 };
      const revenue = Math.round(item.revenue);
      const totalAmount = revenue + penalty.penaltyFee - maintenance.maintenanceCost;

      return {
        carId: item.carId,
        carName: item.carName,
        carPlate: item.carPlate,
        rentals: item.rentals.size,
        revenue,
        maintenanceCost: maintenance.maintenanceCost,
        maintenanceCount: maintenance.maintenanceCount,
        penaltyFee: penalty.penaltyFee,
        penaltyCount: penalty.penaltyCount,
        totalAmount: Math.round(totalAmount),
      };
    })
    .sort((left, right) => right.totalAmount - left.totalAmount || right.revenue - left.revenue);

  const summary = items.reduce(
    (accumulator, item) => ({
      cars: accumulator.cars + 1,
      rentals: accumulator.rentals + item.rentals,
      revenue: accumulator.revenue + item.revenue,
      maintenanceCost: accumulator.maintenanceCost + item.maintenanceCost,
      penaltyFee: accumulator.penaltyFee + item.penaltyFee,
      totalAmount: accumulator.totalAmount + item.totalAmount,
    }),
    {
      cars: 0,
      rentals: 0,
      revenue: 0,
      maintenanceCost: 0,
      penaltyFee: 0,
      totalAmount: 0,
    },
  );

  return {
    fromDate,
    toDate,
    items,
    summary,
  };
}

module.exports = {
  getSummary,
  getRevenueByMonth,
  getCarStatusBreakdown,
  getAlerts,
  getRecentActivities,
  getRevenueReport,
};
