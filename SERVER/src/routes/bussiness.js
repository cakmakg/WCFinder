"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { list, create, read, update, delete: deleteFunc,joinbussiness } = require('../controller/bussiness');
const { isLogin, isAdmin, isOwner,  } = require('../middleware/permissions');

// URL: /brands

router.route('/').get(isLogin, list).post(isOwner, create);
router.put('/join/:bussinessId', isOwner, joinbussiness);

router.route('/:id')
    .get(isLogin, read)
    .put(isLogin,isOwner, update)
    .patch(isLogin,isOwner, update)
    .delete(isLogin,isOwner, deleteFunc);

/* ------------------------------------------------------- */
module.exports = router;
