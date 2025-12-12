"use strict";
/**
 * Analytics Routes
 * 
 * Admin analytics API endpoints.
 * All routes require admin authentication.
 * 
 * Base URL: /api/admin/analytics
 */

const router = require("express").Router();
const analyticsController = require("../controller/analytics");
const { isLogin, isAdmin } = require("../middleware/permissions");

// All routes require login and admin role
router.use(isLogin, isAdmin);

/* ------------------------------------------------------- */
// ROUTES:

/**
 * @route GET /api/admin/analytics/dashboard
 * @desc Get dashboard summary
 * @access Admin
 */
router.get("/dashboard", analyticsController.getDashboardSummary);

/**
 * @route GET /api/admin/analytics/revenue-trend
 * @desc Get revenue trend (daily/weekly/monthly)
 * @access Admin
 * @query period - 'daily' | 'weekly' | 'monthly'
 * @query startDate - ISO date string
 * @query endDate - ISO date string
 */
router.get("/revenue-trend", analyticsController.getRevenueTrend);

/**
 * @route GET /api/admin/analytics/revenue-comparison
 * @desc Compare revenue between two periods
 * @access Admin
 * @query startDate - Current period start
 * @query endDate - Current period end
 * @query compareStartDate - Comparison period start
 * @query compareEndDate - Comparison period end
 */
router.get("/revenue-comparison", analyticsController.getRevenueComparison);

/**
 * @route GET /api/admin/analytics/business-performance
 * @desc Get business performance metrics
 * @access Admin
 * @query startDate - ISO date string
 * @query endDate - ISO date string
 */
router.get("/business-performance", analyticsController.getBusinessPerformance);

/**
 * @route GET /api/admin/analytics/commission-report
 * @desc Get commission breakdown
 * @access Admin
 * @query startDate - ISO date string
 * @query endDate - ISO date string
 */
router.get("/commission-report", analyticsController.getCommissionReport);

/**
 * @route GET /api/admin/analytics/profit-loss
 * @desc Get profit/loss analysis
 * @access Admin
 * @query startDate - ISO date string
 * @query endDate - ISO date string
 */
router.get("/profit-loss", analyticsController.getProfitLoss);

/* ------------------------------------------------------- */
module.exports = router;

