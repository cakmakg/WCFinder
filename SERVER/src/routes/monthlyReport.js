"use strict";
/**
 * Monthly Report Routes
 * 
 * Aylık işletme raporları için API routes.
 * Tüm route'lar admin yetkisi gerektirir.
 */

const router = require("express").Router();
const monthlyReportController = require("../controller/monthlyReport");
const { isLogin, isAdmin } = require("../middleware/permissions");

// All routes require admin
router.use(isLogin, isAdmin);

/* ------------------------------------------------------- */
// ROUTES:

/**
 * @route GET /api/monthly-reports
 * @desc List all monthly reports (with filters)
 * @query businessId, year, month, status, page, limit
 */
router.get("/", monthlyReportController.list);

/**
 * @route POST /api/monthly-reports/generate
 * @desc Generate a new monthly report for a business
 * @body businessId, year, month, notes
 */
router.post("/generate", monthlyReportController.generate);

/**
 * @route POST /api/monthly-reports/generate-bulk
 * @desc Generate reports for all businesses for a month
 * @body year, month
 */
router.post("/generate-bulk", monthlyReportController.generateBulk);

/**
 * @route GET /api/monthly-reports/business/:businessId
 * @desc Get all reports for a specific business
 * @query year (optional)
 */
router.get("/business/:businessId", monthlyReportController.getByBusiness);

/**
 * @route GET /api/monthly-reports/:id
 * @desc Get single report by ID
 */
router.get("/:id", monthlyReportController.read);

/**
 * @route PUT /api/monthly-reports/:id
 * @desc Update report (notes, status)
 */
router.put("/:id", monthlyReportController.update);

/**
 * @route DELETE /api/monthly-reports/:id
 * @desc Delete a report
 */
router.delete("/:id", monthlyReportController.destroy);

/* ------------------------------------------------------- */
module.exports = router;

