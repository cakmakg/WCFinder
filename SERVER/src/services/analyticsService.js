"use strict";
/**
 * Analytics Service
 * 
 * Admin analytics ve reporting için iş mantığı.
 * Revenue trend, commission, profit/loss hesaplamaları.
 * 
 * SERVICE_FEE = 0.75€ (Platform komisyonu)
 */

const Usage = require("../models/usage");
const Payment = require("../models/payment");
const Business = require("../models/business");
const User = require("../models/user");

// Platform service fee (commission)
const SERVICE_FEE = 0.75;

/**
 * Get revenue trend for a period
 * @param {string} period - 'daily' | 'weekly' | 'monthly'
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Trend data
 */
async function getRevenueTrend(period = 'daily', startDate, endDate) {
    let dateFormat;
    let groupBy;

    switch (period) {
        case 'weekly':
            dateFormat = "%Y-W%V";
            groupBy = { $isoWeek: "$createdAt" };
            break;
        case 'monthly':
            dateFormat = "%Y-%m";
            groupBy = { 
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
            };
            break;
        default: // daily
            dateFormat = "%Y-%m-%d";
            groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    }

    const matchStage = {
        $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            $or: [
                { paymentStatus: 'paid' },
                { status: 'completed' }
            ]
        }
    };

    const trend = await Usage.aggregate([
        matchStage,
        {
            $group: {
                _id: period === 'monthly' ? groupBy : { $dateToString: { format: dateFormat, date: "$createdAt" } },
                revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                commission: { $sum: { $ifNull: ["$serviceFee", SERVICE_FEE] } },
                bookings: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: "$_id",
                revenue: { $round: ["$revenue", 2] },
                commission: { $round: ["$commission", 2] },
                businessRevenue: { $round: [{ $subtract: ["$revenue", "$commission"] }, 2] },
                bookings: 1
            }
        }
    ]);

    return trend;
}

/**
 * Compare two periods for revenue
 * @param {Date} startDate - Current period start
 * @param {Date} endDate - Current period end
 * @param {Date} compareStartDate - Comparison period start
 * @param {Date} compareEndDate - Comparison period end
 * @returns {Promise<Object>} Comparison data
 */
