import { formatDate } from './dateHelpers';

/**
 * Format currency for export
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'EUR')
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '0,00 €';

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Format number for German locale
 * @param {number} value - Number to format
 * @param {number} decimals - Decimal places (default: 2)
 * @returns {string} Formatted number
 */
export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined || isNaN(value)) return '0';

  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Prepare data for Excel/CSV export
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Column definitions
 * @returns {Array} Formatted data for export
 */
export const prepareExportData = (data, columns) => {
  if (!data || !Array.isArray(data) || !columns) return [];

  return data.map(row => {
    const exportRow = {};

    columns.forEach(col => {
      const value = col.accessor ? col.accessor(row) : row[col.field];

      // Format based on column type
      if (col.type === 'currency') {
        exportRow[col.header] = formatCurrency(value);
      } else if (col.type === 'number') {
        exportRow[col.header] = formatNumber(value, col.decimals || 2);
      } else if (col.type === 'percentage') {
        exportRow[col.header] = formatPercentage(value, col.decimals || 1);
      } else if (col.type === 'date') {
        exportRow[col.header] = value ? formatDate(value, col.format || 'dd.MM.yyyy') : '';
      } else if (col.type === 'datetime') {
        exportRow[col.header] = value ? formatDate(value, 'dd.MM.yyyy HH:mm') : '';
      } else if (col.type === 'boolean') {
        exportRow[col.header] = value ? 'Ja' : 'Nein';
      } else {
        exportRow[col.header] = value || '';
      }
    });

    return exportRow;
  });
};

/**
 * Get filename with timestamp
 * @param {string} baseName - Base filename
 * @param {string} extension - File extension (default: 'xlsx')
 * @returns {string} Filename with timestamp
 */
export const getExportFilename = (baseName, extension = 'xlsx') => {
  const timestamp = formatDate(new Date(), 'yyyy-MM-dd_HHmmss');
  return `${baseName}_${timestamp}.${extension}`;
};

/**
 * Column definitions for common exports
 */
