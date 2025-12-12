import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  subDays,
  subWeeks,
  subMonths,
  addDays,
  differenceInDays,
  parseISO,
  isValid
} from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Format a date to German locale string
 * @param {Date|string} date - Date to format
 * @param {string} formatStr - Format string (default: 'dd.MM.yyyy')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatStr = 'dd.MM.yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatStr, { locale: de });
};

/**
 * Format a date range to string
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

/**
 * Get preset date ranges
 * @param {string} preset - Preset type ('today', 'week', 'month', 'lastMonth', 'year', 'lastYear')
 * @returns {Object} { startDate, endDate }
 */
export const getPresetRange = (preset) => {
  const now = new Date();

  switch (preset) {
    case 'today':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now)
      };

    case 'yesterday':
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday)
      };

    case 'last7days':
      return {
        startDate: startOfDay(subDays(now, 6)),
        endDate: endOfDay(now)
      };

    case 'last30days':
      return {
        startDate: startOfDay(subDays(now, 29)),
        endDate: endOfDay(now)
      };

    case 'week':
      return {
        startDate: startOfWeek(now, { locale: de }),
        endDate: endOfWeek(now, { locale: de })
      };

    case 'lastWeek':
      const lastWeek = subWeeks(now, 1);
      return {
        startDate: startOfWeek(lastWeek, { locale: de }),
        endDate: endOfWeek(lastWeek, { locale: de })
      };

    case 'month':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now)
      };

    case 'lastMonth':
      const lastMonth = subMonths(now, 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth)
      };

    case 'year':
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now)
      };

    case 'lastYear':
      const lastYear = subMonths(now, 12);
      return {
        startDate: startOfYear(lastYear),
        endDate: endOfYear(lastYear)
      };

    default:
      // Default to current month
      return {
        startDate: startOfMonth(now),
        endDate: endOfDay(now)
      };
  }
};

/**
 * Get comparison period for a given date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} { startDate, endDate } for comparison period
 */
export const getComparisonPeriod = (startDate, endDate) => {
  if (!startDate || !endDate) return null;

  const duration = differenceInDays(endDate, startDate);
  const compareEndDate = subDays(startDate, 1);
  const compareStartDate = subDays(compareEndDate, duration);

  return {
    startDate: compareStartDate,
    endDate: compareEndDate
  };
};

/**
 * Calculate growth percentage
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {number} Growth percentage
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
};

/**
 * Format growth percentage with sign
 * @param {number} growth - Growth percentage
 * @returns {string} Formatted growth string
 */
export const formatGrowth = (growth) => {
  if (!growth || isNaN(growth)) return '0%';
  const sign = growth > 0 ? '+' : '';
  return `${sign}${growth.toFixed(1)}%`;
};

/**
 * Get trend indicator based on growth
 * @param {number} growth - Growth percentage
 * @returns {string} 'up' | 'down' | 'neutral'
 */
export const getTrendIndicator = (growth) => {
  if (!growth || isNaN(growth) || Math.abs(growth) < 0.1) return 'neutral';
  return growth > 0 ? 'up' : 'down';
};

/**
 * Convert date to ISO string for API
 * @param {Date} date - Date to convert
 * @returns {string} ISO string
 */
export const toISOString = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return dateObj.toISOString();
};

/**
 * Parse date from various formats
 * @param {Date|string} date - Date to parse
 * @returns {Date|null} Parsed date or null
 */
export const parseDate = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : null;
};

/**
 * Get date range label for display
 * @param {string} preset - Preset type
 * @returns {string} Label
 */
export const getDateRangeLabel = (preset) => {
  const labels = {
    today: 'Heute',
    yesterday: 'Gestern',
    last7days: 'Letzte 7 Tage',
    last30days: 'Letzte 30 Tage',
    week: 'Diese Woche',
    lastWeek: 'Letzte Woche',
    month: 'Dieser Monat',
    lastMonth: 'Letzter Monat',
    year: 'Dieses Jahr',
    lastYear: 'Letztes Jahr',
    custom: 'Benutzerdefiniert'
  };

  return labels[preset] || labels.custom;
};

/**
 * Group dates by period
 * @param {Array} data - Array of data with date field
 * @param {string} period - Period type ('daily', 'weekly', 'monthly')
 * @param {string} dateField - Field name containing date (default: 'createdAt')
 * @returns {Object} Grouped data by period
 */
export const groupByPeriod = (data, period = 'daily', dateField = 'createdAt') => {
  if (!data || !Array.isArray(data)) return {};

  const formatMap = {
    daily: 'yyyy-MM-dd',
    weekly: "yyyy-'W'ww",
    monthly: 'yyyy-MM'
  };

  const formatStr = formatMap[period] || formatMap.daily;

  return data.reduce((acc, item) => {
    const date = parseDate(item[dateField]);
    if (!date) return acc;

    const key = format(date, formatStr, { locale: de });
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
};

/**
 * Check if date is in range
 * @param {Date} date - Date to check
 * @param {Date} startDate - Range start
 * @param {Date} endDate - Range end
 * @returns {boolean}
 */
export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;
  const dateObj = parseDate(date);
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  return dateObj >= start && dateObj <= end;
};
