const mongoose = require('mongoose');
const { SEAT_STATUS } = require('../config/constants');

const seatAllocationSchema = new mongoose.Schema({
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    unique: true, // One active allotment per application
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  seat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seat',
    required: true
  },
  programme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdmissionProgramme',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  feeAmount: {
    type: Number,
    required: true
  },
  allotmentDate: {
    type: Date,
    default: Date.now
  },
  acceptanceDeadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SEAT_STATUS),
    default: SEAT_STATUS.ALLOTTED,
    index: true
  },
  acceptedAt: {
    type: Date
  },
  declinedAt: {
    type: Date
  },
  declineReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SeatAllocation', seatAllocationSchema);
