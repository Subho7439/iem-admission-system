const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../config/constants');

const paymentSchema = new mongoose.Schema({
  transactionReference: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  allocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SeatAllocation',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Payment amount must be positive']
  },
  paymentMethod: {
    type: String,
    enum: ['NetBanking_Demo', 'UPI_Demo', 'Card_Demo', 'Demo_Simulator'],
    default: 'Demo_Simulator'
  },
  status: {
    type: String,
    enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING,
    index: true
  },
  gatewayResponse: {
    gatewayOrderId: { type: String },
    gatewayPaymentId: { type: String },
    gatewaySignature: { type: String },
    mode: { type: String, default: 'SIMULATED_ACADEMIC_DEMO' }
  },
  retryCount: {
    type: Number,
    default: 0
  },
  failureReason: {
    type: String,
    default: ''
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
