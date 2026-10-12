# IEM Admission Management System — Test Plan & Quality Assurance Strategy

**Subject:** Software Engineering & Project Management Laboratory (PCC-CS504)  
**System Under Test (SUT):** IEM Admission Management System (MEAN Stack)  
**Frameworks Used:** Jest 29.7, Supertest 7.0, Angular Testbed  
**Date:** October 2026  

---

## 1. Objectives & Scope

The purpose of this Test Plan is to verify that the **IEM Admission Management System** strictly satisfies all functional requirements, business constraints, security barriers, and workflow transitions specified by the IEM Academic Council and Laboratory Syllabus.

### Scope:
- **In-Scope:**
  - Student registration, password hashing, and JWT authorization.
  - Role-based access control (`student`, `admin`, `verifier`).
  - Application draft saving, boundary checks, and submission locks.
  - Multipart document upload, file format filtering, and size limit checks (4 MB).
  - Document verification, rejection with mandatory remarks, and replacement flow.
  - Configurable deterministic merit calculation and tie-breaking algorithms.
  - Seat allocation, concurrency locks, and expiration deadlines.
  - Simulated payment state-machine and idempotent outcome validation.
  - Seat acceptance gating and PDFKit admission confirmation receipt generation.
  - Search, filtering, pagination, and analytics exports.
- **Out-of-Scope:**
  - Real money financial transactions (simulated payment engine strictly utilized).
  - Third-party live email SMTP relay dependencies (in-app notification center utilized with optional SMTP fallback).

---

## 2. Test Strategy & Levels of Testing

### 2.1 Unit Testing
- **Backend:** Schema validators, password comparison functions, token generation, and tie-breaking algorithms.
- **Frontend:** Service state stores (Angular Signals), form validation controls, and route guard logic.

### 2.2 Integration & API Testing
- Built with **Jest** and **Supertest** executing against an active MongoDB test database.
- Evaluates complete HTTP request/response lifecycles, database persistence, middleware chains, and role authorization barriers.

### 2.3 Boundary & Negative Testing
- Negative boundary tests for academic scores (scores of `-1` and `101` rejected; `0` and `100` accepted).
- Payload limit testing for oversized document uploads (>4 MB).
- Unsupported MIME types (`.txt`, `.exe`, `.sh`).

### 2.4 Security & Concurrency Testing
- Protection against privilege escalation (prevent self-selection of admin/verifier roles during registration).
- Tenant isolation (prevent a student from inspecting or modifying another student's application or documents).
- Race-condition testing (simultaneous allocation requests against a single seat inventory unit).

---

## 3. Test Environment & Configuration

| Component | Specification |
| :--- | :--- |
| **Node.js Runtime** | Node.js v18+ / v20+ LTS |
| **Backend Framework** | Express 4.21.2 |
| **Database** | MongoDB 6.0+ (`mongodb://localhost:27017/iem_admission_db`) |
| **Frontend Framework** | Angular 18.2 with Tailwind CSS 3.4 |
| **Test Runner** | Jest with `--runInBand --detectOpenHandles --forceExit` |
| **File Storage** | Local test sandbox storage (`/uploads`) |

---

## 4. Requirement Traceability Matrix (RTM)

| Test ID | Test Category | Target Feature / Requirement | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | Auth / Identity | Valid Student Registration | Account created, bcrypt hashed, JWT returned. |
| **TC-02** | Auth / Negative | Duplicate Email Registration | Rejected with HTTP 400. |
| **TC-03** | Auth / Security | Valid Credentials Login | HTTP 200, JWT issued. |
| **TC-04** | Auth / Security | Invalid Password Login | Rejected with HTTP 401. |
| **TC-05** | RBAC / Security | Student Access to Admin APIs | Blocked with HTTP 403 Forbidden. |
| **TC-06** | RBAC / Admin | Admin Access to Management APIs | Permitted with HTTP 200 OK. |
| **TC-07** | Tenant Isolation | Cross-Student Access Protection | Blocked with HTTP 403 / 404. |
| **TC-08** | Application | Draft Persistence & Resuming | Draft saved, retrieved unmodified. |
| **TC-09** | Application | Unique Application ID Generation | Unique `IEM-2026-XXXX` generated. |
| **TC-10** | Application | Incomplete Application Submission | Rejected with HTTP 400. |
| **TC-11** | File Upload | Valid PDF/JPG Upload (<= 4 MB) | Accepted, stored, status updated. |
| **TC-12** | File Upload | Unsupported File Types (.txt) | Rejected with HTTP 400. |
| **TC-13** | Scrutiny | Unuploaded Documents | Displayed as Not Uploaded / Pending. |
| **TC-14** | Scrutiny | Document Approval by Verifier | Marked Approved, audit recorded. |
| **TC-15** | Scrutiny | Document Rejection with Remarks | Remarks required, student notified. |
| **TC-16** | Scrutiny | Replacement Document Submission | Replacement uploaded, re-queued. |
| **TC-17** | Merit Eligibility | Unverified/Rejected Docs Blocking | Eligibility blocked until 100% verified. |
| **TC-18** | Boundary Test | Percentage Bounds (0% and 100%) | Accepted as valid scores. |
| **TC-19** | Boundary Test | Percentage Bounds (-1% and 101%) | Rejected by schema validator. |
| **TC-20** | Merit Engine | Deterministic Ranking Execution | Rankings follow configured rules. |
| **TC-21** | Merit Engine | Category Quota Partitioning | Separate lists generated for GEN, OBC, SC, ST. |
| **TC-22** | Seat Allocation | Ineligible Candidate Allotment | System blocks seat allocation. |
| **TC-23** | Seat Allocation | Exhausted Inventory Allotment | Blocked when available seats = 0. |
| **TC-24** | Concurrency | Double Allotment Race Condition | Only one candidate wins the seat. |
| **TC-25** | Payment / Gating| Successful Payment Unlocks Seat | Seat acceptance unlocked. |
| **TC-26** | Payment / Retry | Failed Payment Blocks & Retries | Acceptance blocked, retry permitted. |
| **TC-27** | Payment / State | Pending/Cancelled Payment Gating | Final acceptance blocked. |
| **TC-28** | Security | Client-side Payment Forgery | Server state machine rejects forgery. |
| **TC-29** | Seat Expiration | Expired Deadline Acceptance | Rejected after acceptance deadline. |
| **TC-30** | Seat Allocation | Seat Decline Workflow | Seat released back to inventory. |
| **TC-31** | Receipt | Idempotent Receipt Generation | Exactly one unique receipt issued. |
| **TC-32** | Security | Unauthorized Receipt PDF Download| Blocked with HTTP 403. |
| **TC-33** | Notifications | Status Change In-App Alerts | Notifications dispatched for key transitions. |
| **TC-34** | Admin Search | Query, Filtering, Pagination | Correct matching records returned. |
| **TC-35** | System Health | Health Check & Public Endpoints | Returns HTTP 200 with operational metrics. |

---

## 5. Pass / Fail Criteria

1. **Unit & API Testing:** 100% of tests in `src/tests/acceptanceCriteria.test.js` must pass.
2. **Build Success:** Angular production build (`npm run build`) must complete with 0 compilation errors.
3. **Database Operations:** All CRUD operations must persist in MongoDB without data truncation.
