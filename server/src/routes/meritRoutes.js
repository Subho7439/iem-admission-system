const express = require('express');
const router = express.Router();
const {
  getMeritConfig,
  updateMeritConfig,
  calculateMerit,
  publishMeritList,
  getPublishedMeritList,
  exportMeritListCSV
} = require('../controllers/meritController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { ROLES } = require('../config/constants');

// Public or student viewing of published list
router.get('/list/:programmeId', getPublishedMeritList);

// Admin-only merit calculation & publishing operations
router.get('/config/:programmeId', protect, authorizeRoles(ROLES.ADMIN), getMeritConfig);
router.put('/config/:programmeId', protect, authorizeRoles(ROLES.ADMIN), updateMeritConfig);
router.post('/calculate', protect, authorizeRoles(ROLES.ADMIN), calculateMerit);
router.post('/publish', protect, authorizeRoles(ROLES.ADMIN), publishMeritList);
router.get('/export-csv/:programmeId', protect, authorizeRoles(ROLES.ADMIN), exportMeritListCSV);

module.exports = router;
