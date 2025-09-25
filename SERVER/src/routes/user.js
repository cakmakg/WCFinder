"use strict"
/* -------------------------------------------------------
    user route
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { list, create, read, update, deletee } = require('../controller/user');
const { isLogin, isAdmin, isSelfOrAdmin } = require('../middleware/permissions');


// URL: /users

router.route('/')
 .get(isAdmin, list) // Kullanıcıları SADECE Admin listeleyebilir
 .post(create);      // Yeni kullanıcı oluşturma (register) herkese açık


router.route('/:id')
.get(isLogin, isSelfOrAdmin, read)       // Kullanıcı kendi profilini veya Admin herkesinkini görebilir
    .put(isLogin, isSelfOrAdmin, update)     // Kullanıcı kendi profilini veya Admin herkesinkini güncelleyebilir
    .patch(isLogin, isSelfOrAdmin, update)
    .delete(isAdmin, deletee); // Kullanıcıları SADECE Admin silebilir


/* ------------------------------------------------------- */
module.exports = router;
