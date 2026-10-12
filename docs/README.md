# IEM Admission Management System — Documentation Suite

**Course:** Software Engineering & Project Management Laboratory (PCC-CS504)  
**Institution:** Institute of Engineering & Management (IEM), Kolkata  
**Academic Session:** 2026–2027  
**Technology Stack:** MEAN (MongoDB, Express.js, Angular 18, Node.js)  

---

## 1. Documentation Overview

This directory provides the formal Software Engineering documentation for the **IEM Admission Management System**, structured to fulfill laboratory project requirements and university evaluation criteria:

| Document | Purpose & Scope |
| :--- | :--- |
| [**`API_DOCUMENTATION.md`**](./API_DOCUMENTATION.md) | Comprehensive REST API reference, request/response contracts, authorization roles, query parameters, and error status codes. |
| [**`DATABASE_SCHEMA.md`**](./DATABASE_SCHEMA.md) | MongoDB data models, Mongoose schemas, relationships, field constraints, indexing strategy, and lifecycle state machines. |
| [**`TEST_PLAN.md`**](./TEST_PLAN.md) | Software testing strategy, test methodology, environment specifications, test levels, and acceptance test matrix. |
| [**`TEST_RESULTS.md`**](./TEST_RESULTS.md) | Traceable test execution report recording inputs, expected outputs, actual outputs, and pass/fail statuses for all 35 acceptance criteria. |

---

## 2. Software Engineering Models & Architecture

### A. Use-Case Model
- **Actors:**
  - **Student / Candidate:** Registers, enters personal and academic details, uploads certificates, tracks scrutiny, views merit rankings, accepts/declines allotted seats, simulates payments, downloads PDF receipts.
  - **Document Verifier:** Scrutinizes submitted applicant documents, approves genuine certificates, or rejects defective scans with mandatory remarks, and requests replacement uploads.
  - **Administrator:** Exercises complete institutional oversight: configures programmes, sets seat capacities, calculates merit rankings, publishes official merit lists, allocates seats, analyzes payment summaries, inspects audit logs, and exports CSV reports.

### B. Data-Flow Model (DFD Processes)
1. **P1: User Registration & Authentication** (Candidate identity provisioning, bcrypt hashing, JWT issuance).
2. **P2: Application & Document Lifecycle** (Draft persistence, multipart uploads, 4 MB boundary enforcement, verifier review).
3. **P3: Merit Calculation Engine** (Deterministic ranking, tie-breaking rules based on Class 12 and Class 10 marks, category partitioning).
4. **P4: Seat Inventory & Allocation** (Capacity checks, concurrency locks, category reservation rules, allotment issuance).
5. **P5: Payment Processing & Receipting** (Simulated transaction state machine, verification barrier, PDFKit receipt generation).

### C. Layered MEAN Architecture
- **Presentation Layer (Angular 18):** Standalone components, Angular Signals for state reactivity, Reactive Forms for validation, Tailwind CSS for accessible university UI, Route Guards (`authGuard`, `roleGuard`), and HTTP interceptors.
- **Application / Business Logic Layer (Node.js & Express):** Modular routing, controller-service abstraction, RBAC middleware, Multer file scrutiny, PDFKit document generation.
- **Data Persistence Layer (MongoDB & Mongoose):** Schema enforcement, indexes for search efficiency, unique constraints, transactional and conditional atomic updates.
