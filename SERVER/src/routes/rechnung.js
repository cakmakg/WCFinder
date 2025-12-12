"use strict";
/* -------------------------------------------------------
    Rechnung Routes - Deutsche Rechnungen
    §14 UStG, EN 16931, XRechnung 3.0, GoBD Konform
------------------------------------------------------- */

const router = require('express').Router();
const {
    list,
    read,
    createForPayout,
    createFromMonthlyReport,
    recordPayment,
    downloadPDF,
    downloadXRechnung,
    validateXRechnung,
    updateStatus,
    registerPayment,
    getPayments,
    createStorno,
    resendEmail,
    regeneratePDF,
    regenerateXRechnung,
    getStatistics,
    getUnitCodes,
    getInvoiceTypes,
    getInvoiceStatuses,
    getAuditLog,
    deletee,
} = require('../controller/rechnung');
const { isLogin, isAdmin, isOwnerOrAdmin } = require('../middleware/permissions');
const {
    createForPayoutValidation,
    statusUpdateValidation,
    paymentValidation,
    stornoValidation,
    listValidation,
    idParamValidation
} = require('../middleware/rechnungValidation');

// URL: /rechnungen

// ============================================
// METADATA ENDPOINTS (No Auth for some)
// ============================================

// ✅ UN/ECE Recommendation 20 Birim Kodları
router.get('/unit-codes', getUnitCodes);

// ✅ Fatura Türleri
router.get('/invoice-types', getInvoiceTypes);

// ✅ Fatura Durumları
router.get('/invoice-statuses', getInvoiceStatuses);

// ============================================
// LISTE & STATISTIKEN
// ============================================

// ✅ Liste (Admin ve Owner) - with validation
router.get('/', isLogin, listValidation, list);

// ✅ İstatistikler (Admin)
router.get('/statistics', isAdmin, getStatistics);

// ============================================
// RECHNUNG ERSTELLEN
// ============================================

// ✅ MonthlyReport için Rechnung oluştur (Admin) - DOĞRU AKIŞ
router.post('/create-from-monthly-report', isAdmin, createFromMonthlyReport);

// ✅ Payout için Rechnung oluştur (Admin) - ESKİ YÖNTEM (opsiyonel)
router.post('/create-for-payout', isAdmin, createForPayoutValidation, createForPayout);

// ✅ Zahlung erfassen ve Payout oluştur (Admin) - DOĞRU AKIŞ
router.post('/:id/record-payment', isAdmin, idParamValidation, recordPayment);

// ============================================
// DOWNLOAD ENDPOINTS
// ============================================

// ✅ PDF indir (Admin ve Owner)
router.get('/:id/download', isLogin, idParamValidation, downloadPDF);

// ✅ XRechnung XML indir (EN 16931 / XRechnung 3.0) - (Admin ve Owner)
router.get('/:id/xrechnung', isLogin, idParamValidation, downloadXRechnung);

// ============================================
// VALIDIERUNG & AUDIT
// ============================================

// ✅ XRechnung validieren (Admin)
router.get('/:id/validate', isAdmin, idParamValidation, validateXRechnung);

// ✅ Audit Log (GoBD Compliant) - (Admin)
router.get('/:id/audit-log', isAdmin, idParamValidation, getAuditLog);

// ============================================
// ZAHLUNGEN (PAYMENTS) - NEU
// ============================================

// ✅ Zahlungsverlauf (Admin)
router.get('/:id/payments', isAdmin, idParamValidation, getPayments);

// ✅ Zahlung registrieren (Admin) - with validation
router.post('/:id/payments', isAdmin, idParamValidation, paymentValidation, registerPayment);

// ============================================
// RECHNUNG DETAY
// ============================================

// ✅ Rechnung detayı (Admin ve Owner)
router.get('/:id', isLogin, idParamValidation, read);

// ============================================
// STATUS & AKTIONEN
// ============================================

// ✅ Durum güncelle (Admin) - with validation
router.patch('/:id/status', isAdmin, idParamValidation, statusUpdateValidation, updateStatus);

// ✅ Storno erstellen (Gutschrift) - (Admin) - with validation
router.post('/:id/storno', isAdmin, idParamValidation, stornoValidation, createStorno);

// ✅ Email yeniden gönder (Admin)
router.post('/:id/resend-email', isAdmin, idParamValidation, resendEmail);

// ✅ PDF yeniden oluştur (Admin)
router.post('/:id/regenerate-pdf', isAdmin, idParamValidation, regeneratePDF);

// ✅ XRechnung XML yeniden oluştur (Admin)
router.post('/:id/regenerate-xrechnung', isAdmin, idParamValidation, regenerateXRechnung);

// ============================================
// DELETE (GoBD COMPLIANT)
// ============================================

// ✅ Silme (Admin - sadece entwurf)
router.delete('/:id', isAdmin, idParamValidation, deletee);

module.exports = router;
