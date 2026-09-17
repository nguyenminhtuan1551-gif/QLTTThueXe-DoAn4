const { sendSuccess } = require('../common/response');
const {
  CAR_STATUSES,
  CONTRACT_STATUSES,
  INSPECTION_STATUSES,
  MAINTENANCE_STATUSES,
  EMPLOYEE_ROLES,
  PENALTY_TYPES,
  PAYMENT_METHODS,
} = require('../common/constants');

function meta(_req, res) {
  sendSuccess(res, {
    data: {
      appName: 'Car Rental Backend',
      authStrategy: 'session',
      statuses: {
        car: CAR_STATUSES,
        contract: CONTRACT_STATUSES,
        inspection: INSPECTION_STATUSES,
        maintenance: MAINTENANCE_STATUSES,
        employeeRole: EMPLOYEE_ROLES,
        penaltyType: PENALTY_TYPES,
        paymentMethod: PAYMENT_METHODS,
      },
    },
    message: 'Lấy metadata hệ thống thành công.',
  });
}

module.exports = {
  meta,
};
