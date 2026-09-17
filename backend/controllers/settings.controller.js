const { sendSuccess } = require('../common/response');
const asyncHandler = require('../middlewares/asyncHandler');
const SettingsModel = require('../models/settings.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const getSettings = asyncHandler(async (_req, res) => {
  const settings = await SettingsModel.getSettings();

  if (!settings) {
    throw createError('Chưa có cấu hình hệ thống.', 404);
  }

  sendSuccess(res, {
    data: settings,
    message: 'Lấy cấu hình hệ thống thành công.',
  });
});

const updateSettings = asyncHandler(async (req, res) => {
  const { companyName, phone, email, address, notifEmail, notifExpiry, notifContract, daysWarning } = req.body;

  if (!companyName || !phone || !email || !address) {
    throw createError('Vui lòng nhập đầy đủ thông tin công ty.', 400);
  }

  const settings = await SettingsModel.upsertSettings({
    companyName,
    phone,
    email,
    address,
    notifEmail,
    notifExpiry,
    notifContract,
    daysWarning,
  });

  sendSuccess(res, {
    data: settings,
    message: 'Lưu cài đặt hệ thống thành công.',
  });
});

module.exports = {
  getSettings,
  updateSettings,
};
