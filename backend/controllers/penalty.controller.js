const { sendSuccess } = require('../common/response');
const { generateId } = require('../common/generateId');
const asyncHandler = require('../middlewares/asyncHandler');
const PenaltyModel = require('../models/penalty.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const list = asyncHandler(async (req, res) => {
  const penalties = await PenaltyModel.findAll(req.query);

  sendSuccess(res, {
    data: penalties,
    meta: { total: penalties.length },
    message: 'Lấy danh sách phí phạt thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const penalty = await PenaltyModel.findById(req.params.id);

  if (!penalty) {
    throw createError('Không tìm thấy phí phạt.', 404);
  }

  sendSuccess(res, {
    data: penalty,
    message: 'Lấy chi tiết phí phạt thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const { id, returnId, type, amount, notes } = req.body;

  if (!returnId || !type || !amount) {
    throw createError('Thiếu thông tin phí phạt.', 400);
  }

  const createdPenalty = await PenaltyModel.create({
    id: id || generateId('PP'),
    returnId,
    type,
    amount,
    notes,
  });

  sendSuccess(res, {
    status: 201,
    data: createdPenalty,
    message: 'Tạo phí phạt thành công.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingPenalty = await PenaltyModel.findById(req.params.id);

  if (!existingPenalty) {
    throw createError('Không tìm thấy phí phạt cần cập nhật.', 404);
  }

  const updatedPenalty = await PenaltyModel.update(req.params.id, {
    returnId: req.body.returnId ?? existingPenalty.returnId,
    type: req.body.type ?? existingPenalty.type,
    amount: req.body.amount ?? existingPenalty.amount,
    notes: req.body.notes ?? existingPenalty.notes,
  });

  sendSuccess(res, {
    data: updatedPenalty,
    message: 'Cập nhật phí phạt thành công.',
  });
});

const remove = asyncHandler(async (req, res) => {
  const existingPenalty = await PenaltyModel.findById(req.params.id);

  if (!existingPenalty) {
    throw createError('Không tìm thấy phí phạt cần xóa.', 404);
  }

  await PenaltyModel.remove(req.params.id);

  sendSuccess(res, {
    data: null,
    message: 'Xóa phí phạt thành công.',
  });
});

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
};
