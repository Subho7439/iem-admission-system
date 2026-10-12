const fs = require('fs');
const Receipt = require('../models/Receipt');
const Application = require('../models/Application');
const pdfService = require('../services/pdfService');

/**
 * @desc    Get student's active admission receipt
 * @route   GET /api/receipts/my-receipt
 * @access  Private (Student)
 */
const getMyReceipt = async (req, res, next) => {
  try {
    const receipt = await Receipt.findOne({ student: req.user._id })
      .populate('application allocation payment');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'No provisional admission confirmation receipt found for this account'
      });
    }

    res.status(200).json({
      success: true,
      receipt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get receipt details by ID
 * @route   GET /api/receipts/:id
 * @access  Private (Admin, Verifier, or Owner Student)
 */
const getReceiptById = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('application allocation payment student');

    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    // Ownership check for students
    if (req.user.role === 'student' && receipt.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot access receipts issued to other students'
      });
    }

    res.status(200).json({
      success: true,
      receipt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download receipt PDF file
 * @route   GET /api/receipts/:id/download-pdf
 * @access  Private
 */
const downloadReceiptPDF = async (req, res, next) => {
  try {
    const receipt = await Receipt.findById(req.params.id).populate('application');
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found' });
    }

    // Test case 32: Unauthorized receipt downloads are blocked
    if (req.user.role === 'student' && receipt.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not authorized to download this confirmation receipt'
      });
    }

    let filePath = receipt.pdfPath;

    // If PDF file doesn't exist on disk, regenerate dynamically
    if (!filePath || !fs.existsSync(filePath)) {
      filePath = await pdfService.generateAdmissionReceipt({
        receiptNumber: receipt.receiptNumber,
        candidateName: receipt.candidateName,
        applicationId: receipt.application?.applicationId || 'IEM-2026',
        admissionCycle: receipt.admissionCycle,
        programmeName: receipt.programmeName,
        seatIdentifier: receipt.seatIdentifier,
        category: receipt.category,
        paymentReference: receipt.paymentReference,
        amountPaid: receipt.amountPaid,
        issuedAt: receipt.issuedAt
      });
      receipt.pdfPath = filePath;
      await receipt.save();
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${receipt.receiptNumber}.pdf"`);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyReceipt,
  getReceiptById,
  downloadReceiptPDF
};
