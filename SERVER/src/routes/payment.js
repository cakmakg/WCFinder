// routes/payment.js - GÜNCELLENMİŞ HALİ

"use strict";

const router = require('express').Router();
const { 
    list, 
    read, 
    update, 
    deletee,
    createStripePayment,
    createPayPalOrder,
    capturePayPalOrder,
    confirmStripePayment,
    refundPayment,
    myPayments
} = require('../controller/payment');
const { isLogin, isAdmin } = require('../middleware/permissions');
const paymentLimiter = require('../middleware/paymentRateLimit');

// URL: /payments

// ℹ️ Stripe webhook (/payments/webhook/stripe) index.js'de global body parser'dan
//    ÖNCE express.raw ile mount edilir (imza doğrulaması ham gövde gerektirir).
//    Burada tekrar tanımlanMAZ; aksi halde parse edilmiş gövde imzayı bozar.

// ✅ YENİ: Kullanıcı kendi ödemelerini görebilir
router.get('/my-payments', isLogin, myPayments);

// ✅ YENİ: Ödeme başlatma endpoint'leri (Rate limited)
router.post('/stripe/create', isLogin, paymentLimiter, createStripePayment);
router.post('/stripe/confirm', isLogin, confirmStripePayment); // ✅ YENİ: Payment confirm ve usage oluştur
router.post('/paypal/create', isLogin, paymentLimiter, createPayPalOrder);
router.post('/paypal/capture', isLogin, paymentLimiter, capturePayPalOrder);

// ✅ YENİ: İade endpoint'i
router.post('/:id/refund', isAdmin, refundPayment);

// Admin route'ları
router.route('/')
    .get(isAdmin, list);

router.route('/:id')
    .get(isLogin, read)
    .put(isAdmin, update)
    .patch(isAdmin, update)
    .delete(isAdmin, deletee);

module.exports = router;