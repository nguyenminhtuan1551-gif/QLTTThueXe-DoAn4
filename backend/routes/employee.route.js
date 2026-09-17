const express = require('express');

const EmployeeController = require('../controllers/employee.controller');
const { requireRoles } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', requireRoles('Admin'), EmployeeController.list);
router.get('/:id', requireRoles('Admin'), EmployeeController.getById);
router.post('/', requireRoles('Admin'), EmployeeController.create);
router.put('/:id', requireRoles('Admin'), EmployeeController.update);
router.delete('/:id', requireRoles('Admin'), EmployeeController.remove);

module.exports = router;
