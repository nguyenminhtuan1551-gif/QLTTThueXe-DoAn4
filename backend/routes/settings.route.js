const express = require('express');

const SettingsController = require('../controllers/settings.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireRoles('Admin', 'Nhân viên'), SettingsController.getSettings);
router.put('/', requireRoles('Admin', 'Nhân viên'), SettingsController.updateSettings);

module.exports = router;
