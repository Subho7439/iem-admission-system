const express = require('express');
const router = express.Router();
const {
  uploadDocument,
  reviewDocument,
  downloadDocument,
  getMyDocuments
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const upload = require('../middleware/upload');
const { ROLES } = require('../config/constants');

// Upload document (Student only)
router.post('/upload', protect, authorizeRoles(ROLES.STUDENT), upload.single('document'), uploadDocument);

// Get student's documents
router.get('/my-documents', protect, authorizeRoles(ROLES.STUDENT), getMyDocuments);

// Review document (Admin, Verifier)
router.put('/:id/review', protect, authorizeRoles(ROLES.ADMIN, ROLES.VERIFIER), reviewDocument);

// Download / preview document (Authorized owner or Admin/Verifier)
router.get('/:id/download', protect, downloadDocument);

module.exports = router;
