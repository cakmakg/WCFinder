// routes/business.js

"use strict"
const router = require('express').Router();
const { 
    list, 
    myBusiness, 
    getOwnerStats,
    getBusinessStats,
    create, 
    read, 
    update, 
    deletee,
    partnerRegistration,
    approveBusiness
} = require('../controller/business');
const { isLogin, isAdmin, isOwnerOrAdmin } = require('../middleware/permissions');

// URL: /business

// Herkes listeleyebilir (public - login gerektirmez)
router.get('/', list);

// ✅ Partner registration (public - login gerektirmez)
router.post('/partner-registration', partnerRegistration);

// ✅ Owner kendi işletmesini görebilir
router.get('/my-business', isOwnerOrAdmin, myBusiness);

// ✅ Owner kendi istatistiklerini görebilir (READ-ONLY)
router.get('/my-stats', isOwnerOrAdmin, getOwnerStats);

// ✅ Admin işletme istatistiklerini görebilir
router.get('/:id/stats', isAdmin, getBusinessStats);

// ✅ Admin business onayı/reddi
router.patch('/:id/approve', isAdmin, approveBusiness);

// ✅ Sadece ADMIN CRUD yapabilir
router.post('/', isAdmin, create);

router.route('/:id')
    .get(read)                 // ✅ Herkes görebilir (public - login gerektirmez)
    .put(isAdmin, update)
    .patch(isAdmin, update)
    .delete(isAdmin, deletee);

module.exports = router;