"use strict"
/* -------------------------------------------------------
    | Business Route |
------------------------------------------------------- */
const router = require('express').Router();
/* ------------------------------------------------------- */

const { list, create, read, update, deletee } = require('../controller/review');
const { isLogin, isAdmin } = require('../middleware/permissions');

// URL: /bussiness

router.route('/')
    .get(isLogin, list)
    .post(isLogin, create); // create, update, delete için Admin olmak (isAdmin) gerekli.

router.route('/:id')
    .get(isLogin, read)
    .put(isAdmin, update)
    .patch(isAdmin, update)
    .delete(isAdmin, deletee);

/* ------------------------------------------------------- */
module.exports = router;