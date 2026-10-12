const validateAcademicScores = (academicInfo) => {
  if (!academicInfo) return { valid: true };

  const { class10Percentage, class12Percentage, entranceRank, entrancePercentile } = academicInfo;

  if (class10Percentage !== undefined && class10Percentage !== null && class10Percentage !== '') {
    const p10 = Number(class10Percentage);
    if (isNaN(p10) || p10 < 0 || p10 > 100) {
      return { valid: false, message: 'Class 10 percentage must be between 0 and 100' };
    }
  }

  if (class12Percentage !== undefined && class12Percentage !== null && class12Percentage !== '') {
    const p12 = Number(class12Percentage);
    if (isNaN(p12) || p12 < 0 || p12 > 100) {
      return { valid: false, message: 'Class 12 percentage must be between 0 and 100' };
    }
  }

  if (entrancePercentile !== undefined && entrancePercentile !== null && entrancePercentile !== '') {
    const perc = Number(entrancePercentile);
    if (isNaN(perc) || perc < 0 || perc > 100) {
      return { valid: false, message: 'Entrance percentile must be between 0 and 100' };
    }
  }

  if (entranceRank !== undefined && entranceRank !== null && entranceRank !== '') {
    const rank = Number(entranceRank);
    if (isNaN(rank) || rank <= 0 || !Number.isInteger(rank)) {
      return { valid: false, message: 'Entrance rank must be a positive integer greater than 0' };
    }
  }

  return { valid: true };
};

const validateApplicationUpdate = (req, res, next) => {
  if (req.body.academicInfo) {
    const check = validateAcademicScores(req.body.academicInfo);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.message });
    }
  }
  next();
};

const validateApplicationSubmission = (application, uploadedDocuments = []) => {
  const { personalInfo, academicInfo } = application;
  const errors = [];

  // Personal info checks
  if (!personalInfo?.fullName) errors.push('Full name is required');
  if (!personalInfo?.dob) errors.push('Date of birth is required');
  if (!personalInfo?.address) errors.push('Address is required');
  if (!personalInfo?.pinCode) errors.push('PIN code is required');
  if (!personalInfo?.category) errors.push('Category is required');

  // Academic checks
  if (!academicInfo?.class10Board) errors.push('Class 10 Board is required');
  if (academicInfo?.class10Percentage === undefined || academicInfo?.class10Percentage === null) {
    errors.push('Class 10 Percentage is required');
  } else if (academicInfo.class10Percentage < 0 || academicInfo.class10Percentage > 100) {
    errors.push('Class 10 percentage must be between 0 and 100');
  }

  if (!academicInfo?.class12Board) errors.push('Class 12 Board is required');
  if (academicInfo?.class12Percentage === undefined || academicInfo?.class12Percentage === null) {
    errors.push('Class 12 Percentage is required');
  } else if (academicInfo.class12Percentage < 0 || academicInfo.class12Percentage > 100) {
    errors.push('Class 12 percentage must be between 0 and 100');
  }

  if (!academicInfo?.entranceRank || academicInfo.entranceRank <= 0) {
    errors.push('Valid positive entrance examination rank is required');
  }

  // Document checks: mandatory docs (Photo, Signature, Class 10, Class 12, Rank Card)
  const mandatoryDocs = [
    'Photograph',
    'Signature',
    'Class 10 Marksheet',
    'Class 12 Marksheet',
    'Entrance Examination Rank Card'
  ];

  if (personalInfo?.category && personalInfo.category !== 'GENERAL') {
    mandatoryDocs.push('Category Certificate');
  }

  const uploadedTypes = uploadedDocuments
    .filter(doc => doc.status !== 'Not Uploaded' && doc.filePath)
    .map(doc => doc.documentType);

  const missingDocs = mandatoryDocs.filter(d => !uploadedTypes.includes(d));
  if (missingDocs.length > 0) {
    errors.push(`Missing mandatory documents: ${missingDocs.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateAcademicScores,
  validateApplicationUpdate,
  validateApplicationSubmission
};
