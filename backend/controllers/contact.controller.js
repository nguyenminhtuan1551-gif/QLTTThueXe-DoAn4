const { sendSuccess } = require('../common/response');
const asyncHandler = require('../middlewares/asyncHandler');
const ContactModel = require('../models/contact.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const list = asyncHandler(async (_req, res) => {
  const contacts = await ContactModel.findAll();

  sendSuccess(res, {
    data: contacts,
    meta: { total: contacts.length },
    message: 'Lấy danh sách liên hệ thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const { fullName, phone, email, message } = req.body;

  if (!fullName || !phone || !email || !message) {
    throw createError('Vui lòng nhập đầy đủ thông tin liên hệ.', 400);
  }

  const createdContact = await ContactModel.create({
    fullName,
    phone,
    email,
    message,
  });

  sendSuccess(res, {
    status: 201,
    data: createdContact,
    message: 'Gửi liên hệ thành công.',
  });
});

const updateStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const existing = await ContactModel.findById(id);
  if (!existing) {
    throw createError('Không tìm thấy tin nhắn liên hệ.', 404);
  }

  const updated = await ContactModel.updateStatus(id, status || 'Đã phản hồi');

  sendSuccess(res, {
    data: updated,
    message: 'Cập nhật trạng thái liên hệ thành công.',
  });
});

module.exports = {
  list,
  create,
  updateStatus,
};
