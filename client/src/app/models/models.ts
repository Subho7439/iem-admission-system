export type UserRole = 'student' | 'admin' | 'verifier';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  dob?: string;
  lastLogin?: string;
}

export interface AdmissionProgramme {
  _id: string;
  code: string;
  name: string;
  degree: string;
  durationYears: number;
  totalSeats: number;
  seatsByCategory: {
    GENERAL: number;
    OBC: number;
    SC: number;
    ST: number;
  };
  admissionFee: number;
  semesterFee: number;
  eligibility: {
    minClass12Percentage: number;
    allowedExams: string[];
    maxEntranceRank: number;
  };
  isActive: boolean;
}

export type ApplicationStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Action Required'
  | 'Verified'
  | 'Eligible'
  | 'Ineligible'
  | 'Merit Listed'
  | 'Seat Allotted'
  | 'Accepted'
  | 'Declined';

export interface PersonalInfo {
  fullName?: string;
  dob?: string;
  gender?: string;
  email?: string;
  mobile?: string;
  address?: string;
  state?: string;
  pinCode?: string;
  category?: 'GENERAL' | 'OBC' | 'SC' | 'ST';
  guardianName?: string;
  guardianMobile?: string;
  guardianOccupation?: string;
}

export interface AcademicInfo {
  class10Board?: string;
  class10Year?: number;
  class10Percentage?: number;
  class12Board?: string;
  class12Year?: number;
  class12Percentage?: number;
  entranceExam?: 'WBJEE' | 'JEE Main' | 'IEMJEE';
  entranceRank?: number;
  entrancePercentile?: number;
}

export interface Application {
  _id: string;
  applicationId: string;
  user: User | string;
  programme: AdmissionProgramme;
  admissionCycle: string;
  status: ApplicationStatus;
  isDraft: boolean;
  submissionDate?: string;
  personalInfo: PersonalInfo;
  academicInfo: AcademicInfo;
  isDocumentVerified: boolean;
  isEligible: boolean;
  eligibilityRemarks?: string;
  meritPosition?: number;
  categoryMeritPosition?: number;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus =
  | 'Not Uploaded'
  | 'Pending'
  | 'Under Review'
  | 'Approved'
  | 'Rejected'
  | 'Replacement Submitted';

export interface DocumentVerificationHistory {
  status: string;
  remarks: string;
  fileName?: string;
  changedBy?: string;
  timestamp: string;
}

export interface DocumentItem {
  _id: string;
  application: string;
  documentType: string;
  originalName: string;
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  status: DocumentStatus;
  isRequired: boolean;
  verifierRemarks?: string;
  verifiedAt?: string;
  history?: DocumentVerificationHistory[];
}

export interface MeritEntry {
  position: number;
  categoryPosition: number;
  application: string;
  applicationId: string;
  candidateName: string;
  category: string;
  entranceExam: string;
  entranceRank: number;
  entrancePercentile: number;
  class12Percentage: number;
  class10Percentage: number;
  meritScore: number;
  tieBreakDetails: string;
  isEligible: boolean;
}

export interface MeritConfiguration {
  _id?: string;
  programme: AdmissionProgramme | string;
  admissionCycle: string;
  primaryCriterion: 'EntranceRank' | 'Class12Marks' | 'EntrancePercentile';
  rankOrder: 'ASC' | 'DESC';
  tieBreakers: string[];
  allowedExams: string[];
  status: 'Draft' | 'Calculated' | 'Published';
  publishedAt?: string;
}

export interface Seat {
  _id: string;
  seatIdentifier: string;
  programme: AdmissionProgramme | string;
  category: 'GENERAL' | 'OBC' | 'SC' | 'ST';
  status: 'Available' | 'Allotted' | 'Accepted' | 'Declined' | 'Expired';
  allottedTo?: Application;
  allottedAt?: string;
}

export interface SeatAllocation {
  _id: string;
  application: Application;
  student: User;
  seat: Seat;
  programme: AdmissionProgramme;
  category: string;
  feeAmount: number;
  allotmentDate: string;
  acceptanceDeadline: string;
  status: 'Allotted' | 'Accepted' | 'Declined' | 'Expired';
  acceptedAt?: string;
  declinedAt?: string;
  declineReason?: string;
}

export interface Payment {
  _id: string;
  transactionReference: string;
  application: string;
  allocation: SeatAllocation | string;
  amount: number;
  paymentMethod: string;
  status: 'Not Initiated' | 'Pending' | 'Successful' | 'Failed' | 'Cancelled';
  failureReason?: string;
  completedAt?: string;
  retryCount: number;
  createdAt: string;
}

export interface Receipt {
  _id: string;
  receiptNumber: string;
  application: Application;
  candidateName: string;
  programmeName: string;
  programmeCode: string;
  category: string;
  seatIdentifier: string;
  amountPaid: number;
  paymentReference: string;
  admissionCycle: string;
  issuedAt: string;
  pdfPath?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedApplicationId?: string;
  link?: string;
  createdAt: string;
}
