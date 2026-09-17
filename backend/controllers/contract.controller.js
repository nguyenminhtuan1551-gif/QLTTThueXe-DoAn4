const path = require('path');

const {
  CAR_STATUS_AVAILABLE,
  CAR_STATUS_RENTING,
  CONTRACT_STATUS_ACTIVE,
  CONTRACT_STATUS_CANCELLED,
  CONTRACT_STATUS_COMPLETED,
  CONTRACT_STATUS_PENDING,
  INSPECTION_STATUS_EXPIRED,
} = require('../common/constants');
const { sendSuccess } = require('../common/response');
const { generateId } = require('../common/generateId');
const { hashPassword } = require('../common/password');
const { verifyPickupPointInHanoi } = require('../common/pickupPointValidator');
const asyncHandler = require('../middlewares/asyncHandler');
const ContractModel = require('../models/contract.model');
const CustomerModel = require('../models/customer.model');
const CarModel = require('../models/car.model');
const ReturnModel = require('../models/return.model');
const PenaltyModel = require('../models/penalty.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function calculateRentalDays(startDate, expectedReturnDate) {
  const start = new Date(startDate);
  const end = new Date(expectedReturnDate);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return diff > 0 ? diff : 1;
}

function padNumber(value) {
  return String(value).padStart(2, '0');
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

  return `${parsed.getFullYear()}-${padNumber(parsed.getMonth() + 1)}-${padNumber(parsed.getDate())}`;
}

function isCurrentRentalPeriod(startDate, expectedReturnDate) {
  const today = toDateKey(new Date());
  const normalizedStartDate = toDateKey(startDate);
  const normalizedEndDate = toDateKey(expectedReturnDate);

  if (!today || !normalizedStartDate || !normalizedEndDate) {
    return false;
  }

  return normalizedStartDate <= today && normalizedEndDate >= today;
}

