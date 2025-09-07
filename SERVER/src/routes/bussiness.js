"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { list, create, read, update, deletee: deletee } = require('../controller/bussiness');
const { isLogin, isOwnerOrAdmin} = require('../middleware/permissions');

// URL: /brands

router.route('/').get(isLogin, list).post(isOwnerOrAdmin, create);

router.route('/:id')
    .get(isLogin, read)
    .put(isOwnerOrAdmin, update)
    .patch(isOwnerOrAdmin, update)
    .delete(isOwnerOrAdmin, deletee);

/* ------------------------------------------------------- */
module.exports = router;
