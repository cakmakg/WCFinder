"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { list, create, read, update, deletee } = require('../controller/token');
const { isAdmin } = require('../middleware/permissions');

// URL: /tokens

// ✅ SECURITY: Token koleksiyonu oturum sırlarını tutar. Bu route'lar sadece
// admin'e açık olmalı; aksi halde herkes token'ları listeleyip başka kullanıcıları
// (admin dahil) taklit edebilir.
router.use(isAdmin);

router.route('/').get(list).post(create);

router.route('/:id').get(read).put(update).patch(update).delete(deletee);

/* ------------------------------------------------------- */
module.exports = router;
