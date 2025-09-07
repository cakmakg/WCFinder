// usage.model.js

"use strict";
/* -------------------------------------------------------
                    Kullanım Modeli
     (Her bir tuvalet kullanım işleminin kaydını tutar)
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");
const crypto = require("crypto"); // Erişim kodu üretmek için Node.js'in dahili modülü

const UsageSchema = new mongoose.Schema({
    // Bu kullanım işlemini gerçekleştiren kullanıcı. 'User' modeline referans verir.
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true, // Kullanıcıya göre geçmiş işlemleri hızlıca bulmak için.
    },

    // Kullanılan tuvalet. 'WC' modeline referans verir.
    toiletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Toilet',
        required: true,
        index: true, // Bir tuvaletin ne kadar kullanıldığını hızlıca bulmak için.
    },
    
    // Bu işlem için ödenen toplam ücret.
    totalFee: {
        type: Number,
        required: true,
    },
    
    // İşlemin yaşam döngüsündeki durumu.
    status: {
        type: String,
        enum: ['paid', 'completed', 'cancelled'], // ödendi, tamamlandı, iptal edildi
        default: 'paid',
    },

    // Kullanıcının erişim için kullanacağı benzersiz kod (QR kod, PIN vb. olabilir).
    // Her kullanım için özel olarak üretilir.
    accessCode: {
        type: String,
        unique: true,
    },

    // Kullanıcıya erişim hakkının tanındığı zaman damgası.
    accessTimestamp: {
        type: Date,
        default: Date.now,
    }

}, {
    collection: "usages",
    timestamps: true, // createdAt (oluşturulma) ve updatedAt (güncellenme) zamanlarını ekler.
});

// Veritabanına YENİ BİR kullanım kaydı oluşturulmadan HEMEN ÖNCE çalışır.
UsageSchema.pre('save', function(next) {
    // Sadece yeni bir belge oluşturulurken ve accessCode henüz yokken çalışır.
    // 'isNew' kontrolü, belgenin güncellenmesi durumunda yeni bir kod üretilmesini engeller.
    if (this.isNew && !this.accessCode) {
        // Rastgele, 6 karakterli, benzersiz ve okunması kolay bir kod üretir.
        this.accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    }
    next(); // Kaydetme işlemine devam et.
});

module.exports = mongoose.model("Usage", UsageSchema);