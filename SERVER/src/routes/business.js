"use strict"
/* -------------------------------------------------------
    | Business Route |
------------------------------------------------------- */
const router = require('express').Router();
/* ------------------------------------------------------- */

const { list, create, read, update, deletee } = require('../controller/business');
const { isLogin, isOwnerOrAdmin } = require('../middleware/permissions');
const Business = require('../models/business');

// URL: /bussiness

router.route('/')
    .get(isLogin, list)             // Her giriş yapan kullanıcı işletmeleri listeleyebilir.
    .post(isLogin, create);         // Her giriş yapan kullanıcı YENİ bir işletme oluşturabilir.

router.route('/:id')
    .get(isLogin, read)
    .put(isLogin, isOwnerOrAdmin(Business, 'owner'), update)
    .delete(isLogin, isOwnerOrAdmin(Business, 'owner'), deletee);

/* ------------------------------------------------------- */
module.exports = router;