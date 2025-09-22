"use strict";
/* -------------------------------------------------------
    | Payment Route (Best Practice) |
------------------------------------------------------- */
const router = require('express').Router();

const { list, read, update, remove } = require('../controller/payment');
const { isLogin, isAdmin, isOwnerOrAdmin } = require('../middleware/permissions');
const Payment = require('../models/payment'); // Payment modelini içeri aktarıyoruz

// URL: /payments

router.route('/')
    .get(isLogin, list);

router.route('/:id')
    // Bir ödemeyi sadece sahibi VEYA bir Admin görüntüleyebilir.
    .get(isLogin, isOwnerOrAdmin(Payment, 'userId'), read)
    
    // Bir ödemeyi SADECE Admin güncelleyebilir.
    .put(isAdmin, update)
    .patch(isAdmin, update)
    
    // Bir ödemeyi SADECE Admin silebilir.
    .delete(isAdmin, remove);

module.exports = router;