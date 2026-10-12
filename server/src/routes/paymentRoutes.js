const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  processSimulatedOutcome,
  getMyPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { ROLES } = require('../config/constants');

router.post('/create-order', protect, authorizeRoles(ROLES.STUDENT), createPaymentOrder);
router.post('/:id/simulate-outcome', protect, authorizeRoles(ROLES.STUDENT), processSimulatedOutcome);
router.get('/my-payments', protect, authorizeRoles(ROLES.STUDENT), getMyPayments);

module.exports = router;
