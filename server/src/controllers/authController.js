const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Application = require('../models/Application');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const Document = require('../models/Document');
const { ROLES, APPLICATION_STATUS, DOCUMENT_TYPES } = require('../config/constants');
const notificationService = require('../services/notificationService');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'iem_admission_system_jwt_secret_academic_pcc_cs504_2026', {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, mobile, password, dob, programmeId } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
    }

    // Role is strictly forced to student for public registration
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      mobile: mobile.trim(),
      password,
      dob: dob ? new Date(dob) : null,
      role: ROLES.STUDENT
    });

    // Initialize student's admission application draft with chosen or default programme
    try {
      let targetProg = null;
      if (programmeId) {
        targetProg = await AdmissionProgramme.findById(programmeId);
      }
      if (!targetProg) {
        targetProg = await AdmissionProgramme.findOne({ isActive: true });
      }

      if (targetProg) {
        const count = await Application.countDocuments();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const appId = `IEM-2026-${String(count + 1).padStart(3, '0')}${randomSuffix}`;

        const initialApp = await Application.create({
          applicationId: appId,
          user: user._id,
          programme: targetProg._id,
          status: APPLICATION_STATUS.DRAFT,
          isDraft: true,
          personalInfo: {
            fullName: user.name,
            email: user.email,
            mobile: user.mobile,
            dob: user.dob
          }
        });

        const initialDocs = Object.values(DOCUMENT_TYPES).map(docType => ({
          application: initialApp._id,
          user: user._id,
          documentType: docType,
          isRequired: docType !== DOCUMENT_TYPES.CATEGORY_CERT
        }));
        await Document.insertMany(initialDocs);
      }
    } catch (appInitErr) {
      // Non-fatal if application is subsequently lazy-initialized in getMyApplication
      console.warn(`[Register] Notice: Initial application auto-creation deferred: ${appInitErr.message}`);
    }

    const token = generateToken(user._id);

    // Create welcome notification
    await notificationService.notify({
      recipientId: user._id,
      title: 'Welcome to IEM Admission Portal',
      message: `Hello ${user.name}, your registration is complete! You can now start filling in your admission application.`,
      type: 'REGISTRATION',
      link: '/student/application'
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        dob: user.dob
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user (Student, Admin, Verifier)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'This account has been deactivated' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email address or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        dob: user.dob
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user details
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        dob: user.dob,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Quick demo login for academic evaluation
 * @route   POST /api/auth/demo-login
 * @access  Public
 */
const demoLogin = async (req, res, next) => {
  try {
    const { role = 'student' } = req.body;
    let query = { role };

    if (role === 'student_draft') {
      query = { email: 'draft.student@iemcal.edu' };
    } else if (role === 'student_verified') {
      query = { email: 'verified.student@iemcal.edu' };
    } else if (role === 'student_allotted') {
      query = { email: 'allotted.student@iemcal.edu' };
    } else if (role === 'student_rejected_doc') {
      query = { email: 'rejected.doc@iemcal.edu' };
    }

    const user = await User.findOne(query);
    if (!user) {
      return res.status(404).json({ success: false, message: `Demo account for '${role}' not found. Please run seed script.` });
    }

    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      message: `Demo logged in as ${user.name} (${user.role})`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  demoLogin
};
