"use strict";
/**
 * Analytics Controller
 * 
 * Admin analytics endpoints için controller.
 * Tüm endpoint'ler admin yetkisi gerektirir.
 */

const analyticsService = require("../services/analyticsService");

/**
 * @route GET /api/admin/analytics/revenue-trend
 * @desc Get revenue trend for a period
 * @access Admin
 */
const getRevenueTrend = async (req, res) => {
    /*
        #swagger.tags = ['Analytics']
        #swagger.summary = 'Get Revenue Trend'
        #swagger.description = 'Get revenue trend data for daily/weekly/monthly periods'
        #swagger.parameters['period'] = { 
            in: 'query', 
            description: 'Period type', 
            type: 'string',
            enum: ['daily', 'weekly', 'monthly'],
            default: 'daily'
        }
        #swagger.parameters['startDate'] = { 
            in: 'query', 
            description: 'Start date (ISO string)',
            type: 'string'
        }
        #swagger.parameters['endDate'] = { 
            in: 'query', 
            description: 'End date (ISO string)',
            type: 'string'
        }
    */
    try {
        const { period = 'daily', startDate, endDate } = req.query;

        // Default date range: last 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const trend = await analyticsService.getRevenueTrend(period, start, end);

        res.status(200).json({
            error: false,
            message: "Revenue trend retrieved successfully",
            result: {
                period,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                trend
            }
        });
    } catch (error) {
        console.error("Error getting revenue trend:", error);
        res.status(500).json({
            error: true,
            message: "Error retrieving revenue trend",
            details: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/revenue-comparison
 * @desc Compare revenue between two periods
 * @access Admin
 */
const getRevenueComparison = async (req, res) => {
    /*
        #swagger.tags = ['Analytics']
        #swagger.summary = 'Compare Revenue Periods'
        #swagger.description = 'Compare revenue between current and previous periods'
    */
    try {
        const { startDate, endDate, compareStartDate, compareEndDate } = req.query;

        // Default: current 30 days vs previous 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const compareEnd = compareEndDate ? new Date(compareEndDate) : new Date(start.getTime() - 1);
        const compareStart = compareStartDate 
            ? new Date(compareStartDate) 
            : new Date(compareEnd.getTime() - (end.getTime() - start.getTime()));

        const comparison = await analyticsService.getRevenueComparison(start, end, compareStart, compareEnd);

        res.status(200).json({
            error: false,
            message: "Revenue comparison retrieved successfully",
            result: {
                currentPeriod: {
                    startDate: start.toISOString(),
                    endDate: end.toISOString()
                },
                comparisonPeriod: {
                    startDate: compareStart.toISOString(),
                    endDate: compareEnd.toISOString()
                },
                ...comparison
            }
        });
    } catch (error) {
        console.error("Error getting revenue comparison:", error);
        res.status(500).json({
            error: true,
            message: "Error retrieving revenue comparison",
            details: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/business-performance
 * @desc Get business performance data
 * @access Admin
 */
const getBusinessPerformance = async (req, res) => {
    /*
        #swagger.tags = ['Analytics']
        #swagger.summary = 'Get Business Performance'
        #swagger.description = 'Get performance metrics for all businesses'
    */
    try {
        const { startDate, endDate } = req.query;

        // Default: last 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const performance = await analyticsService.getBusinessPerformance(start, end);

        res.status(200).json({
            error: false,
            message: "Business performance retrieved successfully",
            result: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                businessCount: performance.length,
                businesses: performance
            }
        });
    } catch (error) {
        console.error("Error getting business performance:", error);
        res.status(500).json({
            error: true,
            message: "Error retrieving business performance",
            details: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/commission-report
 * @desc Get commission report
 * @access Admin
 */
const getCommissionReport = async (req, res) => {
    /*
        #swagger.tags = ['Analytics']
        #swagger.summary = 'Get Commission Report'
        #swagger.description = 'Get detailed commission breakdown by business'
    */
    try {
        const { startDate, endDate } = req.query;

        // Default: last 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const report = await analyticsService.getCommissionReport(start, end);

        res.status(200).json({
            error: false,
            message: "Commission report retrieved successfully",
            result: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                serviceFee: analyticsService.SERVICE_FEE,
                ...report
            }
        });
    } catch (error) {
        console.error("Error getting commission report:", error);
        res.status(500).json({
            error: true,
            message: "Error retrieving commission report",
            details: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/profit-loss
 * @desc Get profit/loss analysis
 * @access Admin
 */
const getProfitLoss = async (req, res) => {
    /*
        #swagger.tags = ['Analytics']
        #swagger.summary = 'Get Profit/Loss Analysis'
        #swagger.description = 'Get profit and loss breakdown'
    */
    try {
        const { startDate, endDate } = req.query;

        // Default: last 30 days
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

        const profitLoss = await analyticsService.getProfitLoss(start, end);

        res.status(200).json({
            error: false,
            message: "Profit/loss analysis retrieved successfully",
            result: {
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                ...profitLoss
            }
        });
    } catch (error) {
        console.error("Error getting profit/loss:", error);
        res.status(500).json({
            error: true,
            message: "Error retrieving profit/loss analysis",
            details: error.message
        });
    }
};

/**
 * @route GET /api/admin/analytics/dashboard
 * @desc Get dashboard summary
 * @access Admin
 */
const getDashboardSummary = async (req, res) => {
    /*
        #swagger.tags = ['Analytics']
        #swagger.summary = 'Get Dashboard Summary'
        #swagger.description = 'Get quick summary for admin dashboard'
    */
    try {
        const summary = await analyticsService.getDashboardSummary();

        res.status(200).json({
            error: false,
            message: "Dashboard summary retrieved successfully",
            result: summary
        });
    } catch (error) {
        console.error("Error getting dashboard summary:", error);
        res.status(500).json({
            error: true,
            message: "Error retrieving dashboard summary",
            details: error.message
        });
    }
};

module.exports = {
    getRevenueTrend,
    getRevenueComparison,
    getBusinessPerformance,
    getCommissionReport,
    getProfitLoss,
    getDashboardSummary
};

