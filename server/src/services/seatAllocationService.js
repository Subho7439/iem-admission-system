const Seat = require('../models/Seat');
const SeatAllocation = require('../models/SeatAllocation');
const Application = require('../models/Application');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const notificationService = require('./notificationService');
const { SEAT_STATUS, APPLICATION_STATUS } = require('../config/constants');

class SeatAllocationService {
  /**
   * Initialize or sync seat inventory for a programme based on configured capacity
   */
  async initializeSeatsForProgramme(programmeId) {
    const programme = await AdmissionProgramme.findById(programmeId);
    if (!programme) throw new Error('Programme not found');

    const createdSeats = [];
    const categories = ['GENERAL', 'OBC', 'SC', 'ST'];

    for (const cat of categories) {
      const count = programme.seatsByCategory[cat] || 0;
      for (let i = 1; i <= count; i++) {
        const seatId = `${programme.code}-${cat.substring(0, 3)}-${String(i).padStart(2, '0')}`;
        const existing = await Seat.findOne({ seatIdentifier: seatId });
        if (!existing) {
          const seat = await Seat.create({
            seatIdentifier: seatId,
            programme: programme._id,
            category: cat,
            status: SEAT_STATUS.AVAILABLE
          });
          createdSeats.push(seat);
        }
      }
    }
    return createdSeats;
  }

  /**
   * Allot a seat to an eligible candidate
   * Protects against duplicate allotment and concurrency
   */
  async allotSeat({ applicationId, category = null, deadlineDays = 5, actorId = null }) {
    const application = await Application.findById(applicationId).populate('programme user');
    if (!application) {
      throw new Error('Application not found');
    }

    // Rule: Ineligible candidates cannot be allotted seats
    if (!application.isEligible) {
      throw new Error('Candidate is not eligible for seat allotment (verification or criteria unmet)');
    }

    // Rule: Cannot allot if already allotted
    const existingAllocation = await SeatAllocation.findOne({
      application: application._id,
      status: { $in: [SEAT_STATUS.ALLOTTED, SEAT_STATUS.ACCEPTED] }
    });
    if (existingAllocation) {
      throw new Error('Application already has an active or accepted seat allotment');
    }

    const targetCategory = category || application.personalInfo?.category || 'GENERAL';

    // Atomic find and update to prevent concurrent allocation of the same seat
    // First try candidate's category, fallback to GENERAL if available
    let seat = await Seat.findOneAndUpdate(
      {
        programme: application.programme._id,
        category: targetCategory,
        status: SEAT_STATUS.AVAILABLE
      },
      {
        $set: {
          status: SEAT_STATUS.ALLOTTED,
          allottedTo: application._id,
          allottedAt: new Date()
        }
      },
      { new: true }
    );

    // If candidate is reserved category but no reserved seat left, check GENERAL quota
    if (!seat && targetCategory !== 'GENERAL') {
      seat = await Seat.findOneAndUpdate(
        {
          programme: application.programme._id,
          category: 'GENERAL',
          status: SEAT_STATUS.AVAILABLE
        },
        {
          $set: {
            status: SEAT_STATUS.ALLOTTED,
            allottedTo: application._id,
            allottedAt: new Date()
          }
        },
        { new: true }
      );
    }

    if (!seat) {
      throw new Error(`No available seats in ${application.programme.name} for category ${targetCategory}`);
    }

    // Calculate deadline
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + deadlineDays);

    const allocation = await SeatAllocation.create({
      application: application._id,
      student: application.user._id,
      seat: seat._id,
      programme: application.programme._id,
      category: seat.category,
      feeAmount: application.programme.admissionFee || 65000,
      allotmentDate: new Date(),
      acceptanceDeadline: deadline,
      status: SEAT_STATUS.ALLOTTED
    });

    // Update application status
    application.status = APPLICATION_STATUS.SEAT_ALLOTTED;
    await application.save();

    // Notify student
    await notificationService.notify({
      recipientId: application.user._id,
      title: 'Congratulations! Seat Allotted',
      message: `You have been allotted seat ${seat.seatIdentifier} in ${application.programme.name}. Please pay the admission fee and accept your seat before ${deadline.toLocaleDateString()}.`,
      type: 'SEAT_ALLOTTED',
      applicationId: application.applicationId,
      link: '/student/allotment'
    });

