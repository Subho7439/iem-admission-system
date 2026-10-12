const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const SeatAllocation = require('../models/SeatAllocation');

/**
 * @desc    Create a new simulated payment order
 * @route   POST /api/payments/create-order
 * @access  Private (Student)
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const { allocationId, paymentMethod } = req.body;
    if (!allocationId) {
      return res.status(400).json({ success: false, message: 'allocationId is required' });
    }

    const payment = await paymentService.createPaymentOrder({
      allocationId,
      userId: req.user._id,
      paymentMethod
    });

    res.status(201).json({
      success: true,
      message: 'Payment order created. Ready for simulated demo processing.',
      payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Process simulated outcome (Success / Failed / Cancelled)
 * @route   POST /api/payments/:id/simulate-outcome
 * @access  Private (Student)
 */
const processSimulatedOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { outcome, failureReason } = req.body;

    const payment = await paymentService.processSimulatedOutcome({
      paymentId: id,
      userId: req.user._id,
      outcome,
      failureReason
    });

    res.status(200).json({
      success: true,
      message: `Simulated payment result: ${payment.status}`,
      payment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applicant's payment history
 * @route   GET /api/payments/my-payments
 * @access  Private (Student)
 */
const getMyPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find({ student: req.user._id })
      .populate('allocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  processSimulatedOutcome,
  getMyPayments
};
