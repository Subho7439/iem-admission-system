const Application = require('../models/Application');
const Document = require('../models/Document');
const MeritConfiguration = require('../models/MeritConfiguration');
const MeritList = require('../models/MeritList');
const { APPLICATION_STATUS, DOCUMENT_STATUS } = require('../config/constants');

class MeritCalculationService {
  /**
   * Calculate merit rankings for a programme based on configured rules
   */
  async calculateMerit({ programmeId, admissionCycle = '2026-2027', saveAsPreview = false, user = null }) {
    // 1. Fetch or get default configuration
    let config = await MeritConfiguration.findOne({ programme: programmeId, admissionCycle });
    if (!config) {
      config = await MeritConfiguration.create({
        programme: programmeId,
        admissionCycle,
        primaryCriterion: 'EntranceRank',
        rankOrder: 'ASC',
        tieBreakers: ['Class12Marks', 'Class10Marks']
      });
    }

    // 2. Fetch all submitted or under review applications for this programme & cycle
    const applications = await Application.find({
      programme: programmeId,
      admissionCycle,
      status: {
        $in: [
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          APPLICATION_STATUS.VERIFIED,
          APPLICATION_STATUS.ELIGIBLE,
          APPLICATION_STATUS.MERIT_LISTED,
          APPLICATION_STATUS.SEAT_ALLOTTED,
          APPLICATION_STATUS.ACCEPTED
        ]
      }
    }).populate('programme user');

    // 3. Filter candidates: check document verification and eligibility
    const eligibleCandidates = [];

    for (const app of applications) {
      // Check that all required documents are APPROVED
      const docs = await Document.find({ application: app._id, isRequired: true });
      const hasAllApprovedDocs = docs.length >= 5 && docs.every(d => d.status === DOCUMENT_STATUS.APPROVED);

      // Check academic eligibility against programme rules
      const minP12 = app.programme?.eligibility?.minClass12Percentage || 60;
      const class12Pass = (app.academicInfo?.class12Percentage || 0) >= minP12;
      const validRank = (app.academicInfo?.entranceRank || 0) > 0;

      const isEligible = hasAllApprovedDocs && class12Pass && validRank;

      // Update application eligibility flag in DB
      app.isDocumentVerified = hasAllApprovedDocs;
      app.isEligible = isEligible;
      app.eligibilityRemarks = isEligible
        ? 'Verified & Eligible for Merit'
        : (!hasAllApprovedDocs ? 'Documents Pending or Rejected' : 'Does not meet minimum criteria');
      await app.save();

      if (isEligible) {
        eligibleCandidates.push(app);
      }
    }

    // 4. Sort eligible candidates using configured ranking rules and tie-breakers
    const criterion = config.primaryCriterion;
    const rankOrder = config.rankOrder; // 'ASC' or 'DESC'

    eligibleCandidates.sort((a, b) => {
      let scoreA, scoreB;

      if (criterion === 'EntranceRank') {
        scoreA = a.academicInfo?.entranceRank || 999999;
        scoreB = b.academicInfo?.entranceRank || 999999;
        const diff = rankOrder === 'ASC' ? scoreA - scoreB : scoreB - scoreA;
        if (diff !== 0) return diff;
      } else if (criterion === 'Class12Marks') {
        scoreA = a.academicInfo?.class12Percentage || 0;
        scoreB = b.academicInfo?.class12Percentage || 0;
        const diff = rankOrder === 'ASC' ? scoreA - scoreB : scoreB - scoreA;
        if (diff !== 0) return diff;
      } else if (criterion === 'EntrancePercentile') {
        scoreA = a.academicInfo?.entrancePercentile || 0;
        scoreB = b.academicInfo?.entrancePercentile || 0;
        const diff = rankOrder === 'ASC' ? scoreA - scoreB : scoreB - scoreA;
        if (diff !== 0) return diff;
      }

      // Tie Breaker 1: Class 12 Percentage (DESC)
      const p12A = a.academicInfo?.class12Percentage || 0;
      const p12B = b.academicInfo?.class12Percentage || 0;
      if (p12B !== p12A) return p12B - p12A;

      // Tie Breaker 2: Class 10 Percentage (DESC)
      const p10A = a.academicInfo?.class10Percentage || 0;
      const p10B = b.academicInfo?.class10Percentage || 0;
      if (p10B !== p10A) return p10B - p10A;

      // Final deterministic fallback: application ID
      return a.applicationId.localeCompare(b.applicationId);
    });

    // 5. Build overall & category-wise rankings
    const categoryCounters = {
      GENERAL: 0,
      OBC: 0,
      SC: 0,
      ST: 0
    };

    const entries = eligibleCandidates.map((app, index) => {
      const cat = app.personalInfo?.category || 'GENERAL';
      categoryCounters[cat] = (categoryCounters[cat] || 0) + 1;

      let meritScore = 0;
      if (criterion === 'EntranceRank') {
        meritScore = app.academicInfo?.entranceRank || 0;
      } else if (criterion === 'Class12Marks') {
        meritScore = app.academicInfo?.class12Percentage || 0;
      } else {
        meritScore = app.academicInfo?.entrancePercentile || 0;
      }

      return {
        position: index + 1,
        categoryPosition: categoryCounters[cat],
        application: app._id,
        applicationId: app.applicationId,
        candidateName: app.personalInfo?.fullName || app.user?.name || 'Candidate',
        category: cat,
        entranceExam: app.academicInfo?.entranceExam || 'WBJEE',
        entranceRank: app.academicInfo?.entranceRank || 0,
        entrancePercentile: app.academicInfo?.entrancePercentile || 0,
        class12Percentage: app.academicInfo?.class12Percentage || 0,
        class10Percentage: app.academicInfo?.class10Percentage || 0,
        meritScore,
        tieBreakDetails: `P12: ${app.academicInfo?.class12Percentage || 0}%, P10: ${app.academicInfo?.class10Percentage || 0}%`,
        isEligible: true
      };
    });

    // If requested, save/update MeritList
    let meritList = await MeritList.findOne({ programme: programmeId, admissionCycle });
    if (!meritList) {
      meritList = new MeritList({
        programme: programmeId,
        admissionCycle,
        status: saveAsPreview ? 'Preview' : 'Published',
        publishedAt: saveAsPreview ? null : new Date(),
        publishedBy: user?._id || null,
        entries
      });
    } else {
      meritList.entries = entries;
      if (!saveAsPreview) {
        meritList.status = 'Published';
        meritList.publishedAt = new Date();
        meritList.publishedBy = user?._id || null;
      }
    }
    await meritList.save();

    // If publishing, update positions back onto Applications
    if (!saveAsPreview) {
      for (const entry of entries) {
        await Application.findByIdAndUpdate(entry.application, {
          status: APPLICATION_STATUS.MERIT_LISTED,
          meritPosition: entry.position,
          categoryMeritPosition: entry.categoryPosition
        });
      }
      config.status = 'Published';
      config.publishedAt = new Date();
      config.publishedBy = user?._id || null;
      await config.save();
    }

    return {
      config,
      meritList,
      totalEligible: eligibleCandidates.length,
      entries
    };
  }

  /**
   * Export merit list entries to CSV string
   */
  generateCSV(meritList) {
    const headers = [
      'Overall Rank',
      'Category Rank',
      'Application ID',
      'Candidate Name',
      'Category',
      'Entrance Exam',
      'Entrance Rank',
      'Class 12 %',
      'Class 10 %',
      'Merit Score'
    ];

    const rows = (meritList.entries || []).map(e => [
      e.position,
      e.categoryPosition,
      `"${e.applicationId}"`,
      `"${e.candidateName}"`,
      e.category,
      e.entranceExam,
      e.entranceRank,
      e.class12Percentage,
      e.class10Percentage,
      e.meritScore
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

module.exports = new MeritCalculationService();
