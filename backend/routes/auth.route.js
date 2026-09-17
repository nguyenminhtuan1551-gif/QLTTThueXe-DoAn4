const express = require('express');

const AuthController = require('../controllers/auth.controller');
const { requireAuth, requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/admin/login', AuthController.adminLogin);
router.post('/customers/register', AuthController.customerRegister);
router.post('/customers/login', AuthController.customerLogin);
router.get('/me', requireAuth, AuthController.me);
router.post('/logout', requireAuth, AuthController.logout);
router.patch('/admin/change-password', requireRoles('Admin', 'Nhân viên'), AuthController.changeAdminPassword);

module.exports = router;
