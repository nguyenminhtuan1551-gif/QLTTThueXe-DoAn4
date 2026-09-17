const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'car-rental-jwt-secret-key-2026-secure-token';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Tạo JSON Web Token từ payload
 * @param {Object} payload - Dữ liệu người dùng cần mã hoá
 * @param {Object} options - Tùy chọn mở rộng của jsonwebtoken
 * @returns {string} Token JWT
 */
function signToken(payload, options = {}) {
  const cleanPayload = { ...payload };
  // Xóa các trường nhạy cảm nếu có
  delete cleanPayload.password;
  delete cleanPayload.MatKhau;

  return jwt.sign(cleanPayload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    ...options,
  });
}

/**
 * Xác thực và giải mã JSON Web Token
 * @param {string} token - Token JWT
 * @returns {Object|null} Payload đã giải mã hoặc ném lỗi nếu không hợp lệ
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Giải mã token mà không cần verify (dùng để debug hoặc trích xuất thông tin nhanh)
 * @param {string} token
 * @returns {Object|null}
 */
function decodeToken(token) {
  return jwt.decode(token);
}

module.exports = {
  signToken,
  verifyToken,
  decodeToken,
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
