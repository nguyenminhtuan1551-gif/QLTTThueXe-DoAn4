const express = require('express');

const CustomerController = require('../controllers/customer.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/', staffOnly, CustomerController.list);
router.get('/:id/rentals', staffOnly, CustomerController.rentalHistory);
router.get('/:id', staffOnly, CustomerController.getById);
router.post('/', staffOnly, CustomerController.create);
router.put('/:id', staffOnly, CustomerController.update);
router.delete('/:id', requireRoles('Admin'), CustomerController.remove);

module.exports = router;
