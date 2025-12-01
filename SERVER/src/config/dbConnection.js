"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
// MongoDB Connection:

const mongoose = require('mongoose')

const dbConnection = function () {
    // MongoDB connection string validation
    const mongoUri = process.env.MONGODB;
    
    if (!mongoUri) {
        console.error('❌ MongoDB bağlantı hatası: MONGODB environment variable tanımlı değil!');
        console.error('💡 Railway\'de Variables sekmesinden MONGODB değişkenini ekleyin.');
        console.error('💡 Format: mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority');
        process.exit(1);
    }
    
    if (!mongoUri.startsWith('mongodb://') && !mongoUri.startsWith('mongodb+srv://')) {
        console.error('❌ MongoDB bağlantı hatası: Geçersiz connection string formatı!');
        console.error('💡 Connection string "mongodb://" veya "mongodb+srv://" ile başlamalı.');
        console.error('💡 Mevcut değer:', mongoUri.substring(0, 20) + '...');
        process.exit(1);
    }
    
    // Connect:
    mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
        console.log('✅ MongoDB bağlantısı başarılı!');
        console.log('📊 Database:', mongoose.connection.name);
    })
    .catch(err => {
        console.error('❌ MongoDB bağlantı hatası:', err.message);
        console.error('💡 Connection string\'i kontrol edin:');
        console.error('   - Username ve password doğru mu?');
        console.error('   - Cluster URL doğru mu?');
        console.error('   - Network Access ayarları doğru mu? (0.0.0.0/0)');
        process.exit(1);
    });
}

/* ------------------------------------------------------- */
module.exports = {
    mongoose,
    dbConnection
} 