async function getRevenueComparison(startDate, endDate, compareStartDate, compareEndDate) {
    // Current period stats
    const currentStats = await Usage.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                $or: [
                    { paymentStatus: 'paid' },
                    { status: 'completed' }
                ]
            }
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                commission: { $sum: { $ifNull: ["$serviceFee", SERVICE_FEE] } },
                bookings: { $sum: 1 }
            }
        }
    ]);

    // Previous period stats
    const previousStats = await Usage.aggregate([
        {
            $match: {
                createdAt: { $gte: compareStartDate, $lte: compareEndDate },
                $or: [
                    { paymentStatus: 'paid' },
                    { status: 'completed' }
                ]
            }
        },
        {
            $group: {
                _id: null,
                revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                commission: { $sum: { $ifNull: ["$serviceFee", SERVICE_FEE] } },
                bookings: { $sum: 1 }
            }
        }
    ]);

    const current = currentStats[0] || { revenue: 0, commission: 0, bookings: 0 };
    const previous = previousStats[0] || { revenue: 0, commission: 0, bookings: 0 };

    // Calculate growth percentages
    const calculateGrowth = (curr, prev) => {
        if (!prev || prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    return {
        current: {
            revenue: Number(current.revenue.toFixed(2)),
            commission: Number(current.commission.toFixed(2)),
            bookings: current.bookings,
            averageValue: current.bookings > 0 ? Number((current.revenue / current.bookings).toFixed(2)) : 0
        },
        previous: {
            revenue: Number(previous.revenue.toFixed(2)),
            commission: Number(previous.commission.toFixed(2)),
            bookings: previous.bookings,
            averageValue: previous.bookings > 0 ? Number((previous.revenue / previous.bookings).toFixed(2)) : 0
        },
        growth: {
            revenue: Number(calculateGrowth(current.revenue, previous.revenue).toFixed(2)),
            commission: Number(calculateGrowth(current.commission, previous.commission).toFixed(2)),
            bookings: Number(calculateGrowth(current.bookings, previous.bookings).toFixed(2))
        }
    };
}

/**
 * Get business performance data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Array>} Business performance data
 */
async function getBusinessPerformance(startDate, endDate) {
    const businesses = await Business.find({ approvalStatus: 'approved' })
        .select('_id businessName businessType approvalStatus createdAt');

    const performanceData = await Usage.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: "$businessId",
                totalRevenue: { 
                    $sum: { 
                        $cond: [
                            { $or: [
                                { $eq: ["$paymentStatus", "paid"] },
                                { $eq: ["$status", "completed"] }
                            ]},
                            { $ifNull: ["$totalFee", 0] },
                            0
                        ]
                    }
                },
                platformCommission: {
                    $sum: {
                        $cond: [
                            { $or: [
                                { $eq: ["$paymentStatus", "paid"] },
                                { $eq: ["$status", "completed"] }
                            ]},
                            { $ifNull: ["$serviceFee", SERVICE_FEE] },
                            0
                        ]
                    }
                },
                totalBookings: { $sum: 1 },
                completedBookings: {
                    $sum: {
                        $cond: [
                            { $or: [
                                { $eq: ["$paymentStatus", "paid"] },
                                { $eq: ["$status", "completed"] }
                            ]},
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: "businesses",
                localField: "_id",
                foreignField: "_id",
                as: "business"
            }
        },
        {
            $unwind: {
                path: "$business",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                businessId: "$_id",
                businessName: { $ifNull: ["$business.businessName", "Unbekannt"] },
                businessType: { $ifNull: ["$business.businessType", "other"] },
                status: { $ifNull: ["$business.approvalStatus", "pending"] },
                totalRevenue: { $round: ["$totalRevenue", 2] },
                platformCommission: { $round: ["$platformCommission", 2] },
                businessRevenue: { $round: [{ $subtract: ["$totalRevenue", "$platformCommission"] }, 2] },
                totalBookings: 1,
                completedBookings: 1,
                completionRate: {
                    $cond: [
                        { $eq: ["$totalBookings", 0] },
                        0,
                        { $round: [{ $multiply: [{ $divide: ["$completedBookings", "$totalBookings"] }, 100] }, 1] }
                    ]
                },
                averageBookingValue: {
                    $cond: [
                        { $eq: ["$completedBookings", 0] },
                        0,
                        { $round: [{ $divide: ["$totalRevenue", "$completedBookings"] }, 2] }
                    ]
                }
            }
        },
        { $sort: { totalRevenue: -1 } }
    ]);

    return performanceData;
}

/**
 * Get commission report
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Commission report data
 */
async function getCommissionReport(startDate, endDate) {
    // Total commission
    const totalStats = await Usage.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                $or: [
                    { paymentStatus: 'paid' },
                    { status: 'completed' }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                totalCommission: { $sum: { $ifNull: ["$serviceFee", SERVICE_FEE] } },
                transactionCount: { $sum: 1 }
            }
        }
    ]);

    // Commission by business
    const byBusiness = await Usage.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                $or: [
                    { paymentStatus: 'paid' },
                    { status: 'completed' }
                ]
            }
        },
        {
            $group: {
                _id: "$businessId",
                totalRevenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                commission: { $sum: { $ifNull: ["$serviceFee", SERVICE_FEE] } },
                transactionCount: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "businesses",
                localField: "_id",
                foreignField: "_id",
                as: "business"
            }
        },
        {
            $unwind: {
                path: "$business",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                _id: 0,
                businessId: "$_id",
                businessName: { $ifNull: ["$business.businessName", "Unbekannt"] },
                totalRevenue: { $round: ["$totalRevenue", 2] },
                commission: { $round: ["$commission", 2] },
                businessRevenue: { $round: [{ $subtract: ["$totalRevenue", "$commission"] }, 2] },
                transactionCount: 1
            }
        },
        { $sort: { totalRevenue: -1 } }
    ]);

    // Commission trend (daily for last 30 days)
    const commissionTrend = await Usage.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                $or: [
                    { paymentStatus: 'paid' },
                    { status: 'completed' }
                ]
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                commission: { $sum: { $ifNull: ["$serviceFee", SERVICE_FEE] } },
                revenue: { $sum: { $ifNull: ["$totalFee", 0] } }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                _id: 0,
                date: "$_id",
                commission: { $round: ["$commission", 2] },
                revenue: { $round: ["$revenue", 2] }
            }
        }
    ]);

    const total = totalStats[0] || { totalRevenue: 0, totalCommission: 0, transactionCount: 0 };

    return {
        total: {
            totalRevenue: Number(total.totalRevenue.toFixed(2)),
            totalCommission: Number(total.totalCommission.toFixed(2)),
            businessRevenue: Number((total.totalRevenue - total.totalCommission).toFixed(2)),
            transactionCount: total.transactionCount,
            commissionRate: total.totalRevenue > 0 
                ? Number(((total.totalCommission / total.totalRevenue) * 100).toFixed(2))
                : 0
        },
        byBusiness,
        trend: commissionTrend
    };
}

