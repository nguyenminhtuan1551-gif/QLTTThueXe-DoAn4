const express = require('express');

const authRoute = require('./auth.route');
const carRoute = require('./car.route');
const customerRoute = require('./customer.route');
const contractRoute = require('./contract.route');
const returnRoute = require('./return.route');
const penaltyRoute = require('./penalty.route');
const inspectionRoute = require('./inspection.route');
const maintenanceRoute = require('./maintenance.route');
const employeeRoute = require('./employee.route');
const dashboardRoute = require('./dashboard.route');
const contactRoute = require('./contact.route');
const systemRoute = require('./system.route');
const settingsRoute = require('./settings.route');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API healthy.',
  });
});

router.use('/auth', authRoute);
router.use('/cars', carRoute);
router.use('/customers', customerRoute);
router.use('/contracts', contractRoute);
router.use('/returns', returnRoute);
router.use('/penalties', penaltyRoute);
router.use('/inspections', inspectionRoute);
router.use('/maintenance', maintenanceRoute);
router.use('/employees', employeeRoute);
router.use('/dashboard', dashboardRoute);
router.use('/contacts', contactRoute);
router.use('/system', systemRoute);
router.use('/settings', settingsRoute);

module.exports = router;
