const express = require('express');

const ReturnController = require('../controllers/return.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/', staffOnly, ReturnController.list);
router.get('/:id', staffOnly, ReturnController.getById);
router.post('/', staffOnly, ReturnController.create);
router.put('/:id', staffOnly, ReturnController.update);

module.exports = router;
