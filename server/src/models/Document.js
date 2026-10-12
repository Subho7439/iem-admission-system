const mongoose = require('mongoose');
const { DOCUMENT_STATUS, DOCUMENT_TYPES } = require('../config/constants');

const documentSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  documentType: {
    type: String,
    enum: Object.values(DOCUMENT_TYPES),
    required: true
  },
  originalName: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  filePath: {
    type: String,
    default: ''
  },
  mimeType: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: Object.values(DOCUMENT_STATUS),
    default: DOCUMENT_STATUS.NOT_UPLOADED
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  verifierRemarks: {
    type: String,
    default: ''
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: {
    type: Date
  },
  history: [
    {
      status: { type: String },
      remarks: { type: String, default: '' },
      fileName: { type: String },
      changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

documentSchema.index({ application: 1, documentType: 1 }, { unique: true });

module.exports = mongoose.model('Document', documentSchema);
