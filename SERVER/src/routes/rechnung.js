"use strict";
/* -------------------------------------------------------
    Rechnung Routes - Deutsche Rechnungen
------------------------------------------------------- */

const router = require('express').Router();
const {
    list,
    read,
    createForPayout,
    downloadPDF,
    updateStatus,
    resendEmail,
    regeneratePDF,
    getStatistics,
    deletee,
} = require('../controller/rechnung');
const { isLogin, isAdmin, isOwnerOrAdmin } = require('../middleware/permissions');

// URL: /rechnungen

// ✅ Liste (Admin ve Owner)
router.get('/', isLogin, list);

// ✅ İstatistikler (Admin)
router.get('/statistics', isAdmin, getStatistics);

// ✅ Payout için Rechnung oluştur (Admin)
router.post('/create-for-payout', isAdmin, createForPayout);

// ✅ PDF indir (Admin ve Owner)
router.get('/:id/download', isLogin, downloadPDF);

// ✅ Rechnung detayı (Admin ve Owner)
router.get('/:id', isLogin, read);

// ✅ Durum güncelle (Admin)
router.patch('/:id/status', isAdmin, updateStatus);

// ✅ Email yeniden gönder (Admin)
router.post('/:id/resend-email', isAdmin, resendEmail);

// ✅ PDF yeniden oluştur (Admin)
router.post('/:id/regenerate-pdf', isAdmin, regeneratePDF);

// ✅ Silme (Admin - sadece entwurf)
router.delete('/:id', isAdmin, deletee);

module.exports = router;

