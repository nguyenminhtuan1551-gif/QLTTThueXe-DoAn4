const express = require('express');

const SystemController = require('../controllers/system.controller');

const router = express.Router();

router.get('/meta', SystemController.meta);

module.exports = router;
