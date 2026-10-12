const Payment = require('../models/Payment');
const SeatAllocation = require('../models/SeatAllocation');
const notificationService = require('./notificationService');
const { PAYMENT_STATUS, SEAT_STATUS } = require('../config/constants');

class PaymentService {
  /**
   * Initialize a payment order for an allotted seat
   */
  async createPaymentOrder({ allocationId, userId, paymentMethod = 'NetBanking_Demo' }) {
    const allocation = await SeatAllocation.findById(allocationId).populate('application programme');
    if (!allocation) {
      throw new Error('Seat allocation not found');
    }

    if (allocation.student.toString() !== userId.toString()) {
      throw new Error('Unauthorized to make payment for this allocation');
    }

    if (allocation.status !== SEAT_STATUS.ALLOTTED) {
      throw new Error(`Cannot pay for allocation in status '${allocation.status}'`);
    }

    // Check if expired
    if (new Date() > new Date(allocation.acceptanceDeadline)) {
      throw new Error('Seat allotment acceptance deadline has expired');
    }

    // Check existing successful payment
    const existingSuccess = await Payment.findOne({
      allocation: allocation._id,
      status: PAYMENT_STATUS.SUCCESSFUL
    });
    if (existingSuccess) {
      throw new Error('Payment has already been completed successfully for this allotment');
    }

    // Generate unique transaction reference
    const uniqueTxnId = `TXN-IEM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      transactionReference: uniqueTxnId,
      application: allocation.application._id,
      student: userId,
      allocation: allocation._id,
      amount: allocation.feeAmount,
      paymentMethod,
      status: PAYMENT_STATUS.PENDING,
      gatewayResponse: {
        gatewayOrderId: `ORDER_${Date.now()}`,
        mode: 'SIMULATED_ACADEMIC_DEMO'
      }
    });

    return payment;
  }

  /**
   * Process simulated outcome (Success, Failed, Cancelled)
   * Enforced on server with simulated gateway validation
   */
  async processSimulatedOutcome({ paymentId, userId, outcome, failureReason = '' }) {
    const payment = await Payment.findById(paymentId).populate('allocation application');
    if (!payment) {
      throw new Error('Payment record not found');
    }

    if (payment.student.toString() !== userId.toString()) {
      throw new Error('Unauthorized access to payment transaction');
    }

    if (payment.status === PAYMENT_STATUS.SUCCESSFUL) {
      throw new Error('Payment has already been completed and confirmed');
    }

    const validOutcomes = [PAYMENT_STATUS.SUCCESSFUL, PAYMENT_STATUS.FAILED, PAYMENT_STATUS.CANCELLED];
    if (!validOutcomes.includes(outcome)) {
      throw new Error(`Invalid payment outcome '${outcome}'`);
    }

    payment.status = outcome;

    if (outcome === PAYMENT_STATUS.SUCCESSFUL) {
      payment.completedAt = new Date();
      payment.gatewayResponse = {
        ...payment.gatewayResponse,
        gatewayPaymentId: `PAY_IEM_${Date.now()}`,
        gatewaySignature: `SIG_${Math.random().toString(36).substring(2, 15)}`,
        verified: true,
        status: 'PAID'
      };

      await notificationService.notify({
        recipientId: userId,
        title: 'Payment Successful',
        message: `Your admission fee payment of ₹${payment.amount.toLocaleString('en-IN')} (Ref: ${payment.transactionReference}) was successful. You can now accept your seat allotment.`,
        type: 'PAYMENT_UPDATE',
        applicationId: payment.application.applicationId,
        link: '/student/allotment'
      });
    } else if (outcome === PAYMENT_STATUS.FAILED) {
      payment.failureReason = failureReason || 'Simulated transaction decline by demo bank gateway';
      payment.retryCount += 1;

      await notificationService.notify({
        recipientId: userId,
        title: 'Payment Failed',
        message: `Your payment of ₹${payment.amount.toLocaleString('en-IN')} failed. Please retry before the deadline.`,
        type: 'PAYMENT_UPDATE',
        applicationId: payment.application.applicationId,
        link: '/student/allotment'
      });
    } else if (outcome === PAYMENT_STATUS.CANCELLED) {
      payment.failureReason = 'Payment cancelled by candidate';
      payment.retryCount += 1;
    }

    await payment.save();
    return payment;
  }
}

module.exports = new PaymentService();
