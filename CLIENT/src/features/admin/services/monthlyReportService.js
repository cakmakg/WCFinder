// features/admin/services/monthlyReportService.js
// Monthly Report API services

import apiClient from "../../../shared/utils/apiClient";

export const monthlyReportService = {
  // ============ CRUD OPERATIONS ============

  /**
   * Get all monthly reports with filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Reports list with pagination
   */
  getReports: async (params = {}) => {
    const response = await apiClient.get("/monthly-reports", { params });
    return response.data;
  },

  /**
   * Get single report by ID
   * @param {string} reportId - Report ID
   * @returns {Promise} Report data
   */
  getReportById: async (reportId) => {
    const response = await apiClient.get(`/monthly-reports/${reportId}`);
    return response.data;
  },

  /**
   * Generate a new monthly report
   * @param {Object} data - { businessId, year, month, notes }
   * @returns {Promise} Created report
   */
  generateReport: async (data) => {
    const response = await apiClient.post("/monthly-reports/generate", data);
    return response.data;
  },

  /**
   * Generate reports for all businesses (bulk)
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise} Generation results
   */
  generateBulkReports: async (year, month) => {
    const response = await apiClient.post("/monthly-reports/generate-bulk", {
      year,
      month,
    });
    return response.data;
  },

  /**
   * Update report (notes, status)
   * @param {string} reportId - Report ID
   * @param {Object} data - { notes, status }
   * @returns {Promise} Updated report
   */
  updateReport: async (reportId, data) => {
    const response = await apiClient.put(`/monthly-reports/${reportId}`, data);
    return response.data;
  },

  /**
   * Delete a report
   * @param {string} reportId - Report ID
   * @returns {Promise} Success response
   */
  deleteReport: async (reportId) => {
    const response = await apiClient.delete(`/monthly-reports/${reportId}`);
    return response.data;
  },

  /**
   * Get reports for a specific business
   * @param {string} businessId - Business ID
   * @param {number} year - Optional year filter
   * @returns {Promise} Business reports
   */
  getReportsByBusiness: async (businessId, year = null) => {
    const params = year ? { year } : {};
    const response = await apiClient.get(
      `/monthly-reports/business/${businessId}`,
      { params }
    );
    return response.data;
  },

  // ============ HELPER METHODS ============

  /**
   * Get month name in German
   * @param {number} month - Month number (1-12)
   * @returns {string} Month name
   */
  getMonthName: (month) => {
    const months = [
      "Januar",
      "Februar",
      "März",
      "April",
      "Mai",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "Dezember",
    ];
    return months[month - 1] || "";
  },

  /**
   * Get month name in Turkish
   * @param {number} month - Month number (1-12)
   * @returns {string} Month name
   */
  getMonthNameTR: (month) => {
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];
    return months[month - 1] || "";
  },

  /**
   * Format period label
   * @param {number} year - Year
   * @param {number} month - Month
   * @param {string} lang - Language ('de' or 'tr')
   * @returns {string} Formatted label
   */
  formatPeriodLabel: (year, month, lang = "de") => {
    const monthName =
      lang === "tr"
        ? monthlyReportService.getMonthNameTR(month)
        : monthlyReportService.getMonthName(month);
    return `${monthName} ${year}`;
  },

  /**
   * Get available years for selection
   * @returns {Array} Years from 2024 to current year
   */
  getAvailableYears: () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear; y >= 2024; y--) {
      years.push(y);
    }
    return years;
  },

  /**
   * Get available months for selection
   * @param {number} year - Year to check
   * @returns {Array} Months (1-12 or up to current month if current year)
   */
  getAvailableMonths: (year) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const months = [];
    const maxMonth = year === currentYear ? currentMonth : 12;

    for (let m = 1; m <= maxMonth; m++) {
      months.push({
        value: m,
        label: monthlyReportService.getMonthName(m),
        labelTR: monthlyReportService.getMonthNameTR(m),
      });
    }

    return months;
  },

  /**
   * Get status display info
   * @param {string} status - Report status
   * @returns {Object} { label, color }
   */
  getStatusDisplay: (status) => {
    const statusMap = {
      draft: { label: "Entwurf", labelTR: "Taslak", color: "default" },
      finalized: { label: "Abgeschlossen", labelTR: "Tamamlandı", color: "success" },
      archived: { label: "Archiviert", labelTR: "Arşivlendi", color: "info" },
    };
    return statusMap[status] || { label: status, color: "default" };
  },

  /**
   * Format currency
   * @param {number} value - Value to format
   * @returns {string} Formatted currency
   */
  formatCurrency: (value) => {
    return `€${Number(value || 0).toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  },

  /**
   * Calculate growth indicator
   * @param {number} change - Percentage change
   * @returns {Object} { label, color, icon }
   */
  getGrowthIndicator: (change) => {
    if (change > 0) {
      return { label: `+${change.toFixed(1)}%`, color: "success", trend: "up" };
    } else if (change < 0) {
      return { label: `${change.toFixed(1)}%`, color: "error", trend: "down" };
    }
    return { label: "0%", color: "default", trend: "neutral" };
  },
};

export default monthlyReportService;

