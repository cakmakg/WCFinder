"use strict"
/* -------------------------------------------------------
    user route
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { list, read, update, deletee } = require('../controller/user');

// URL: /users

router.route('/').get(list);

router.route('/:id').get(read).put(update).patch(update).delete(deletee);

/* ------------------------------------------------------- */
module.exports = router;
