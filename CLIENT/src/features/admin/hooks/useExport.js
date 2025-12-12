// features/admin/hooks/useExport.js
// Custom hook for export functionality

import { useState, useCallback } from 'react';
import { exportService } from '../services/exportService';
import { toast } from 'react-toastify';

/**
 * Custom hook for exporting data
 * @returns {Object} Export state and handlers
 */
export const useExport = () => {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Export data in specified format
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @param {Object} options - Export options
   */
  const exportData = useCallback(async (data, columns, options = {}) => {
    const {
      format = 'excel',
      filename = 'export',
      title = 'Export',
      showToast = true
    } = options;

    setExporting(true);
    setError(null);

    try {
      let result;

      switch (format) {
        case 'excel':
          result = exportService.exportToExcel(data, columns, filename, options);
          break;

        case 'pdf':
          result = exportService.exportToPDF(data, columns, title, filename, options);
          break;

        case 'csv':
          result = exportService.exportToCSV(data, columns, filename);
          break;

        default:
          throw new Error(`Unbekanntes Format: ${format}`);
      }

      if (showToast) {
        toast.success(`Export erfolgreich: ${result.filename}`);
      }

      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);

      if (showToast) {
        toast.error(errorMsg);
      }

      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Export payments data
   */
  const exportPayments = useCallback(async (payments, format = 'excel') => {
    setExporting(true);
    setError(null);

    try {
      const result = exportService.exportPayments(payments, format);
      toast.success(`Zahlungen exportiert: ${result.filename}`);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Export bookings data
   */
  const exportBookings = useCallback(async (bookings, format = 'excel') => {
    setExporting(true);
    setError(null);

    try {
      const result = exportService.exportBookings(bookings, format);
      toast.success(`Buchungen exportiert: ${result.filename}`);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Export businesses data
   */
  const exportBusinesses = useCallback(async (businesses, format = 'excel') => {
    setExporting(true);
    setError(null);

    try {
      const result = exportService.exportBusinesses(businesses, format);
      toast.success(`Geschäfte exportiert: ${result.filename}`);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Export payouts data
   */
  const exportPayouts = useCallback(async (payouts, format = 'excel') => {
    setExporting(true);
    setError(null);

    try {
      const result = exportService.exportPayouts(payouts, format);
      toast.success(`Auszahlungen exportiert: ${result.filename}`);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Export invoices data
   */
  const exportInvoices = useCallback(async (invoices, format = 'excel') => {
    setExporting(true);
    setError(null);

    try {
      const result = exportService.exportInvoices(invoices, format);
      toast.success(`Rechnungen exportiert: ${result.filename}`);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Export monthly report
   */
  const exportMonthlyReport = useCallback(async (reportData, month) => {
    setExporting(true);
    setError(null);

    try {
      const result = exportService.exportMonthlyReport(reportData, month);
      toast.success(`Monatsbericht exportiert: ${result.filename}`);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Export multiple sheets to Excel
   */
  const exportMultipleSheets = useCallback(async (sheets, filename = 'export') => {
    setExporting(true);
    setError(null);

    try {
      const result = exportService.exportMultipleSheetsToExcel(sheets, filename);
      toast.success(`Daten exportiert: ${result.filename}`);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Export fehlgeschlagen';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    exporting,
    error,

    // Generic export
    exportData,

    // Predefined exports
    exportPayments,
    exportBookings,
    exportBusinesses,
    exportPayouts,
    exportInvoices,
    exportMonthlyReport,
    exportMultipleSheets,

    // Utilities
    clearError
  };
};

export default useExport;
