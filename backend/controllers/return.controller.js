const {
  CAR_STATUS_AVAILABLE,
  CONTRACT_STATUS_COMPLETED,
} = require('../common/constants');
const { sendSuccess } = require('../common/response');
const { generateId } = require('../common/generateId');
const asyncHandler = require('../middlewares/asyncHandler');
const ReturnModel = require('../models/return.model');
const ContractModel = require('../models/contract.model');
const CarModel = require('../models/car.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function calculateActualDays(startDate, actualReturnDate) {
  const start = new Date(startDate);
  const end = new Date(actualReturnDate);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : 1;
}

async function syncCarStatus(carId, status) {
  const car = await CarModel.findById(carId);

  if (!car) {
    return;
  }

  await CarModel.update(carId, {
    licensePlate: car.licensePlate,
    name: car.name,
    type: car.type,
    brand: car.brand,
    year: car.year,
    price: car.price,
    fuelType: car.fuelType,
    seatCount: car.seatCount,
    status,
    image: car.image,
    notes: car.notes,
  });
}

const list = asyncHandler(async (req, res) => {
  const returns = await ReturnModel.findAll(req.query);

  sendSuccess(res, {
    data: returns,
    meta: { total: returns.length },
    message: 'Lấy danh sách hồ sơ trả xe thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const returnRecord = await ReturnModel.findById(req.params.id);

  if (!returnRecord) {
    throw createError('Không tìm thấy hồ sơ trả xe.', 404);
  }

  sendSuccess(res, {
    data: returnRecord,
    message: 'Lấy chi tiết trả xe thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const {
    id,
    contractId,
    actualReturnDate,
    carCondition,
    paymentMethod,
    actualDays,
    totalRent,
    deposit,
    remaining,
    totalPayment,
    notes,
  } = req.body;

  if (!contractId || !actualReturnDate || !paymentMethod) {
    throw createError('Thiếu thông tin hồ sơ trả xe.', 400);
  }

  const existingReturn = await ReturnModel.findByContractId(contractId);
  if (existingReturn) {
    throw createError('Hợp đồng này đã có hồ sơ trả xe.', 409);
  }

  const contract = await ContractModel.findById(contractId);
  if (!contract) {
    throw createError('Không tìm thấy hợp đồng cần trả xe.', 404);
  }

  const resolvedActualDays = actualDays || calculateActualDays(contract.startDate, actualReturnDate);
  const resolvedTotalRent = totalRent || resolvedActualDays * Number(contract.pricePerDay);
  const resolvedDeposit = deposit ?? Number(contract.deposit || 0);
  const resolvedRemaining = remaining ?? Math.max(resolvedTotalRent - resolvedDeposit, 0);
  const resolvedTotalPayment = totalPayment ?? resolvedRemaining;

  const createdReturn = await ReturnModel.create({
    id: id || generateId('TRX'),
    contractId,
    actualReturnDate,
    carCondition: carCondition || 'Bình thường',
    paymentMethod,
    actualDays: resolvedActualDays,
    totalRent: resolvedTotalRent,
    deposit: resolvedDeposit,
    remaining: resolvedRemaining,
    totalPayment: resolvedTotalPayment,
    notes,
  });

  await ContractModel.update(contractId, {
    customerId: contract.customerId,
    carId: contract.carId,
    startDate: contract.startDate,
    expectedReturnDate: contract.expectedReturnDate,
    pickupPoint: contract.pickupPoint,
    deposit: contract.deposit,
    totalAmount: contract.totalAmount,
    status: CONTRACT_STATUS_COMPLETED,
    notes: contract.notes,
  });
  await syncCarStatus(contract.carId, CAR_STATUS_AVAILABLE);

  sendSuccess(res, {
    status: 201,
    data: createdReturn,
    message: 'Tạo hồ sơ trả xe thành công.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingReturn = await ReturnModel.findById(req.params.id);

  if (!existingReturn) {
    throw createError('Không tìm thấy hồ sơ trả xe cần cập nhật.', 404);
  }

  const updatedReturn = await ReturnModel.update(req.params.id, {
    contractId: req.body.contractId ?? existingReturn.contractId,
    actualReturnDate: req.body.actualReturnDate ?? existingReturn.actualReturnDate,
    carCondition: req.body.carCondition ?? existingReturn.carCondition,
    paymentMethod: req.body.paymentMethod ?? existingReturn.paymentMethod,
    actualDays: req.body.actualDays ?? existingReturn.actualDays,
    totalRent: req.body.totalRent ?? existingReturn.totalRent,
    deposit: req.body.deposit ?? existingReturn.deposit,
    remaining: req.body.remaining ?? existingReturn.remaining,
    totalPayment: req.body.totalPayment ?? existingReturn.totalPayment,
    notes: req.body.notes ?? existingReturn.notes,
  });

  sendSuccess(res, {
    data: updatedReturn,
    message: 'Cập nhật hồ sơ trả xe thành công.',
  });
});

module.exports = {
  list,
  getById,
  create,
  update,
};
