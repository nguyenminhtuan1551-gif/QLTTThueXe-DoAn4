const { EMPLOYEE_STATUS_ACTIVE } = require('../common/constants');
const { sendSuccess } = require('../common/response');
const { hashPassword, comparePassword } = require('../common/password');
const { generateId } = require('../common/generateId');
const { signToken } = require('../common/jwt');
const asyncHandler = require('../middlewares/asyncHandler');
const EmployeeModel = require('../models/employee.model');
const CustomerModel = require('../models/customer.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const INTERNAL_ACCOUNT_MESSAGE =
  'Tài khoản này thuộc khu vực điều hành nội bộ. Vui lòng chuyển sang cổng quản trị để đăng nhập.';
const CUSTOMER_ACCOUNT_MESSAGE =
  'Tài khoản này thuộc khu vực khách hàng. Vui lòng chuyển sang cổng khách hàng để đăng nhập.';

function setSessionUser(req, user) {
  if (req.session) {
    req.session.user = user;
  }
}

const adminLogin = asyncHandler(async (req, res) => {
  const identifier = req.body.identifier || req.body.email;
  const { password } = req.body;

  if (!identifier || !password) {
    throw createError('Vui lòng nhập email hoặc số điện thoại và mật khẩu.', 400);
  }

  const employee = await EmployeeModel.findByCredential(identifier);

  if (!employee) {
    const customer = await CustomerModel.findByCredential(identifier);
    if (customer) {
      throw createError(CUSTOMER_ACCOUNT_MESSAGE, 403);
    }

    throw createError('Thông tin đăng nhập không chính xác.', 401);
  }

  const matched = await comparePassword(password, employee.password);

  if (!matched) {
    throw createError('Thông tin đăng nhập không chính xác.', 401);
  }

  if (employee.status && employee.status !== EMPLOYEE_STATUS_ACTIVE) {
    throw createError('Tài khoản nhân viên đang bị khóa.', 403);
  }

  const user = {
    id: employee.id,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone,
    role: employee.role,
    scope: 'admin',
  };

  const token = signToken(user);
  setSessionUser(req, user);

  sendSuccess(res, {
    message: 'Đăng nhập quản trị thành công.',
    data: {
      ...user,
      token,
      user,
    },
  });
});

const customerRegister = asyncHandler(async (req, res) => {
  const {
    id,
    fullName,
    cccd,
    phone,
    email,
    password,
    address,
    driverLicense,
  } = req.body;

  if (!fullName || !phone || !email || !password || !address || !driverLicense) {
    throw createError('Vui lòng nhập đầy đủ thông tin đăng ký.', 400);
  }

  const existingCustomer = await CustomerModel.findByEmail(email);
  if (existingCustomer) {
    throw createError('Email này đã được đăng ký.', 409);
  }

  const createdCustomer = await CustomerModel.create({
    id: id || generateId('KH'),
    fullName,
    cccd,
    phone,
    email,
    password: await hashPassword(password),
    address,
    driverLicense,
  });

  const user = {
    id: createdCustomer.id,
    fullName: createdCustomer.fullName,
    email: createdCustomer.email,
    phone: createdCustomer.phone,
    cccd: createdCustomer.cccd || '',
    driverLicense: createdCustomer.driverLicense || '',
    address: createdCustomer.address || '',
    role: 'Customer',
    scope: 'customer',
  };

  const token = signToken(user);
  setSessionUser(req, user);

  sendSuccess(res, {
    status: 201,
    message: 'Đăng ký tài khoản thành công.',
    data: {
      ...user,
      token,
      user,
    },
  });
});

const customerLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError('Vui lòng nhập email và mật khẩu.', 400);
  }

  const customer = await CustomerModel.findByEmail(email);

  if (!customer) {
    const employee = await EmployeeModel.findByCredential(email);
    if (employee) {
      throw createError(INTERNAL_ACCOUNT_MESSAGE, 403);
    }

    throw createError('Email hoặc mật khẩu không đúng.', 401);
  }

  const matched = await comparePassword(password, customer.password);
  if (!matched) {
    throw createError('Email hoặc mật khẩu không đúng.', 401);
  }

  const user = {
    id: customer.id,
    fullName: customer.fullName,
    email: customer.email,
    phone: customer.phone,
    cccd: customer.cccd || '',
    driverLicense: customer.driverLicense || '',
    address: customer.address || '',
    role: 'Customer',
    scope: 'customer',
  };

  const token = signToken(user);
  setSessionUser(req, user);

  sendSuccess(res, {
    message: 'Đăng nhập khách hàng thành công.',
    data: {
      ...user,
      token,
      user,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  if (!req.currentUser) {
    throw createError('Chưa có phiên đăng nhập.', 401);
  }

  let profile = req.currentUser;
  if (req.currentUser.scope === 'customer') {
    const customer = await CustomerModel.findById(req.currentUser.id);
    if (customer) {
      profile = {
        ...req.currentUser,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        cccd: customer.cccd || '',
        driverLicense: customer.driverLicense || '',
        address: customer.address || '',
      };
    }
  }

  sendSuccess(res, {
    data: profile,
    message: 'Lấy thông tin phiên đăng nhập thành công.',
  });
});

const logout = (req, res, next) => {
  if (req.session && typeof req.session.destroy === 'function') {
    req.session.destroy((error) => {
      if (error) {
        return next(error);
      }

      res.clearCookie(process.env.SESSION_NAME || 'car_rental.sid');
      return sendSuccess(res, {
        message: 'Đăng xuất thành công.',
        data: null,
      });
    });
  } else {
    res.clearCookie(process.env.SESSION_NAME || 'car_rental.sid');
    return sendSuccess(res, {
      message: 'Đăng xuất thành công.',
      data: null,
    });
  }
};

const changeAdminPassword = asyncHandler(async (req, res) => {
  if (!req.currentUser || req.currentUser.scope !== 'admin') {
    throw createError('Bạn không có quyền thực hiện chức năng này.', 403);
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới.', 400);
  }

  if (String(newPassword).length < 6) {
    throw createError('Mật khẩu mới phải có ít nhất 6 ký tự.', 400);
  }

  const employee = await EmployeeModel.findByCredential(req.currentUser.email);

  if (!employee) {
    throw createError('Không tìm thấy tài khoản nhân viên.', 404);
  }

  const matched = await comparePassword(currentPassword, employee.password);
  if (!matched) {
    throw createError('Mật khẩu hiện tại không chính xác.', 400);
  }

  await EmployeeModel.update(employee.id, {
    fullName: employee.fullName,
    phone: employee.phone,
    email: employee.email,
    role: employee.role,
    status: employee.status || EMPLOYEE_STATUS_ACTIVE,
    password: await hashPassword(newPassword),
  });

  sendSuccess(res, {
    data: null,
    message: 'Đổi mật khẩu thành công.',
  });
});

module.exports = {
  adminLogin,
  customerRegister,
  customerLogin,
  me,
  logout,
  changeAdminPassword,
};
