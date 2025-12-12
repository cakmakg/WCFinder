// features/admin/services/invoiceService.js
// Rechnung (Invoice) API services - §14 UStG, EN 16931, XRechnung 3.0 Compliant

import apiClient from "../../../shared/utils/apiClient";

// Fatura Türleri
export const INVOICE_TYPES = {
  INVOICE: 'invoice',
  CREDIT_NOTE: 'credit_note',
  CORRECTED: 'corrected_invoice',
  ADVANCE: 'advance_invoice'
};

// Fatura Durumları
export const INVOICE_STATUS = {
  ENTWURF: 'entwurf',
  VERSENDET: 'versendet',
  ANGESEHEN: 'angesehen',
  TEILBEZAHLT: 'teilbezahlt',
  BEZAHLT: 'bezahlt',
  UEBERFAELLIG: 'ueberfaellig',
  MAHNUNG: 'mahnung',
  STORNIERT: 'storniert',
  ANGEFOCHTEN: 'angefochten'
};

export const invoiceService = {
  // ============ INVOICE CRUD ============

  /**
   * Get all invoices (Admin/Owner)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.status - Filter by status
   * @param {string} params.from - Filter from date
   * @param {string} params.to - Filter to date
   * @param {string} params.rechnungstyp - Filter by invoice type
   * @returns {Promise} Invoices list
   */
  getInvoices: async (params = {}) => {
    const response = await apiClient.get("/rechnungen", { params });
    return response.data;
  },

  /**
   * Get invoice statistics (Admin only)
   * @returns {Promise} Invoice statistics
   */
  getInvoiceStatistics: async () => {
    const response = await apiClient.get("/rechnungen/statistics");
    return response.data;
  },

  /**
   * Get UN/ECE Recommendation 20 Unit Codes
   * @returns {Promise} Unit codes
   */
  getUnitCodes: async () => {
    const response = await apiClient.get("/rechnungen/unit-codes");
    return response.data;
  },

  /**
   * Get Invoice Types
   * @returns {Promise} Invoice types
   */
  getInvoiceTypes: async () => {
    const response = await apiClient.get("/rechnungen/invoice-types");
    return response.data;
  },

  /**
   * Get Invoice Statuses
   * @returns {Promise} Invoice statuses
   */
  getInvoiceStatuses: async () => {
    const response = await apiClient.get("/rechnungen/invoice-statuses");
    return response.data;
  },

  /**
   * Create invoice for payout (Admin only)
   * @param {string} payoutId - Payout ID
   * @param {Object} options - Additional options
   * @param {boolean} options.kleinunternehmer - Use §19 UStG (no VAT)
   * @returns {Promise} Created invoice
   */
  createInvoiceForPayout: async (payoutId, options = {}) => {
    const response = await apiClient.post("/rechnungen/create-for-payout", {
      payoutId,
      kleinunternehmer: options.kleinunternehmer || false,
      ...options
    });
    return response.data;
  },

  /**
   * Get single invoice by ID
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Invoice data
   */
  getInvoiceById: async (invoiceId) => {
    const response = await apiClient.get(`/rechnungen/${invoiceId}`);
    return response.data;
  },

  /**
   * Download invoice PDF
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Blob>} PDF blob
   */
  downloadInvoicePDF: async (invoiceId) => {
    const response = await apiClient.get(`/rechnungen/${invoiceId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Download XRechnung XML (EN 16931 / XRechnung 3.0)
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise<Blob>} XML blob
   */
  downloadXRechnung: async (invoiceId) => {
    const response = await apiClient.get(`/rechnungen/${invoiceId}/xrechnung`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Validate XRechnung structure
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Validation result
   */
  validateXRechnung: async (invoiceId) => {
    const response = await apiClient.get(`/rechnungen/${invoiceId}/validate`);
    return response.data;
  },

  /**
   * Get invoice audit log (GoBD Compliant)
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Audit log
   */
  getAuditLog: async (invoiceId) => {
    const response = await apiClient.get(`/rechnungen/${invoiceId}/audit-log`);
    return response.data;
  },

  /**
   * Update invoice status (Admin only)
   * @param {string} invoiceId - Invoice ID
   * @param {string} status - New status
   * @param {string} details - Optional details for audit log
   * @returns {Promise} Updated invoice
   */
  updateInvoiceStatus: async (invoiceId, status, details = null) => {
    const response = await apiClient.patch(`/rechnungen/${invoiceId}/status`, {
      status,
      details
    });
    return response.data;
  },

  // ============ PAYMENTS (NEU) ============

  /**
   * Get payment history for invoice
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Payment history
   */
  getPayments: async (invoiceId) => {
    const response = await apiClient.get(`/rechnungen/${invoiceId}/payments`);
    return response.data;
  },

  /**
   * Register payment for invoice (Admin only)
   * @param {string} invoiceId - Invoice ID
   * @param {Object} paymentData - Payment details
   * @param {number} paymentData.betrag - Payment amount
   * @param {string} paymentData.zahlungsdatum - Payment date (ISO)
   * @param {string} paymentData.zahlungsmethode - Payment method
   * @param {string} paymentData.transaktionsreferenz - Transaction reference
   * @param {string} paymentData.notizen - Notes
   * @returns {Promise} Updated invoice with payment
   */
  registerPayment: async (invoiceId, paymentData) => {
    const response = await apiClient.post(`/rechnungen/${invoiceId}/payments`, paymentData);
    return response.data;
  },

  /**
   * Create Storno (Credit Note) for invoice (Admin only)
   * @param {string} invoiceId - Invoice ID to cancel
   * @param {string} grund - Reason for cancellation
   * @returns {Promise} Storno invoice
   */
  createStorno: async (invoiceId, grund) => {
    const response = await apiClient.post(`/rechnungen/${invoiceId}/storno`, {
      grund
    });
    return response.data;
  },

  /**
   * Resend invoice email (Admin only)
   * @param {string} invoiceId - Invoice ID
   * @param {string} email - Optional override email
   * @returns {Promise} Success response
   */
  resendInvoiceEmail: async (invoiceId, email = null) => {
    const response = await apiClient.post(`/rechnungen/${invoiceId}/resend-email`, {
      email
    });
    return response.data;
  },

  /**
   * Regenerate invoice PDF (Admin only)
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Updated invoice
   */
  regenerateInvoicePDF: async (invoiceId) => {
    const response = await apiClient.post(`/rechnungen/${invoiceId}/regenerate-pdf`);
    return response.data;
  },

  /**
   * Regenerate XRechnung XML (Admin only)
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Updated invoice
   */
  regenerateXRechnung: async (invoiceId) => {
    const response = await apiClient.post(`/rechnungen/${invoiceId}/regenerate-xrechnung`);
    return response.data;
  },

  /**
   * Delete invoice (Admin only - only draft invoices)
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} Success response
   */
  deleteInvoice: async (invoiceId) => {
    const response = await apiClient.delete(`/rechnungen/${invoiceId}`);
    return response.data;
  },

  // ============ HELPER METHODS ============

  /**
   * Get invoice status display properties
   * @param {string} status - Invoice status
   * @returns {Object} { label, color, icon, description }
   */
  getInvoiceStatusDisplay: (status) => {
    const statusMap = {
      entwurf: { label: 'Entwurf', color: 'default', description: 'Rechnung ist noch nicht versendet' },
      versendet: { label: 'Versendet', color: 'info', description: 'Rechnung wurde versendet' },
      angesehen: { label: 'Angesehen', color: 'info', description: 'Rechnung wurde vom Kunden angesehen' },
      teilbezahlt: { label: 'Teilbezahlt', color: 'warning', description: 'Rechnung wurde teilweise bezahlt' },
      bezahlt: { label: 'Bezahlt', color: 'success', description: 'Rechnung wurde vollständig bezahlt' },
      ueberfaellig: { label: 'Überfällig', color: 'error', description: 'Zahlungsfrist überschritten' },
      mahnung: { label: 'Mahnung', color: 'warning', description: 'Mahnung versendet' },
      storniert: { label: 'Storniert', color: 'default', description: 'Rechnung wurde storniert' },
      angefochten: { label: 'Angefochten', color: 'error', description: 'Rechnung wird angefochten' }
    };
    return statusMap[status] || { label: status, color: 'default', description: '' };
  },

  /**
   * Get invoice type display
   * @param {string} type - Invoice type
   * @returns {Object} { label, color }
   */
  getInvoiceTypeDisplay: (type) => {
    const typeMap = {
      invoice: { label: 'Rechnung', color: 'primary' },
      credit_note: { label: 'Gutschrift', color: 'warning' },
      corrected_invoice: { label: 'Korrekturrechnung', color: 'info' },
      advance_invoice: { label: 'Anzahlungsrechnung', color: 'secondary' }
    };
    return typeMap[type] || { label: type, color: 'default' };
  },

  /**
   * Get available next statuses based on current status
   * Following GoBD compliance rules
   * @param {string} currentStatus - Current invoice status
   * @returns {Array} Available next statuses
   */
  getAvailableStatuses: (currentStatus) => {
    const statusFlow = {
      entwurf: ['versendet'],
      versendet: ['angesehen', 'teilbezahlt', 'bezahlt', 'ueberfaellig', 'mahnung', 'storniert', 'angefochten'],
      angesehen: ['teilbezahlt', 'bezahlt', 'ueberfaellig', 'mahnung', 'storniert', 'angefochten'],
      teilbezahlt: ['bezahlt', 'ueberfaellig', 'mahnung', 'storniert', 'angefochten'],
      ueberfaellig: ['teilbezahlt', 'bezahlt', 'mahnung', 'storniert', 'angefochten'],
      mahnung: ['teilbezahlt', 'bezahlt', 'storniert', 'angefochten'],
      angefochten: ['teilbezahlt', 'bezahlt', 'storniert'],
      bezahlt: [], // Final state
      storniert: ['entwurf'] // Can only be reset to draft
    };
    return statusFlow[currentStatus] || [];
  },

  /**
   * Get available payment methods
   * @returns {Array} Payment methods
   */
  getPaymentMethods: () => [
    { value: 'bank_transfer', label: 'Überweisung', labelDe: 'Banküberweisung' },
    { value: 'cash', label: 'Bar', labelDe: 'Barzahlung' },
    { value: 'credit_card', label: 'Kreditkarte', labelDe: 'Kreditkarte' },
    { value: 'paypal', label: 'PayPal', labelDe: 'PayPal' },
    { value: 'other', label: 'Sonstige', labelDe: 'Sonstige' }
  ],

  /**
   * Check if invoice can be edited
   * @param {string} status - Invoice status
   * @returns {boolean}
   */
  canEditInvoice: (status) => {
    return status === 'entwurf';
  },

  /**
   * Check if invoice can be deleted (GoBD: only drafts)
   * @param {string} status - Invoice status
   * @returns {boolean}
   */
  canDeleteInvoice: (status) => {
    return status === 'entwurf';
  },

  /**
   * Check if invoice can be cancelled (Storno)
   * @param {string} status - Invoice status
   * @returns {boolean}
   */
  canCancelInvoice: (status) => {
    return ['versendet', 'angesehen', 'teilbezahlt', 'ueberfaellig', 'mahnung', 'angefochten'].includes(status);
  },

  /**
   * Check if payment can be registered
   * @param {string} status - Invoice status
   * @returns {boolean}
   */
  canRegisterPayment: (status) => {
    return ['versendet', 'angesehen', 'teilbezahlt', 'ueberfaellig', 'mahnung'].includes(status);
  },

  /**
   * Check if invoice can be sent
   * @param {string} status - Invoice status
   * @returns {boolean}
   */
  canSendInvoice: (status) => {
    return status === 'entwurf' || status === 'storniert';
  },

  /**
   * Check if invoice is overdue
   * @param {Object} invoice - Invoice object
   * @returns {boolean}
   */
  isInvoiceOverdue: (invoice) => {
    if (!invoice.faelligkeitsdatum || invoice.status === 'bezahlt') return false;

    const dueDate = new Date(invoice.faelligkeitsdatum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dueDate < today && !['bezahlt', 'storniert'].includes(invoice.status);
  },

  /**
   * Calculate days until due / overdue
   * @param {Object} invoice - Invoice object
   * @returns {number} Days (positive = days until due, negative = days overdue)
   */
  getDaysUntilDue: (invoice) => {
    if (!invoice.faelligkeitsdatum) return null;

    const dueDate = new Date(invoice.faelligkeitsdatum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },

  /**
   * Format invoice number
   * @param {string} rechnungsnummer - Invoice number
   * @returns {string} Formatted invoice number
   */
  formatInvoiceNumber: (rechnungsnummer) => {
    if (!rechnungsnummer) return 'N/A';
    return rechnungsnummer;
  },

  /**
   * Calculate invoice totals
   * @param {Array} positionen - Invoice items
   * @param {number} mwstSatz - VAT rate (default: 19)
   * @param {boolean} kleinunternehmer - Is Kleinunternehmer (§19 UStG)
   * @returns {Object} { nettobetrag, mwstBetrag, gesamtbetrag }
   */
  calculateInvoiceTotals: (positionen, mwstSatz = 19, kleinunternehmer = false) => {
    if (!positionen || !Array.isArray(positionen)) {
      return {
        nettobetrag: 0,
        mwstBetrag: 0,
        gesamtbetrag: 0
      };
    }

    const nettobetrag = positionen.reduce((sum, item) => {
      return sum + (Number(item.gesamtpreis) || 0);
    }, 0);

    // §19 UStG: No VAT for Kleinunternehmer
    const mwstBetrag = kleinunternehmer ? 0 : (nettobetrag * mwstSatz) / 100;
    const gesamtbetrag = nettobetrag + mwstBetrag;

    return {
      nettobetrag: Number(nettobetrag.toFixed(2)),
      mwstBetrag: Number(mwstBetrag.toFixed(2)),
      gesamtbetrag: Number(gesamtbetrag.toFixed(2))
    };
  },

  /**
   * Validate invoice data (§14 UStG compliance)
   * @param {Object} invoiceData - Invoice data
   * @returns {Object} { valid: boolean, errors: Array }
   */
  validateInvoiceData: (invoiceData) => {
    const errors = [];

    // §14 Abs. 4 Nr. 4 UStG - Rechnungsnummer
    if (!invoiceData.rechnungsnummer) {
      errors.push('Rechnungsnummer ist erforderlich (§14 Abs. 4 Nr. 4 UStG)');
    }

    // §14 Abs. 4 Nr. 1 UStG - Rechnungsdatum
    if (!invoiceData.rechnungsdatum) {
      errors.push('Rechnungsdatum ist erforderlich (§14 Abs. 4 Nr. 1 UStG)');
    }

    // Fälligkeitsdatum
    if (!invoiceData.faelligkeitsdatum) {
      errors.push('Fälligkeitsdatum ist erforderlich');
    }

    // §14 Abs. 4 Nr. 1 UStG - Empfänger
    if (!invoiceData.rechnungsempfaenger || !invoiceData.rechnungsempfaenger.businessId) {
      errors.push('Rechnungsempfänger ist erforderlich (§14 Abs. 4 Nr. 1 UStG)');
    }

    // §14 Abs. 4 Nr. 5 UStG - Positionen
    if (!invoiceData.positionen || invoiceData.positionen.length === 0) {
      errors.push('Mindestens eine Position ist erforderlich (§14 Abs. 4 Nr. 5 UStG)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate German IBAN
   * @param {string} iban - IBAN to validate
   * @returns {boolean}
   */
  validateGermanIBAN: (iban) => {
    if (!iban) return false;
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    return /^DE[0-9]{20}$/.test(cleanIBAN);
  },

  /**
   * Validate BIC
   * @param {string} bic - BIC to validate
   * @returns {boolean}
   */
  validateBIC: (bic) => {
    if (!bic) return false;
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.toUpperCase());
  },

  /**
   * Validate German USt-IdNr
   * @param {string} ustIdNr - USt-IdNr to validate
   * @returns {boolean}
   */
  validateUStIdNr: (ustIdNr) => {
    if (!ustIdNr) return true; // Optional
    return /^DE[0-9]{9}$/.test(ustIdNr.toUpperCase());
  },

  /**
   * Validate German PLZ
   * @param {string} plz - PLZ to validate
   * @returns {boolean}
   */
  validateGermanPLZ: (plz) => {
    if (!plz) return false;
    return /^\d{5}$/.test(plz);
  },

  /**
   * Group invoices by status
   * @param {Array} invoices - Array of invoices
   * @returns {Object} Grouped invoices
   */
  groupInvoicesByStatus: (invoices) => {
    if (!invoices || !Array.isArray(invoices)) return {};

    return invoices.reduce((acc, invoice) => {
      const status = invoice.status || 'entwurf';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(invoice);
      return acc;
    }, {});
  },

  /**
   * Calculate invoice statistics
   * @param {Array} invoices - Array of invoices
   * @returns {Object} Statistics
   */
  calculateInvoiceStats: (invoices) => {
    if (!invoices || !Array.isArray(invoices)) {
      return {
        total: 0,
        totalAmount: 0,
        paid: 0,
        paidAmount: 0,
        pending: 0,
        pendingAmount: 0,
        overdue: 0,
        overdueAmount: 0,
        partiallyPaid: 0,
        partiallyPaidAmount: 0,
        draft: 0,
        cancelled: 0,
        xrechnungCount: 0
      };
    }

    const stats = {
      total: invoices.length,
      totalAmount: 0,
      paid: 0,
      paidAmount: 0,
      pending: 0,
      pendingAmount: 0,
      overdue: 0,
      overdueAmount: 0,
      partiallyPaid: 0,
      partiallyPaidAmount: 0,
      draft: 0,
      cancelled: 0,
      xrechnungCount: 0
    };

    invoices.forEach(invoice => {
      const amount = Number(invoice.gesamtbetrag) || 0;
      stats.totalAmount += amount;

      switch (invoice.status) {
        case 'bezahlt':
          stats.paid++;
          stats.paidAmount += amount;
          break;
        case 'versendet':
        case 'angesehen':
          stats.pending++;
          stats.pendingAmount += amount;
          break;
        case 'teilbezahlt':
          stats.partiallyPaid++;
          stats.partiallyPaidAmount += invoice.offenerBetrag || amount;
          break;
        case 'ueberfaellig':
        case 'mahnung':
        case 'angefochten':
          stats.overdue++;
          stats.overdueAmount += invoice.offenerBetrag || amount;
          break;
        case 'entwurf':
          stats.draft++;
          break;
        case 'storniert':
          stats.cancelled++;
          break;
      }

      // XRechnung count
      if (invoice.xrechnung?.xmlGeneriert) {
        stats.xrechnungCount++;
      }
    });

    return stats;
  },

  /**
   * Download invoice and trigger browser download
   * @param {string} invoiceId - Invoice ID
   * @param {string} filename - Filename (optional)
   */
  downloadAndSaveInvoice: async (invoiceId, filename = null) => {
    try {
      const blob = await invoiceService.downloadInvoicePDF(invoiceId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `rechnung_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  },

  /**
   * Download XRechnung XML and trigger browser download
   * @param {string} invoiceId - Invoice ID
   * @param {string} filename - Filename (optional)
   */
  downloadAndSaveXRechnung: async (invoiceId, filename = null) => {
    try {
      const blob = await invoiceService.downloadXRechnung(invoiceId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `xrechnung_${invoiceId}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error downloading XRechnung:', error);
      throw error;
    }
  }
};

export default invoiceService;
