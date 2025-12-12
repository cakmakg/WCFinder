// features/admin/services/payoutService.js
// Business Payout API services

import apiClient from "../../../shared/utils/apiClient";

export const payoutService = {
  // ============ ADMIN ENDPOINTS ============

  /**
   * Get all pending payouts grouped by business (Admin only)
   * @returns {Promise} { businesses: [...], totalPending: number, businessCount: number }
   */
  getAllPendingPayouts: async () => {
    const response = await apiClient.get("/business-payouts/all-pending");
    return response.data;
  },

  /**
   * Get businesses with payout history (Admin only)
   * @returns {Promise} Array of businesses with payout data
   */
  getBusinessesWithPayouts: async () => {
    const response = await apiClient.get("/business-payouts/businesses-with-payouts");
    return response.data;
  },

  /**
   * Get monthly summary for a specific month (Admin only)
   * @param {number} year - Year
   * @param {number} month - Month (1-12)
   * @returns {Promise} Monthly summary data
   */
  getMonthlySummary: async (year, month) => {
    const response = await apiClient.get("/business-payouts/monthly-summary", {
      params: { year, month }
    });
    return response.data;
  },

  /**
   * Create a new payout (Admin only)
   * @param {Object} payoutData - Payout data
   * @param {string} payoutData.businessId - Business ID
   * @param {number} payoutData.amount - Payout amount
   * @param {string} payoutData.paymentMethod - Payment method (bank_transfer, stripe_connect, paypal, manual)
   * @param {Object} payoutData.period - Period object { startDate, endDate }
   * @param {string} payoutData.notes - Optional notes
   * @returns {Promise} Created payout
   */
  createPayout: async (payoutData) => {
    const response = await apiClient.post("/business-payouts/create", payoutData);
    return response.data;
  },

  /**
   * Complete a payout (Admin only)
   * @param {string} payoutId - Payout ID
   * @param {Object} completionData - Completion data
   * @param {string} completionData.transactionReference - Transaction reference
   * @param {string} completionData.notes - Optional notes
   * @returns {Promise} Updated payout
   */
  completePayout: async (payoutId, completionData) => {
    const response = await apiClient.patch(
      `/business-payouts/${payoutId}/complete`,
      completionData
    );
    return response.data;
  },

  // ============ OWNER ENDPOINTS (for reference) ============

  /**
   * Get pending payouts for current owner
   * @returns {Promise} Owner's pending payouts
   */
  getMyPendingPayouts: async () => {
    const response = await apiClient.get("/business-payouts/my-pending");
    return response.data;
  },

  /**
   * Get financial summary for current owner
   * @param {string} startDate - Start date (ISO string)
   * @param {string} endDate - End date (ISO string)
   * @returns {Promise} Financial summary
   */
  getMyFinancialSummary: async (startDate, endDate) => {
    const response = await apiClient.get("/business-payouts/my-summary", {
      params: { startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get payout history for current owner
   * @returns {Promise} Payout history
   */
  getMyPayoutHistory: async () => {
    const response = await apiClient.get("/business-payouts/my-history");
    return response.data;
  },

  // ============ HELPER METHODS ============

  /**
   * Calculate total pending amount for a business
   * @param {Array} payments - Array of pending payments
   * @returns {number} Total pending amount
   */
  calculateTotalPending: (payments) => {
    if (!payments || !Array.isArray(payments)) return 0;
    return payments.reduce((sum, payment) => {
      return sum + (Number(payment.businessFee) || 0);
    }, 0);
  },

  /**
   * Format payout status for display
   * @param {string} status - Payout status
   * @returns {Object} { label, color }
   */
  getPayoutStatusDisplay: (status) => {
    const statusMap = {
      pending: { label: 'Ausstehend', color: 'warning' },
      processing: { label: 'In Bearbeitung', color: 'info' },
      completed: { label: 'Abgeschlossen', color: 'success' },
      failed: { label: 'Fehlgeschlagen', color: 'error' },
      cancelled: { label: 'Storniert', color: 'default' }
    };
    return statusMap[status] || { label: status, color: 'default' };
  },

  /**
   * Format payment method for display
   * @param {string} method - Payment method
   * @returns {string} Formatted method
   */
  getPaymentMethodDisplay: (method) => {
    const methodMap = {
      bank_transfer: 'Banküberweisung',
      stripe_connect: 'Stripe Connect',
      paypal: 'PayPal',
      manual: 'Manuell'
    };
    return methodMap[method] || method;
  },

  /**
   * Validate payout data before creation
   * @param {Object} payoutData - Payout data to validate
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validatePayoutData: (payoutData) => {
    const errors = [];

    if (!payoutData.businessId) {
      errors.push('Geschäft ist erforderlich');
    }

    if (!payoutData.amount || payoutData.amount <= 0) {
      errors.push('Betrag muss größer als 0 sein');
    }

    if (!payoutData.paymentMethod) {
      errors.push('Zahlungsmethode ist erforderlich');
    }

    if (!payoutData.period || !payoutData.period.startDate || !payoutData.period.endDate) {
      errors.push('Zeitraum ist erforderlich');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Group payouts by status
   * @param {Array} payouts - Array of payouts
   * @returns {Object} Grouped payouts
   */
  groupPayoutsByStatus: (payouts) => {
    if (!payouts || !Array.isArray(payouts)) return {};

    return payouts.reduce((acc, payout) => {
      const status = payout.status || 'unknown';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(payout);
      return acc;
    }, {});
  },

  /**
   * Calculate payout statistics
   * @param {Array} payouts - Array of payouts
   * @returns {Object} Statistics
   */
  calculatePayoutStats: (payouts) => {
    if (!payouts || !Array.isArray(payouts)) {
      return {
        total: 0,
        totalAmount: 0,
        completed: 0,
        completedAmount: 0,
        pending: 0,
        pendingAmount: 0,
        failed: 0,
        failedAmount: 0
      };
    }

    const stats = {
      total: payouts.length,
      totalAmount: 0,
      completed: 0,
      completedAmount: 0,
      pending: 0,
      pendingAmount: 0,
      failed: 0,
      failedAmount: 0
    };

    payouts.forEach(payout => {
      const amount = Number(payout.amount) || 0;
      stats.totalAmount += amount;

      if (payout.status === 'completed') {
        stats.completed++;
        stats.completedAmount += amount;
      } else if (payout.status === 'pending' || payout.status === 'processing') {
        stats.pending++;
        stats.pendingAmount += amount;
      } else if (payout.status === 'failed') {
        stats.failed++;
        stats.failedAmount += amount;
      }
    });

    return stats;
  }
};

export default payoutService;
