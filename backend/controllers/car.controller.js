const path = require('path');

const { generateId } = require('../common/generateId');
const { sendSuccess } = require('../common/response');
const asyncHandler = require('../middlewares/asyncHandler');
const CarModel = require('../models/car.model');

function createError(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const list = asyncHandler(async (req, res) => {
  const cars = await CarModel.findAll(req.query);

  sendSuccess(res, {
    data: cars,
    meta: { total: cars.length },
    message: 'Lấy danh sách xe thành công.',
  });
});

const featured = asyncHandler(async (req, res) => {
  const cars = await CarModel.findFeatured(req.query.limit || 6);

  sendSuccess(res, {
    data: cars,
    meta: { total: cars.length },
    message: 'Lấy danh sách xe nổi bật thành công.',
  });
});

const getById = asyncHandler(async (req, res) => {
  const car = await CarModel.findById(req.params.id);

  if (!car) {
    throw createError('Không tìm thấy xe.', 404);
  }

  sendSuccess(res, {
    data: car,
    message: 'Lấy chi tiết xe thành công.',
  });
});

const create = asyncHandler(async (req, res) => {
  const { id, licensePlate, name, type, brand, year, price, fuelType, seatCount, status, image, notes, location } = req.body;

  if (!licensePlate || !name || !type || !brand || !year || !price || !fuelType || !seatCount || !status) {
    throw createError('Vui lòng nhập đầy đủ thông tin xe.', 400);
  }

  const createdCar = await CarModel.create({
    id: id || generateId('XE'),
    licensePlate,
    name,
    type,
    brand,
    year,
    price,
    fuelType,
    seatCount,
    status,
    image,
    notes,
    location,
  });

  sendSuccess(res, {
    status: 201,
    data: createdCar,
    message: 'Thêm xe mới thành công.',
  });
});

const update = asyncHandler(async (req, res) => {
  const existingCar = await CarModel.findById(req.params.id);

  if (!existingCar) {
    throw createError('Không tìm thấy xe cần cập nhật.', 404);
  }

  const updatedCar = await CarModel.update(req.params.id, {
    licensePlate: req.body.licensePlate ?? existingCar.licensePlate,
    name: req.body.name ?? existingCar.name,
    type: req.body.type ?? existingCar.type,
    brand: req.body.brand ?? existingCar.brand,
    year: req.body.year ?? existingCar.year,
    price: req.body.price ?? existingCar.price,
    fuelType: req.body.fuelType ?? existingCar.fuelType,
    seatCount: req.body.seatCount ?? existingCar.seatCount,
    status: req.body.status ?? existingCar.status,
    image: req.body.image ?? existingCar.image,
    notes: req.body.notes ?? existingCar.notes,
    location: req.body.location ?? existingCar.location,
  });

  sendSuccess(res, {
    data: updatedCar,
    message: 'Cập nhật xe thành công.',
  });
});

const remove = asyncHandler(async (req, res) => {
  const existingCar = await CarModel.findById(req.params.id);

  if (!existingCar) {
    throw createError('Không tìm thấy xe cần xóa.', 404);
  }

  await CarModel.remove(req.params.id);

  sendSuccess(res, {
    data: null,
    message: 'Xóa xe thành công.',
  });
});

const uploadImage = asyncHandler(async (req, res) => {
  const existingCar = await CarModel.findById(req.params.id);

  if (!existingCar) {
    throw createError('Không tìm thấy xe để cập nhật ảnh.', 404);
  }

  if (!req.file) {
    throw createError('Vui lòng chọn file ảnh hợp lệ.', 400);
  }

  const imagePath = path.posix.join('/uploads/car', req.file.filename);
  const updatedCar = await CarModel.updateImage(req.params.id, imagePath);

  sendSuccess(res, {
    data: updatedCar,
    message: 'Tải ảnh xe lên thành công.',
  });
});

module.exports = {
  list,
  featured,
  getById,
  create,
  update,
  remove,
  uploadImage,
};
