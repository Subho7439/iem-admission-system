const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    unique: true, // One confirmed receipt per application
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true
  },
  allocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeatAllocation',
    required: true
  },
  candidateName: {
    type: String,
    required: true
  },
  programmeName: {
    type: String,
    required: true
  },
  programmeCode: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  seatIdentifier: {
    type: String,
    required: true
  },
  amountPaid: {
    type: Number,
    required: true
  },
  paymentReference: {
    type: String,
    required: true
  },
  admissionCycle: {
    type: String,
    default: '2026-2027'
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  pdfPath: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Receipt', receiptSchema);
