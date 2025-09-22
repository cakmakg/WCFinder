"use strict";
/* -------------------------------------------------------
    | Usage Route (Best Practice) |
------------------------------------------------------- */
const router = require('express').Router();

const { list, create, read, update, deletee } = require('../controller/usage');
const { isLogin, isOwnerOrAdmin } = require('../middleware/permissions');
const Usage = require('../models/usage'); // Usage modelini içeri aktarıyoruz

// URL: /usages

router.route('/')
    // Giriş yapmış her kullanıcı kendi kullanım kayıtlarını listeleyebilir.
    .get(isLogin, list)
    // Giriş yapmış her kullanıcı yeni bir kullanım kaydı oluşturabilir.
    .post(isLogin, create);

router.route('/:id')
    // Bir kullanım kaydını sadece sahibi veya Admin görebilir, güncelleyebilir veya silebilir.
    // isOwnerOrAdmin fonksiyonuna Usage modelini ve sahip alanının adını ('userId') veriyoruz.
    .get(isLogin, isOwnerOrAdmin(Usage, 'userId'), read)
    .put(isLogin, isOwnerOrAdmin(Usage, 'userId'), update)
    .patch(isLogin, isOwnerOrAdmin(Usage, 'userId'), update)
    .delete(isLogin, isOwnerOrAdmin(Usage, 'userId'), deletee);

/* ------------------------------------------------------- */
module.exports = router;