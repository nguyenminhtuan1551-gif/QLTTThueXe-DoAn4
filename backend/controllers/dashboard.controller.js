const { sendSuccess } = require('../common/response');
const asyncHandler = require('../middlewares/asyncHandler');
const DashboardModel = require('../models/dashboard.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function normalizeDate(value) {
  if (!value) {
    return null;
  }

  const normalizedValue = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalizedValue) ? normalizedValue : null;
}

const summary = asyncHandler(async (_req, res) => {
  const [overview, revenueByMonth, carStatusBreakdown, recentActivities, alerts] = await Promise.all([
    DashboardModel.getSummary(),
    DashboardModel.getRevenueByMonth(),
    DashboardModel.getCarStatusBreakdown(),
    DashboardModel.getRecentActivities(),
    DashboardModel.getAlerts(),
  ]);

  sendSuccess(res, {
    data: {
      overview,
      revenueByMonth,
      carStatusBreakdown,
      recentActivities,
      alerts,
    },
    message: 'Lấy dữ liệu tổng quan thành công.',
  });
});

const alerts = asyncHandler(async (_req, res) => {
  const alertData = await DashboardModel.getAlerts();

  sendSuccess(res, {
    data: alertData,
    message: 'Lấy danh sách cảnh báo thành công.',
  });
});

const revenueReport = asyncHandler(async (req, res) => {
  const fromDate = normalizeDate(req.query.fromDate);
  const toDate = normalizeDate(req.query.toDate);

  if (!fromDate || !toDate) {
    throw createError('Vui lòng chọn đầy đủ từ ngày và đến ngày.', 400);
  }

  if (toDate < fromDate) {
    throw createError('Đến ngày không được nhỏ hơn từ ngày.', 400);
  }

  const report = await DashboardModel.getRevenueReport({ fromDate, toDate });

  sendSuccess(res, {
    data: report,
    message: 'Lấy báo cáo doanh thu xe thành công.',
  });
});

module.exports = {
  summary,
  alerts,
  revenueReport,
};
