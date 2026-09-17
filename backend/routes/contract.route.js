const express = require('express');

const bookingImageUpload = require('../common/bookingImageUpload');
const ContractController = require('../controllers/contract.controller');
const { requireCustomer, requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/lookup', ContractController.lookup);
router.get('/my-rentals', requireCustomer, ContractController.myRentals);
router.get('/', staffOnly, ContractController.list);
router.get('/:id', staffOnly, ContractController.getById);
router.post('/', bookingImageUpload.array('pickupImages', 6), ContractController.create);
router.put('/:id', staffOnly, ContractController.update);
router.patch('/:id/cancel', staffOnly, ContractController.cancel);
router.delete('/:id', staffOnly, ContractController.remove);

module.exports = router;