/**
 * Get profit/loss analysis
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Object>} Profit/loss data
 */
async function getProfitLoss(startDate, endDate) {
    const stats = await Usage.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $facet: {
                completed: [
                    {
                        $match: {
                            $or: [
                                { paymentStatus: 'paid' },
                                { status: 'completed' }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                            commission: { $sum: { $ifNull: ["$serviceFee", SERVICE_FEE] } },
                            count: { $sum: 1 }
                        }
                    }
                ],
                pending: [
                    {
                        $match: {
                            status: 'pending',
                            paymentStatus: { $ne: 'paid' }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                            count: { $sum: 1 }
                        }
                    }
                ],
                cancelled: [
                    {
                        $match: {
                            status: 'cancelled'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                            count: { $sum: 1 }
                        }
                    }
                ]
            }
        }
    ]);

    const completed = stats[0]?.completed[0] || { revenue: 0, commission: 0, count: 0 };
    const pending = stats[0]?.pending[0] || { revenue: 0, count: 0 };
    const cancelled = stats[0]?.cancelled[0] || { revenue: 0, count: 0 };

    const totalRevenue = completed.revenue;
    const platformCommission = completed.commission;
    const businessPayouts = totalRevenue - platformCommission;
    const netProfit = platformCommission; // Platform's profit is the commission
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        completedRevenue: Number(completed.revenue.toFixed(2)),
        pendingRevenue: Number(pending.revenue.toFixed(2)),
        cancelledRevenue: Number(cancelled.revenue.toFixed(2)),
        platformCommission: Number(platformCommission.toFixed(2)),
        businessPayouts: Number(businessPayouts.toFixed(2)),
        netProfit: Number(netProfit.toFixed(2)),
        profitMargin: Number(profitMargin.toFixed(2)),
        transactions: {
            completed: completed.count,
            pending: pending.count,
            cancelled: cancelled.count,
            total: completed.count + pending.count + cancelled.count
        }
    };
}

/**
 * Get dashboard summary
 * @returns {Promise<Object>} Dashboard summary data
 */
async function getDashboardSummary() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
        totalUsers,
        totalBusinesses,
        recentStats,
        previousStats
    ] = await Promise.all([
        User.countDocuments(),
        Business.countDocuments({ approvalStatus: 'approved' }),
        Usage.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    $or: [
                        { paymentStatus: 'paid' },
                        { status: 'completed' }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                    bookings: { $sum: 1 }
                }
            }
        ]),
        Usage.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
                    $or: [
                        { paymentStatus: 'paid' },
                        { status: 'completed' }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    revenue: { $sum: { $ifNull: ["$totalFee", 0] } },
                    bookings: { $sum: 1 }
                }
            }
        ])
    ]);

    const recent = recentStats[0] || { revenue: 0, bookings: 0 };
    const previous = previousStats[0] || { revenue: 0, bookings: 0 };

    const calculateGrowth = (curr, prev) => {
        if (!prev || prev === 0) return curr > 0 ? 100 : 0;
        return ((curr - prev) / prev) * 100;
    };

    return {
        totalUsers,
        totalBusinesses,
        recentRevenue: Number(recent.revenue.toFixed(2)),
        recentBookings: recent.bookings,
        revenueGrowth: Number(calculateGrowth(recent.revenue, previous.revenue).toFixed(2)),
        bookingsGrowth: Number(calculateGrowth(recent.bookings, previous.bookings).toFixed(2))
    };
}

module.exports = {
    getRevenueTrend,
    getRevenueComparison,
    getBusinessPerformance,
    getCommissionReport,
    getProfitLoss,
    getDashboardSummary,
    SERVICE_FEE
};

