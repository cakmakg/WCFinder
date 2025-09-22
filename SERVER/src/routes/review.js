"use strict"
/* -------------------------------------------------------
    | Review Route (Best Practice) |
------------------------------------------------------- */
const router = require('express').Router();

const { list, create, read, update, deletee } = require('../controller/review');
const { isLogin, isOwnerOrAdmin } = require('../middleware/permissions');
const Review = require('../models/review'); // Yorum modelini içeri aktarıyoruz

// URL: /reviews
router.route('/')
    // Her giriş yapmış kullanıcı yorumları listeleyebilir.
    .get(isLogin, list)
    // Her giriş yapmış kullanıcı YENİ bir yorum oluşturabilir.
    .post(isLogin, create);

router.route('/:id')
    .get(isLogin, isOwnerOrAdmin(Review, 'userId'), read)
    .put(isLogin, isOwnerOrAdmin(Review, 'userId'), update)
    .delete(isLogin, isOwnerOrAdmin(Review, 'userId'), deletee);

/* ------------------------------------------------------- */
module.exports = router;