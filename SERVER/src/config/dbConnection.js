"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
// MongoDB Connection:

const mongoose = require('mongoose')

const dbConnection = function () {
    // Connect:
    mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB bağlantısı başarılı!'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));
}

/* ------------------------------------------------------- */
module.exports = {
    mongoose,
    dbConnection
} 