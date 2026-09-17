const express = require('express');

const InspectionController = require('../controllers/inspection.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/alerts/expiring', staffOnly, InspectionController.expiring);
router.get('/', staffOnly, InspectionController.list);
router.get('/:id', staffOnly, InspectionController.getById);
router.post('/', staffOnly, InspectionController.create);
router.put('/:id', staffOnly, InspectionController.update);
router.delete('/:id', requireRoles('Admin'), InspectionController.remove);

module.exports = router;
