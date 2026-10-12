# IEM Admission Management System — Automated Test Results & Verification Log

**Course:** Software Engineering & Project Management Laboratory (PCC-CS504)  
**Test Suite:** `server/src/tests/acceptanceCriteria.test.js`  
**Execution Environment:** Windows 10/11, Node.js v20.x, MongoDB 6.0+  
**Execution Timestamp:** October 12, 2026  
**Overall Result:** **35 / 35 TESTS PASSED (100% SUCCESS)**  
**Execution Time:** 10.46 seconds  

---

## 1. Test Execution Summary

```
PASS src/tests/acceptanceCriteria.test.js (10.462 s)
  IEM Admission Management System — Acceptance Criteria Suite
    √ TC-01: Valid student registration succeeds (351 ms)
    √ TC-02: Duplicate email registration fails (41 ms)
    √ TC-03: Valid login succeeds (300 ms)
    √ TC-04: Invalid login fails (188 ms)
    √ TC-05: Student cannot access admin APIs (41 ms)
    √ TC-06: Admin can access authorized management APIs (297 ms)
    √ TC-07: Student cannot access another student's application (52 ms)
    √ TC-08: Draft saving and resuming work correctly (71 ms)
    √ TC-09: Valid application submission generates unique application ID (496 ms)
    √ TC-10: Incomplete applications cannot be submitted (46 ms)
    √ TC-11: PDF and JPG files within 4 MB limit are accepted (169 ms)
    √ TC-12: Unsupported file types are rejected (40 ms)
    √ TC-13: Unuploaded documents remain Not Uploaded or Pending (14 ms)
    √ TC-14: Valid documents can be approved by verifier (116 ms)
    √ TC-15: Invalid documents can be rejected with mandatory remarks (134 ms)
    √ TC-16: Students can replace rejected documents (106 ms)
    √ TC-17: Missing or rejected required documents block eligibility (12 ms)
    √ TC-18: Scores of 0 and 100 are accepted (126 ms)
    √ TC-19: Scores of -1 and 101 are rejected (69 ms)
    √ TC-20: Merit calculation uses configured ranking criteria (139 ms)
    √ TC-21: Category-wise merit lists are generated consistently (9 ms)
    √ TC-22: Ineligible candidates are not allotted seats (31 ms)
    √ TC-23: No seat is allotted when inventory is exhausted (44 ms)
    √ TC-24: Concurrent allocation attempts cannot assign the same seat twice (225 ms)
    √ TC-25: Payment success enables seat acceptance (347 ms)
    √ TC-26: Payment failure blocks acceptance and allows retry (117 ms)
    √ TC-27: Pending or cancelled payment blocks acceptance (86 ms)
    √ TC-28: Students cannot forge payment success (32 ms)
    √ TC-29: Acceptance after deadline is rejected (119 ms)
    √ TC-30: Declining seat updates allocation and releases seat (483 ms)
    √ TC-31: Successful acceptance generates one valid receipt (11 ms)
    √ TC-32: Unauthorized receipt downloads are blocked (64 ms)
    √ TC-33: Notifications are generated for key status changes (10 ms)
    √ TC-34: Search, filters, and pagination return correct results (72 ms)
    √ TC-35: API health check and public programmes endpoint return valid payloads (49 ms)

Test Suites: 1 passed, 1 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        10.654 s
```

---

## 2. Traceable Test Execution Matrix

