const Application = require('../models/Application');
const Document = require('../models/Document');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const notificationService = require('../services/notificationService');
const { validateApplicationSubmission } = require('../validators/applicationValidator');
const { APPLICATION_STATUS, DOCUMENT_TYPES } = require('../config/constants');

/**
 * Helper to generate unique Application ID: IEM-2026-XXXX
 */
const generateApplicationId = async () => {
  const count = await Application.countDocuments();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `IEM-2026-${String(count + 1).padStart(3, '0')}${randomSuffix}`;
};

/**
 * @desc    Get or create applicant's active application
 * @route   GET /api/applications/my-application
 * @access  Private (Student)
 */
const getMyApplication = async (req, res, next) => {
  try {
    let application = await Application.findOne({ user: req.user._id })
      .populate('programme')
      .populate('lastReviewedBy', 'name role');

    if (!application) {
      // Find a default active programme (e.g. B.Tech CSE)
      const defaultProg = await AdmissionProgramme.findOne({ isActive: true });
      if (!defaultProg) {
        return res.status(400).json({ success: false, message: 'No active admission programme found' });
      }

      const appId = await generateApplicationId();
      application = await Application.create({
        applicationId: appId,
        user: req.user._id,
        programme: defaultProg._id,
        status: APPLICATION_STATUS.DRAFT,
        isDraft: true,
        personalInfo: {
          fullName: req.user.name,
          email: req.user.email,
          mobile: req.user.mobile,
          dob: req.user.dob
        }
      });

      // Initialize default document placeholders for this applicant
      const initialDocs = Object.values(DOCUMENT_TYPES).map(docType => ({
        application: application._id,
        user: req.user._id,
        documentType: docType,
        isRequired: docType !== DOCUMENT_TYPES.CATEGORY_CERT
      }));
      await Document.insertMany(initialDocs);

      application = await Application.findById(application._id).populate('programme');
    }

    // Fetch documents associated with this application
    const documents = await Document.find({ application: application._id });

    res.status(200).json({
      success: true,
      application,
      documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Save/Update application draft
 * @route   PUT /api/applications/my-application/draft
 * @access  Private (Student)
 */
const updateDraft = async (req, res, next) => {
  try {
    const application = await Application.findOne({ user: req.user._id });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!application.isDraft && application.status !== APPLICATION_STATUS.DRAFT && application.status !== APPLICATION_STATUS.ACTION_REQUIRED) {
      return res.status(400).json({
        success: false,
        message: `Cannot edit application in '${application.status}' state. Only drafts can be modified.`
      });
    }

    const { programmeId, personalInfo, academicInfo } = req.body;

    if (programmeId) {
      const prog = await AdmissionProgramme.findById(programmeId);
      if (prog) application.programme = prog._id;
    }

    if (personalInfo) {
      application.personalInfo = {
        ...application.personalInfo.toObject(),
        ...personalInfo
      };
    }

    if (academicInfo) {
      application.academicInfo = {
        ...application.academicInfo.toObject(),
        ...academicInfo
      };
    }

    await application.save();
    const updated = await Application.findById(application._id).populate('programme');

    res.status(200).json({
      success: true,
      message: 'Draft saved successfully',
      application: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit formal application
 * @route   POST /api/applications/my-application/submit
 * @access  Private (Student)
 */
const submitApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ user: req.user._id }).populate('programme');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!application.isDraft && application.status !== APPLICATION_STATUS.DRAFT && application.status !== APPLICATION_STATUS.ACTION_REQUIRED) {
      return res.status(400).json({
        success: false,
        message: 'This application has already been formally submitted.'
      });
    }

    // Fetch documents to validate completion
    const documents = await Document.find({ application: application._id });

    // Validate submission completeness
    const validation = validateApplicationSubmission(application, documents);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Application is incomplete and cannot be submitted.',
        errors: validation.errors
      });
    }

    application.isDraft = false;
    application.status = APPLICATION_STATUS.SUBMITTED;
    application.submissionDate = new Date();
    await application.save();

    // Mark uploaded documents as Pending or Under Review
    await Document.updateMany(
      { application: application._id, filePath: { $ne: '' }, status: 'Not Uploaded' },
      { $set: { status: 'Pending' } }
    );

    // Create in-app notification
    await notificationService.notify({
      recipientId: req.user._id,
      title: 'Application Submitted Successfully',
      message: `Your application ${application.applicationId} for ${application.programme.name} has been formally submitted. It is now queued for document verification.`,
      type: 'SUBMISSION',
      applicationId: application.applicationId,
      link: '/student/status'
    });

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: application.applicationId,
      application
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get application by ID (Protected: Admin, Verifier, or Owner Student)
 * @route   GET /api/applications/:id
 * @access  Private
 */
const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('programme user')
      .populate('lastReviewedBy', 'name role');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Enforce ownership: student can only view their own application!
    if (req.user.role === 'student' && application.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You do not have permission to access another applicant’s record'
      });
    }

    const documents = await Document.find({ application: application._id }).populate('verifiedBy', 'name role');

    res.status(200).json({
      success: true,
      application,
      documents
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all applications with search, filter, pagination (Admin, Verifier)
 * @route   GET /api/applications
 * @access  Private (Admin, Verifier)
 */
const getAllApplications = async (req, res, next) => {
  try {
    const {
      search = '',
      status = '',
      programme = '',
      category = '',
      exam = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status) query.status = status;

    // Filter by programme
    if (programme) query.programme = programme;

    // Filter by category
    if (category) query['personalInfo.category'] = category;

    // Filter by exam
    if (exam) query['academicInfo.entranceExam'] = exam;

    // Search by name, email, or application ID
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { applicationId: regex },
        { 'personalInfo.fullName': regex },
        { 'personalInfo.email': regex }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const total = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate('programme', 'name code degree')
      .populate('user', 'name email mobile')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      applications
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyApplication,
  updateDraft,
  submitApplication,
  getApplicationById,
  getAllApplications
};
