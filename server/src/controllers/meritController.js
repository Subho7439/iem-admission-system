const MeritConfiguration = require('../models/MeritConfiguration');
const MeritList = require('../models/MeritList');
const AdmissionProgramme = require('../models/AdmissionProgramme');
const meritCalculationService = require('../services/meritCalculationService');
const notificationService = require('../services/notificationService');
const Application = require('../models/Application');

/**
 * @desc    Get merit configuration for a programme
 * @route   GET /api/merit/config/:programmeId
 * @access  Private (Admin)
 */
const getMeritConfig = async (req, res, next) => {
  try {
    const { programmeId } = req.params;
    const { cycle = '2026-2027' } = req.query;

    let config = await MeritConfiguration.findOne({ programme: programmeId, admissionCycle: cycle })
      .populate('programme', 'name code degree');

    if (!config) {
      config = await MeritConfiguration.create({
        programme: programmeId,
        admissionCycle: cycle,
        primaryCriterion: 'EntranceRank',
        rankOrder: 'ASC',
        tieBreakers: ['Class12Marks', 'Class10Marks']
      });
      config = await MeritConfiguration.findById(config._id).populate('programme', 'name code degree');
    }

    res.status(200).json({ success: true, config });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update merit configuration
 * @route   PUT /api/merit/config/:programmeId
 * @access  Private (Admin)
 */
const updateMeritConfig = async (req, res, next) => {
  try {
    const { programmeId } = req.params;
    const { primaryCriterion, rankOrder, tieBreakers, allowedExams, admissionCycle = '2026-2027' } = req.body;

    let config = await MeritConfiguration.findOne({ programme: programmeId, admissionCycle });
    if (!config) {
      config = new MeritConfiguration({ programme: programmeId, admissionCycle });
    }

    if (primaryCriterion) config.primaryCriterion = primaryCriterion;
    if (rankOrder) config.rankOrder = rankOrder;
    if (tieBreakers) config.tieBreakers = tieBreakers;
    if (allowedExams) config.allowedExams = allowedExams;
    config.status = 'Draft';

    await config.save();

    res.status(200).json({
      success: true,
      message: 'Merit criteria configuration updated successfully',
      config
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Calculate merit rankings (Preview mode)
 * @route   POST /api/merit/calculate
 * @access  Private (Admin)
 */
const calculateMerit = async (req, res, next) => {
  try {
    const { programmeId, admissionCycle = '2026-2027' } = req.body;
    if (!programmeId) {
      return res.status(400).json({ success: false, message: 'programmeId is required' });
    }

    const result = await meritCalculationService.calculateMerit({
      programmeId,
      admissionCycle,
      saveAsPreview: true,
      user: req.user
    });

    res.status(200).json({
      success: true,
      message: `Calculated merit list preview with ${result.totalEligible} eligible candidates`,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Publish final merit list
 * @route   POST /api/merit/publish
 * @access  Private (Admin)
 */
const publishMeritList = async (req, res, next) => {
  try {
    const { programmeId, admissionCycle = '2026-2027' } = req.body;
    if (!programmeId) {
      return res.status(400).json({ success: false, message: 'programmeId is required' });
    }

    const result = await meritCalculationService.calculateMerit({
      programmeId,
      admissionCycle,
      saveAsPreview: false,
      user: req.user
    });

    const programme = await AdmissionProgramme.findById(programmeId);

    // Notify all eligible candidates that merit list is published
    const eligibleUserIds = await Application.find({
      programme: programmeId,
      admissionCycle,
      isEligible: true
    }).distinct('user');

    if (eligibleUserIds.length > 0) {
      await notificationService.broadcast({
        userIds: eligibleUserIds,
        title: 'Official Merit List Published',
        message: `The official merit list for ${programme.name} (${admissionCycle}) has been published. View your merit rank on the dashboard.`,
        type: 'MERIT_PUBLISHED',
        link: '/student/merit'
      });
    }

    res.status(200).json({
      success: true,
      message: `Official merit list for ${programme.name} has been published successfully`,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get published merit list (Student / Public / Admin)
 * @route   GET /api/merit/list/:programmeId
 * @access  Public / Private
 */
const getPublishedMeritList = async (req, res, next) => {
  try {
    const { programmeId } = req.params;
    const { category, search = '' } = req.query;

    const meritList = await MeritList.findOne({ programme: programmeId })
      .populate('programme', 'name code degree');

    if (!meritList) {
      return res.status(404).json({ success: false, message: 'No merit list found for this programme' });
    }

    let entries = meritList.entries || [];

    // Category filter
    if (category && category !== 'ALL') {
      entries = entries.filter(e => e.category === category);
    }

    // Search by candidate name or application ID
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      entries = entries.filter(e =>
        e.candidateName.toLowerCase().includes(q) ||
        e.applicationId.toLowerCase().includes(q)
      );
    }

    res.status(200).json({
      success: true,
      programme: meritList.programme,
      status: meritList.status,
      publishedAt: meritList.publishedAt,
      totalEntries: entries.length,
      entries
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export merit list to CSV
 * @route   GET /api/merit/export-csv/:programmeId
 * @access  Private (Admin)
 */
const exportMeritListCSV = async (req, res, next) => {
  try {
    const { programmeId } = req.params;
    const meritList = await MeritList.findOne({ programme: programmeId })
      .populate('programme', 'name code');

    if (!meritList) {
      return res.status(404).json({ success: false, message: 'Merit list not found' });
    }

    const csvData = meritCalculationService.generateCSV(meritList);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="MeritList-${meritList.programme.code}.csv"`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeritConfig,
  updateMeritConfig,
  calculateMerit,
  publishMeritList,
  getPublishedMeritList,
  exportMeritListCSV
};
