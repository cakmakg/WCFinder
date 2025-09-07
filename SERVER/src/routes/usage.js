
"use strict";

const router = require('express').Router();
// 'update' fonksiyonunu da import listesine ekliyoruz.
const { list, create, read, update, deletee } = require('../controller/usage');
// 'isOwnerOrAdmin' middleware'ini, 'owner'ların bu yola erişebilmesi için kullanacağız.
const { isLogin, isAdmin, isOwnerOrAdmin } = require('../middleware/permissions');

// URL: /usages

router.route('/')
    .get(isLogin, list)
    .post(isLogin, create);

router.route('/:id')
    .get(isLogin, read)
    // YENİ EKLENEN ROTALAR
    // Sadece admin veya owner rolündekiler bu yola erişebilir.
    .put(isOwnerOrAdmin, update)
    .patch(isOwnerOrAdmin, update)
    .delete(isAdmin, deletee);

module.exports = router;