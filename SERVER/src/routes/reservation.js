"use strict"
/* -------------------------------------------------------
    | Reservation Route (Best Practice) |
------------------------------------------------------- */
const router = require('express').Router();

const { list, create, read, update, deletee } = require('../controller/reservation');
const { isLogin, isOwnerOrAdmin } = require('../middleware/permissions');
const Reservation = require('../models/reservation'); // Modeli içeri aktarıyoruz

// URL: /reservations
router.route('/')
    // Giriş yapmış her kullanıcı rezervasyon oluşturabilir.
    .post(isLogin, create)
    // Giriş yapmış kullanıcılar (sadece kendilerine ait olanları) listeler.
    // Bu filtreleme `list` controller'ı içinde yapılır, middleware sadece giriş kontrolü yapar.
    .get(isLogin, list);

router.route('/:id')
    .get(isLogin, isOwnerOrAdmin(Reservation, 'userId'), read)
    .put(isLogin, isOwnerOrAdmin(Reservation, 'userId'), update)
    .delete(isLogin, isOwnerOrAdmin(Reservation, 'userId'), deletee);
/* ------------------------------------------------------- */
module.exports = router;