| Test ID | Input / Action | Expected Output | Actual Output | Status |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | `POST /api/auth/register` with valid candidate payload | HTTP 201, JWT issued, user role is `student` | HTTP 201, Token returned, `role: 'student'` | **PASS** |
| **TC-02** | `POST /api/auth/register` with already registered email | HTTP 400, duplicate email message | HTTP 400, "An account with this email address already exists" | **PASS** |
| **TC-03** | `POST /api/auth/login` with correct student email/password | HTTP 200, JWT token returned | HTTP 200, Token returned, authenticated | **PASS** |
| **TC-04** | `POST /api/auth/login` with incorrect password | HTTP 401 Unauthorized | HTTP 401, "Invalid email address or password" | **PASS** |
| **TC-05** | `GET /api/admin/dashboard-stats` using student Bearer token | HTTP 403 Forbidden | HTTP 403, Role verification blocked student | **PASS** |
| **TC-06** | `GET /api/admin/dashboard-stats` using admin Bearer token | HTTP 200 OK, returns stats payload | HTTP 200 OK, full dashboard stats received | **PASS** |
| **TC-07** | Student 2 requests `GET /api/applications/:student1_id` | HTTP 403 / 404 access denied | HTTP 403, Tenant boundary protected | **PASS** |
| **TC-08** | `PUT /api/applications/my-application/draft` with updated info | HTTP 200, draft persisted in DB | HTTP 200, DB record verified matching draft | **PASS** |
| **TC-09** | `POST /api/applications/my-application/submit` with valid data | HTTP 200, unique `IEM-2026-XXXX` generated | HTTP 200, Unique ID generated and persisted | **PASS** |
| **TC-10** | Submit incomplete application (missing required details) | HTTP 400 with missing field errors | HTTP 400, "Validation Error: Incomplete application" | **PASS** |
| **TC-11** | Upload valid 1.5 MB PDF and 800 KB JPG documents | HTTP 200, document saved and tracked | HTTP 200, stored in `/uploads`, status updated | **PASS** |
| **TC-12** | Upload unsupported `.txt` file | HTTP 400, invalid file type | HTTP 400, Rejected by Multer file filter | **PASS** |
| **TC-13** | Query newly initialized documents before candidate upload | Status reflects `Not Uploaded` / `Pending` | Status confirmed `Not Uploaded` | **PASS** |
| **TC-14** | Verifier calls `PUT /api/documents/:id/review` (`Approved`) | Document status marked `Approved` | HTTP 200, `status: 'Approved'`, audit recorded | **PASS** |
| **TC-15** | Verifier calls review (`Rejected`) with remarks | Status marked `Rejected`, remark logged | HTTP 200, `status: 'Rejected'`, remark stored | **PASS** |
| **TC-16** | Student uploads replacement for rejected document | Status changes to `Replacement Submitted` | HTTP 200, re-queued for scrutiny | **PASS** |
| **TC-17** | Application evaluation with 1 rejected mandatory document | `isDocumentVerified` remains false | Confirmed `isDocumentVerified: false` | **PASS** |
| **TC-18** | Academic percentage set to boundary values: 0% and 100% | HTTP 200, valid boundaries accepted | HTTP 200, 0% and 100% saved successfully | **PASS** |
| **TC-19** | Academic percentage set to invalid values: -1% and 101% | HTTP 400 Bad Request | HTTP 400, Rejected by validation check | **PASS** |
| **TC-20** | Execute merit ranking calculation for verified candidates | Ordered deterministically by entrance rank | Verified: Rank 1420 placed higher than 3800 | **PASS** |
| **TC-21** | Category-wise merit list partitioning | Candidates categorized into GEN, OBC, SC, ST | Verified: Category ranks calculated per quota | **PASS** |
| **TC-22** | Allot seat to ineligible / unverified candidate | HTTP 400, allotment blocked | HTTP 400, "Candidate is not eligible for allotment" | **PASS** |
| **TC-23** | Allot seat when programme category capacity is exhausted | HTTP 400, capacity limit enforced | HTTP 400, "No available seats in quota" | **PASS** |
| **TC-24** | 2 concurrent allocation requests for 1 remaining seat | Exactly one allotment succeeds, one rejected | Atomic check: 1 succeeded, 1 rejected | **PASS** |
| **TC-25** | Payment status: `Successful` &rarr; Request Seat Accept | HTTP 200, seat confirmed as `Accepted` | HTTP 200, Seat accepted, receipt generated | **PASS** |
| **TC-26** | Payment status: `Failed` &rarr; Request Seat Accept | HTTP 400 blocked; retry permitted | HTTP 400, "Payment not completed"; retry allowed | **PASS** |
| **TC-27** | Payment status: `Pending` or `Cancelled` &rarr; Seat Accept | HTTP 400, acceptance strictly blocked | HTTP 400, blocked | **PASS** |
| **TC-28** | Client sends spoofed acceptance request with unpaid fee | Server verifies DB payment record and blocks | HTTP 400, forgery rejected | **PASS** |
| **TC-29** | Seat acceptance attempted after expiry deadline | HTTP 400, expired allocation rejected | HTTP 400, "Allotment offer has expired" | **PASS** |
| **TC-30** | Candidate calls `POST /api/seats/decline` | Allotment marked `Declined`, seat released | HTTP 200, Seat marked `Available` in inventory | **PASS** |
| **TC-31** | Idempotent receipt creation after seat acceptance | Exactly 1 receipt generated with unique number | Verified: Duplicate acceptance blocked | **PASS** |
| **TC-32** | Student 2 requests download of Student 1's PDF receipt | HTTP 403 Forbidden | HTTP 403, PDF download blocked | **PASS** |
| **TC-33** | Application state transition triggers notification | Notification record added in MongoDB | Verified: Notification created with title & link | **PASS** |
| **TC-34** | Admin searches applications by keyword, quota, status | Filtered and paginated records returned | Correct matching subsets returned | **PASS** |
| **TC-35** | `GET /api/health` and `GET /api/admin/programmes` | HTTP 200 with operational metrics | HTTP 200, valid JSON payloads returned | **PASS** |

---

## 3. Frontend Production Build Verification

- **Command:** `npm run build` (in `/client`)
- **Status:** **SUCCESS (0 ERRORS, 0 WARNINGS)**
- **Output Directory:** `client/dist/client`
- **Bundle Metrics:**
  - Initial Total Transfer: ~97.99 kB (Raw: 372.41 kB)
  - Lazy Chunks: Split into on-demand chunks for fast mobile load times.
- **Components Verified:**
  - `AppComponent`
  - `LandingComponent`, `ProgrammesComponent`, `PublicMeritComponent`
  - `LoginComponent`, `RegisterComponent`
  - `StudentDashboardComponent`, `ApplicationFormComponent`, `DocumentStatusComponent`, `MeritViewComponent`, `SeatAllotmentComponent`, `ReceiptComponent`
  - `AdminDashboardComponent`, `ApplicationsListComponent`, `MeritManagementComponent`, `SeatManagementComponent`, `ReportsComponent`
  - `VerifierDashboardComponent`
  - `NavbarComponent`, `SidebarComponent`, `FooterComponent`, `ToastComponent`

---

## 4. Verification Sign-Off

All 35 acceptance criteria mandated by the IEM Software Engineering and Project Management (PCC-CS504) specification are thoroughly verified and operating as designed.
