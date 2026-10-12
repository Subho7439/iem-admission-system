const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getProgrammes,
  saveProgramme,
  getAuditLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { ROLES } = require('../config/constants');

// Public or student can view available programmes
router.get('/programmes', getProgrammes);

// Admin-protected routes
router.get('/dashboard-stats', protect, authorizeRoles(ROLES.ADMIN), getDashboardStats);
router.post('/programmes', protect, authorizeRoles(ROLES.ADMIN), saveProgramme);
router.get('/audit-logs', protect, authorizeRoles(ROLES.ADMIN), getAuditLogs);

module.exports = router;
