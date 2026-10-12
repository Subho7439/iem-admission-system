const express = require('express');
const router = express.Router();
const {
  getMyApplication,
  updateDraft,
  submitApplication,
  getApplicationById,
  getAllApplications
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { validateApplicationUpdate } = require('../validators/applicationValidator');
const { ROLES } = require('../config/constants');

// Applicant specific endpoints
router.get('/my-application', protect, authorizeRoles(ROLES.STUDENT), getMyApplication);
router.put('/my-application/draft', protect, authorizeRoles(ROLES.STUDENT), validateApplicationUpdate, updateDraft);
router.post('/my-application/submit', protect, authorizeRoles(ROLES.STUDENT), submitApplication);

// Admin / Verifier list all applications with search and filters
router.get('/', protect, authorizeRoles(ROLES.ADMIN, ROLES.VERIFIER), getAllApplications);

// Single application details (Owner student or Admin/Verifier)
router.get('/:id', protect, getApplicationById);

module.exports = router;
