const express = require('express');

const CarController = require('../controllers/car.controller');
const upload = require('../common/carUpload');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/featured', CarController.featured);
router.get('/', CarController.list);
router.get('/:id', CarController.getById);
router.post('/', staffOnly, CarController.create);
router.put('/:id', staffOnly, CarController.update);
router.delete('/:id', requireRoles('Admin'), CarController.remove);
router.post('/:id/image', staffOnly, upload.single('image'), CarController.uploadImage);

module.exports = router;
