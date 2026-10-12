const mongoose = require('mongoose');
const { SEAT_STATUS, CATEGORIES } = require('../config/constants');

const seatSchema = new mongoose.Schema({
  seatIdentifier: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionProgramme',
    required: true
  },
  category: {
    type: String,
    enum: CATEGORIES,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SEAT_STATUS),
    default: SEAT_STATUS.AVAILABLE,
    index: true
  },
  allottedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    default: null
  },
  allottedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

seatSchema.index({ programme: 1, category: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);
