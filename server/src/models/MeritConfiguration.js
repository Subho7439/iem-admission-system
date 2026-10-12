const mongoose = require('mongoose');

const meritConfigurationSchema = new mongoose.Schema({
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
  primaryCriterion: {
    type: String,
    enum: ['EntranceRank', 'Class12Marks', 'EntrancePercentile'],
    default: 'EntranceRank'
  },
  rankOrder: {
    type: String,
    enum: ['ASC', 'DESC'],
    default: 'ASC' // ASC for rank (lower rank is better), DESC for marks/percentile
  },
  tieBreakers: {
    type: [String],
    default: ['Class12Marks', 'Class10Marks']
  },
  allowedExams: {
    type: [String],
    default: ['WBJEE', 'JEE Main']
  },
  status: {
    type: String,
    enum: ['Draft', 'Calculated', 'Published'],
    default: 'Draft'
  },
  publishedAt: {
    type: Date
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

meritConfigurationSchema.index({ programme: 1, admissionCycle: 1 }, { unique: true });

module.exports = mongoose.model('MeritConfiguration', meritConfigurationSchema);
