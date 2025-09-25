"use strict";

const router = require('express').Router();
const { list, read, update, deletee } = require('../controller/payment');
const{ isLogin, isAdmin } = require('../middleware/permissions'); // Sadece isAdmin'i kullanacağız

// URL: /payments

// === YENİ VE GÜVENLİ YAPI ===
// Hem listeleme hem de tekil veri okuma dahil TÜM yolları `isAdmin` ile koruyoruz.
router.route('/')
    .get(isAdmin, list);

router.route('/:id')
    .get(isLogin, read)
    .put(isAdmin, update)
    .patch(isAdmin, update)
    .delete(isAdmin, deletee);

module.exports = router;