const express = require('express');
const router = express.Router();
const {
  getMyReceipt,
  getReceiptById,
  downloadReceiptPDF
} = require('../controllers/receiptController');
const { protect } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/roleAuth');
const { ROLES } = require('../config/constants');

router.get('/my-receipt', protect, authorizeRoles(ROLES.STUDENT), getMyReceipt);
router.get('/:id', protect, getReceiptById);
router.get('/:id/download-pdf', protect, downloadReceiptPDF);

module.exports = router;