export const EXPORT_COLUMNS = {
  payments: [
    { field: '_id', header: 'ID', type: 'text' },
    { field: 'createdAt', header: 'Datum', type: 'datetime' },
    { field: 'userId.email', header: 'Benutzer', accessor: (row) => row.userId?.email || 'N/A' },
    { field: 'businessId.businessName', header: 'Geschäft', accessor: (row) => row.businessId?.businessName || 'N/A' },
    { field: 'amount', header: 'Betrag', type: 'currency' },
    { field: 'platformFee', header: 'Plattformgebühr', type: 'currency' },
    { field: 'businessFee', header: 'Geschäftsgebühr', type: 'currency' },
    { field: 'status', header: 'Status', type: 'text' },
    { field: 'paymentMethod', header: 'Zahlungsmethode', type: 'text' }
  ],

  bookings: [
    { field: '_id', header: 'ID', type: 'text' },
    { field: 'createdAt', header: 'Erstellt', type: 'datetime' },
    { field: 'startTime', header: 'Startzeit', type: 'datetime' },
    { field: 'userId.email', header: 'Benutzer', accessor: (row) => row.userId?.email || 'N/A' },
    { field: 'businessId.businessName', header: 'Geschäft', accessor: (row) => row.businessId?.businessName || 'N/A' },
    { field: 'personCount', header: 'Personen', type: 'number', decimals: 0 },
    { field: 'totalFee', header: 'Gesamtgebühr', type: 'currency' },
    { field: 'status', header: 'Status', type: 'text' },
    { field: 'paymentStatus', header: 'Zahlungsstatus', type: 'text' }
  ],

  businesses: [
    { field: '_id', header: 'ID', type: 'text' },
    { field: 'businessName', header: 'Name', type: 'text' },
    { field: 'businessType', header: 'Typ', type: 'text' },
    { field: 'address.city', header: 'Stadt', accessor: (row) => row.address?.city || '' },
    { field: 'address.postalCode', header: 'PLZ', accessor: (row) => row.address?.postalCode || '' },
    { field: 'approvalStatus', header: 'Status', type: 'text' },
    { field: 'totalEarnings', header: 'Gesamteinnahmen', type: 'currency' },
    { field: 'pendingBalance', header: 'Ausstehend', type: 'currency' },
    { field: 'totalPaidOut', header: 'Ausgezahlt', type: 'currency' },
    { field: 'createdAt', header: 'Erstellt', type: 'date' }
  ],

  payouts: [
    { field: '_id', header: 'ID', type: 'text' },
    { field: 'createdAt', header: 'Erstellt', type: 'datetime' },
    { field: 'businessId.businessName', header: 'Geschäft', accessor: (row) => row.businessId?.businessName || 'N/A' },
    { field: 'amount', header: 'Betrag', type: 'currency' },
    { field: 'status', header: 'Status', type: 'text' },
    { field: 'paymentMethod', header: 'Zahlungsmethode', type: 'text' },
    { field: 'period.startDate', header: 'Periode von', accessor: (row) => row.period?.startDate, type: 'date' },
    { field: 'period.endDate', header: 'Periode bis', accessor: (row) => row.period?.endDate, type: 'date' },
    { field: 'paymentCount', header: 'Anzahl Zahlungen', type: 'number', decimals: 0 },
    { field: 'completedAt', header: 'Abgeschlossen', type: 'datetime' }
  ],

  invoices: [
    { field: 'rechnungsnummer', header: 'Rechnungsnummer', type: 'text' },
    { field: 'rechnungsdatum', header: 'Datum', type: 'date' },
    { field: 'rechnungsempfaenger.businessName', header: 'Empfänger', accessor: (row) => row.rechnungsempfaenger?.businessName || 'N/A' },
    { field: 'gesamtbetrag', header: 'Gesamtbetrag', type: 'currency' },
    { field: 'nettobetrag', header: 'Nettobetrag', type: 'currency' },
    { field: 'mwstBetrag', header: 'MwSt.', type: 'currency' },
    { field: 'status', header: 'Status', type: 'text' },
    { field: 'faelligkeitsdatum', header: 'Fällig', type: 'date' }
  ]
};

/**
 * Transform nested object to flat structure for export
 * @param {Object} obj - Object to flatten
 * @param {string} prefix - Prefix for keys
 * @returns {Object} Flattened object
 */
export const flattenObject = (obj, prefix = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(acc, flattenObject(value, newKey));
    } else {
      acc[newKey] = value;
    }

    return acc;
  }, {});
};

/**
 * Sanitize data for export (remove sensitive fields)
 * @param {Array} data - Data to sanitize
 * @param {Array} sensitiveFields - Fields to remove
 * @returns {Array} Sanitized data
 */
export const sanitizeExportData = (data, sensitiveFields = ['password', 'token', 'secret']) => {
  if (!data || !Array.isArray(data)) return [];

  return data.map(item => {
    const sanitized = { ...item };
    sensitiveFields.forEach(field => {
      delete sanitized[field];
    });
    return sanitized;
  });
};

/**
 * Get summary row for export data
 * @param {Array} data - Data array
 * @param {Object} config - Summary configuration
 * @returns {Object} Summary row
 */
export const createSummaryRow = (data, config) => {
  const summary = { ...config.labels };

  Object.keys(config.calculations).forEach(field => {
    const calculation = config.calculations[field];
    const values = data.map(row => Number(row[field]) || 0);

    if (calculation === 'sum') {
      summary[field] = values.reduce((sum, val) => sum + val, 0);
    } else if (calculation === 'avg') {
      summary[field] = values.reduce((sum, val) => sum + val, 0) / values.length;
    } else if (calculation === 'count') {
      summary[field] = values.length;
    } else if (calculation === 'min') {
      summary[field] = Math.min(...values);
    } else if (calculation === 'max') {
      summary[field] = Math.max(...values);
    }
  });

  return summary;
};
