const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const Application = require('../models/Application');
const notificationService = require('../services/notificationService');
const { DOCUMENT_STATUS, APPLICATION_STATUS } = require('../config/constants');

/**
 * @desc    Upload or replace a document
 * @route   POST /api/documents/upload
 * @access  Private (Student)
 */
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a valid document file to upload' });
    }

    const { documentType } = req.body;
    if (!documentType) {
      return res.status(400).json({ success: false, message: 'documentType is required' });
    }

    const application = await Application.findOne({ user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    let document = await Document.findOne({ application: application._id, documentType });

    const isReplacement = document && document.status === DOCUMENT_STATUS.REJECTED;

    const fileMeta = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      status: isReplacement ? DOCUMENT_STATUS.REPLACEMENT_SUBMITTED : DOCUMENT_STATUS.PENDING
    };

    if (!document) {
      document = new Document({
        application: application._id,
        user: req.user._id,
        documentType,
        ...fileMeta,
        history: [{
          status: fileMeta.status,
          remarks: 'Document uploaded',
          fileName: fileMeta.fileName,
          changedBy: req.user._id,
          timestamp: new Date()
        }]
      });
    } else {
      // If document is already approved and application is submitted, prevent tampering unless requested
      if (document.status === DOCUMENT_STATUS.APPROVED && !application.isDraft) {
        return res.status(400).json({
          success: false,
          message: 'This document has already been verified and approved. It cannot be replaced.'
        });
      }

      document.originalName = fileMeta.originalName;
      document.fileName = fileMeta.fileName;
      document.filePath = fileMeta.filePath;
      document.mimeType = fileMeta.mimeType;
      document.fileSize = fileMeta.fileSize;
      document.status = fileMeta.status;
      document.verifierRemarks = ''; // Clear previous rejection remark upon replacement

      document.history.push({
        status: fileMeta.status,
        remarks: isReplacement ? 'Replacement document uploaded' : 'Document uploaded',
        fileName: fileMeta.fileName,
        changedBy: req.user._id,
        timestamp: new Date()
      });
    }

    await document.save();

    // If replacement was submitted, notify verifier/system
    if (isReplacement) {
      await notificationService.notify({
        recipientId: req.user._id,
        title: 'Replacement Document Submitted',
        message: `Your replacement for '${documentType}' has been uploaded and queued for re-verification.`,
        type: 'DOC_APPROVED',
        applicationId: application.applicationId,
        link: '/student/documents'
      });
    }

    res.status(200).json({
      success: true,
      message: `${documentType} uploaded successfully`,
      document
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Review a document (Approve or Reject with Remarks)
 * @route   PUT /api/documents/:id/review
 * @access  Private (Admin, Verifier)
 */
const reviewDocument = async (req, res, next) => {
  try {
    const { status, remarks = '' } = req.body;

    if (![DOCUMENT_STATUS.APPROVED, DOCUMENT_STATUS.REJECTED].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be either '${DOCUMENT_STATUS.APPROVED}' or '${DOCUMENT_STATUS.REJECTED}'`
      });
    }

    if (status === DOCUMENT_STATUS.REJECTED && !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A clear remark explaining the rejection reason is required when rejecting a document'
      });
    }

    const document = await Document.findById(req.params.id).populate('application user');
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.status = status;
    document.verifierRemarks = remarks.trim();
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();

    document.history.push({
      status,
      remarks: remarks.trim(),
      fileName: document.fileName,
      changedBy: req.user._id,
      timestamp: new Date()
    });

    await document.save();

    // Check application overall document status
    const allDocs = await Document.find({ application: document.application._id, isRequired: true });
    const hasRejected = allDocs.some(d => d.status === DOCUMENT_STATUS.REJECTED);
    const allApproved = allDocs.length >= 5 && allDocs.every(d => d.status === DOCUMENT_STATUS.APPROVED);

    const application = await Application.findById(document.application._id);

    if (hasRejected) {
      application.status = APPLICATION_STATUS.ACTION_REQUIRED;
      application.isDocumentVerified = false;
      application.isEligible = false;
      application.eligibilityRemarks = 'Documents rejected - action required from candidate';
      await application.save();

      // Notify candidate about rejection
      await notificationService.notify({
        recipientId: document.user._id,
        title: `Action Required: Document Rejected`,
        message: `Your '${document.documentType}' was rejected: "${remarks}". Please upload a replacement document immediately.`,
        type: 'DOC_REJECTED',
        applicationId: application.applicationId,
        link: '/student/documents'
      });
    } else if (allApproved) {
      application.status = APPLICATION_STATUS.VERIFIED;
      application.isDocumentVerified = true;
      application.isEligible = true;
      application.eligibilityRemarks = 'All mandatory documents verified and approved';
      await application.save();

      // Notify candidate about full approval
      await notificationService.notify({
        recipientId: document.user._id,
        title: 'Document Verification Completed',
        message: `All your submitted documents for application ${application.applicationId} have been verified and approved!`,
        type: 'VERIFICATION_COMPLETE',
        applicationId: application.applicationId,
        link: '/student/status'
      });
    } else {
      // Mixed or still pending docs
      if (status === DOCUMENT_STATUS.APPROVED) {
        await notificationService.notify({
          recipientId: document.user._id,
          title: `Document Approved: ${document.documentType}`,
          message: `Your document '${document.documentType}' has been verified and approved.`,
          type: 'DOC_APPROVED',
          applicationId: application.applicationId,
          link: '/student/documents'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Document has been ${status.toLowerCase()}`,
      document,
      applicationStatus: application.status
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download/Preview document with authorization check
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
const downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Authorization check: only owner student, admin, or verifier
    if (req.user.role === 'student' && document.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You cannot access documents belonging to other applicants'
      });
    }

    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({ success: false, message: 'Document file not found on server' });
    }

    res.setHeader('Content-Type', document.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${document.originalName || document.fileName}"`);

    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applicant's documents
 * @route   GET /api/documents/my-documents
 * @access  Private (Student)
 */
const getMyDocuments = async (req, res, next) => {
  try {
    const application = await Application.findOne({ user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const documents = await Document.find({ application: application._id });
    res.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDocument,
  reviewDocument,
  downloadDocument,
  getMyDocuments
};
