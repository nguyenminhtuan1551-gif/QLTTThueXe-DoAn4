const {
  CAR_STATUS_AVAILABLE,
  CAR_STATUS_MAINTENANCE,
  MAINTENANCE_STATUS_IN_PROGRESS,
} = require('../common/constants');
const { sendSuccess } = require('../common/response');
const { generateId } = require('../common/generateId');
const asyncHandler = require('../middlewares/asyncHandler');
const MaintenanceModel = require('../models/maintenance.model');
const CarModel = require('../models/car.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function syncCarStatus(carId, maintenanceStatus) {
  const car = await CarModel.findById(carId);

  if (!car) {
    return;
  }

  const nextCarStatus = maintenanceStatus === MAINTENANCE_STATUS_IN_PROGRESS
    ? CAR_STATUS_MAINTENANCE
    : CAR_STATUS_AVAILABLE;

  await CarModel.update(carId, {
    licensePlate: car.licensePlate,
    name: car.name,
    type: car.type,
    brand: car.brand,
    year: car.year,
    price: car.price,
    fuelType: car.fuelType,
    seatCount: car.seatCount,
    status: nextCarStatus,
    image: car.image,
    notes: car.notes,
  });
}

const list = asyncHandler(async (req, res) => {
  const maintenanceRecords = await MaintenanceModel.findAll(req.query);

  sendSuccess(res, {
    data: maintenanceRecords,
    meta: { total: maintenanceRecords.length },
    message: 'Lấy danh sách bảo trì thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const maintenanceRecord = await MaintenanceModel.findById(req.params.id);

  if (!maintenanceRecord) {
    throw createError('Không tìm thấy hồ sơ bảo trì.', 404);
  }

  sendSuccess(res, {
    data: maintenanceRecord,
    message: 'Lấy chi tiết bảo trì thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const { id, carId, date, content, cost, status } = req.body;

  if (!carId || !date || !content || !cost || !status) {
    throw createError('Thiếu thông tin bảo trì.', 400);
  }

  const createdRecord = await MaintenanceModel.create({
    id: id || generateId('BT'),
    carId,
    date,
    content,
    cost,
    status,
  });

  await syncCarStatus(carId, status);

  sendSuccess(res, {
    status: 201,
    data: createdRecord,
    message: 'Tạo hồ sơ bảo trì thành công.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingRecord = await MaintenanceModel.findById(req.params.id);

  if (!existingRecord) {
    throw createError('Không tìm thấy hồ sơ bảo trì cần cập nhật.', 404);
  }

  const updatedRecord = await MaintenanceModel.update(req.params.id, {
    carId: req.body.carId ?? existingRecord.carId,
    date: req.body.date ?? existingRecord.date,
    content: req.body.content ?? existingRecord.content,
    cost: req.body.cost ?? existingRecord.cost,
    status: req.body.status ?? existingRecord.status,
  });

  await syncCarStatus(updatedRecord.carId, updatedRecord.status);

  sendSuccess(res, {
    data: updatedRecord,
    message: 'Cập nhật hồ sơ bảo trì thành công.',
  });
});

const remove = asyncHandler(async (req, res) => {
  const existingRecord = await MaintenanceModel.findById(req.params.id);

  if (!existingRecord) {
    throw createError('Không tìm thấy hồ sơ bảo trì cần xóa.', 404);
  }

  await MaintenanceModel.remove(req.params.id);

  sendSuccess(res, {
    data: null,
    message: 'Xóa hồ sơ bảo trì thành công.',
  });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
