# IEM Admission Management System — REST API Documentation

**Base API URL:** `http://localhost:5000/api`  
**Authentication Standard:** HTTP Authorization Header using Bearer Token (`Authorization: Bearer <jwt_token>`)  
**Data Interchange Format:** JSON (`Content-Type: application/json`), Multipart Form-Data for uploads.

---

## 1. Authentication & User APIs (`/api/auth`)

### 1.1 Candidate Registration
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Arindam Ghosh",
  "email": "arindam.ghosh@iemcal.edu",
  "mobile": "9830088776",
  "password": "Password123!",
  "dob": "2007-02-14",
  "programmeId": "65b210c4f8..." // Optional: initial programme selection
}
```
- **Responses:**
  - `201 Created`: Returns JWT token and sanitized user profile object (role strictly defaulted to `student`).
  - `400 Bad Request`: Email already exists, or validation failure (e.g., non-10 digit mobile number, short password).
  - `403 Forbidden`: Client attempted to pass administrative or verifier roles in public registration.

### 1.2 User Login
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "student@iemcal.edu",
  "password": "Password123!"
}
```
- **Responses:**
  - `200 OK`: Returns JWT token and sanitized user details.
  - `401 Unauthorized`: Invalid credentials.

### 1.3 Rapid Demo Role Login (Evaluator Control)
- **Endpoint:** `POST /api/auth/demo-login`
- **Access:** Public (Academic evaluation utility)
- **Request Body:** `{ "role": "admin" | "verifier" | "student_verified" | "student_allotted" | ... }`
- **Responses:**
  - `200 OK`: Issues pre-authenticated session for the targeted evaluation scenario.

### 1.4 Current Session Profile
- **Endpoint:** `GET /api/auth/me`
- **Access:** Private (Authenticated User)
- **Responses:**
  - `200 OK`: `{ "success": true, "user": { ... } }`

---

## 2. Application Form Lifecycle APIs (`/api/applications`)

### 2.1 Fetch My Application
- **Endpoint:** `GET /api/applications/my-application`
- **Access:** Private (`student`)
- **Responses:**
  - `200 OK`: Returns applicant application object, populated programme details, and document items. If not yet initialized, auto-provisions draft with unique `IEM-2026-XXXX` ID.

### 2.2 Save Application Draft
- **Endpoint:** `PUT /api/applications/my-application/draft`
- **Access:** Private (`student`)
- **Request Body:**
```json
{
  "programmeId": "65b210c4f8...",
  "personalInfo": {
    "fullName": "Arindam Ghosh",
    "dob": "2007-02-14",
    "gender": "Male",
    "category": "GENERAL",
    "address": "Salt Lake Sector V",
    "state": "West Bengal",
    "pinCode": "700091",
    "guardianName": "Subhas Ghosh",
    "guardianMobile": "9830012345"
  },
  "academicInfo": {
    "class10Board": "CBSE",
    "class10Year": 2024,
    "class10Percentage": 91.5,
    "class12Board": "CBSE",
    "class12Year": 2026,
    "class12Percentage": 89.2,
    "entranceExam": "WBJEE",
    "entranceRank": 1420,
    "entrancePercentile": 98.4
  }
}
```
- **Responses:**
  - `200 OK`: Draft updated successfully.
  - `400 Bad Request`: Validation failure (e.g., percentage outside 0–100 range, non-positive rank) or attempted modification of locked/submitted record.

### 2.3 Formal Application Submission
- **Endpoint:** `POST /api/applications/my-application/submit`
- **Access:** Private (`student`)
- **Responses:**
  - `200 OK`: Transitions status from `Draft` to `Submitted`, locks applicant editing, records timestamp, triggers in-app notification.
  - `400 Bad Request`: Missing mandatory fields or mandatory documents unuploaded.

### 2.4 Application Directory (Admin & Verifier)
- **Endpoint:** `GET /api/applications`
- **Access:** Private (`admin`, `verifier`)
- **Query Parameters:** `search`, `status`, `programme`, `category`, `exam`, `page`, `limit`, `sortBy`, `sortOrder`.
- **Responses:**
  - `200 OK`: `{ "success": true, "total": 45, "page": 1, "totalPages": 5, "applications": [ ... ] }`

---

## 3. Document Scrutiny & Upload APIs (`/api/documents`)

### 3.1 Upload Document File
- **Endpoint:** `POST /api/documents/upload`
- **Access:** Private (`student`)
- **Form Data:**
  - `documentType`: e.g. `Class 10 Marksheet`
  - `document`: Binary file (PDF, JPG, JPEG, PNG; Max 4 MB)
- **Responses:**
  - `200 OK`: Document uploaded, stored in uploads storage, status marked `Under Review` or `Replacement Submitted`.
  - `400 Bad Request`: Disallowed MIME type (e.g. `.txt`, `.exe`) or missing file.
  - `413 Payload Too Large`: File exceeds 4 MB threshold.

