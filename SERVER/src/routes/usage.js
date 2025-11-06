// routes/usage.js - TAM GÜNCELLENMİŞ

"use strict";

const router = require('express').Router();
const {
    list,
    create,
    read,
    update,
    deletee,
    myUsages,
    myUsageDetail,
    confirmPayment,
    useAccessCode,
    cancel,
} = require('../controller/usage');
const { isLogin, isAdmin } = require('../middleware/permissions');

// URL: /usages

// ✅ Kullanıcı endpoint'leri
router.get('/my-usages', isLogin, myUsages);
router.get('/my-usages/:id', isLogin, myUsageDetail);
router.post('/cancel/:id', isLogin, cancel);

// ✅ QR kod kullanımı (işletme tarafından)
router.post('/use-access-code', useAccessCode);

// ✅ Ödeme sonrası onay (internal - payment controller'dan çağrılır)
router.post('/confirm-payment', isLogin, confirmPayment);

// ✅ Temel CRUD
router.route('/')
    .post(isLogin, create)   // Rezervasyon oluştur
    .get(isAdmin, list);     // Admin - tüm rezervasyonları listele

router.route('/:id')
    .get(isAdmin, read)      // Admin - tekil rezervasyon
    .put(isAdmin, update)    // Admin - güncelle
    .patch(isAdmin, update)  // Admin - güncelle
    .delete(isAdmin, deletee); // Admin - sil

module.exports = router;