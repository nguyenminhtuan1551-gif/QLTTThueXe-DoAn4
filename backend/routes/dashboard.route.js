const express = require('express');

const DashboardController = require('../controllers/dashboard.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/summary', staffOnly, DashboardController.summary);
router.get('/alerts', staffOnly, DashboardController.alerts);
router.get('/revenue-report', staffOnly, DashboardController.revenueReport);

module.exports = router;
