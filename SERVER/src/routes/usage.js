"use strict"; 

const router = require('express').Router();
const { list, create, read, update, deletee } = require('../controller/usage');
const { isLogin, isAdmin } = require('../middleware/permissions');

// URL: /usage

// --- USAGE ROUTES ---
// Kullanıcı sadece create yapabilir
router.route('/')
    .post(isLogin, create)   // USER → yeni usage kaydı açar
    .get(isAdmin, list);     // ADMIN → tüm usage kayıtlarını listeler

router.route('/:id')
    .get(isAdmin, read)      // ADMIN → tekil usage kaydı görür
    .put(isAdmin, update)    // ADMIN → usage günceller
    .patch(isAdmin, update)  // ADMIN → usage günceller
    .delete(isAdmin, deletee);// ADMIN → usage siler

module.exports = router;
