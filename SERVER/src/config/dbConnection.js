"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
// MongoDB Connection:

const mongoose = require('mongoose')

const dbConnection = function () {
    // MongoDB connection string validation
    const mongoUri = process.env.MONGODB ? process.env.MONGODB.trim() : null;
    
    if (!mongoUri) {
        console.error('❌ MongoDB bağlantı hatası: MONGODB environment variable tanımlı değil!');
        console.error('💡 Railway\'de Variables sekmesinden MONGODB değişkenini ekleyin.');
        console.error('💡 Format: mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority');
        process.exit(1);
    }
    
    // Remove any leading/trailing whitespace and check format
    const trimmedUri = mongoUri.trim();
    
    if (!trimmedUri.startsWith('mongodb://') && !trimmedUri.startsWith('mongodb+srv://')) {
        console.error('❌ MongoDB bağlantı hatası: Geçersiz connection string formatı!');
        console.error('💡 Connection string "mongodb://" veya "mongodb+srv://" ile başlamalı.');
        console.error('💡 Mevcut değer (ilk 30 karakter):', trimmedUri.substring(0, 30) + '...');
        console.error('💡 İlk karakter ASCII kodu:', trimmedUri.charCodeAt(0));
        process.exit(1);
    }
    
    // Connect:
    mongoose.connect(trimmedUri, {
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
        console.error('   - Cluster URL doğru mu? (ENOTFOUND = DNS/cluster adı veya internet)');
        console.error('   - Network Access ayarları doğru mu? (0.0.0.0/0)');
        console.error('   - Lokal geliştirme için: MONGODB=mongodb://localhost:27017/wcfinder');
        process.exit(1);
    });
}

/* ------------------------------------------------------- */
module.exports = {
    mongoose,
    dbConnection
} 