const express = require('express');

const ContactController = require('../controllers/contact.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();
const staffOnly = requireRoles('Admin', 'Nhân viên');

router.get('/', staffOnly, ContactController.list);
router.post('/', ContactController.create);
router.patch('/:id/status', staffOnly, ContactController.updateStatus);
router.put('/:id', staffOnly, ContactController.updateStatus);

module.exports = router;
