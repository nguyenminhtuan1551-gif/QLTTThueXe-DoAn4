function sendSuccess(res, { data = null, message = 'Thành công', meta, status = 200 } = {}) {
  const payload = {
    success: true,
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return res.status(status).json(payload);
}

module.exports = {
  sendSuccess,
};
