"use strict";
/**
 * Monthly Report Controller
 * 
 * Aylık işletme raporlarını oluşturma, listeleme ve yönetme.
 */

const MonthlyReport = require("../models/monthlyReport");
const Business = require("../models/business");
const Usage = require("../models/usage");
const Toilet = require("../models/toilet");
const Review = require("../models/review");
const User = require("../models/user");

// Platform service fee
const SERVICE_FEE = 0.75;

/**
 * @route GET /api/monthly-reports
 * @desc Get all monthly reports (with filters)
 * @access Admin
 */
const list = async (req, res) => {
  /*
    #swagger.tags = ['Monthly Reports']
    #swagger.summary = 'List all monthly reports'
  */
  try {
    const { businessId, year, month, status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (businessId) filter.businessId = businessId;
    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reports, total] = await Promise.all([
      MonthlyReport.find(filter)
        .populate("businessId", "businessName businessType")
        .populate("generatedBy", "username email")
        .sort({ year: -1, month: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      MonthlyReport.countDocuments(filter),
    ]);

    res.status(200).json({
      error: false,
      message: "Monthly reports retrieved successfully",
      result: reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error listing monthly reports:", error);
    res.status(500).json({
      error: true,
      message: "Error retrieving monthly reports",
      details: error.message,
    });
  }
};

/**
 * @route GET /api/monthly-reports/:id
 * @desc Get single monthly report by ID
 * @access Admin
 */
const read = async (req, res) => {
  /*
    #swagger.tags = ['Monthly Reports']
    #swagger.summary = 'Get monthly report by ID'
  */
  try {
    const report = await MonthlyReport.findById(req.params.id)
      .populate("businessId", "businessName businessType address")
      .populate("generatedBy", "username email");

    if (!report) {
      return res.status(404).json({
        error: true,
        message: "Report not found",
      });
    }

    res.status(200).json({
      error: false,
      message: "Report retrieved successfully",
      result: report,
    });
  } catch (error) {
    console.error("Error reading monthly report:", error);
    res.status(500).json({
      error: true,
      message: "Error retrieving report",
      details: error.message,
    });
  }
};

/**
 * @route POST /api/monthly-reports/generate
 * @desc Generate a new monthly report for a business
 * @access Admin
 */
const generate = async (req, res) => {
  /*
    #swagger.tags = ['Monthly Reports']
    #swagger.summary = 'Generate monthly report for a business'
  */
  try {
    const { businessId, year, month, notes } = req.body;

    // Validation
    if (!businessId || !year || !month) {
      return res.status(400).json({
        error: true,
        message: "businessId, year, and month are required",
      });
    }

    // Check if report already exists
    const existingReport = await MonthlyReport.findOne({
      businessId,
      year: parseInt(year),
      month: parseInt(month),
    });

    if (existingReport) {
      return res.status(400).json({
        error: true,
        message: "Report for this period already exists",
        existingReportId: existingReport._id,
      });
    }

    // Get business info
    const business = await Business.findById(businessId).populate("userId", "username email");
    if (!business) {
      return res.status(404).json({
        error: true,
        message: "Business not found",
      });
    }

    // Calculate date range
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    // Previous month for comparison
    const prevStartDate = new Date(parseInt(year), parseInt(month) - 2, 1);
    const prevEndDate = new Date(parseInt(year), parseInt(month) - 1, 0, 23, 59, 59, 999);

    // Get toilets for this business
    const toilets = await Toilet.find({ business: businessId }).select("_id name fee");
    const toiletIds = toilets.map((t) => t._id);

    // Get usages for this period
    const usages = await Usage.find({
      businessId: businessId,
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Get previous month usages for comparison
    const prevUsages = await Usage.find({
      businessId: businessId,
      createdAt: { $gte: prevStartDate, $lte: prevEndDate },
    });

    // Get reviews for this period
    const reviews = await Review.find({
      toiletId: { $in: toiletIds },
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate financials
    const completedUsages = usages.filter(
      (u) => u.paymentStatus === "paid" || u.status === "completed"
    );
    const prevCompletedUsages = prevUsages.filter(
      (u) => u.paymentStatus === "paid" || u.status === "completed"
    );

    const totalRevenue = completedUsages.reduce(
      (sum, u) => sum + (Number(u.totalFee) || 0),
      0
    );
    const platformCommission = completedUsages.reduce(
      (sum, u) => sum + (Number(u.serviceFee) || SERVICE_FEE),
      0
    );
    const businessRevenue = totalRevenue - platformCommission;

    const prevTotalRevenue = prevCompletedUsages.reduce(
      (sum, u) => sum + (Number(u.totalFee) || 0),
      0
    );

    // Calculate daily breakdown
    const dailyBreakdown = [];
    const daysInMonth = endDate.getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayStart = new Date(parseInt(year), parseInt(month) - 1, day);
      const dayEnd = new Date(parseInt(year), parseInt(month) - 1, day, 23, 59, 59, 999);

      const dayUsages = completedUsages.filter((u) => {
        const usageDate = new Date(u.createdAt);
        return usageDate >= dayStart && usageDate <= dayEnd;
      });

      const dayRevenue = dayUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0);
      const dayCommission = dayUsages.reduce((sum, u) => sum + (Number(u.serviceFee) || SERVICE_FEE), 0);

      dailyBreakdown.push({
        date: dayStart,
        revenue: dayRevenue,
        bookings: dayUsages.length,
        commission: dayCommission,
      });
    }

    // Calculate toilet stats
    const toiletStats = toilets.map((toilet) => {
      const toiletUsages = completedUsages.filter(
        (u) => u.toiletId?.toString() === toilet._id.toString()
      );
      return {
        toiletId: toilet._id,
        toiletName: toilet.name,
        usageCount: toiletUsages.length,
        revenue: toiletUsages.reduce((sum, u) => sum + (Number(u.totalFee) || 0), 0),
      };
    });

    // Calculate ratings
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.ratings?.overall || r.rating || 0), 0) / reviews.length
        : 0;

    // Calculate comparison
    const revenueChange =
      prevTotalRevenue > 0
        ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100
        : totalRevenue > 0
        ? 100
        : 0;

    const bookingsChange =
      prevCompletedUsages.length > 0
        ? ((completedUsages.length - prevCompletedUsages.length) / prevCompletedUsages.length) * 100
        : completedUsages.length > 0
        ? 100
        : 0;

    // Create report
    const report = await MonthlyReport.create({
      businessId,
      year: parseInt(year),
      month: parseInt(month),
      businessSnapshot: {
        businessName: business.businessName,
        businessType: business.businessType,
        address: business.address,
        ownerName: business.userId?.username || "",
        ownerEmail: business.userId?.email || "",
      },
      financials: {
        totalRevenue,
        platformCommission,
        businessRevenue,
        commissionRate: totalRevenue > 0 ? (platformCommission / totalRevenue) * 100 : 0,
        averageTransactionValue: completedUsages.length > 0 ? totalRevenue / completedUsages.length : 0,
      },
      bookings: {
        total: usages.length,
        completed: completedUsages.length,
        cancelled: usages.filter((u) => u.status === "cancelled").length,
        pending: usages.filter((u) => u.status === "pending").length,
        completionRate: usages.length > 0 ? (completedUsages.length / usages.length) * 100 : 0,
      },
      dailyBreakdown,
      toiletStats,
      ratings: {
        averageRating: avgRating,
        totalReviews: reviews.length,
        newReviews: reviews.length,
      },
      comparison: {
        revenueChange,
        bookingsChange,
        ratingChange: 0,
      },
      status: "finalized",
      generatedBy: req.user?._id,
      notes,
    });

    // Populate and return
    const populatedReport = await MonthlyReport.findById(report._id)
      .populate("businessId", "businessName businessType")
      .populate("generatedBy", "username email");

    res.status(201).json({
      error: false,
      message: "Monthly report generated successfully",
      result: populatedReport,
    });
  } catch (error) {
    console.error("Error generating monthly report:", error);
    res.status(500).json({
      error: true,
      message: "Error generating report",
      details: error.message,
    });
  }
};

/**
 * @route PUT /api/monthly-reports/:id
 * @desc Update monthly report (notes, status)
 * @access Admin
 */
const update = async (req, res) => {
  /*
    #swagger.tags = ['Monthly Reports']
    #swagger.summary = 'Update monthly report'
  */
  try {
    const { notes, status } = req.body;

    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (status) updateData.status = status;

    const report = await MonthlyReport.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("businessId", "businessName businessType")
      .populate("generatedBy", "username email");

    if (!report) {
      return res.status(404).json({
        error: true,
        message: "Report not found",
      });
    }

    res.status(200).json({
      error: false,
      message: "Report updated successfully",
      result: report,
    });
  } catch (error) {
    console.error("Error updating monthly report:", error);
    res.status(500).json({
      error: true,
      message: "Error updating report",
      details: error.message,
    });
  }
};

/**
 * @route DELETE /api/monthly-reports/:id
 * @desc Delete monthly report
 * @access Admin
 */
const destroy = async (req, res) => {
  /*
    #swagger.tags = ['Monthly Reports']
    #swagger.summary = 'Delete monthly report'
  */
  try {
    const report = await MonthlyReport.findByIdAndDelete(req.params.id);

    if (!report) {
      return res.status(404).json({
        error: true,
        message: "Report not found",
      });
    }

    res.status(200).json({
      error: false,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting monthly report:", error);
    res.status(500).json({
      error: true,
      message: "Error deleting report",
      details: error.message,
    });
  }
};

/**
 * @route GET /api/monthly-reports/business/:businessId
 * @desc Get all reports for a specific business
 * @access Admin/Owner
 */
const getByBusiness = async (req, res) => {
  /*
    #swagger.tags = ['Monthly Reports']
    #swagger.summary = 'Get reports by business'
  */
  try {
    const { businessId } = req.params;
    const { year } = req.query;

    const filter = { businessId };
    if (year) filter.year = parseInt(year);

    const reports = await MonthlyReport.find(filter)
      .sort({ year: -1, month: -1 })
      .populate("generatedBy", "username");

    res.status(200).json({
      error: false,
      message: "Business reports retrieved successfully",
      result: reports,
    });
  } catch (error) {
    console.error("Error getting business reports:", error);
    res.status(500).json({
      error: true,
      message: "Error retrieving business reports",
      details: error.message,
    });
  }
};

/**
 * @route POST /api/monthly-reports/generate-bulk
 * @desc Generate reports for all businesses for a specific month
 * @access Admin
 */
const generateBulk = async (req, res) => {
  /*
    #swagger.tags = ['Monthly Reports']
    #swagger.summary = 'Generate reports for all businesses'
  */
  try {
    const { year, month } = req.body;

    if (!year || !month) {
      return res.status(400).json({
        error: true,
        message: "year and month are required",
      });
    }

    // Get all approved businesses
    const businesses = await Business.find({ approvalStatus: "approved" }).select("_id businessName");

    const results = {
      success: [],
      skipped: [],
      failed: [],
    };

    for (const business of businesses) {
      try {
        // Check if report exists
        const existing = await MonthlyReport.findOne({
          businessId: business._id,
          year: parseInt(year),
          month: parseInt(month),
        });

        if (existing) {
          results.skipped.push({
            businessId: business._id,
            businessName: business.businessName,
            reason: "Report already exists",
          });
          continue;
        }

        // Generate report (simplified - reuse generate logic)
        // In production, this should be refactored to avoid code duplication
        const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
        const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

        const usages = await Usage.find({
          businessId: business._id,
          createdAt: { $gte: startDate, $lte: endDate },
        });

        const completedUsages = usages.filter(
          (u) => u.paymentStatus === "paid" || u.status === "completed"
        );

        const totalRevenue = completedUsages.reduce(
          (sum, u) => sum + (Number(u.totalFee) || 0),
          0
        );

        // Only create report if there's activity
        if (usages.length > 0) {
          await MonthlyReport.create({
            businessId: business._id,
            year: parseInt(year),
            month: parseInt(month),
            businessSnapshot: { businessName: business.businessName },
            financials: {
              totalRevenue,
              platformCommission: completedUsages.length * SERVICE_FEE,
              businessRevenue: totalRevenue - completedUsages.length * SERVICE_FEE,
            },
            bookings: {
              total: usages.length,
              completed: completedUsages.length,
            },
            status: "finalized",
            generatedBy: req.user?._id,
          });

          results.success.push({
            businessId: business._id,
            businessName: business.businessName,
          });
        } else {
          results.skipped.push({
            businessId: business._id,
            businessName: business.businessName,
            reason: "No activity in this period",
          });
        }
      } catch (err) {
        results.failed.push({
          businessId: business._id,
          businessName: business.businessName,
          error: err.message,
        });
      }
    }

    res.status(200).json({
      error: false,
      message: "Bulk report generation completed",
      result: results,
    });
  } catch (error) {
    console.error("Error in bulk report generation:", error);
    res.status(500).json({
      error: true,
      message: "Error generating bulk reports",
      details: error.message,
    });
  }
};

module.exports = {
  list,
  read,
  generate,
  update,
  destroy,
  getByBusiness,
  generateBulk,
};

