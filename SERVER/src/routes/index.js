"use strict"
/* -------------------------------------------------------
    index route
------------------------------------------------------- */
const router = require('express').Router()
/* ------------------------------------------------------- */
// routes/:

// URL: /

// auth:
router.use('/auth', require('./auth'));
// user:
router.use('/users', require('./user'));
// token:
router.use('/tokens', require('./token'));

// business: (NOT bussiness)
router.use('/business', require('./business'));

// document:
router.use('/documents', require('./document'));

router.use('/usages', require('./usage'));
router.use('/payments', require('./payment'));


// review:
router.use('/review', require('./review'));

// toilet:
router.use('/toilet', require('./toilet'));

/* ------------------------------------------------------- */
module.exports = router;