import { formatDate, groupByPeriod } from './dateHelpers';
import { formatCurrency } from './exportHelpers';

/**
 * Chart color palette
 */
export const CHART_COLORS = {
  primary: '#0891b2',      // Teal
  success: '#16a34a',      // Green
  warning: '#f59e0b',      // Amber
  error: '#dc2626',        // Red
  info: '#3b82f6',         // Blue
  purple: '#8b5cf6',       // Purple
  pink: '#ec4899',         // Pink
  indigo: '#6366f1',       // Indigo
  gray: '#6b7280'          // Gray
};

/**
 * Extended color palette for charts
 */
export const CHART_COLOR_PALETTE = [
  '#0891b2', // primary
  '#16a34a', // success
  '#f59e0b', // warning
  '#dc2626', // error
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#3b82f6', // info
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f97316'  // orange
];

/**
 * Status color mapping
 */
export const STATUS_COLORS = {
  // Payment status
  succeeded: CHART_COLORS.success,
  paid: CHART_COLORS.success,
  pending: CHART_COLORS.warning,
  processing: CHART_COLORS.info,
  failed: CHART_COLORS.error,
  refunded: CHART_COLORS.gray,
  cancelled: CHART_COLORS.gray,

  // Booking status
  completed: CHART_COLORS.success,
  confirmed: CHART_COLORS.success,
  active: CHART_COLORS.info,
  expired: CHART_COLORS.gray,

  // Business status
  approved: CHART_COLORS.success,
  rejected: CHART_COLORS.error,

  // Payout status
  completed: CHART_COLORS.success
};

/**
 * Prepare revenue chart data
 * @param {Array} payments - Payment data
 * @param {string} period - Period type ('daily', 'weekly', 'monthly')
 * @returns {Array} Chart data
 */
export const prepareRevenueChartData = (payments, period = 'daily') => {
  if (!payments || !Array.isArray(payments)) return [];

  // Filter succeeded payments only
  const succeededPayments = payments.filter(
    p => p.status === 'succeeded' || p.status === 'paid'
  );

  // Group by period
  const grouped = groupByPeriod(succeededPayments, period);

  // Calculate totals for each period
  return Object.keys(grouped)
    .sort()
    .map(key => {
      const periodPayments = grouped[key];
      const revenue = periodPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const bookings = periodPayments.length;

      // Format date label
      let dateLabel = key;
      if (period === 'daily') {
        dateLabel = formatDate(new Date(key), 'dd.MM');
      } else if (period === 'monthly') {
        dateLabel = formatDate(new Date(key + '-01'), 'MMM yyyy');
      }

      return {
        date: key,
        dateLabel,
        revenue: Number(revenue.toFixed(2)),
        bookings,
        avgRevenue: bookings > 0 ? Number((revenue / bookings).toFixed(2)) : 0
      };
    });
};

/**
 * Prepare status distribution data for pie chart
 * @param {Array} data - Data array
 * @param {string} statusField - Status field name (default: 'status')
 * @returns {Array} Pie chart data
 */
export const prepareStatusDistribution = (data, statusField = 'status') => {
  if (!data || !Array.isArray(data)) return [];

  // Count by status
  const statusCounts = data.reduce((acc, item) => {
    const status = item[statusField] || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data
  return Object.keys(statusCounts).map((status, index) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: statusCounts[status],
    percentage: ((statusCounts[status] / data.length) * 100).toFixed(1),
    color: STATUS_COLORS[status] || CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]
  }));
};

/**
 * Prepare business type distribution data
 * @param {Array} businesses - Business data
 * @returns {Array} Pie chart data
 */
