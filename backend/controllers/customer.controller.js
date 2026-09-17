const { sendSuccess } = require('../common/response');
const { hashPassword } = require('../common/password');
const { generateId } = require('../common/generateId');
const asyncHandler = require('../middlewares/asyncHandler');
const CustomerModel = require('../models/customer.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const list = asyncHandler(async (req, res) => {
  const customers = await CustomerModel.findAll(req.query);

  sendSuccess(res, {
    data: customers,
    meta: { total: customers.length },
    message: 'Lấy danh sách khách hàng thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const customer = await CustomerModel.findById(req.params.id);

  if (!customer) {
    throw createError('Không tìm thấy khách hàng.', 404);
  }

  sendSuccess(res, {
    data: customer,
    message: 'Lấy chi tiết khách hàng thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const {
    id,
    fullName,
    cccd,
    phone,
    email,
    address,
    driverLicense,
    password,
  } = req.body;

  if (!fullName || !cccd || !phone || !email || !address || !driverLicense) {
    throw createError('Vui lòng nhập đầy đủ thông tin khách hàng.', 400);
  }

  const createdCustomer = await CustomerModel.create({
    id: id || generateId('KH'),
    fullName,
    cccd,
    phone,
    email,
    address,
    driverLicense,
    password: await hashPassword(password || '123456'),
  });

  sendSuccess(res, {
    status: 201,
    data: createdCustomer,
    message: 'Tạo khách hàng thành công. Mật khẩu mặc định là 123456 nếu chưa truyền từ frontend.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingCustomer = await CustomerModel.findById(req.params.id);

  if (!existingCustomer) {
    throw createError('Không tìm thấy khách hàng cần cập nhật.', 404);
  }

  const updatedCustomer = await CustomerModel.update(req.params.id, {
    fullName: req.body.fullName ?? existingCustomer.fullName,
    cccd: req.body.cccd ?? existingCustomer.cccd,
    phone: req.body.phone ?? existingCustomer.phone,
    email: req.body.email ?? existingCustomer.email,
    address: req.body.address ?? existingCustomer.address,
    driverLicense: req.body.driverLicense ?? existingCustomer.driverLicense,
    password: req.body.password ? await hashPassword(req.body.password) : null,
  });

  sendSuccess(res, {
    data: updatedCustomer,
    message: 'Cập nhật khách hàng thành công.',
  });
});

const remove = asyncHandler(async (req, res) => {
  const existingCustomer = await CustomerModel.findById(req.params.id);

  if (!existingCustomer) {
    throw createError('Không tìm thấy khách hàng cần xóa.', 404);
  }

  await CustomerModel.remove(req.params.id);

  sendSuccess(res, {
    data: null,
    message: 'Xóa khách hàng thành công.',
  });
});

const rentalHistory = asyncHandler(async (req, res) => {
  const history = await CustomerModel.findRentalHistory(req.params.id);

  sendSuccess(res, {
    data: history,
    meta: { total: history.length },
    message: 'Lấy lịch sử thuê xe thành công.',
  });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  rentalHistory,
};
