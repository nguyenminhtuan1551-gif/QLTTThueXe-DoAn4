const express = require('express');

const PenaltyController = require('../controllers/penalty.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/', staffOnly, PenaltyController.list);
router.get('/:id', staffOnly, PenaltyController.getById);
router.post('/', staffOnly, PenaltyController.create);
router.put('/:id', staffOnly, PenaltyController.update);
router.delete('/:id', requireRoles('Admin'), PenaltyController.remove);

module.exports = router;