### 3.2 Review Document (Approve / Reject)
- **Endpoint:** `PUT /api/documents/:id/review`
- **Access:** Private (`admin`, `verifier`)
- **Request Body:**
```json
{
  "status": "Approved" | "Rejected",
  "remarks": "Mandatory remark if rejecting"
}
```
- **Responses:**
  - `200 OK`: Updates verification state, records verifier audit timestamp, updates overall application eligibility.
  - `400 Bad Request`: Remarks omitted when rejecting.

### 3.3 Secure Document Download
- **Endpoint:** `GET /api/documents/:id/download`
- **Access:** Private (Authorized owner student, verifier, or admin)
- **Responses:**
  - `200 OK`: Binary file stream.
  - `403 Forbidden`: Student attempting to access another candidate's private certificate.

---

## 4. Merit Calculation & Ranking Engine (`/api/merit`)

### 4.1 Calculate Merit Preview
- **Endpoint:** `POST /api/merit/calculate`
- **Access:** Private (`admin`)
- **Request Body:** `{ "programmeId": "...", "admissionCycle": "2026-2027" }`
- **Responses:**
  - `200 OK`: Computes rankings for all eligible, 100% document-verified candidates using configured criteria and tie-breakers.

### 4.2 Publish Official Merit List
- **Endpoint:** `POST /api/merit/publish`
- **Access:** Private (`admin`)
- **Responses:**
  - `200 OK`: Freezes rankings, marks list `Published`, notifies candidates, enables seat allocation.

### 4.3 View Published Merit List (Public & Student)
- **Endpoint:** `GET /api/merit/list/:programmeId`
- **Access:** Public
- **Query Parameters:** `category` (`GENERAL`, `OBC`, `SC`, `ST`), `search`.
- **Responses:**
  - `200 OK`: `{ "success": true, "programme": { ... }, "entries": [ ... ] }`

### 4.4 Export Merit List to CSV
- **Endpoint:** `GET /api/merit/export-csv/:programmeId`
- **Access:** Private (`admin`)
- **Responses:**
  - `200 OK`: CSV binary stream.

---

## 5. Seat Inventory & Allotment APIs (`/api/seats`)

### 5.1 Fetch Student Allotment
- **Endpoint:** `GET /api/seats/my-allotment`
- **Access:** Private (`student`)
- **Responses:**
  - `200 OK`: Details of allotted seat, category quota, admission fee amount, and acceptance deadline.

### 5.2 Allot Seat to Candidate
- **Endpoint:** `POST /api/seats/allot`
- **Access:** Private (`admin`)
- **Request Body:** `{ "applicationId": "...", "category": "GENERAL", "deadlineDays": 5 }`
- **Responses:**
  - `200 OK`: Atomic seat allocation created, prevents over-allocation, updates seat status to `Allotted`.
  - `400 Bad Request`: Candidate ineligible, unverified, or seat inventory exhausted.

### 5.3 Accept Allotted Seat
- **Endpoint:** `POST /api/seats/accept`
- **Access:** Private (`student`)
- **Request Body:** `{ "allocationId": "..." }`
- **Responses:**
  - `200 OK`: Seat confirmed, provisional admission receipt auto-generated.
  - `400 Bad Request`: Payment not successful, deadline expired, or seat already processed.

### 5.4 Decline Allotted Seat
- **Endpoint:** `POST /api/seats/decline`
- **Access:** Private (`student`)
- **Request Body:** `{ "allocationId": "...", "reason": "Opting for another institution" }`
- **Responses:**
  - `200 OK`: Releases seat back to available inventory.

---

## 6. Simulated Fee Payment APIs (`/api/payments`)

### 6.1 Create Payment Order
- **Endpoint:** `POST /api/payments/create-order`
- **Access:** Private (`student`)
- **Request Body:** `{ "allocationId": "...", "paymentMethod": "NetBanking_Demo" }`
- **Responses:**
  - `200 OK`: Generates unique transaction reference (`TXN-IEM-2026-XXXX`).

### 6.2 Simulate Payment Outcome (Evaluator Control)
- **Endpoint:** `POST /api/payments/:paymentId/simulate-outcome`
- **Access:** Private (`student`)
- **Request Body:**
```json
{
  "outcome": "Successful" | "Failed" | "Cancelled",
  "failureReason": "Simulated insufficient funds"
}
```
- **Responses:**
  - `200 OK`: Updates payment state-machine, permits retry on failure, unlocks seat acceptance on verified success.

---

## 7. Admission Receipts (`/api/receipts`)

### 7.1 Fetch Provisional Admission Receipt
- **Endpoint:** `GET /api/receipts/my-receipt`
- **Access:** Private (`student`)
- **Responses:**
  - `200 OK`: Returns receipt metadata (receipt number, candidate, programme, quota, transaction reference).

### 7.2 Download Official PDF Confirmation Receipt
- **Endpoint:** `GET /api/receipts/:receiptId/download-pdf`
- **Access:** Private (Receipt owner student or Admin)
- **Responses:**
  - `200 OK`: Streams official styled PDF receipt generated via PDFKit.
  - `403 Forbidden`: Unauthorized access attempt blocked.
