// features/admin/services/exportService.js
// Excel, PDF, CSV export services

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { prepareExportData, getExportFilename, EXPORT_COLUMNS } from '../utils/exportHelpers';

export const exportService = {
  // ============ EXCEL EXPORT ============

  /**
   * Export data to Excel file
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @param {string} filename - Base filename
   * @param {Object} options - Export options
   */
  exportToExcel: (data, columns, filename = 'export', options = {}) => {
    try {
      // Prepare data for export
      const exportData = prepareExportData(data, columns);

      if (exportData.length === 0) {
        throw new Error('Keine Daten zum Exportieren vorhanden');
      }

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Set column widths
      const columnWidths = columns.map(col => ({
        wch: col.width || 20
      }));
      ws['!cols'] = columnWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Daten');

      // Add summary sheet if provided
      if (options.summary) {
        const summaryWs = XLSX.utils.json_to_sheet([options.summary]);
        XLSX.utils.book_append_sheet(wb, summaryWs, 'Zusammenfassung');
      }

      // Generate filename with timestamp
      const fullFilename = getExportFilename(filename, 'xlsx');

      // Write file
      XLSX.writeFile(wb, fullFilename);

      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error(`Excel Export fehlgeschlagen: ${error.message}`);
    }
  },

  /**
   * Export multiple sheets to Excel
   * @param {Array} sheets - Array of { name, data, columns }
   * @param {string} filename - Base filename
   */
  exportMultipleSheetsToExcel: (sheets, filename = 'export') => {
    try {
      const wb = XLSX.utils.book_new();

      sheets.forEach(sheet => {
        const exportData = prepareExportData(sheet.data, sheet.columns);
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Set column widths
        if (sheet.columns) {
          const columnWidths = sheet.columns.map(col => ({
            wch: col.width || 20
          }));
          ws['!cols'] = columnWidths;
        }

        XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Sheet');
      });

      const fullFilename = getExportFilename(filename, 'xlsx');
      XLSX.writeFile(wb, fullFilename);

      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error('Multi-sheet Excel export error:', error);
      throw new Error(`Excel Export fehlgeschlagen: ${error.message}`);
    }
  },

  // ============ PDF EXPORT ============

  /**
   * Export data to PDF file
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @param {string} title - PDF title
   * @param {string} filename - Base filename
   * @param {Object} options - Export options
   */
  exportToPDF: (data, columns, title = 'Export', filename = 'export', options = {}) => {
    try {
      // Prepare data for export
      const exportData = prepareExportData(data, columns);

      if (exportData.length === 0) {
        throw new Error('Keine Daten zum Exportieren vorhanden');
      }

      // Create PDF document
      const doc = new jsPDF(options.orientation || 'landscape');

      // Add title
      doc.setFontSize(16);
      doc.text(title, 14, 20);

      // Add date
      doc.setFontSize(10);
      const dateStr = new Date().toLocaleDateString('de-DE');
      doc.text(`Erstellt am: ${dateStr}`, 14, 28);

      // Prepare table headers and body
      const headers = columns.map(col => col.header);
      const body = exportData.map(row =>
        columns.map(col => row[col.header] || '')
      );

      // Add table
      doc.autoTable({
        head: [headers],
        body: body,
        startY: 35,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [8, 145, 178], // Primary color
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        ...options.tableOptions
      });

      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Seite ${i} von ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Generate filename
      const fullFilename = getExportFilename(filename, 'pdf');

      // Save PDF
      doc.save(fullFilename);

      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error(`PDF Export fehlgeschlagen: ${error.message}`);
    }
  },

  // ============ CSV EXPORT ============

  /**
   * Export data to CSV file
   * @param {Array} data - Data to export
   * @param {Array} columns - Column definitions
   * @param {string} filename - Base filename
   */
  exportToCSV: (data, columns, filename = 'export') => {
    try {
      // Prepare data for export
      const exportData = prepareExportData(data, columns);

      if (exportData.length === 0) {
        throw new Error('Keine Daten zum Exportieren vorhanden');
      }

      // Create worksheet and convert to CSV
      const ws = XLSX.utils.json_to_sheet(exportData);
      const csv = XLSX.utils.sheet_to_csv(ws);

      // Create blob
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

      // Generate filename
      const fullFilename = getExportFilename(filename, 'csv');

      // Download
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fullFilename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      return { success: true, filename: fullFilename };
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error(`CSV Export fehlgeschlagen: ${error.message}`);
    }
  },

  // ============ PREDEFINED EXPORTS ============

  /**
   * Export payments data
   * @param {Array} payments - Payments array
   * @param {string} format - Export format ('excel', 'pdf', 'csv')
   */
  exportPayments: (payments, format = 'excel') => {
    const columns = EXPORT_COLUMNS.payments;
    const filename = 'zahlungen';
    const title = 'Zahlungen Export';

    switch (format) {
      case 'excel':
        return exportService.exportToExcel(payments, columns, filename);
      case 'pdf':
        return exportService.exportToPDF(payments, columns, title, filename);
      case 'csv':
        return exportService.exportToCSV(payments, columns, filename);
      default:
        throw new Error('Unbekanntes Export-Format');
    }
  },

  /**
   * Export bookings data
   * @param {Array} bookings - Bookings array
   * @param {string} format - Export format
   */
  exportBookings: (bookings, format = 'excel') => {
    const columns = EXPORT_COLUMNS.bookings;
    const filename = 'buchungen';
    const title = 'Buchungen Export';

    switch (format) {
      case 'excel':
        return exportService.exportToExcel(bookings, columns, filename);
      case 'pdf':
        return exportService.exportToPDF(bookings, columns, title, filename);
      case 'csv':
        return exportService.exportToCSV(bookings, columns, filename);
      default:
        throw new Error('Unbekanntes Export-Format');
    }
  },

  /**
   * Export businesses data
   * @param {Array} businesses - Businesses array
   * @param {string} format - Export format
   */
  exportBusinesses: (businesses, format = 'excel') => {
    const columns = EXPORT_COLUMNS.businesses;
    const filename = 'geschaefte';
    const title = 'Geschäfte Export';

    switch (format) {
      case 'excel':
        return exportService.exportToExcel(businesses, columns, filename);
      case 'pdf':
        return exportService.exportToPDF(businesses, columns, title, filename);
      case 'csv':
        return exportService.exportToCSV(businesses, columns, filename);
      default:
        throw new Error('Unbekanntes Export-Format');
    }
  },

  /**
   * Export payouts data
   * @param {Array} payouts - Payouts array
   * @param {string} format - Export format
   */
  exportPayouts: (payouts, format = 'excel') => {
    const columns = EXPORT_COLUMNS.payouts;
    const filename = 'auszahlungen';
    const title = 'Auszahlungen Export';

    switch (format) {
      case 'excel':
        return exportService.exportToExcel(payouts, columns, filename);
      case 'pdf':
        return exportService.exportToPDF(payouts, columns, title, filename);
      case 'csv':
        return exportService.exportToCSV(payouts, columns, filename);
      default:
        throw new Error('Unbekanntes Export-Format');
    }
  },

  /**
   * Export invoices data
   * @param {Array} invoices - Invoices array
   * @param {string} format - Export format
   */
  exportInvoices: (invoices, format = 'excel') => {
    const columns = EXPORT_COLUMNS.invoices;
    const filename = 'rechnungen';
    const title = 'Rechnungen Export';

    switch (format) {
      case 'excel':
        return exportService.exportToExcel(invoices, columns, filename);
      case 'pdf':
        return exportService.exportToPDF(invoices, columns, title, filename);
      case 'csv':
        return exportService.exportToCSV(invoices, columns, filename);
      default:
        throw new Error('Unbekanntes Export-Format');
    }
  },

  // ============ REPORT EXPORTS ============

  /**
   * Export monthly report
   * @param {Object} reportData - Report data
   * @param {string} month - Month label
   */
  exportMonthlyReport: (reportData, month) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.text('Monatsbericht', 14, 20);

      doc.setFontSize(12);
      doc.text(month, 14, 28);

      // Summary section
      doc.setFontSize(14);
      doc.text('Zusammenfassung', 14, 40);

      doc.setFontSize(10);
      let y = 48;

      const summaryItems = [
        { label: 'Gesamtumsatz', value: `${reportData.totalRevenue.toFixed(2)} €` },
        { label: 'Plattformgebühr', value: `${reportData.platformCommission.toFixed(2)} €` },
        { label: 'Geschäftsgebühr', value: `${reportData.businessRevenue.toFixed(2)} €` },
        { label: 'Anzahl Zahlungen', value: reportData.paymentCount },
        { label: 'Anzahl Geschäfte', value: reportData.businessCount }
      ];

      summaryItems.forEach(item => {
        doc.text(`${item.label}:`, 20, y);
        doc.text(String(item.value), 100, y);
        y += 8;
      });

      // Business breakdown table
      if (reportData.businessBreakdown && reportData.businessBreakdown.length > 0) {
        doc.setFontSize(14);
        doc.text('Geschäftsübersicht', 14, y + 10);

        doc.autoTable({
          head: [['Geschäft', 'Umsatz', 'Gebühr', 'Zahlungen']],
          body: reportData.businessBreakdown.map(b => [
            b.businessName,
            `${b.totalRevenue.toFixed(2)} €`,
            `${b.businessFee.toFixed(2)} €`,
            b.paymentCount
          ]),
          startY: y + 18,
          headStyles: {
            fillColor: [8, 145, 178]
          }
        });
      }

      const filename = getExportFilename(`monatsbericht_${month.replace(/\s/g, '_')}`, 'pdf');
      doc.save(filename);

      return { success: true, filename };
    } catch (error) {
      console.error('Monthly report export error:', error);
      throw new Error(`Berichtsexport fehlgeschlagen: ${error.message}`);
    }
  }
};

export default exportService;
