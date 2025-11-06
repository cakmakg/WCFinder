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
    stripeWebhook,
    refundPayment,
    myPayments
} = require('../controller/payment');
const { isLogin, isAdmin } = require('../middleware/permissions');

// URL: /payments

// ✅ YENİ: Webhook (Auth bypass gerekli - Stripe/PayPal'dan geliyor)
router.post('/webhook/stripe', stripeWebhook);

// ✅ YENİ: Kullanıcı kendi ödemelerini görebilir
router.get('/my-payments', isLogin, myPayments);

// ✅ YENİ: Ödeme başlatma endpoint'leri
router.post('/stripe/create', isLogin, createStripePayment);
router.post('/paypal/create', isLogin, createPayPalOrder);
router.post('/paypal/capture', isLogin, capturePayPalOrder);

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