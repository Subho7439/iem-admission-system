const Seat = require('../models/Seat');
const SeatAllocation = require('../models/SeatAllocation');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const Payment = require('../models/Payment');
const Receipt = require('../models/Receipt');
const Application = require('../models/Application');
const seatAllocationService = require('../services/seatAllocationService');
const pdfService = require('../services/pdfService');
const notificationService = require('../services/notificationService');
const { SEAT_STATUS, PAYMENT_STATUS, APPLICATION_STATUS } = require('../config/constants');

/**
 * @desc    Get seats overview and inventory for a programme
 * @route   GET /api/seats/programme/:programmeId
 * @access  Private (Admin)
 */
const getProgrammeSeats = async (req, res, next) => {
  try {
    const { programmeId } = req.params;
    let seats = await Seat.find({ programme: programmeId }).populate('allottedTo', 'applicationId personalInfo.fullName');

    // If no seats yet, initialize them automatically from programme seat config
    if (seats.length === 0) {
      await seatAllocationService.initializeSeatsForProgramme(programmeId);
      seats = await Seat.find({ programme: programmeId }).populate('allottedTo', 'applicationId personalInfo.fullName');
    }

    const stats = {
      total: seats.length,
      available: seats.filter(s => s.status === SEAT_STATUS.AVAILABLE).length,
      allotted: seats.filter(s => s.status === SEAT_STATUS.ALLOTTED).length,
      accepted: seats.filter(s => s.status === SEAT_STATUS.ACCEPTED).length,
      declined: seats.filter(s => s.status === SEAT_STATUS.DECLINED).length
    };

    res.status(200).json({ success: true, stats, seats });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin manually or automatically allots seat to applicant
 * @route   POST /api/seats/allot
 * @access  Private (Admin)
 */
const allotSeat = async (req, res, next) => {
  try {
    const { applicationId, category, deadlineDays = 5 } = req.body;
    if (!applicationId) {
      return res.status(400).json({ success: false, message: 'applicationId is required' });
    }

    const result = await seatAllocationService.allotSeat({
      applicationId,
      category,
      deadlineDays,
      actorId: req.user._id
    });

    res.status(200).json({
      success: true,
      message: `Seat ${result.seat.seatIdentifier} allotted successfully`,
      allocation: result.allocation,
      seat: result.seat
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get applicant's allotment status
 * @route   GET /api/seats/my-allotment
 * @access  Private (Student)
 */
const getMyAllotment = async (req, res, next) => {
  try {
    const allocation = await SeatAllocation.findOne({ student: req.user._id })
      .populate('seat programme application');

    if (!allocation) {
      return res.status(200).json({
        success: true,
        hasAllotment: false,
        allocation: null
      });
    }

    // Check payment status for this allocation
    const payment = await Payment.findOne({ allocation: allocation._id }).sort({ createdAt: -1 });
    const receipt = await Receipt.findOne({ allocation: allocation._id });

    // Check if expired
    const isExpired = new Date() > new Date(allocation.acceptanceDeadline);

    res.status(200).json({
      success: true,
      hasAllotment: true,
      allocation,
      payment,
      receipt,
      isExpired
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept allotted seat (Requires verified SUCCESSFUL payment & before deadline!)
 * @route   POST /api/seats/accept
 * @access  Private (Student)
 */
const acceptSeat = async (req, res, next) => {
  try {
    const { allocationId } = req.body;
    const allocation = await SeatAllocation.findById(allocationId)
      .populate('seat programme application student');

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Seat allotment record not found' });
    }

    // Ownership check
    if (allocation.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to accept this seat' });
    }

    // Check status
    if (allocation.status === SEAT_STATUS.ACCEPTED) {
      return res.status(400).json({ success: false, message: 'This seat allotment has already been accepted' });
    }

    if (allocation.status !== SEAT_STATUS.ALLOTTED) {
      return res.status(400).json({ success: false, message: `Cannot accept seat in '${allocation.status}' status` });
    }

    // Test case 29: Acceptance after deadline is rejected
    if (new Date() > new Date(allocation.acceptanceDeadline)) {
      allocation.status = SEAT_STATUS.EXPIRED;
      await allocation.save();
      await Seat.findByIdAndUpdate(allocation.seat._id, { status: SEAT_STATUS.AVAILABLE, allottedTo: null });
      return res.status(400).json({ success: false, message: 'Acceptance deadline has expired. This seat allotment is no longer valid.' });
    }

    // Test cases 25, 27: Verify SUCCESSFUL payment exists
    const payment = await Payment.findOne({
      allocation: allocation._id,
      status: PAYMENT_STATUS.SUCCESSFUL
    });

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: 'Admission fee payment has not been verified as Successful. Seat acceptance requires completed payment.'
      });
    }

    // Update allocation & seat status
    allocation.status = SEAT_STATUS.ACCEPTED;
    allocation.acceptedAt = new Date();
    await allocation.save();

    await Seat.findByIdAndUpdate(allocation.seat._id, {
      status: SEAT_STATUS.ACCEPTED
    });

    await Application.findByIdAndUpdate(allocation.application._id, {
      status: APPLICATION_STATUS.ACCEPTED
    });

    // Generate unique Receipt number: RCP-IEM-2026-XXXX
    const receiptCount = await Receipt.countDocuments();
    const receiptNumber = `RCP-IEM-2026-${String(receiptCount + 1).padStart(4, '0')}`;

    let receipt = await Receipt.findOne({ application: allocation.application._id });
    if (!receipt) {
      receipt = await Receipt.create({
        receiptNumber,
        application: allocation.application._id,
        student: req.user._id,
        payment: payment._id,
        allocation: allocation._id,
        candidateName: req.user.name,
        programmeName: allocation.programme.name,
        programmeCode: allocation.programme.code,
        category: allocation.category,
        seatIdentifier: allocation.seat.seatIdentifier,
        amountPaid: payment.amount,
        paymentReference: payment.transactionReference,
        admissionCycle: '2026-2027',
        issuedAt: new Date()
      });

      // Generate PDF file
      try {
        const pdfPath = await pdfService.generateAdmissionReceipt({
          receiptNumber: receipt.receiptNumber,
          candidateName: receipt.candidateName,
          applicationId: allocation.application.applicationId,
          admissionCycle: receipt.admissionCycle,
          programmeName: receipt.programmeName,
          seatIdentifier: receipt.seatIdentifier,
          category: receipt.category,
          paymentReference: receipt.paymentReference,
          amountPaid: receipt.amountPaid,
          issuedAt: receipt.issuedAt
        });
        receipt.pdfPath = pdfPath;
        await receipt.save();
      } catch (pdfErr) {
        console.error(`[PDF] Error generating PDF receipt: ${pdfErr.message}`);
      }
    }

    await notificationService.notify({
      recipientId: req.user._id,
      title: 'Provisional Admission Confirmed!',
      message: `Congratulations! Your seat ${allocation.seat.seatIdentifier} in ${allocation.programme.name} is confirmed. Download your official admission receipt.`,
      type: 'SEAT_CONFIRMED',
      applicationId: allocation.application.applicationId,
      link: '/student/receipt'
    });

    res.status(200).json({
      success: true,
      message: 'Seat accepted successfully and provisional admission confirmed!',
      allocation,
      receipt
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Decline allotted seat
 * @route   POST /api/seats/decline
 * @access  Private (Student)
 */
const declineSeat = async (req, res, next) => {
  try {
    const { allocationId, reason } = req.body;
    const allocation = await seatAllocationService.declineSeat({
      allocationId,
      userId: req.user._id,
      reason
    });

    res.status(200).json({
      success: true,
      message: 'Seat allotment has been declined and released.',
      allocation
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke / Take back seat allotment by Administrator (e.g. allocated by mistake)
 * @route   POST /api/seats/revoke
 * @access  Private (Admin)
 */
const revokeSeat = async (req, res, next) => {
  try {
    const { seatId, applicationId, reason } = req.body;
    if (!seatId && !applicationId) {
      return res.status(400).json({ success: false, message: 'seatId or applicationId is required' });
    }

    const result = await seatAllocationService.revokeSeat({
      seatId,
      applicationId,
      reason,
      actorId: req.user._id,
      actorName: req.user.name
    });

    res.status(200).json({
      success: true,
      message: `Seat ${result.seat.seatIdentifier} has been successfully revoked and released back to available inventory.`,
      seat: result.seat
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgrammeSeats,
  allotSeat,
  getMyAllotment,
  acceptSeat,
  declineSeat,
  revokeSeat
};