function formatDateLabel(value) {
  const normalizedValue = toDateKey(value);
  return normalizedValue || value || '--';
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

async function validatePickupPoint(pickupPoint) {
  if (!pickupPoint || !pickupPoint.trim()) {
    throw createError('Vui lòng nhập điểm đón xe.', 400);
  }

  const verification = await verifyPickupPointInHanoi(pickupPoint.trim());

  if (verification.status === 'outside') {
    throw createError('Hệ thống chỉ hỗ trợ điểm đón xe trong phạm vi Hà Nội.', 400);
  }

  if (verification.status === 'not_found' || verification.status === 'unverified') {
    throw createError('Không thể xác minh điểm đón. Vui lòng nhập địa chỉ chi tiết trong phạm vi Hà Nội.', 400);
  }

  return pickupPoint.trim();
}

function extractPickupImages(files = []) {
  if (!Array.isArray(files) || !files.length) {
    return [];
  }

  return files.map((file) => ({
    path: path.posix.join('/uploads/booking', file.filename),
    fileName: file.originalname,
  }));
}

async function validateRentalRequest({ carId, startDate, expectedReturnDate, excludeContractId } = {}) {
  const normalizedStartDate = toDateKey(startDate);
  const normalizedEndDate = toDateKey(expectedReturnDate);

  if (!normalizedStartDate || !normalizedEndDate) {
    throw createError('Ngày thuê hoặc ngày trả dự kiến không hợp lệ.', 400);
  }

  if (normalizedEndDate < normalizedStartDate) {
    throw createError('Ngày trả dự kiến không được trước ngày thuê.', 400);
  }

  const car = await CarModel.findById(carId);

  if (!car) {
    throw createError('Không tìm thấy xe cần đặt.', 404);
  }

  if (car.status !== CAR_STATUS_AVAILABLE) {
    throw createError('Xe hiện không sẵn sàng để đặt.', 409);
  }

  if (car.inspectionStatus === INSPECTION_STATUS_EXPIRED || car.isInspectionExpired) {
    throw createError('Xe này đang hết hạn đăng kiểm và chưa thể cho thuê.', 409);
  }

  const conflict = await ContractModel.findConflictingContract({
    carId,
    startDate,
    expectedReturnDate,
    excludeId: excludeContractId,
  });

  if (conflict) {
    throw createError(
      `Xe đã có lịch thuê trong khoảng ${formatDateLabel(conflict.startDate)} - ${formatDateLabel(conflict.expectedReturnDate)}. Vui lòng chọn thời gian khác.`,
      409,
    );
  }

  return car;
}

async function ensureCustomer(payload) {
  if (payload.customerId) {
    return payload.customerId;
  }

  if (
    !payload.email ||
    !payload.fullName ||
    !payload.cccd ||
    !payload.phone ||
    !payload.address ||
    !payload.driverLicense
  ) {
    throw createError('Thiếu thông tin khách hàng để tạo yêu cầu đặt xe.', 400);
  }

  const existingCustomer = await CustomerModel.findByEmail(payload.email);
  if (existingCustomer) {
    await CustomerModel.update(existingCustomer.id, {
      fullName: payload.fullName || existingCustomer.fullName,
      cccd: payload.cccd || existingCustomer.cccd,
      phone: payload.phone || existingCustomer.phone,
      email: payload.email || existingCustomer.email,
      address: payload.address || existingCustomer.address,
      driverLicense: payload.driverLicense || existingCustomer.driverLicense,
      password: null,
    });
    return existingCustomer.id;
  }

  const customerId = generateId('KH');
  await CustomerModel.create({
    id: customerId,
    fullName: payload.fullName,
    cccd: payload.cccd,
    phone: payload.phone,
    email: payload.email,
    address: payload.address,
    driverLicense: payload.driverLicense,
    password: await hashPassword(payload.password || '123456'),
  });

  return customerId;
}

async function resolveCustomerId(req, payload) {
  if (!req.currentUser) {
    throw createError('Bạn cần có tài khoản trước khi thuê xe', 401);
  }

  if (req.currentUser.scope === 'customer') {
    const existingCustomer = await CustomerModel.findById(req.currentUser.id);

    if (!existingCustomer) {
      throw createError('Không tìm thấy tài khoản khách hàng hiện tại.', 404);
    }

    const nextProfile = {
      fullName: payload.fullName || existingCustomer.fullName,
      cccd: payload.cccd || existingCustomer.cccd,
      phone: payload.phone || existingCustomer.phone,
      email: payload.email || existingCustomer.email,
      address: payload.address || existingCustomer.address,
      driverLicense: payload.driverLicense || existingCustomer.driverLicense,
      password: null,
    };

    if (
      !nextProfile.fullName ||
      !nextProfile.cccd ||
      !nextProfile.phone ||
      !nextProfile.email ||
      !nextProfile.address ||
      !nextProfile.driverLicense
    ) {
      throw createError('Vui lòng cập nhật đầy đủ thông tin cá nhân trước khi thuê xe.', 400);
    }

    const updatedCustomer = await CustomerModel.update(existingCustomer.id, nextProfile);
    req.session.user = {
      ...req.currentUser,
      fullName: updatedCustomer.fullName,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
    };

    return updatedCustomer.id;
  }

  return ensureCustomer(payload);
}

const list = asyncHandler(async (req, res) => {
  const contracts = await ContractModel.findAll(req.query);

  sendSuccess(res, {
    data: contracts,
    meta: { total: contracts.length },
    message: 'Lấy danh sách hợp đồng thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const contract = await ContractModel.findById(req.params.id);

  if (!contract) {
    throw createError('Không tìm thấy hợp đồng.', 404);
  }

  sendSuccess(res, {
    data: contract,
    message: 'Lấy chi tiết hợp đồng thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const {
    id,
    customerId,
    carId,
    startDate,
    expectedReturnDate,
    deposit,
    totalAmount,
    status,
    notes,
    fullName,
    cccd,
    phone,
    email,
    address,
    driverLicense,
    password,
    pickupPoint,
  } = req.body;

  if (!carId || !startDate || !expectedReturnDate) {
    throw createError('Thiếu thông tin xe hoặc thời gian thuê.', 400);
  }

  const car = await validateRentalRequest({ carId, startDate, expectedReturnDate });
  const resolvedPickupPoint = await validatePickupPoint(pickupPoint);
  const pickupImages = extractPickupImages(req.files);

  const resolvedCustomerId = await resolveCustomerId(req, {
    customerId,
    fullName,
    cccd,
    phone,
    email,
    address,
    driverLicense,
    password,
  });

  const rentalDays = calculateRentalDays(startDate, expectedReturnDate);
  const resolvedTotalAmount = totalAmount || rentalDays * Number(car.price);
  const resolvedStatus = status || CONTRACT_STATUS_PENDING;

  const createdContract = await ContractModel.create({
    id: id || generateId('HD'),
    customerId: resolvedCustomerId,
    carId,
    startDate,
    expectedReturnDate,
    pickupPoint: resolvedPickupPoint,
    deposit: deposit || 0,
    totalAmount: resolvedTotalAmount,
    status: resolvedStatus,
    notes,
    pickupImages,
  });

  if (resolvedStatus === CONTRACT_STATUS_ACTIVE && isCurrentRentalPeriod(startDate, expectedReturnDate)) {
    await syncCarStatus(carId, CAR_STATUS_RENTING);
  }

  sendSuccess(res, {
    status: 201,
    data: createdContract,
    message: 'Tạo yêu cầu thuê xe thành công.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingContract = await ContractModel.findById(req.params.id);

  if (!existingContract) {
    throw createError('Không tìm thấy hợp đồng cần cập nhật.', 404);
  }

  const nextPayload = {
    customerId: req.body.customerId ?? existingContract.customerId,
    carId: req.body.carId ?? existingContract.carId,
    startDate: req.body.startDate ?? existingContract.startDate,
    expectedReturnDate: req.body.expectedReturnDate ?? existingContract.expectedReturnDate,
    pickupPoint: req.body.pickupPoint ?? existingContract.pickupPoint,
    deposit: req.body.deposit ?? existingContract.deposit,
    totalAmount: req.body.totalAmount ?? existingContract.totalAmount,
    status: req.body.status ?? existingContract.status,
    notes: req.body.notes ?? existingContract.notes,
  };

  if (req.body.pickupPoint !== undefined || nextPayload.pickupPoint) {
    nextPayload.pickupPoint = await validatePickupPoint(nextPayload.pickupPoint);
  }

  if (![CONTRACT_STATUS_COMPLETED, CONTRACT_STATUS_CANCELLED].includes(nextPayload.status)) {
    await validateRentalRequest({
      carId: nextPayload.carId,
      startDate: nextPayload.startDate,
      expectedReturnDate: nextPayload.expectedReturnDate,
      excludeContractId: req.params.id,
    });
  }

  const updatedContract = await ContractModel.update(req.params.id, nextPayload);

  if (
    updatedContract.status === CONTRACT_STATUS_ACTIVE &&
    isCurrentRentalPeriod(updatedContract.startDate, updatedContract.expectedReturnDate)
  ) {
    await syncCarStatus(updatedContract.carId, CAR_STATUS_RENTING);
  }

  if (
    updatedContract.status === CONTRACT_STATUS_PENDING ||
    updatedContract.status === CONTRACT_STATUS_COMPLETED ||
    updatedContract.status === CONTRACT_STATUS_CANCELLED ||
    (updatedContract.status === CONTRACT_STATUS_ACTIVE &&
      !isCurrentRentalPeriod(updatedContract.startDate, updatedContract.expectedReturnDate))
  ) {
    await syncCarStatus(updatedContract.carId, CAR_STATUS_AVAILABLE);
  }

  sendSuccess(res, {
    data: updatedContract,
    message: 'Cập nhật hợp đồng thành công.',
  });
});

const cancel = asyncHandler(async (req, res) => {
  const existingContract = await ContractModel.findById(req.params.id);

  if (!existingContract) {
    throw createError('Không tìm thấy hợp đồng cần hủy.', 404);
  }

  const cancelledContract = await ContractModel.cancel(req.params.id);
  await syncCarStatus(cancelledContract.carId, CAR_STATUS_AVAILABLE);

  sendSuccess(res, {
    data: cancelledContract,
    message: 'Hủy hợp đồng thành công.',
  });
});

const remove = asyncHandler(async (req, res) => {
  const existingContract = await ContractModel.findById(req.params.id);

  if (!existingContract) {
    throw createError('Không tìm thấy hợp đồng cần xóa.', 404);
  }

  await ContractModel.remove(req.params.id);

  if (existingContract.status === CONTRACT_STATUS_ACTIVE) {
    await syncCarStatus(existingContract.carId, CAR_STATUS_AVAILABLE);
  }

  sendSuccess(res, {
    data: null,
    message: 'Xóa hợp đồng thành công.',
  });
});

const lookup = asyncHandler(async (req, res) => {
  const { contractId, cccd, phone } = req.query;

  if (!contractId && !cccd && !phone) {
    throw createError('Vui lòng nhập ít nhất một thông tin tra cứu.', 400);
  }

  const contract = await ContractModel.findByLookup({ contractId, cccd, phone });

  if (!contract) {
    throw createError('Không tìm thấy đơn thuê phù hợp.', 404);
  }

  const returnRecord = await ReturnModel.findByContractId(contract.id);
  const penalties = returnRecord ? await PenaltyModel.findByReturnId(returnRecord.id) : [];

  sendSuccess(res, {
    data: {
      contract,
      customer: {
        id: contract.customerId,
        fullName: contract.customerName,
        phone: contract.customerPhone,
        email: contract.customerEmail,
        cccd: contract.cccd,
        address: contract.customerAddress,
        driverLicense: contract.driverLicense,
      },
      returnRecord,
      penalties,
    },
    message: 'Tra cứu đơn thuê thành công.',
  });
});

const myRentals = asyncHandler(async (req, res) => {
  const rentals = await ContractModel.findByCustomerId(req.currentUser.id);

  sendSuccess(res, {
    data: rentals,
    meta: { total: rentals.length },
    message: 'Lấy danh sách đơn thuê của khách hàng thành công.',
  });
});

module.exports = {
  list,
  getById,
  create,
  update,
  cancel,
  remove,
  lookup,
  myRentals,
};
