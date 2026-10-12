const express = require('express');
const router = express.Router();
const {
  getReportsSummary,
  exportApplicationsCSV
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { ROLES } = require('../config/constants');

router.get('/summary', protect, authorizeRoles(ROLES.ADMIN), getReportsSummary);
router.get('/export/applications-csv', protect, authorizeRoles(ROLES.ADMIN), exportApplicationsCSV);

module.exports = router;
