"use strict"
/* -------------------------------------------------------
auth

------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { login, refresh, logout, register } = require('../controller/auth');

// URL: /auth

router.post('/login', login);
router.post('/register', register);
router.post('/refresh', refresh);
router.get('/logout', logout);


/* ------------------------------------------------------- */
module.exports = router;