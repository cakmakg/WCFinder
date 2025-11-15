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
router.use('/business-payouts', require('./businessPayout'));
router.use('/rechnungen', require('./rechnung'));


// review:
router.use('/review', require('./review'));

// toilet:
router.use('/toilet', require('./toilet'));

/* ------------------------------------------------------- */
module.exports = router;