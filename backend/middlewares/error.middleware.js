function notFoundHandler(req, _res, next) {
  const error = new Error(`Không tìm thấy tài nguyên: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, _req, res, _next) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Dữ liệu đã tồn tại trong hệ thống.',
    });
  }

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Đã có lỗi xảy ra ở máy chủ.',
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