export const prepareBusinessTypeDistribution = (businesses) => {
  if (!businesses || !Array.isArray(businesses)) return [];

  const typeCounts = businesses.reduce((acc, business) => {
    const type = business.businessType || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return Object.keys(typeCounts).map((type, index) => ({
    name: type,
    value: typeCounts[type],
    percentage: ((typeCounts[type] / businesses.length) * 100).toFixed(1),
    color: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]
  }));
};

/**
 * Prepare top businesses by revenue
 * @param {Array} businesses - Business data
 * @param {Array} payments - Payment data
 * @param {number} limit - Number of top businesses (default: 10)
 * @returns {Array} Bar chart data
 */
export const prepareTopBusinesses = (businesses, payments, limit = 10) => {
  if (!businesses || !payments) return [];

  // Calculate revenue per business
  const revenueByBusiness = payments.reduce((acc, payment) => {
    if (payment.status === 'succeeded' || payment.status === 'paid') {
      const businessId = payment.businessId?._id || payment.businessId;
      acc[businessId] = (acc[businessId] || 0) + Number(payment.amount || 0);
    }
    return acc;
  }, {});

  // Map to business names and sort
  const businessData = Object.keys(revenueByBusiness)
    .map(businessId => {
      const business = businesses.find(b => b._id === businessId);
      return {
        id: businessId,
        name: business?.businessName || 'Unknown',
        revenue: revenueByBusiness[businessId]
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return businessData;
};

/**
 * Prepare commission breakdown data
 * @param {Array} payments - Payment data
 * @returns {Object} Commission data
 */
export const prepareCommissionData = (payments) => {
  if (!payments || !Array.isArray(payments)) {
    return {
      totalRevenue: 0,
      platformCommission: 0,
      businessRevenue: 0,
      commissionRate: 0
    };
  }

  const succeededPayments = payments.filter(
    p => p.status === 'succeeded' || p.status === 'paid'
  );

  const totalRevenue = succeededPayments.reduce(
    (sum, p) => sum + (Number(p.amount) || 0), 0
  );

  const platformCommission = succeededPayments.reduce(
    (sum, p) => sum + (Number(p.platformFee) || 0), 0
  );

  const businessRevenue = succeededPayments.reduce(
    (sum, p) => sum + (Number(p.businessFee) || 0), 0
  );

  const commissionRate = totalRevenue > 0
    ? (platformCommission / totalRevenue) * 100
    : 0;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    platformCommission: Number(platformCommission.toFixed(2)),
    businessRevenue: Number(businessRevenue.toFixed(2)),
    commissionRate: Number(commissionRate.toFixed(2))
  };
};

/**
 * Prepare comparison chart data
 * @param {Array} currentData - Current period data
 * @param {Array} previousData - Previous period data
 * @returns {Array} Comparison chart data
 */
export const prepareComparisonData = (currentData, previousData) => {
  if (!currentData || !previousData) return [];

  const current = prepareRevenueChartData(currentData);
  const previous = prepareRevenueChartData(previousData);

  // Ensure same length
  const maxLength = Math.max(current.length, previous.length);
  const comparisonData = [];

  for (let i = 0; i < maxLength; i++) {
    comparisonData.push({
      index: i + 1,
      current: current[i]?.revenue || 0,
      previous: previous[i]?.revenue || 0,
      currentBookings: current[i]?.bookings || 0,
      previousBookings: previous[i]?.bookings || 0,
      dateLabel: current[i]?.dateLabel || previous[i]?.dateLabel || `Tag ${i + 1}`
    });
  }

  return comparisonData;
};

/**
 * Calculate chart statistics
 * @param {Array} data - Chart data
 * @param {string} valueField - Field containing the value
 * @returns {Object} Statistics
 */
export const calculateChartStats = (data, valueField = 'revenue') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      count: 0
    };
  }

  const values = data.map(d => Number(d[valueField]) || 0);
  const total = values.reduce((sum, val) => sum + val, 0);

  return {
    total: Number(total.toFixed(2)),
    average: Number((total / values.length).toFixed(2)),
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length
  };
};

/**
 * Format chart tooltip
 * @param {Object} data - Tooltip data
 * @param {string} label - Label
 * @param {string} valueField - Value field name
 * @param {string} valueType - Type of value ('currency', 'number', 'percentage')
 * @returns {string} Formatted tooltip
 */
export const formatChartTooltip = (data, label, valueField, valueType = 'currency') => {
  const value = data[valueField];

  if (value === null || value === undefined) return '';

  let formattedValue = value;

  if (valueType === 'currency') {
    formattedValue = formatCurrency(value);
  } else if (valueType === 'percentage') {
    formattedValue = `${value.toFixed(1)}%`;
  } else if (valueType === 'number') {
    formattedValue = value.toLocaleString('de-DE');
  }

  return `${label}: ${formattedValue}`;
};

/**
 * Get gradient definition for area charts
 * @param {string} color - Base color
 * @returns {Object} Gradient configuration
 */
export const getChartGradient = (color = CHART_COLORS.primary) => {
  return {
    id: `gradient-${color.replace('#', '')}`,
    color1: color,
    color2: `${color}33`, // 20% opacity
    offset1: '5%',
    offset2: '95%'
  };
};

/**
 * Prepare dual axis chart data
 * @param {Array} data - Data array
 * @param {string} yAxis1Field - First Y-axis field
 * @param {string} yAxis2Field - Second Y-axis field
 * @returns {Array} Formatted data for dual axis chart
 */
export const prepareDualAxisData = (data, yAxis1Field, yAxis2Field) => {
  if (!data || !Array.isArray(data)) return [];

  return data.map(item => ({
    ...item,
    [yAxis1Field]: Number(item[yAxis1Field]) || 0,
    [yAxis2Field]: Number(item[yAxis2Field]) || 0
  }));
};
