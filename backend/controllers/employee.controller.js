const { sendSuccess } = require('../common/response');
const { hashPassword } = require('../common/password');
const { generateId } = require('../common/generateId');
const asyncHandler = require('../middlewares/asyncHandler');
const EmployeeModel = require('../models/employee.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const list = asyncHandler(async (req, res) => {
  const employees = await EmployeeModel.findAll(req.query);

  sendSuccess(res, {
    data: employees,
    meta: { total: employees.length },
    message: 'Lấy danh sách nhân viên thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const employee = await EmployeeModel.findById(req.params.id);

  if (!employee) {
    throw createError('Không tìm thấy nhân viên.', 404);
  }

  sendSuccess(res, {
    data: employee,
    message: 'Lấy chi tiết nhân viên thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const { id, fullName, phone, email, role, status, password } = req.body;

  if (!fullName || !phone || !email || !role || !password) {
    throw createError('Thiếu thông tin nhân viên.', 400);
  }

  const createdEmployee = await EmployeeModel.create({
    id: id || generateId('NV'),
    fullName,
    phone,
    email,
    role,
    status,
    password: await hashPassword(password),
  });

  sendSuccess(res, {
    status: 201,
    data: createdEmployee,
    message: 'Tạo nhân viên thành công.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingEmployee = await EmployeeModel.findById(req.params.id);

  if (!existingEmployee) {
    throw createError('Không tìm thấy nhân viên cần cập nhật.', 404);
  }

  const updatedEmployee = await EmployeeModel.update(req.params.id, {
    fullName: req.body.fullName ?? existingEmployee.fullName,
    phone: req.body.phone ?? existingEmployee.phone,
    email: req.body.email ?? existingEmployee.email,
    role: req.body.role ?? existingEmployee.role,
    status: req.body.status ?? existingEmployee.status,
    password: req.body.password ? await hashPassword(req.body.password) : null,
  });

  sendSuccess(res, {
    data: updatedEmployee,
    message: 'Cập nhật nhân viên thành công.',
  });
});

const remove = asyncHandler(async (req, res) => {
  const existingEmployee = await EmployeeModel.findById(req.params.id);

  if (!existingEmployee) {
    throw createError('Không tìm thấy nhân viên cần xóa.', 404);
  }

  await EmployeeModel.remove(req.params.id);

  sendSuccess(res, {
    data: null,
    message: 'Xóa nhân viên thành công.',
  });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
