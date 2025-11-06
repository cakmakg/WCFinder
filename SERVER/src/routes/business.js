// routes/business.js

"use strict"
const router = require('express').Router();
const { 
    list, 
    myBusiness, 
    getOwnerStats, 
    create, 
    read, 
    update, 
    deletee 
} = require('../controller/business');
const { isLogin, isAdmin, isOwnerOrAdmin } = require('../middleware/permissions');

// URL: /business

// Herkes listeleyebilir
router.get('/', isLogin, list);

// ✅ Owner kendi işletmesini görebilir
router.get('/my-business', isOwnerOrAdmin, myBusiness);

// ✅ Owner kendi istatistiklerini görebilir (READ-ONLY)
router.get('/my-stats', isOwnerOrAdmin, getOwnerStats);

// ✅ Sadece ADMIN CRUD yapabilir
router.post('/', isAdmin, create);

router.route('/:id')
    .get(isLogin, read)
    .put(isAdmin, update)
    .patch(isAdmin, update)
    .delete(isAdmin, deletee);

module.exports = router;