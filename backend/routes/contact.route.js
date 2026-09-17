const express = require('express');

const ContactController = require('../controllers/contact.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireRoles('Admin', 'Nhân viên'), ContactController.list);
router.post('/', ContactController.create);

module.exports = router;
