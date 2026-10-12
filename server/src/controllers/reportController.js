const Application = require('../models/Application');
const Document = require('../models/Document');
const Seat = require('../models/Seat');
const SeatAllocation = require('../models/SeatAllocation');
const Payment = require('../models/Payment');
const AdmissionProgramme = require('../models/AdmissionProgramme');

/**
 * @desc    Get aggregated admission reports
 * @route   GET /api/reports/summary
 * @access  Private (Admin)
 */
const getReportsSummary = async (req, res, next) => {
  try {
    // 1. Applications by status
    const statusAggregation = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Applications by course & category
    const courseCategoryAggregation = await Application.aggregate([
      {
        $group: {
          _id: {
            programme: '$programme',
            category: '$personalInfo.category'
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'admissionprogrammes',
          localField: '_id.programme',
          foreignField: '_id',
          as: 'prog'
        }
      },
      { $unwind: '$prog' }
    ]);

    // 3. Document status summary
    const docStatusAggregation = await Document.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 4. Seat utilization
    const seatAggregation = await Seat.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 5. Payment summary
    const paymentAggregation = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusAggregation,
        byCourseCategory: courseCategoryAggregation,
        documentSummary: docStatusAggregation,
        seatUtilization: seatAggregation,
        paymentSummary: paymentAggregation
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export applications report as CSV
 * @route   GET /api/reports/export/applications-csv
 * @access  Private (Admin)
 */
const exportApplicationsCSV = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('programme user')
      .sort({ createdAt: -1 });

    const headers = [
      'Application ID',
      'Candidate Name',
      'Email',
      'Mobile',
      'Programme',
      'Category',
      'Status',
      'Entrance Exam',
      'Entrance Rank',
      'Class 12 %',
      'Document Verified',
      'Eligible',
      'Submission Date'
    ];

    const rows = applications.map(app => [
      `"${app.applicationId}"`,
      `"${app.personalInfo?.fullName || app.user?.name || ''}"`,
      `"${app.personalInfo?.email || app.user?.email || ''}"`,
      `"${app.personalInfo?.mobile || app.user?.mobile || ''}"`,
      `"${app.programme?.name || ''}"`,
      `"${app.personalInfo?.category || 'GENERAL'}"`,
      `"${app.status}"`,
      `"${app.academicInfo?.entranceExam || ''}"`,
      app.academicInfo?.entranceRank || '',
      app.academicInfo?.class12Percentage || '',
      app.isDocumentVerified ? 'Yes' : 'No',
      app.isEligible ? 'Yes' : 'No',
      app.submissionDate ? `"${new Date(app.submissionDate).toLocaleDateString()}"` : 'Draft'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="IEM-Applications-Report.csv"');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReportsSummary,
  exportApplicationsCSV
};
