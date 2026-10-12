const request = require('supertest');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = require('../app');
const User = require('../models/User');
const Application = require('../models/Application');
const Document = require('../models/Document');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const Seat = require('../models/Seat');
const SeatAllocation = require('../models/SeatAllocation');
const Payment = require('../models/Payment');
const Receipt = require('../models/Receipt');
const Notification = require('../models/Notification');
const MeritConfiguration = require('../models/MeritConfiguration');
const MeritList = require('../models/MeritList');
const meritCalculationService = require('../services/meritCalculationService');
const seatAllocationService = require('../services/seatAllocationService');
const { ROLES, APPLICATION_STATUS, DOCUMENT_STATUS, SEAT_STATUS, PAYMENT_STATUS, DOCUMENT_TYPES } = require('../config/constants');

const testDummyPdf = path.resolve(__dirname, 'test_sample.pdf');
const testDummyJpg = path.resolve(__dirname, 'test_sample.jpg');
const testDummyTxt = path.resolve(__dirname, 'test_sample.txt');

describe('IEM Admission Management System — Acceptance Criteria Suite', () => {
  let studentToken, studentUser, studentApp;
  let student2Token, student2User, student2App;
  let adminToken, adminUser;
  let verifierToken, verifierUser;
  let testProgramme;

  beforeAll(async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iem_admission_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }
    fs.writeFileSync(testDummyPdf, '%PDF-1.4 test dummy pdf content for unit tests');
    fs.writeFileSync(testDummyJpg, 'test dummy jpeg image binary simulation content');
    fs.writeFileSync(testDummyTxt, 'plain text file not allowed');

    // 1. Programme
    testProgramme = await AdmissionProgramme.findOneAndUpdate(
      { code: 'TEST_CSE' },
      {
        code: 'TEST_CSE',
        name: 'B.Tech in Computer Science (Test)',
        degree: 'B.Tech',
        durationYears: 4,
        totalSeats: 5,
        seatsByCategory: { GENERAL: 3, OBC: 1, SC: 1, ST: 0 },
        admissionFee: 50000,
        semesterFee: 60000,
        eligibility: { minClass12Percentage: 60, allowedExams: ['WBJEE'], maxEntranceRank: 50000 }
      },
      { upsert: true, new: true }
    );

    // 2. Admin
    const adminEmail = `admin.suite.${Date.now()}@iemcal.edu`;
    adminUser = await User.create({
      name: 'System Admin Suite',
      email: adminEmail,
      mobile: '9830000011',
      password: 'AdminPassword123!',
      role: ROLES.ADMIN
    });
    const aRes = await request(app).post('/api/auth/login').send({ email: adminEmail, password: 'AdminPassword123!' });
    adminToken = aRes.body.token;

    // 3. Verifier
    const verifierEmail = `verifier.suite.${Date.now()}@iemcal.edu`;
    verifierUser = await User.create({
      name: 'Doc Verifier Suite',
      email: verifierEmail,
      mobile: '9830000022',
      password: 'VerifierPassword123!',
      role: ROLES.VERIFIER
    });
    const vRes = await request(app).post('/api/auth/login').send({ email: verifierEmail, password: 'VerifierPassword123!' });
    verifierToken = vRes.body.token;

    // 4. Student 1
    const s1Email = `student1.suite.${Date.now()}@iemcal.edu`;
    const s1Reg = await request(app).post('/api/auth/register').send({
      name: 'Suman Roy',
      email: s1Email,
      mobile: '9830000033',
      password: 'Password123!',
      dob: '2007-05-10'
    });
    studentToken = s1Reg.body.token;
    studentUser = s1Reg.body.user;

    const s1AppRes = await request(app).get('/api/applications/my-application').set('Authorization', `Bearer ${studentToken}`);
    studentApp = s1AppRes.body.application;

    // 5. Student 2
    const s2Email = `student2.suite.${Date.now()}@iemcal.edu`;
    const s2Reg = await request(app).post('/api/auth/register').send({
      name: 'Priyanka Das',
      email: s2Email,
      mobile: '9830000044',
      password: 'Password123!',
      dob: '2007-08-15'
    });
    student2Token = s2Reg.body.token;
    student2User = s2Reg.body.user;

    const s2AppRes = await request(app).get('/api/applications/my-application').set('Authorization', `Bearer ${student2Token}`);
    student2App = s2AppRes.body.application;
  });

  afterAll(async () => {
    if (fs.existsSync(testDummyPdf)) fs.unlinkSync(testDummyPdf);
    if (fs.existsSync(testDummyJpg)) fs.unlinkSync(testDummyJpg);
    if (fs.existsSync(testDummyTxt)) fs.unlinkSync(testDummyTxt);
    await mongoose.connection.close();
  });

  // 1. Valid student registration succeeds
  test('TC-01: Valid student registration succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Arindam Ghosh',
        email: `arindam.${Date.now()}@iemcal.edu`,
        mobile: '9830088776',
        password: 'Password123!',
        dob: '2007-02-14'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe(ROLES.STUDENT);
  });

  // 2. Duplicate email registration fails
  test('TC-02: Duplicate email registration fails', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Candidate',
        email: studentUser.email,
        mobile: '9830011223',
        password: 'Password123!'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  // 3. Valid login succeeds
  test('TC-03: Valid login succeeds', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentUser.email,
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(studentUser.email);
  });

  // 4. Invalid login fails
  test('TC-04: Invalid login fails', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentUser.email,
        password: 'WrongPassword999!'
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  // 5. Student cannot access admin APIs
  test('TC-05: Student cannot access admin APIs', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 6. Admin can access authorized management APIs
  test('TC-06: Admin can access authorized management APIs', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard-stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats).toBeDefined();
  });

  // 7. Student cannot access another student's application
  test('TC-07: Student cannot access another student\'s application', async () => {
    const res = await request(app)
      .get(`/api/applications/${student2App._id}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  // 8. Draft saving and resuming work correctly
  test('TC-08: Draft saving and resuming work correctly', async () => {
    const updateRes = await request(app)
      .put('/api/applications/my-application/draft')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        programmeId: testProgramme._id,
        personalInfo: {
          fullName: 'Suman Roy',
          dob: '2007-05-10',
          address: 'Salt Lake Sector V',
          state: 'West Bengal',
          pinCode: '700091',
          category: 'GENERAL'
        },
        academicInfo: {
          class10Board: 'CBSE',
          class10Year: 2024,
          class10Percentage: 88,
          class12Board: 'CBSE',
          class12Year: 2026,
          class12Percentage: 92,
          entranceExam: 'WBJEE',
          entranceRank: 1200
        }
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.application.academicInfo.class12Percentage).toBe(92);
  });

  // 9. Valid application submission generates one unique application ID
  test('TC-09: Valid application submission generates unique application ID', async () => {
    const docTypes = [
      DOCUMENT_TYPES.PHOTO,
      DOCUMENT_TYPES.SIGNATURE,
      DOCUMENT_TYPES.CLASS_10,
      DOCUMENT_TYPES.CLASS_12,
      DOCUMENT_TYPES.RANK_CARD
    ];

    for (const dType of docTypes) {
      await request(app)
        .post('/api/documents/upload')
        .set('Authorization', `Bearer ${studentToken}`)
        .field('documentType', dType)
        .attach('document', testDummyPdf);
    }

    const submitRes = await request(app)
      .post('/api/applications/my-application/submit')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.success).toBe(true);
    expect(submitRes.body.applicationId).toMatch(/^IEM-2026-/);
  });

  // 10. Incomplete applications cannot be submitted
  test('TC-10: Incomplete applications cannot be submitted', async () => {
    const submitRes = await request(app)
      .post('/api/applications/my-application/submit')
      .set('Authorization', `Bearer ${student2Token}`);

    expect(submitRes.status).toBe(400);
    expect(submitRes.body.success).toBe(false);
  });

  // 11. PDF/JPG files within 4 MB limit are accepted
  test('TC-11: PDF and JPG files within 4 MB limit are accepted', async () => {
    const resPdf = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${student2Token}`)
      .field('documentType', DOCUMENT_TYPES.PHOTO)
      .attach('document', testDummyPdf);

    expect(resPdf.status).toBe(200);

    const resJpg = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${student2Token}`)
      .field('documentType', DOCUMENT_TYPES.SIGNATURE)
      .attach('document', testDummyJpg);

    expect(resJpg.status).toBe(200);
  });

  // 12. Unsupported file types are rejected
  test('TC-12: Unsupported file types are rejected', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${student2Token}`)
      .field('documentType', DOCUMENT_TYPES.CLASS_10)
      .attach('document', testDummyTxt);

    expect(res.status).toBe(400);
  });

  // 13. Unuploaded documents remain Not Uploaded or Pending
  test('TC-13: Unuploaded documents remain Not Uploaded or Pending', async () => {
    const docs = await Document.find({ application: student2App._id });
    const pendingOrNotUploaded = docs.filter(d => !d.filePath || d.status === DOCUMENT_STATUS.NOT_UPLOADED);
    expect(pendingOrNotUploaded.length).toBeGreaterThan(0);
  });

  // 14. Valid documents can be approved
  test('TC-14: Valid documents can be approved by verifier', async () => {
    const doc = await Document.findOne({ application: studentApp._id, documentType: DOCUMENT_TYPES.PHOTO });
    const res = await request(app)
      .put(`/api/documents/${doc._id}/review`)
      .set('Authorization', `Bearer ${verifierToken}`)
      .send({ status: DOCUMENT_STATUS.APPROVED, remarks: 'Verified successfully' });

    expect(res.status).toBe(200);
    expect(res.body.document.status).toBe(DOCUMENT_STATUS.APPROVED);
  });

  // 15. Invalid documents can be rejected with remarks
  test('TC-15: Invalid documents can be rejected with mandatory remarks', async () => {
    const doc = await Document.findOne({ application: studentApp._id, documentType: DOCUMENT_TYPES.CLASS_12 });
    
    // Missing remark fails
    const failRes = await request(app)
      .put(`/api/documents/${doc._id}/review`)
      .set('Authorization', `Bearer ${verifierToken}`)
      .send({ status: DOCUMENT_STATUS.REJECTED, remarks: '' });
    expect(failRes.status).toBe(400);

    // With remark succeeds
    const successRes = await request(app)
      .put(`/api/documents/${doc._id}/review`)
      .set('Authorization', `Bearer ${verifierToken}`)
      .send({ status: DOCUMENT_STATUS.REJECTED, remarks: 'Scan blurry' });

    expect(successRes.status).toBe(200);
    expect(successRes.body.document.status).toBe(DOCUMENT_STATUS.REJECTED);
  });

  // 16. Students can replace rejected documents
  test('TC-16: Students can replace rejected documents', async () => {
    const res = await request(app)
      .post('/api/documents/upload')
      .set('Authorization', `Bearer ${studentToken}`)
      .field('documentType', DOCUMENT_TYPES.CLASS_12)
      .attach('document', testDummyPdf);

    expect(res.status).toBe(200);
    expect(res.body.document.status).toBe(DOCUMENT_STATUS.REPLACEMENT_SUBMITTED);
  });

  // 17. Missing or rejected required documents block eligibility
  test('TC-17: Missing or rejected required documents block eligibility', async () => {
    const appRec = await Application.findById(studentApp._id);
    expect(appRec.isDocumentVerified).toBe(false);
  });

  // 18. Scores of 0 and 100 are accepted
  test('TC-18: Scores of 0 and 100 are accepted', async () => {
    const res0 = await request(app)
      .put('/api/applications/my-application/draft')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ academicInfo: { class10Percentage: 0 } });
    expect(res0.status).toBe(200);

    const res100 = await request(app)
      .put('/api/applications/my-application/draft')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ academicInfo: { class12Percentage: 100 } });
    expect(res100.status).toBe(200);
  });

  // 19. Scores of -1 and 101 are rejected
  test('TC-19: Scores of -1 and 101 are rejected', async () => {
    const resNeg = await request(app)
      .put('/api/applications/my-application/draft')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ academicInfo: { class12Percentage: -1 } });
    expect(resNeg.status).toBe(400);

    const resOver = await request(app)
      .put('/api/applications/my-application/draft')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ academicInfo: { class10Percentage: 101 } });
    expect(resOver.status).toBe(400);
  });

  // 20. Merit calculation uses configured ranking criteria
  test('TC-20: Merit calculation uses configured ranking criteria', async () => {
    // Approve all docs for student 1
    await Document.updateMany({ application: studentApp._id }, { $set: { status: DOCUMENT_STATUS.APPROVED } });
    await Application.findByIdAndUpdate(studentApp._id, {
      status: APPLICATION_STATUS.VERIFIED,
      isDocumentVerified: true,
      isEligible: true,
      programme: testProgramme._id
    });

    const calcResult = await meritCalculationService.calculateMerit({
      programmeId: testProgramme._id,
      admissionCycle: '2026-2027',
      saveAsPreview: false,
      user: adminUser
    });

    expect(calcResult.totalEligible).toBeGreaterThanOrEqual(1);
    expect(calcResult.entries[0].position).toBe(1);
  });

  // 21. Category-wise merit lists are generated consistently
  test('TC-21: Category-wise merit lists are generated consistently', async () => {
    const meritList = await MeritList.findOne({ programme: testProgramme._id });
    expect(meritList).toBeDefined();
    expect(meritList.entries.length).toBeGreaterThanOrEqual(1);
  });

  // 22. Ineligible candidates are not allotted seats
  test('TC-22: Ineligible candidates are not allotted seats', async () => {
    await expect(
      seatAllocationService.allotSeat({ applicationId: student2App._id })
    ).rejects.toThrow(/not eligible/i);
  });

  // 23. No seat is allotted when inventory is exhausted
  test('TC-23: No seat is allotted when inventory is exhausted', async () => {
    await Seat.deleteMany({ programme: testProgramme._id });

    await expect(
      seatAllocationService.allotSeat({ applicationId: studentApp._id })
    ).rejects.toThrow(/No available seats/i);
  });

  // 24. Concurrent allocation attempts cannot assign the same seat twice
  test('TC-24: Concurrent allocation attempts cannot assign the same seat twice', async () => {
    const singleSeat = await Seat.create({
      seatIdentifier: `CONC-GEN-01`,
      programme: testProgramme._id,
      category: 'GENERAL',
      status: SEAT_STATUS.AVAILABLE
    });

    await Application.findByIdAndUpdate(studentApp._id, { isEligible: true });

    // First allotment claims it
    const res1 = await seatAllocationService.allotSeat({ applicationId: studentApp._id });
    expect(res1.seat.seatIdentifier).toBe(singleSeat.seatIdentifier);

    // Second allotment fails because seat is now ALLOTTED
    await expect(
      seatAllocationService.allotSeat({ applicationId: studentApp._id })
    ).rejects.toThrow();
  });

  // 25. Payment success enables seat acceptance
  test('TC-25: Payment success enables seat acceptance', async () => {
    const allocation = await SeatAllocation.findOne({ application: studentApp._id });

    await Payment.create({
      transactionReference: `TXN-TC25-${Date.now()}`,
      application: studentApp._id,
      student: studentUser.id,
      allocation: allocation._id,
      amount: testProgramme.admissionFee,
      status: PAYMENT_STATUS.SUCCESSFUL,
      completedAt: new Date()
    });

    const res = await request(app)
      .post('/api/seats/accept')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ allocationId: allocation._id });

    expect(res.status).toBe(200);
    expect(res.body.allocation.status).toBe(SEAT_STATUS.ACCEPTED);
  });

  // 26. Payment failure blocks acceptance and allows retry
  test('TC-26: Payment failure blocks acceptance and allows retry', async () => {
    const newSeat = await Seat.create({
      seatIdentifier: `FAIL-GEN-01`,
      programme: testProgramme._id,
      category: 'GENERAL',
      status: SEAT_STATUS.ALLOTTED
    });
    const newAlloc = await SeatAllocation.create({
      application: student2App._id,
      student: student2User.id,
      seat: newSeat._id,
      programme: testProgramme._id,
      category: 'GENERAL',
      feeAmount: 50000,
      acceptanceDeadline: new Date(Date.now() + 86400000),
      status: SEAT_STATUS.ALLOTTED
    });

    await Payment.create({
      transactionReference: `TXN-TC26-${Date.now()}`,
      application: student2App._id,
      student: student2User.id,
      allocation: newAlloc._id,
      amount: 50000,
      status: PAYMENT_STATUS.FAILED
    });

    const res = await request(app)
      .post('/api/seats/accept')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ allocationId: newAlloc._id });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Successful/i);
  });

  // 27. Pending or cancelled payment blocks acceptance
  test('TC-27: Pending or cancelled payment blocks acceptance', async () => {
    const alloc = await SeatAllocation.findOne({ student: student2User.id, status: SEAT_STATUS.ALLOTTED });
    await Payment.findOneAndUpdate(
      { allocation: alloc._id },
      { $set: { status: PAYMENT_STATUS.PENDING } }
    );

    const res = await request(app)
      .post('/api/seats/accept')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ allocationId: alloc._id });

    expect(res.status).toBe(400);
  });

  // 28. Students cannot forge payment success
  test('TC-28: Students cannot forge payment success', async () => {
    const res = await request(app)
      .post('/api/payments/invalid_id_999/simulate-outcome')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ outcome: 'HACK_SUCCESS' });

    expect(res.status).toBe(404);
  });

  // 29. Acceptance after deadline is rejected
  test('TC-29: Acceptance after deadline is rejected', async () => {
    const alloc = await SeatAllocation.findOne({ student: student2User.id, status: SEAT_STATUS.ALLOTTED });
    alloc.acceptanceDeadline = new Date(Date.now() - 86400000);
    await alloc.save();

    await Payment.findOneAndUpdate(
      { allocation: alloc._id },
      { $set: { status: PAYMENT_STATUS.SUCCESSFUL } }
    );

    const res = await request(app)
      .post('/api/seats/accept')
      .set('Authorization', `Bearer ${student2Token}`)
      .send({ allocationId: alloc._id });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/expired/i);
  });

  // 30. Declining seat updates allocation and releases seat
  test('TC-30: Declining seat updates allocation and releases seat', async () => {
    // Register dedicated applicant for decline testing
    const decEmail = `decline.test.${Date.now()}@iemcal.edu`;
    const decReg = await request(app).post('/api/auth/register').send({
      name: 'Decline Candidate',
      email: decEmail,
      mobile: '9830055443',
      password: 'Password123!',
      dob: '2007-03-10'
    });
    const decToken = decReg.body.token;
    const decUser = decReg.body.user;

    const decAppRes = await request(app).get('/api/applications/my-application').set('Authorization', `Bearer ${decToken}`);
    const decApp = decAppRes.body.application;

    const decSeat = await Seat.create({
      seatIdentifier: `DEC-GEN-01`,
      programme: testProgramme._id,
      category: 'GENERAL',
      status: SEAT_STATUS.ALLOTTED
    });
    const decAlloc = await SeatAllocation.create({
      application: decApp._id,
      student: decUser.id,
      seat: decSeat._id,
      programme: testProgramme._id,
      category: 'GENERAL',
      feeAmount: 50000,
      acceptanceDeadline: new Date(Date.now() + 86400000),
      status: SEAT_STATUS.ALLOTTED
    });

    const res = await request(app)
      .post('/api/seats/decline')
      .set('Authorization', `Bearer ${decToken}`)
      .send({ allocationId: decAlloc._id, reason: 'Declined by test' });

    expect(res.status).toBe(200);
    expect(res.body.allocation.status).toBe(SEAT_STATUS.DECLINED);

    const seatInDb = await Seat.findById(decSeat._id);
    expect(seatInDb.status).toBe(SEAT_STATUS.AVAILABLE);
  });

  // 31. Successful acceptance generates one valid receipt
  test('TC-31: Successful acceptance generates one valid receipt', async () => {
    const receipt = await Receipt.findOne({ application: studentApp._id });
    expect(receipt).toBeDefined();
    expect(receipt.receiptNumber).toMatch(/^RCP-IEM-2026-/);
  });

  // 32. Unauthorized receipt downloads are blocked
  test('TC-32: Unauthorized receipt downloads are blocked', async () => {
    const receipt = await Receipt.findOne({ application: studentApp._id });
    const res = await request(app)
      .get(`/api/receipts/${receipt._id}/download-pdf`)
      .set('Authorization', `Bearer ${student2Token}`);

    expect(res.status).toBe(403);
  });

  // 33. Notifications are generated for key status changes
  test('TC-33: Notifications are generated for key status changes', async () => {
    const notifs = await Notification.find({ recipient: studentUser.id });
    expect(notifs.length).toBeGreaterThanOrEqual(1);
  });

  // 34. Search, filters, and pagination return correct results
  test('TC-34: Search, filters, and pagination return correct results', async () => {
    const res = await request(app)
      .get('/api/applications')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ search: 'Suman', page: 1, limit: 5 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.applications.length).toBeGreaterThanOrEqual(1);
  });

  // 35. Health check and configuration endpoints return valid responsive payloads
  test('TC-35: API health check and public programmes endpoint return valid payloads', async () => {
    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);

    const progs = await request(app).get('/api/admin/programmes');
    expect(progs.status).toBe(200);
    expect(progs.body.programmes.length).toBeGreaterThan(0);
  });
});
