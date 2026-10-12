const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'REGISTRATION',
      'SUBMISSION',
      'DOC_APPROVED',
      'DOC_REJECTED',
      'VERIFICATION_COMPLETE',
      'MERIT_PUBLISHED',
      'SEAT_ALLOTTED',
      'PAYMENT_UPDATE',
      'DEADLINE_REMINDER',
      'SEAT_CONFIRMED',
      'SEAT_DECLINED',
      'GENERAL'
    ],
    default: 'GENERAL'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedApplicationId: {
    type: String,
    default: ''
  },
  link: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
