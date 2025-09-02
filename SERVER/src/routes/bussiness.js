"use strict";
/* -------------------------------------------------------
                    Router for Bussiness
------------------------------------------------------- */
const router = require('express').Router();

// Middleware'lar ve Controller'lar
const { 
  list, 
  create, 
  read, 
  update, 
  delete: deleteFunc,
  joinbussiness 
} = require('../controller/bussiness');

const { isLogin, isStaff,  } = require('../middleware/permissions');

// URL: /bussiness

router.route('/')
    .get(isLogin, list)
    .post(isLogin, create);

// "joinbussiness" için ayrı bir rota
// Yetkilendirme middleware'i olan 'isLogin' eklendi
router.put('/join/:bussinessId', isLogin, joinbussiness);

// Temel CRUD işlemleri için rotalar
router.route('/:id')
    .get(isLogin, read)
    .put(isLogin,  update)
    .patch(isLogin,  update)
    .delete(isLogin,  deleteFunc);

/* ------------------------------------------------------- */
module.exports = router;