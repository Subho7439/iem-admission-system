const User = require('../models/User');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Seat = require('../models/Seat');
const SeatAllocation = require('../models/SeatAllocation');
const Payment = require('../models/Payment');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const AuditLog = require('../models/AuditLog');
const { APPLICATION_STATUS, DOCUMENT_STATUS, SEAT_STATUS, PAYMENT_STATUS, ROLES } = require('../config/constants');

/**
 * @desc    Get complete real-time dashboard analytics
 * @route   GET /api/admin/dashboard-stats
 * @access  Private (Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalRegistered,
      draftCount,
      submittedCount,
      underReviewCount,
      actionRequiredCount,
      verifiedCount,
      eligibleCount,
      meritListedCount,
      totalSeats,
      availableSeats,
      allottedSeats,
      acceptedSeats,
      declinedSeats,
      pendingPayments,
      successfulPayments,
      failedPayments,
      rejectedDocsCount
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      Application.countDocuments({ status: APPLICATION_STATUS.DRAFT }),
      Application.countDocuments({ status: APPLICATION_STATUS.SUBMITTED }),
      Application.countDocuments({ status: APPLICATION_STATUS.UNDER_REVIEW }),
      Application.countDocuments({ status: APPLICATION_STATUS.ACTION_REQUIRED }),
      Application.countDocuments({ status: APPLICATION_STATUS.VERIFIED }),
      Application.countDocuments({ isEligible: true }),
      Application.countDocuments({ status: APPLICATION_STATUS.MERIT_LISTED }),
      Seat.countDocuments(),
      Seat.countDocuments({ status: SEAT_STATUS.AVAILABLE }),
      Seat.countDocuments({ status: SEAT_STATUS.ALLOTTED }),
      Seat.countDocuments({ status: SEAT_STATUS.ACCEPTED }),
      Seat.countDocuments({ status: SEAT_STATUS.DECLINED }),
      Payment.countDocuments({ status: PAYMENT_STATUS.PENDING }),
      Payment.countDocuments({ status: PAYMENT_STATUS.SUCCESSFUL }),
      Payment.countDocuments({ status: PAYMENT_STATUS.FAILED }),
      Document.countDocuments({ status: DOCUMENT_STATUS.REJECTED })
    ]);

    // Programme-wise counts
    const programmes = await AdmissionProgramme.find();
    const programmeStats = await Promise.all(
      programmes.map(async (prog) => {
        const apps = await Application.countDocuments({ programme: prog._id, isDraft: false });
        const seats = await Seat.countDocuments({ programme: prog._id });
        const taken = await Seat.countDocuments({ programme: prog._id, status: { $in: [SEAT_STATUS.ALLOTTED, SEAT_STATUS.ACCEPTED] } });
        return {
          id: prog._id,
          name: prog.name,
          code: prog.code,
          applicationsCount: apps,
          totalSeats: seats || prog.totalSeats,
          occupiedSeats: taken
        };
      })
    );

    // Recent activity audit logs
    const recentActivity = await AuditLog.find().sort({ createdAt: -1 }).limit(10);

    res.status(200).json({
      success: true,
      stats: {
        totalRegistered,
        draftCount,
        submittedCount,
        underReviewCount,
        actionRequiredCount,
        verifiedCount,
        eligibleCount,
        meritListedCount,
        totalSeats,
        availableSeats,
        allottedSeats,
        acceptedSeats,
        declinedSeats,
        pendingPayments,
        successfulPayments,
        failedPayments,
        rejectedDocsCount
      },
      programmeStats,
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all admission programmes (public or admin)
 * @route   GET /api/admin/programmes
 * @access  Public / Private
 */
const getProgrammes = async (req, res, next) => {
  try {
    const programmes = await AdmissionProgramme.find().sort({ name: 1 });
    res.status(200).json({ success: true, programmes });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create or update admission programme
 * @route   POST /api/admin/programmes
 * @access  Private (Admin)
 */
const saveProgramme = async (req, res, next) => {
  try {
    const { id, code, name, degree, totalSeats, seatsByCategory, admissionFee, semesterFee, eligibility } = req.body;

    let programme;
    if (id) {
      programme = await AdmissionProgramme.findByIdAndUpdate(
        id,
        { code, name, degree, totalSeats, seatsByCategory, admissionFee, semesterFee, eligibility },
        { new: true, runValidators: true }
      );
    } else {
      programme = await AdmissionProgramme.create({
        code,
        name,
        degree,
        totalSeats,
        seatsByCategory,
        admissionFee,
        semesterFee,
        eligibility
      });
    }

    res.status(200).json({ success: true, programme });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get audit logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Admin)
 */
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json({ success: true, logs });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getProgrammes,
  saveProgramme,
  getAuditLogs
};
