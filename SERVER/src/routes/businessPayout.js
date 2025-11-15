// routes/businessPayout.js
// İşletme ödeme dağıtımı route'ları

"use strict";

const router = require('express').Router();
const {
    getPendingPayments,
    getFinancialSummary,
    getPayoutHistory,
    getAllPendingPayments,
    createPayout,
    completePayout,
    getMonthlySummary,
    getBusinessesWithPayouts,
} = require('../controller/businessPayout');
const { isLogin, isAdmin, isOwner } = require('../middleware/permissions');

// URL: /business-payouts

// ✅ Owner route'ları
router.get('/my-pending', isLogin, getPendingPayments);
router.get('/my-summary', isLogin, getFinancialSummary);
router.get('/my-history', isLogin, getPayoutHistory);

// ✅ Admin route'ları
router.get('/all-pending', isAdmin, getAllPendingPayments);
router.get('/businesses-with-payouts', isAdmin, getBusinessesWithPayouts);
router.get('/monthly-summary', isAdmin, getMonthlySummary);
router.post('/create', isAdmin, createPayout);
router.patch('/:payoutId/complete', isAdmin, completePayout);

module.exports = router;

