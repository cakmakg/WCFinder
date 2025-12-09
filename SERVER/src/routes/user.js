"use strict"
/* -------------------------------------------------------
    user route
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { list, create, read, update, deletee, deleteMe } = require('../controller/user');
const { isLogin, isAdmin, isSelfOrAdmin } = require('../middleware/permissions');


// URL: /users

router.route('/')
 .get(isAdmin, list) // Kullanıcıları SADECE Admin listeleyebilir
 .post(create);      // Yeni kullanıcı oluşturma (register) herkese açık

// ✅ YENİ: Kullanıcının kendi profilini silmesi için /users/me endpoint'i (daha güvenli)
router.route('/me')
    .delete(isLogin, deleteMe); // Kullanıcı sadece kendi profilini silebilir

router.route('/:id')
.get(isLogin, isSelfOrAdmin, read)       // Kullanıcı kendi profilini veya Admin herkesinkini görebilir
    .put(isLogin, isSelfOrAdmin, update)     // Kullanıcı kendi profilini veya Admin herkesinkini güncelleyebilir
    .patch(isLogin, isSelfOrAdmin, update)
    .delete(isLogin, isSelfOrAdmin, deletee); // Kullanıcı kendi profilini veya Admin herkesinkini silebilir


/* ------------------------------------------------------- */
module.exports = router;