    return { allocation, seat };
  }

  /**
   * Decline seat by student
   */
  async declineSeat({ allocationId, userId, reason = '' }) {
    const allocation = await SeatAllocation.findById(allocationId).populate('seat application programme');
    if (!allocation) {
      throw new Error('Seat allocation not found');
    }

    // Ownership check
    if (allocation.student.toString() !== userId.toString()) {
      throw new Error('Unauthorized to decline this seat allotment');
    }

    if (allocation.status !== SEAT_STATUS.ALLOTTED) {
      throw new Error(`Cannot decline seat with status ${allocation.status}`);
    }

    allocation.status = SEAT_STATUS.DECLINED;
    allocation.declinedAt = new Date();
    allocation.declineReason = reason || 'Declined by candidate';
    await allocation.save();

    // Release seat back to Available inventory
    await Seat.findByIdAndUpdate(allocation.seat._id, {
      status: SEAT_STATUS.AVAILABLE,
      allottedTo: null,
      allottedAt: null
    });

    // Update application status
    await Application.findByIdAndUpdate(allocation.application._id, {
      status: APPLICATION_STATUS.DECLINED
    });

    await notificationService.notify({
      recipientId: userId,
      title: 'Seat Allotment Declined',
      message: `You have declined seat allotment ${allocation.seat.seatIdentifier}. The seat has been released.`,
      type: 'SEAT_DECLINED',
      applicationId: allocation.application.applicationId,
      link: '/student/dashboard'
    });

    return allocation;
  }

  /**
   * Revoke / Take back seat allotment by Administrator (e.g. allocated by mistake)
   */
  async revokeSeat({ seatId, applicationId, reason = '', actorId = null, actorName = 'Administrator' }) {
    let seat = null;
    let allocation = null;

    if (seatId) {
      seat = await Seat.findById(seatId).populate('allottedTo');
    }

    if (!seat && applicationId) {
      allocation = await SeatAllocation.findOne({
        application: applicationId,
        status: { $in: [SEAT_STATUS.ALLOTTED, SEAT_STATUS.ACCEPTED] }
      }).populate('seat application student programme');
      if (allocation) seat = allocation.seat;
    }

    if (!seat) {
      throw new Error('Seat not found');
    }

    // Find active allocation associated with this seat if not already loaded
    if (!allocation) {
      allocation = await SeatAllocation.findOne({
        seat: seat._id,
        status: { $in: [SEAT_STATUS.ALLOTTED, SEAT_STATUS.ACCEPTED] }
      }).populate('application student programme');
    }

    const previousSeatIdentifier = seat.seatIdentifier;

    // Release the seat back to Available
    seat.status = SEAT_STATUS.AVAILABLE;
    seat.allottedTo = null;
    seat.allottedAt = null;
    await seat.save();

    // If an allocation was associated with this seat
    if (allocation) {
      const app = await Application.findById(allocation.application._id);
      if (app) {
        // Return application back to Merit Listed or Eligible so candidate is not disqualified
        app.status = app.meritPosition ? APPLICATION_STATUS.MERIT_LISTED : APPLICATION_STATUS.ELIGIBLE;
        await app.save();
      }

      // If there was a pending payment, cancel it
      const Payment = require('../models/Payment');
      await Payment.updateMany(
        { allocation: allocation._id, status: { $in: ['Pending', 'Not Initiated'] } },
        { status: 'Cancelled', failureReason: 'Seat allotment revoked by administration' }
      );

      // Cleanly delete the allocation record so the candidate can be allotted again in subsequent rounds
      await SeatAllocation.findByIdAndDelete(allocation._id);

      // Notify candidate in-app
      if (allocation.student) {
        await notificationService.notify({
          recipientId: allocation.student._id,
          title: 'Seat Allotment Revoked by Administration',
          message: `Your provisional allotment for seat ${previousSeatIdentifier} has been revoked by the Admissions Directorate. Reason: ${reason || 'Administrative correction'}. Your application remains eligible for subsequent rounds.`,
          type: 'SEAT_REVOKED',
          applicationId: app?.applicationId || '',
          link: '/student/dashboard'
        });
      }
    }

    // Record in Audit Log
    try {
      const AuditLog = require('../models/AuditLog');
      await AuditLog.create({
        actor: actorId,
        actorName: actorName || 'Administrator',
        actorRole: 'admin',
        action: 'REVOKE_SEAT_ALLOTMENT',
        entity: 'Seat',
        entityId: previousSeatIdentifier,
        details: {
          seatId: seat._id,
          seatIdentifier: previousSeatIdentifier,
          reason: reason || 'Administrative correction: Allocated by mistake',
          previousAllocationId: allocation?._id
        }
      });
    } catch (auditErr) {
      console.warn(`[AuditLog] Warning recording seat revocation: ${auditErr.message}`);
    }

    return { seat, allocation };
  }
}

module.exports = new SeatAllocationService();

