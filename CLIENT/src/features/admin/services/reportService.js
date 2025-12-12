// features/admin/services/reportService.js
// Report and Analytics API services

import apiClient from "../../../shared/utils/apiClient";

// Constants
const SERVICE_FEE = 0.75; // Platform commission per transaction

export const reportService = {
  // ============ BACKEND API ENDPOINTS ============

  /**
   * Get dashboard summary from backend
   * @returns {Promise} Dashboard summary data
   */
  getDashboardSummary: async () => {
    const response = await apiClient.get("/admin/analytics/dashboard");
    return response.data;
  },

  /**
   * Get revenue trend from backend
   * @param {string} period - 'daily' | 'weekly' | 'monthly'
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise} Revenue trend data
   */
  getRevenueTrend: async (period = 'daily', startDate, endDate) => {
    const response = await apiClient.get("/admin/analytics/revenue-trend", {
      params: {
        period,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    return response.data;
  },

  /**
   * Get revenue comparison from backend
   * @param {Date} startDate - Current period start
   * @param {Date} endDate - Current period end
   * @param {Date} compareStartDate - Comparison period start
   * @param {Date} compareEndDate - Comparison period end
   * @returns {Promise} Comparison data
   */
  getRevenueComparison: async (startDate, endDate, compareStartDate, compareEndDate) => {
    const response = await apiClient.get("/admin/analytics/revenue-comparison", {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        compareStartDate: compareStartDate?.toISOString(),
        compareEndDate: compareEndDate?.toISOString()
      }
    });
    return response.data;
  },

  /**
   * Get business performance from backend
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise} Business performance data
   */
  getBusinessPerformanceFromAPI: async (startDate, endDate) => {
    const response = await apiClient.get("/admin/analytics/business-performance", {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    return response.data;
  },

  /**
   * Get commission report from backend
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise} Commission report data
   */
  getCommissionReportFromAPI: async (startDate, endDate) => {
    const response = await apiClient.get("/admin/analytics/commission-report", {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    return response.data;
  },

  /**
   * Get profit/loss from backend
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise} Profit/loss data
   */
  getProfitLossFromAPI: async (startDate, endDate) => {
    const response = await apiClient.get("/admin/analytics/profit-loss", {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    return response.data;
  },

  // ============ MONTHLY REPORTS ============

  /**
   * Get monthly summary for a specific month
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
   * Get multiple monthly summaries for comparison
   * @param {Array} periods - Array of { year, month }
   * @returns {Promise} Array of monthly summaries
   */
  getMultipleMonthlySummaries: async (periods) => {
    const promises = periods.map(({ year, month }) =>
      reportService.getMonthlySummary(year, month).catch(() => null)
    );
    const results = await Promise.all(promises);
    return results.filter(Boolean);
  },

  // ============ COMMISSION CALCULATIONS (CLIENT-SIDE FALLBACK) ============

  /**
   * Calculate commission statistics from payments
   * @param {Array} payments - Array of payment objects
   * @returns {Object} Commission statistics
   */
  calculateCommissionStats: (payments) => {
    if (!payments || !Array.isArray(payments)) {
      return {
        totalRevenue: 0,
        platformCommission: 0,
        businessRevenue: 0,
        commissionRate: 0,
        transactionCount: 0,
        averageTransaction: 0
      };
    }

    const successfulPayments = payments.filter(
      p => p.status === 'succeeded' || p.status === 'paid'
    );

    const totalRevenue = successfulPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    const platformCommission = successfulPayments.reduce(
      (sum, p) => sum + (Number(p.platformFee) || Number(p.serviceFee) || SERVICE_FEE),
      0
    );

    const businessRevenue = totalRevenue - platformCommission;
    const transactionCount = successfulPayments.length;
    const averageTransaction = transactionCount > 0 ? totalRevenue / transactionCount : 0;
    const commissionRate = totalRevenue > 0 ? (platformCommission / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      platformCommission,
      businessRevenue,
      commissionRate,
      transactionCount,
      averageTransaction
    };
  },

  /**
   * Calculate commission by business
   * @param {Array} payments - Array of payments with business info
   * @returns {Array} Commission data grouped by business
   */
  calculateCommissionByBusiness: (payments) => {
    if (!payments || !Array.isArray(payments)) return [];

    const businessMap = {};

    payments.forEach(payment => {
      if (payment.status !== 'succeeded' && payment.status !== 'paid') return;

      const businessId = payment.businessId?._id || payment.businessId;
      const businessName = payment.businessId?.businessName || payment.businessId?.name || 'Unbekannt';

      if (!businessMap[businessId]) {
        businessMap[businessId] = {
          businessId,
          businessName,
          totalRevenue: 0,
          platformCommission: 0,
          businessRevenue: 0,
          transactionCount: 0
        };
      }

      const amount = Number(payment.amount) || 0;
      const commission = Number(payment.platformFee) || Number(payment.serviceFee) || SERVICE_FEE;

      businessMap[businessId].totalRevenue += amount;
      businessMap[businessId].platformCommission += commission;
      businessMap[businessId].businessRevenue += (amount - commission);
      businessMap[businessId].transactionCount += 1;
    });

    return Object.values(businessMap).sort((a, b) => b.totalRevenue - a.totalRevenue);
  },

  // ============ PROFIT/LOSS ANALYSIS ============

  /**
   * Calculate profit/loss from usages and payments
   * @param {Array} usages - Array of usage records
   * @param {Object} options - Options { includePending: boolean }
   * @returns {Object} Profit/loss statistics
   */
  calculateProfitLoss: (usages, options = {}) => {
    if (!usages || !Array.isArray(usages)) {
      return {
        totalRevenue: 0,
        platformCommission: 0,
        businessPayouts: 0,
        netProfit: 0,
        profitMargin: 0,
        pendingRevenue: 0,
        completedRevenue: 0
      };
    }

    const { includePending = false } = options;

    let totalRevenue = 0;
    let platformCommission = 0;
    let pendingRevenue = 0;
    let completedRevenue = 0;

    usages.forEach(usage => {
      const totalFee = Number(usage.totalFee) || 0;
      const serviceFee = Number(usage.serviceFee) || SERVICE_FEE;

      if (usage.paymentStatus === 'paid' || usage.status === 'completed') {
        completedRevenue += totalFee;
        platformCommission += serviceFee;
      } else if (includePending && usage.status === 'pending') {
        pendingRevenue += totalFee;
      }
    });

    totalRevenue = completedRevenue + (includePending ? pendingRevenue : 0);
    const businessPayouts = totalRevenue - platformCommission;
    const netProfit = platformCommission; // Platform's profit is the commission
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      platformCommission,
      businessPayouts,
      netProfit,
      profitMargin,
      pendingRevenue,
      completedRevenue
    };
  },

  // ============ BUSINESS PERFORMANCE ============

  /**
   * Calculate business performance metrics
   * @param {Array} businesses - Array of businesses
   * @param {Array} usages - Array of usages
   * @param {Object} dateRange - { startDate, endDate }
   * @returns {Array} Business performance data
   */
  calculateBusinessPerformance: (businesses, usages, dateRange = null) => {
    if (!businesses || !Array.isArray(businesses)) return [];

    return businesses.map(business => {
      const businessId = business._id?.toString() || business._id;

      // Filter usages for this business
      let businessUsages = usages.filter(usage => {
        const usageBusinessId = usage.businessId?._id?.toString() ||
          usage.businessId?.toString() ||
          usage.businessId;
        return usageBusinessId === businessId;
      });

      // Apply date range filter if provided
      if (dateRange?.startDate && dateRange?.endDate) {
        businessUsages = businessUsages.filter(usage => {
          const usageDate = new Date(usage.createdAt || usage.startTime);
          return usageDate >= new Date(dateRange.startDate) &&
            usageDate <= new Date(dateRange.endDate);
        });
      }

      // Calculate metrics
      const paidUsages = businessUsages.filter(
        u => u.paymentStatus === 'paid' || u.status === 'completed'
      );

      const totalRevenue = paidUsages.reduce(
        (sum, u) => sum + (Number(u.totalFee) || 0),
        0
      );

      const platformCommission = paidUsages.reduce(
        (sum, u) => sum + (Number(u.serviceFee) || SERVICE_FEE),
        0
      );

      const businessRevenue = totalRevenue - platformCommission;
      const bookingCount = paidUsages.length;
      const totalBookings = businessUsages.length;
      const completionRate = totalBookings > 0 ? (bookingCount / totalBookings) * 100 : 0;
      const averageBookingValue = bookingCount > 0 ? totalRevenue / bookingCount : 0;

      // Rating calculation
      const ratings = businessUsages
        .filter(u => u.rating)
        .map(u => Number(u.rating));
      const averageRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

      return {
        businessId,
        businessName: business.businessName || business.name || 'Unbekannt',
        businessType: business.businessType || 'restaurant',
        status: business.approvalStatus || 'pending',
        totalRevenue,
        platformCommission,
        businessRevenue,
        bookingCount,
        totalBookings,
        completionRate,
        averageBookingValue,
        averageRating,
        reviewCount: ratings.length
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  },

  // ============ TREND ANALYSIS ============

  /**
   * Calculate revenue trend by period
   * @param {Array} usages - Array of usages
   * @param {string} period - 'daily' | 'weekly' | 'monthly'
   * @param {number} count - Number of periods to analyze
   * @returns {Array} Trend data
   */
  calculateRevenueTrend: (usages, period = 'daily', count = 30) => {
    if (!usages || !Array.isArray(usages)) return [];

    const now = new Date();
    const trends = [];

    for (let i = count - 1; i >= 0; i--) {
      let startDate, endDate, label;

      if (period === 'daily') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - i);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);

        label = startDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      } else if (period === 'weekly') {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - (i * 7));
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        label = `KW ${getWeekNumber(startDate)}`;
      } else if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

        label = startDate.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
      }

      // Filter usages for this period
      const periodUsages = usages.filter(usage => {
        const usageDate = new Date(usage.createdAt || usage.startTime);
        return usageDate >= startDate && usageDate <= endDate;
      });

      const paidUsages = periodUsages.filter(
        u => u.paymentStatus === 'paid' || u.status === 'completed'
      );

      const revenue = paidUsages.reduce(
        (sum, u) => sum + (Number(u.totalFee) || 0),
        0
      );

      const commission = paidUsages.reduce(
        (sum, u) => sum + (Number(u.serviceFee) || SERVICE_FEE),
        0
      );

      trends.push({
        label,
        date: startDate.toISOString(),
        revenue,
        commission,
        businessRevenue: revenue - commission,
        bookings: paidUsages.length,
        totalBookings: periodUsages.length
      });
    }

    return trends;
  },

  // ============ COMPARISON ============

  /**
   * Compare two periods
   * @param {Object} current - Current period data { revenue, bookings, etc }
   * @param {Object} previous - Previous period data
   * @returns {Object} Comparison with growth percentages
   */
  comparePeriods: (current, previous) => {
    const calculateGrowth = (curr, prev) => {
      if (!prev || prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      revenue: {
        current: current.revenue || 0,
        previous: previous.revenue || 0,
        growth: calculateGrowth(current.revenue, previous.revenue)
      },
      commission: {
        current: current.commission || 0,
        previous: previous.commission || 0,
        growth: calculateGrowth(current.commission, previous.commission)
      },
      bookings: {
        current: current.bookings || 0,
        previous: previous.bookings || 0,
        growth: calculateGrowth(current.bookings, previous.bookings)
      },
      averageValue: {
        current: current.bookings > 0 ? current.revenue / current.bookings : 0,
        previous: previous.bookings > 0 ? previous.revenue / previous.bookings : 0,
        growth: calculateGrowth(
          current.bookings > 0 ? current.revenue / current.bookings : 0,
          previous.bookings > 0 ? previous.revenue / previous.bookings : 0
        )
      }
    };
  },

  // ============ EXPORT HELPERS ============

  /**
   * Prepare report data for export
   * @param {string} reportType - 'commission' | 'performance' | 'monthly' | 'profit-loss'
   * @param {Object} data - Report data
   * @returns {Object} { data, columns, summary }
   */
  prepareExportData: (reportType, data) => {
    switch (reportType) {
      case 'commission':
        return {
          data: data.byBusiness || [],
          columns: [
            { key: 'businessName', header: 'Geschäft', width: 25 },
            { key: 'totalRevenue', header: 'Umsatz (€)', width: 15, format: 'currency' },
            { key: 'platformCommission', header: 'Kommission (€)', width: 15, format: 'currency' },
            { key: 'businessRevenue', header: 'Geschäft Einnahmen (€)', width: 20, format: 'currency' },
            { key: 'transactionCount', header: 'Transaktionen', width: 15 }
          ],
          summary: {
            'Gesamtumsatz': `€${(data.total?.totalRevenue || 0).toFixed(2)}`,
            'Gesamtkommission': `€${(data.total?.platformCommission || 0).toFixed(2)}`,
            'Kommissionsrate': `${(data.total?.commissionRate || 0).toFixed(2)}%`,
            'Anzahl Transaktionen': data.total?.transactionCount || 0
          }
        };

      case 'performance':
        return {
          data: data || [],
          columns: [
            { key: 'businessName', header: 'Geschäft', width: 25 },
            { key: 'totalRevenue', header: 'Umsatz (€)', width: 15, format: 'currency' },
            { key: 'bookingCount', header: 'Buchungen', width: 12 },
            { key: 'completionRate', header: 'Abschlussrate (%)', width: 15, format: 'percent' },
            { key: 'averageBookingValue', header: 'Ø Buchungswert (€)', width: 18, format: 'currency' },
            { key: 'averageRating', header: 'Bewertung', width: 12, format: 'rating' }
          ],
          summary: null
        };

      case 'profit-loss':
        return {
          data: [data],
          columns: [
            { key: 'totalRevenue', header: 'Gesamtumsatz (€)', width: 18, format: 'currency' },
            { key: 'platformCommission', header: 'Kommission (€)', width: 18, format: 'currency' },
            { key: 'businessPayouts', header: 'Auszahlungen (€)', width: 18, format: 'currency' },
            { key: 'netProfit', header: 'Nettogewinn (€)', width: 18, format: 'currency' },
            { key: 'profitMargin', header: 'Marge (%)', width: 12, format: 'percent' }
          ],
          summary: null
        };

      default:
        return { data: [], columns: [], summary: null };
    }
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default reportService;

