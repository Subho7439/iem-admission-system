const express = require('express');
const router = express.Router();
const {
  getProgrammeSeats,
  allotSeat,
  getMyAllotment,
  acceptSeat,
  declineSeat
} = require('../controllers/seatController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { ROLES } = require('../config/constants');

// Student allotment actions
router.get('/my-allotment', protect, authorizeRoles(ROLES.STUDENT), getMyAllotment);
router.post('/accept', protect, authorizeRoles(ROLES.STUDENT), acceptSeat);
router.post('/decline', protect, authorizeRoles(ROLES.STUDENT), declineSeat);

// Admin seat inventory and allocation management
router.get('/programme/:programmeId', protect, authorizeRoles(ROLES.ADMIN), getProgrammeSeats);
router.post('/allot', protect, authorizeRoles(ROLES.ADMIN), allotSeat);

module.exports = router;
