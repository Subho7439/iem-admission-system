const mongoose = require('mongoose');

const admissionProgrammeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    enum: ['B.Tech', 'BCA', 'MCA', 'BBA', 'M.Tech'],
    default: 'B.Tech'
  },
  durationYears: {
    type: Number,
    default: 4
  },
  totalSeats: {
    type: Number,
    required: true,
    min: [1, 'Must have at least 1 seat']
  },
  seatsByCategory: {
    GENERAL: { type: Number, default: 0 },
    OBC: { type: Number, default: 0 },
    SC: { type: Number, default: 0 },
    ST: { type: Number, default: 0 }
  },
  admissionFee: {
    type: Number,
    required: true,
    default: 65000
  },
  semesterFee: {
    type: Number,
    required: true,
    default: 85000
  },
  eligibility: {
    minClass12Percentage: {
      type: Number,
      default: 60,
      min: 0,
      max: 100
    },
    allowedExams: {
      type: [String],
      default: ['WBJEE', 'JEE Main']
    },
    maxEntranceRank: {
      type: Number,
      default: 50000
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdmissionProgramme', admissionProgrammeSchema);
