"use strict"
/* -------------------------------------------------------
    | Toilet Route (Best Practice) |
------------------------------------------------------- */
const router = require('express').Router();

const { list, create, read, update, deletee } = require('../controller/toilet');

const { isLogin, isAdmin } = require('../middleware/permissions');
const Toilet = require('../models/toilet');

// URL: /toilets
router.route('/')
    // Giriş yapmış her kullanıcı tuvaletleri listeleyebilir.
    .get(isLogin, list)
    // Giriş yapmış her kullanıcı YENİ bir tuvalet oluşturabilir.
    .post(isAdmin, create);

router.route('/:id')
    // Her giriş yapmış kullanıcı tek bir tuvaleti görebilir.
    .get(isLogin, read)
    .get(isLogin, read)
    .put(isAdmin, update)
    .patch(isAdmin, update)
    .delete(isAdmin, deletee);

/* ------------------------------------------------------- */
module.exports = router;