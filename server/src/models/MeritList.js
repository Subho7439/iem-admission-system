const mongoose = require('mongoose');

const meritListEntrySchema = new mongoose.Schema({
  position: { type: Number, required: true },
  categoryPosition: { type: Number, required: true },
  application: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
  applicationId: { type: String, required: true },
  candidateName: { type: String, required: true },
  category: { type: String, required: true },
  entranceExam: { type: String },
  entranceRank: { type: Number },
  entrancePercentile: { type: Number },
  class12Percentage: { type: Number },
  class10Percentage: { type: Number },
  meritScore: { type: Number, required: true },
  tieBreakDetails: { type: String, default: '' },
  isEligible: { type: Boolean, default: true }
}, { _id: false });

const meritListSchema = new mongoose.Schema({
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionProgramme',
    required: true
  },
  admissionCycle: {
    type: String,
    required: true,
    default: '2026-2027'
  },
  status: {
    type: String,
    enum: ['Preview', 'Published'],
    default: 'Preview'
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  entries: [meritListEntrySchema]
}, {
  timestamps: true
});

meritListSchema.index({ programme: 1, admissionCycle: 1 });

module.exports = mongoose.model('MeritList', meritListSchema);
