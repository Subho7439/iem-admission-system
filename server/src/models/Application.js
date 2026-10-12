const mongoose = require('mongoose');
const { APPLICATION_STATUS, CATEGORIES } = require('../config/constants');

const applicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionProgramme',
    required: true
  },
  admissionCycle: {
    type: String,
    default: '2026-2027'
  },
  status: {
    type: String,
    enum: Object.values(APPLICATION_STATUS),
    default: APPLICATION_STATUS.DRAFT,
    index: true
  },
  isDraft: {
    type: Boolean,
    default: true
  },
  submissionDate: {
    type: Date
  },
  personalInfo: {
    fullName: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
    email: { type: String, lowercase: true, trim: true },
    mobile: { type: String, trim: true },
    address: { type: String, trim: true },
    state: { type: String, trim: true },
    pinCode: { type: String, trim: true },
    category: { type: String, enum: CATEGORIES, default: 'GENERAL' },
    guardianName: { type: String, trim: true },
    guardianMobile: { type: String, trim: true },
    guardianOccupation: { type: String, trim: true }
  },
  academicInfo: {
    class10Board: { type: String, trim: true },
    class10Year: { type: Number },
    class10Percentage: {
      type: Number,
      min: [0, 'Class 10 percentage cannot be less than 0'],
      max: [100, 'Class 10 percentage cannot exceed 100']
    },
    class12Board: { type: String, trim: true },
    class12Year: { type: Number },
    class12Percentage: {
      type: Number,
      min: [0, 'Class 12 percentage cannot be less than 0'],
      max: [100, 'Class 12 percentage cannot exceed 100']
    },
    entranceExam: {
      type: String,
      enum: ['WBJEE', 'JEE Main', 'IEMJEE'],
      default: 'WBJEE'
    },
    entranceRank: {
      type: Number,
      min: [1, 'Entrance rank must be a positive integer']
    },
    entrancePercentile: {
      type: Number,
      min: [0, 'Percentile cannot be less than 0'],
      max: [100, 'Percentile cannot exceed 100']
    }
  },
  isDocumentVerified: {
    type: Boolean,
    default: false
  },
  isEligible: {
    type: Boolean,
    default: false
  },
  eligibilityRemarks: {
    type: String,
    default: ''
  },
  meritPosition: {
    type: Number,
    default: null
  },
  categoryMeritPosition: {
    type: Number,
    default: null
  },
  reviewNotes: {
    type: String,
    default: ''
  },
  lastReviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastReviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index for unique applicant per cycle per program if required
applicationSchema.index({ user: 1, admissionCycle: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
