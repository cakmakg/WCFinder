// routes/toilet.js

"use strict"
const router = require('express').Router();
const { list, create, read, update, deletee } = require('../controller/toilet');
const { isLogin, isAdmin } = require('../middleware/permissions');

// URL: /toilets

router.route('/')
    .get(isLogin, list)        // ✅ Herkes görebilir
    .post(isAdmin, create);    // ✅ Sadece Admin ekler

router.route('/:id')
    .get(isLogin, read)        // ✅ Herkes görebilir
    .put(isAdmin, update)      // ✅ Sadece Admin günceller
    .patch(isAdmin, update)    // ✅ Sadece Admin günceller
    .delete(isAdmin, deletee); // ✅ Sadece Admin siler

module.exports = router;