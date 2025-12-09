"use strict"
/* -------------------------------------------------------
auth

------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */

const { login, refresh, logout, register, forgotPassword, resetPassword } = require('../controller/auth');
const logger = require('../utils/logger');

// URL: /auth

// Development'ta route bilgilerini logla
if (process.env.NODE_ENV === 'development') {
    logger.debug('Auth routes registered', {
        routes: ['/login', '/register', '/refresh', '/logout']
    });
}

router.post('/login', async (req, res, next) => {
  try {
    await login(req, res);
  } catch (error) {
    next(error); // Error handler'a gönder
  }
});

router.post('/register', register);
router.post('/refresh', refresh);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

/* ------------------------------------------------------- */
module.exports = router;