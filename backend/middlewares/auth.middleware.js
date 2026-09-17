const { verifyToken } = require('../common/jwt');

/**
 * Middleware trích xuất và xác thực thông tin người dùng từ JWT Bearer Header hoặc Session
 */
function loadSessionUser(req, _res, next) {
  let user = null;

  // 1. Kiểm tra Bearer Token trong Authorization Header
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        user = decoded;
      }
    }
  }

  // 2. Fallback sang session nếu không có Bearer token
  if (!user && req.session?.user) {
    user = req.session.user;
  }

  req.currentUser = user;
  next();
}

/**
 * Bắt buộc người dùng phải đăng nhập (qua JWT hoặc Session)
 */
function requireAuth(req, _res, next) {
  if (!req.currentUser) {
    const error = new Error('Bạn cần đăng nhập để tiếp tục.');
    error.statusCode = 401;
    throw error;
  }

  next();
}

/**
 * Kiểm tra phân quyền theo vai trò (Admin, Nhân viên, Customer, ...)
 * @param  {...string} roles - Danh sách vai trò được phép truy cập
 */
function requireRoles(...roles) {
  return (req, _res, next) => {
    if (!req.currentUser) {
      const error = new Error('Bạn cần đăng nhập để tiếp tục.');
      error.statusCode = 401;
      throw error;
    }

    if (!roles.includes(req.currentUser.role)) {
      const error = new Error('Bạn không có quyền truy cập chức năng này.');
      error.statusCode = 403;
      throw error;
    }

    next();
  };
}

/**
 * Yêu cầu quyền truy cập dành riêng cho Khách hàng
 */
function requireCustomer(req, _res, next) {
  if (!req.currentUser) {
    const error = new Error('Bạn cần đăng nhập để tiếp tục.');
    error.statusCode = 401;
    throw error;
  }

  const isCustomer = req.currentUser.scope === 'customer' || req.currentUser.role === 'Customer';
  if (!isCustomer) {
    const error = new Error('Chức năng này chỉ dành cho khách hàng.');
    error.statusCode = 403;
    throw error;
  }

  next();
}

/**
 * Yêu cầu quyền Quản trị viên hoặc Nhân viên (Khu vực quản trị nội bộ)
 */
function requireAdminOrStaff(req, _res, next) {
  if (!req.currentUser) {
    const error = new Error('Bạn cần đăng nhập để tiếp tục.');
    error.statusCode = 401;
    throw error;
  }

  const isAdminOrStaff =
    req.currentUser.scope === 'admin' ||
    ['Admin', 'Nhân viên'].includes(req.currentUser.role);

  if (!isAdminOrStaff) {
    const error = new Error('Chức năng này chỉ dành cho Quản trị viên và Nhân viên.');
    error.statusCode = 403;
    throw error;
  }

  next();
}

module.exports = {
  loadSessionUser,
  requireAuth,
  requireRoles,
  requireCustomer,
  requireAdminOrStaff,
};
