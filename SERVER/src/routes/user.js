"use strict"
/* -------------------------------------------------------
    user route
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { list, create, read, update, deletee } = require('../controller/user');
const { exportMe, deleteMe } = require('../controller/gdpr');
const { isLogin, isAdmin, isSelfOrAdmin } = require('../middleware/permissions');


// URL: /users

router.route('/')
 .get(isAdmin, list) // Kullanıcıları SADECE Admin listeleyebilir
 .post(create);      // Yeni kullanıcı oluşturma (register) herkese açık

// DSGVO Art. 15: Kullanıcı kendi verisini JSON olarak dışa aktarır
router.route('/me/export')
    .get(isLogin, exportMe);

// DSGVO Art. 17: Kullanıcı kendi hesabını siler (hesap anonimleştirilir,
// yasal saklama zorunlu belgeler anonim korunur)
router.route('/me')
    .delete(isLogin, deleteMe);

router.route('/:id')
.get(isLogin, isSelfOrAdmin, read)       // Kullanıcı kendi profilini veya Admin herkesinkini görebilir
    .put(isLogin, isSelfOrAdmin, update)     // Kullanıcı kendi profilini veya Admin herkesinkini güncelleyebilir
    .patch(isLogin, isSelfOrAdmin, update)
    .delete(isLogin, isSelfOrAdmin, deletee); // Kullanıcı kendi profilini veya Admin herkesinkini silebilir


/* ------------------------------------------------------- */
module.exports = router;
