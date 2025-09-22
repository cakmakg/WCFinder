"use strict"
/* -------------------------------------------------------
    | Toilet Route (Best Practice) |
------------------------------------------------------- */
const router = require('express').Router();

const { list, create, read, update, deletee } = require('../controller/toilet');

const { isLogin, isOwnerOrAdmin } = require('../middleware/permissions');
const Toilet = require('../models/toilet');

// URL: /toilets
router.route('/')
    // Giriş yapmış her kullanıcı tuvaletleri listeleyebilir.
    .get(isLogin, list)
    // Giriş yapmış her kullanıcı YENİ bir tuvalet oluşturabilir.
    .post(isLogin, create); 

router.route('/:id')
    // Her giriş yapmış kullanıcı tek bir tuvaleti görebilir.
    .get(isLogin, read)
    // Bir tuvaleti sadece ait olduğu işletmenin sahibi veya Admin güncelleyebilir.
    .put(isLogin, isOwnerOrAdmin(Toilet, 'business.owner'), update)
    .patch(isLogin, isOwnerOrAdmin(Toilet, 'business.owner'), update)
    // Bir tuvaleti sadece ait olduğu işletmenin sahibi veya Admin silebilir.
    .delete(isLogin, isOwnerOrAdmin(Toilet, 'business.owner'), deletee);

/* ------------------------------------------------------- */
module.exports = router;