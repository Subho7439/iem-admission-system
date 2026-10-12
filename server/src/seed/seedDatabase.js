require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const Application = require('../models/Application');
const Document = require('../models/Document');
const MeritConfiguration = require('../models/MeritConfiguration');
const MeritList = require('../models/MeritList');
const Seat = require('../models/Seat');
const SeatAllocation = require('../models/SeatAllocation');
const Payment = require('../models/Payment');
const Receipt = require('../models/Receipt');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const pdfService = require('../services/pdfService');
const { ROLES, APPLICATION_STATUS, DOCUMENT_STATUS, SEAT_STATUS, PAYMENT_STATUS, DOCUMENT_TYPES } = require('../config/constants');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iem_admission_db';
  return await mongoose.connect(uri);
};

const createSampleDummyFile = (filename, content = 'Sample Document Content for IEM Academic Demo') => {
  const uploadDir = path.resolve(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
  return filePath;
};

const seed = async () => {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();
    console.log('[Seed] Connected. Clearing previous seed collections...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      AdmissionProgramme.deleteMany({}),
      Application.deleteMany({}),
      Document.deleteMany({}),
      MeritConfiguration.deleteMany({}),
      MeritList.deleteMany({}),
      Seat.deleteMany({}),
      SeatAllocation.deleteMany({}),
      Payment.deleteMany({}),
      Receipt.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log('[Seed] Creating Admission Programmes...');
    const programmes = await AdmissionProgramme.insertMany([
      {
        code: 'CSE',
        name: 'B.Tech in Computer Science & Engineering',
        degree: 'B.Tech',
        durationYears: 4,
        totalSeats: 12,
        seatsByCategory: { GENERAL: 6, OBC: 3, SC: 2, ST: 1 },
        admissionFee: 65000,
        semesterFee: 85000,
        eligibility: { minClass12Percentage: 60, allowedExams: ['WBJEE', 'JEE Main'], maxEntranceRank: 15000 }
      },
      {
        code: 'IT',
        name: 'B.Tech in Information Technology',
        degree: 'B.Tech',
        durationYears: 4,
        totalSeats: 10,
        seatsByCategory: { GENERAL: 5, OBC: 2, SC: 2, ST: 1 },
        admissionFee: 65000,
        semesterFee: 85000,
        eligibility: { minClass12Percentage: 60, allowedExams: ['WBJEE', 'JEE Main'], maxEntranceRank: 25000 }
      },
      {
        code: 'ECE',
        name: 'B.Tech in Electronics & Communication Engineering',
        degree: 'B.Tech',
        durationYears: 4,
        totalSeats: 10,
        seatsByCategory: { GENERAL: 5, OBC: 2, SC: 2, ST: 1 },
        admissionFee: 60000,
        semesterFee: 80000,
        eligibility: { minClass12Percentage: 55, allowedExams: ['WBJEE', 'JEE Main'], maxEntranceRank: 35000 }
      },
      {
        code: 'AIML',
        name: 'B.Tech in Artificial Intelligence & Machine Learning',
        degree: 'B.Tech',
        durationYears: 4,
        totalSeats: 8,
        seatsByCategory: { GENERAL: 4, OBC: 2, SC: 1, ST: 1 },
        admissionFee: 70000,
        semesterFee: 90000,
        eligibility: { minClass12Percentage: 65, allowedExams: ['WBJEE', 'JEE Main'], maxEntranceRank: 12000 }
      },
      {
        code: 'BCA',
        name: 'Bachelor of Computer Applications',
        degree: 'BCA',
        durationYears: 3,
        totalSeats: 10,
        seatsByCategory: { GENERAL: 5, OBC: 2, SC: 2, ST: 1 },
        admissionFee: 45000,
        semesterFee: 55000,
        eligibility: { minClass12Percentage: 50, allowedExams: ['WBJEE', 'IEMJEE'], maxEntranceRank: 50000 }
      }
    ]);

    const cseProg = programmes.find(p => p.code === 'CSE');
    const itProg = programmes.find(p => p.code === 'IT');

    console.log('[Seed] Creating Seat Inventory for CSE & IT...');
    const allSeats = [];
    for (const prog of programmes) {
      for (const [cat, count] of Object.entries(prog.seatsByCategory)) {
        for (let i = 1; i <= count; i++) {
          allSeats.push({
            seatIdentifier: `${prog.code}-${cat.substring(0, 3)}-${String(i).padStart(2, '0')}`,
            programme: prog._id,
            category: cat,
            status: SEAT_STATUS.AVAILABLE
          });
        }
      }
    }
    const createdSeats = await Seat.insertMany(allSeats);

    console.log('[Seed] Creating Administrator and Verifier Accounts...');
    // Create Admin
    const adminUser = await User.create({
      name: 'Prof. Satyajit Chakraborty (Admin)',
      email: 'admin@iemcal.edu',
      mobile: '9830012345',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN,
      dob: new Date('1978-05-15')
    });

    // Create Document Verifier
    const verifierUser = await User.create({
      name: 'Dr. Debashis De (Doc Verifier)',
      email: 'verifier@iemcal.edu',
      mobile: '9830054321',
      password: 'VerifierPassword123!',
      role: ROLES.VERIFIER,
      dob: new Date('1984-08-20')
    });

    console.log('[Seed] Creating Diverse Student Demonstration Accounts...');
    // Demo Students
    const studentData = [
      {
        name: 'Aarav Sharma',
        email: 'draft.student@iemcal.edu',
        mobile: '9876543210',
        password: 'StudentPassword123!',
        dob: new Date('2007-04-12'),
        category: 'GENERAL',
        state: 'Draft',
        rank: 1250,
        p12: 88.5,
        p10: 91.0
      },
      {
        name: 'Rohan Sen',
        email: 'review.student@iemcal.edu',
        mobile: '9876543211',
        password: 'StudentPassword123!',
        dob: new Date('2007-06-25'),
        category: 'GENERAL',
        state: 'Submitted',
        rank: 2100,
        p12: 84.0,
        p10: 86.5
      },
      {
        name: 'Pooja Mukherjee',
        email: 'rejected.doc@iemcal.edu',
        mobile: '9876543212',
        password: 'StudentPassword123!',
        dob: new Date('2007-02-18'),
        category: 'OBC',
        state: 'Action Required',
        rank: 3400,
        p12: 81.2,
        p10: 83.0
      },
      {
        name: 'Ananya Roy',
        email: 'verified.student@iemcal.edu',
        mobile: '9876543213',
        password: 'StudentPassword123!',
        dob: new Date('2007-09-08'),
        category: 'GENERAL',
        state: 'Verified',
        rank: 850,
        p12: 93.4,
        p10: 95.0
      },
      {
        name: 'Sourav Ghosh',
        email: 'allotted.student@iemcal.edu',
        mobile: '9876543214',
        password: 'StudentPassword123!',
        dob: new Date('2007-01-30'),
        category: 'GENERAL',
        state: 'Seat Allotted',
        rank: 450,
        p12: 96.0,
        p10: 94.2
      },
      {
        name: 'Sneha Mondal',
        email: 'paid.student@iemcal.edu',
        mobile: '9876543215',
        password: 'StudentPassword123!',
        dob: new Date('2007-11-14'),
        category: 'SC',
        state: 'Paid',
        rank: 620,
        p12: 89.2,
        p10: 88.0
      },
      {
        name: 'Bikram Das',
        email: 'accepted.student@iemcal.edu',
        mobile: '9876543216',
        password: 'StudentPassword123!',
        dob: new Date('2007-03-22'),
        category: 'GENERAL',
        state: 'Accepted',
        rank: 310,
        p12: 97.5,
        p10: 96.0
      },
      {
        name: 'Debjit Bose',
        email: 'declined.student@iemcal.edu',
        mobile: '9876543217',
        password: 'StudentPassword123!',
        dob: new Date('2007-07-19'),
        category: 'GENERAL',
        state: 'Declined',
        rank: 4200,
        p12: 78.0,
        p10: 80.5
      }
    ];

    let appIndex = 1;
    for (const s of studentData) {
      const user = await User.create({
        name: s.name,
        email: s.email,
        mobile: s.mobile,
        password: s.password,
        role: ROLES.STUDENT,
        dob: s.dob
      });

      const appId = `IEM-2026-${String(appIndex).padStart(3, '0')}880${appIndex}`;
      appIndex++;

      const isDraftState = s.state === 'Draft';
      const app = await Application.create({
        applicationId: appId,
        user: user._id,
        programme: cseProg._id,
        admissionCycle: '2026-2027',
        status: isDraftState ? APPLICATION_STATUS.DRAFT : (s.state === 'Paid' ? APPLICATION_STATUS.SEAT_ALLOTTED : s.state),
        isDraft: isDraftState,
        submissionDate: isDraftState ? null : new Date('2026-06-10'),
        isDocumentVerified: ['Verified', 'Seat Allotted', 'Paid', 'Accepted'].includes(s.state),
        isEligible: ['Verified', 'Seat Allotted', 'Paid', 'Accepted'].includes(s.state),
        eligibilityRemarks: ['Verified', 'Seat Allotted', 'Paid', 'Accepted'].includes(s.state) ? 'All criteria met' : '',
        personalInfo: {
          fullName: s.name,
          dob: s.dob,
          gender: 'Male',
          email: s.email,
          mobile: s.mobile,
          address: 'Salt Lake City, Kolkata, West Bengal',
          state: 'West Bengal',
          pinCode: '700091',
          category: s.category,
          guardianName: 'Guardian of ' + s.name,
          guardianMobile: '9831122334',
          guardianOccupation: 'Private Service'
        },
        academicInfo: {
          class10Board: 'CBSE',
          class10Year: 2024,
          class10Percentage: s.p10,
          class12Board: 'CBSE',
          class12Year: 2026,
          class12Percentage: s.p12,
          entranceExam: 'WBJEE',
          entranceRank: s.rank,
          entrancePercentile: 98.2
        }
      });

      // Create documents for this application
      const docTypes = Object.values(DOCUMENT_TYPES);
      for (const dType of docTypes) {
        if (dType === DOCUMENT_TYPES.CATEGORY_CERT && s.category === 'GENERAL') continue;

        let docStatus = DOCUMENT_STATUS.NOT_UPLOADED;
        let remarks = '';

        if (!isDraftState) {
          if (s.state === 'Action Required' && dType === DOCUMENT_TYPES.CLASS_12) {
            docStatus = DOCUMENT_STATUS.REJECTED;
            remarks = 'Mark sheet scan is blurry and edges are cropped out. Please re-upload high resolution copy.';
          } else if (s.state === 'Submitted') {
            docStatus = DOCUMENT_STATUS.PENDING;
          } else {
            docStatus = DOCUMENT_STATUS.APPROVED;
          }
        }

        const sampleFile = createSampleDummyFile(`demo-${user._id}-${dType.replace(/\s+/g, '_')}.pdf`);

        await Document.create({
          application: app._id,
          user: user._id,
          documentType: dType,
          originalName: `${dType}.pdf`,
          fileName: path.basename(sampleFile),
          filePath: sampleFile,
          mimeType: 'application/pdf',
          fileSize: 1024 * 350,
          status: docStatus,
          isRequired: true,
          verifierRemarks: remarks,
          verifiedBy: docStatus === DOCUMENT_STATUS.APPROVED || docStatus === DOCUMENT_STATUS.REJECTED ? verifierUser._id : null,
          verifiedAt: docStatus === DOCUMENT_STATUS.APPROVED || docStatus === DOCUMENT_STATUS.REJECTED ? new Date() : null,
          history: [{
            status: docStatus,
            remarks: remarks || 'Initial upload for verification',
            fileName: path.basename(sampleFile),
            changedBy: user._id,
            timestamp: new Date()
          }]
        });
      }

      // Handle Allotted / Paid / Accepted specific states
      if (['Seat Allotted', 'Paid', 'Accepted'].includes(s.state)) {
        // Find available seat
        const targetSeat = createdSeats.find(st =>
          st.programme.toString() === cseProg._id.toString() &&
          st.category === s.category &&
          st.status === SEAT_STATUS.AVAILABLE
        );

        if (targetSeat) {
          targetSeat.status = s.state === 'Accepted' ? SEAT_STATUS.ACCEPTED : SEAT_STATUS.ALLOTTED;
          targetSeat.allottedTo = app._id;
          targetSeat.allottedAt = new Date();
          await targetSeat.save();

          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 7);

          const allocation = await SeatAllocation.create({
            application: app._id,
            student: user._id,
            seat: targetSeat._id,
            programme: cseProg._id,
            category: s.category,
            feeAmount: cseProg.admissionFee,
            allotmentDate: new Date(),
            acceptanceDeadline: deadline,
            status: s.state === 'Accepted' ? SEAT_STATUS.ACCEPTED : SEAT_STATUS.ALLOTTED,
            acceptedAt: s.state === 'Accepted' ? new Date() : null
          });

          if (s.state === 'Paid' || s.state === 'Accepted') {
            const payment = await Payment.create({
              transactionReference: `TXN-IEM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              application: app._id,
              student: user._id,
              allocation: allocation._id,
              amount: cseProg.admissionFee,
              paymentMethod: 'NetBanking_Demo',
              status: PAYMENT_STATUS.SUCCESSFUL,
              completedAt: new Date(),
              gatewayResponse: {
                gatewayPaymentId: `PAY_IEM_DEMO_${user._id}`,
                verified: true
              }
            });

            if (s.state === 'Accepted') {
              const rcpNum = `RCP-IEM-2026-000${appIndex}`;
              const receipt = await Receipt.create({
                receiptNumber: rcpNum,
                application: app._id,
                student: user._id,
                payment: payment._id,
                allocation: allocation._id,
                candidateName: s.name,
                programmeName: cseProg.name,
                programmeCode: cseProg.code,
                category: s.category,
                seatIdentifier: targetSeat.seatIdentifier,
                amountPaid: payment.amount,
                paymentReference: payment.transactionReference,
                admissionCycle: '2026-2027',
                issuedAt: new Date()
              });

              // Generate PDF
              try {
                const pdfPath = await pdfService.generateAdmissionReceipt({
                  receiptNumber: receipt.receiptNumber,
                  candidateName: receipt.candidateName,
                  applicationId: app.applicationId,
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
              } catch (e) {
                console.error(`[Seed] Error generating PDF receipt for ${s.name}: ${e.message}`);
              }
            }
          }
        }
      }

      // Add a realistic welcome notification
      await Notification.create({
        recipient: user._id,
        title: 'Welcome to IEM Admission Portal',
        message: `Welcome ${s.name}! Your account is active. Please review your admission status.`,
        type: 'REGISTRATION',
        isRead: false,
        relatedApplicationId: appId,
        link: '/student/dashboard'
      });
    }

    // Configure and publish sample merit list for CSE
    console.log('[Seed] Generating Official Merit Configuration & Published List for CSE...');
    const meritConfig = await MeritConfiguration.create({
      programme: cseProg._id,
      admissionCycle: '2026-2027',
      primaryCriterion: 'EntranceRank',
      rankOrder: 'ASC',
      tieBreakers: ['Class12Marks', 'Class10Marks'],
      status: 'Published',
      publishedAt: new Date(),
      publishedBy: adminUser._id
    });

    const eligibleApps = await Application.find({
      programme: cseProg._id,
      isEligible: true
    }).populate('user');

    eligibleApps.sort((a, b) => (a.academicInfo.entranceRank || 999999) - (b.academicInfo.entranceRank || 999999));

    const catCounters = { GENERAL: 0, OBC: 0, SC: 0, ST: 0 };
    const meritEntries = eligibleApps.map((a, idx) => {
      const cat = a.personalInfo.category || 'GENERAL';
      catCounters[cat] = (catCounters[cat] || 0) + 1;
      return {
        position: idx + 1,
        categoryPosition: catCounters[cat],
        application: a._id,
        applicationId: a.applicationId,
        candidateName: a.personalInfo.fullName,
        category: cat,
        entranceExam: a.academicInfo.entranceExam,
        entranceRank: a.academicInfo.entranceRank,
        entrancePercentile: a.academicInfo.entrancePercentile || 98.0,
        class12Percentage: a.academicInfo.class12Percentage,
        class10Percentage: a.academicInfo.class10Percentage,
        meritScore: a.academicInfo.entranceRank,
        tieBreakDetails: `P12: ${a.academicInfo.class12Percentage}%, P10: ${a.academicInfo.class10Percentage}%`,
        isEligible: true
      };
    });

    await MeritList.create({
      programme: cseProg._id,
      admissionCycle: '2026-2027',
      status: 'Published',
      publishedAt: new Date(),
      publishedBy: adminUser._id,
      entries: meritEntries
    });

    // Add Audit Log
    await AuditLog.create({
      actor: adminUser._id,
      actorName: adminUser.name,
      actorRole: 'admin',
      action: 'INITIAL_SEED_DATABASE',
      entity: 'AdmissionSystem',
      entityId: 'SEED-2026',
      details: { description: 'Populated academic programmes, sample applications, verifications, and merit list.' }
    });

    console.log('[Seed] Database successfully seeded with realistic IEM demonstration data!');
    console.log('========================================================================');
    console.log(' DEMO CREDENTIALS:');
    console.log(' Admin:              admin@iemcal.edu          / AdminPassword123!');
    console.log(' Document Verifier:  verifier@iemcal.edu       / VerifierPassword123!');
    console.log(' Student (Draft):    draft.student@iemcal.edu  / StudentPassword123!');
    console.log(' Student (Review):   review.student@iemcal.edu / StudentPassword123!');
    console.log(' Student (Rejected): rejected.doc@iemcal.edu   / StudentPassword123!');
    console.log(' Student (Verified): verified.student@iemcal.edu / StudentPassword123!');
    console.log(' Student (Allotted): allotted.student@iemcal.edu / StudentPassword123!');
    console.log(' Student (Paid):     paid.student@iemcal.edu   / StudentPassword123!');
    console.log(' Student (Accepted): accepted.student@iemcal.edu / StudentPassword123!');
    console.log(' Student (Declined): declined.student@iemcal.edu / StudentPassword123!');
    console.log('========================================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error seeding database: ${error.message}`, error);
    process.exit(1);
  }
};

seed();
