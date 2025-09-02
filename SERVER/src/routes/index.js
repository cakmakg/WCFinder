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
// token:/
router.use('/tokens', require('./token'));


// bussiness:
router.use('/bussiness', require('./bussiness'));
// bussinessType:
router.use('/bussinessType', require('./bussinessType'));
// document:
router.use('/documents', require('./document'))

router.use('/reservation', require('./reservation'));
// toilet:
router.use('/review', require('./review'));
router.use('/toilet', require('./toilet'));



/* ------------------------------------------------------- */
module.exports = router;