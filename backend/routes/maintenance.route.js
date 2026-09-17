const express = require('express');

const MaintenanceController = require('../controllers/maintenance.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/', staffOnly, MaintenanceController.list);
router.get('/:id', staffOnly, MaintenanceController.getById);
router.post('/', staffOnly, MaintenanceController.create);
router.put('/:id', staffOnly, MaintenanceController.update);
router.delete('/:id', requireRoles('Admin'), MaintenanceController.remove);

module.exports = router;
