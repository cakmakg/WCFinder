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

// Admin Analytics:
router.use('/admin/analytics', require('./analytics'));

// Monthly Reports:
router.use('/monthly-reports', require('./monthlyReport'));

// review:
router.use('/review', require('./review'));

// toilet:
router.use('/toilets', require('./toilet'));

// SEO:
router.use('/', require('./seo')); // sitemap.xml, robots.txt

/* ------------------------------------------------------- */
module.exports = router;