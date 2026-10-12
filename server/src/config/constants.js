module.exports = {
  ROLES: {
    STUDENT: 'student',
    ADMIN: 'admin',
    VERIFIER: 'verifier'
  },
  APPLICATION_STATUS: {
    DRAFT: 'Draft',
    SUBMITTED: 'Submitted',
    UNDER_REVIEW: 'Under Review',
    ACTION_REQUIRED: 'Action Required',
    VERIFIED: 'Verified',
    ELIGIBLE: 'Eligible',
    INELIGIBLE: 'Ineligible',
    MERIT_LISTED: 'Merit Listed',
    SEAT_ALLOTTED: 'Seat Allotted',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined'
  },
  DOCUMENT_STATUS: {
    NOT_UPLOADED: 'Not Uploaded',
    PENDING: 'Pending',
    UNDER_REVIEW: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    REPLACEMENT_SUBMITTED: 'Replacement Submitted'
  },
  DOCUMENT_TYPES: {
    PHOTO: 'Photograph',
    SIGNATURE: 'Signature',
    CLASS_10: 'Class 10 Marksheet',
    CLASS_12: 'Class 12 Marksheet',
    RANK_CARD: 'Entrance Examination Rank Card',
    CATEGORY_CERT: 'Category Certificate'
  },
  CATEGORIES: ['GENERAL', 'OBC', 'SC', 'ST'],
  PAYMENT_STATUS: {
    NOT_INITIATED: 'Not Initiated',
    PENDING: 'Pending',
    SUCCESSFUL: 'Successful',
    FAILED: 'Failed',
    CANCELLED: 'Cancelled'
  },
  SEAT_STATUS: {
    AVAILABLE: 'Available',
    ALLOTTED: 'Allotted',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
    EXPIRED: 'Expired'
  }
};
