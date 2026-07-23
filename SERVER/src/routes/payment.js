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
    paypalRedirect,
    confirmStripePayment,
    stripeWebhook,
    refundPayment,
    myPayments
} = require('../controller/payment');
const { isLogin, isAdmin } = require('../middleware/permissions');
const paymentLimiter = require('../middleware/paymentRateLimit');

// URL: /payments

// ✅ YENİ: Webhook (Auth bypass gerekli - Stripe/PayPal'dan geliyor)
router.post('/webhook/stripe', stripeWebhook);

// ✅ YENİ: PayPal redirect köprüsü (Auth bypass - alıcının tarayıcısından geliyor)
// PayPal onay/iptal sonrası buraya döner, buradan uygulama deep-link'ine 302 yapılır.
router.get('/paypal/redirect', paypalRedirect);

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