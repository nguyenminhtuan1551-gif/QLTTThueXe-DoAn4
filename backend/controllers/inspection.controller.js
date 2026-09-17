const { sendSuccess } = require('../common/response');
const { generateId } = require('../common/generateId');
const asyncHandler = require('../middlewares/asyncHandler');
const InspectionModel = require('../models/inspection.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const list = asyncHandler(async (req, res) => {
  const inspections = await InspectionModel.findAll(req.query);

  sendSuccess(res, {
    data: inspections,
    meta: { total: inspections.length },
    message: 'Lấy danh sách đăng kiểm thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const inspection = await InspectionModel.findById(req.params.id);

  if (!inspection) {
    throw createError('Không tìm thấy hồ sơ đăng kiểm.', 404);
  }

  sendSuccess(res, {
    data: inspection,
    message: 'Lấy chi tiết đăng kiểm thành công.',
  });
});

const expiring = asyncHandler(async (_req, res) => {
  const inspections = await InspectionModel.findExpiring();

  sendSuccess(res, {
    data: inspections,
    meta: { total: inspections.length },
    message: 'Lấy danh sách xe sắp hết hạn đăng kiểm thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const { id, carId, inspectionDate, expiryDate, status, notes } = req.body;

  if (!carId || !inspectionDate || !expiryDate || !status) {
    throw createError('Thiếu thông tin đăng kiểm.', 400);
  }

  const createdInspection = await InspectionModel.create({
    id: id || generateId('DK'),
    carId,
    inspectionDate,
    expiryDate,
    status,
    notes,
  });

  sendSuccess(res, {
    status: 201,
    data: createdInspection,
    message: 'Tạo hồ sơ đăng kiểm thành công.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingInspection = await InspectionModel.findById(req.params.id);

  if (!existingInspection) {
    throw createError('Không tìm thấy hồ sơ đăng kiểm cần cập nhật.', 404);
  }

  const updatedInspection = await InspectionModel.update(req.params.id, {
    carId: req.body.carId ?? existingInspection.carId,
    inspectionDate: req.body.inspectionDate ?? existingInspection.inspectionDate,
    expiryDate: req.body.expiryDate ?? existingInspection.expiryDate,
    status: req.body.status ?? existingInspection.status,
    notes: req.body.notes ?? existingInspection.notes,
  });

  sendSuccess(res, {
    data: updatedInspection,
    message: 'Cập nhật đăng kiểm thành công.',
  });
});

const remove = asyncHandler(async (req, res) => {
  const existingInspection = await InspectionModel.findById(req.params.id);

  if (!existingInspection) {
    throw createError('Không tìm thấy hồ sơ đăng kiểm cần xóa.', 404);
  }

  await InspectionModel.remove(req.params.id);

  sendSuccess(res, {
    data: null,
    message: 'Xóa hồ sơ đăng kiểm thành công.',
  });
});

module.exports = {
  list,
  getById,
  expiring,
  create,
  update,
  remove,
};
