// routes/toilet.js

"use strict"
const router = require('express').Router();
const { list, create, read, update, deletee } = require('../controller/toilet');
const { isOwnerOrAdmin } = require('../middleware/permissions');

// URL: /toilets

// ℹ️ Yazma işlemleri owner/admin gerektirir; controller ayrıca kaynağın çağıran
//    owner'ın işletmesine ait olduğunu (resource-scoped) doğrular.
router.route('/')
    .get(list)                        // ✅ Herkes görebilir (public)
    .post(isOwnerOrAdmin, create);    // ✅ Owner/Admin ekler

router.route('/:id')
    .get(read)                        // ✅ Herkes görebilir (public)
    .put(isOwnerOrAdmin, update)      // ✅ Owner/Admin günceller
    .patch(isOwnerOrAdmin, update)    // ✅ Owner/Admin günceller
    .delete(isOwnerOrAdmin, deletee); // ✅ Owner/Admin siler

module.exports = router;