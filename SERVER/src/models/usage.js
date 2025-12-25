// models/usage.model.js - TAM GÜNCELLENMİŞ

"use strict";

const { mongoose } = require("../config/dbConnection");
const crypto = require("crypto");

const UsageSchema = new mongoose.Schema({
    // Kullanıcı
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    // ✅ YENİ: İşletme bilgisi
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true,
    },

    // Tuvalet
    toiletId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Toilet',
        required: true,
        index: true,
    },

    // ✅ YENİ: Kaç kişi için rezervasyon
    personCount: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
    },

    // ✅ YENİ: Rezervasyon tarihi/saati
    startTime: {
        type: Date,
        required: true,
        index: true,
    },

    // ✅ YENİ: Cinsiyet tercihi (frontend'den geliyor)
    genderPreference: {
        type: String,
        enum: ['male', 'female', 'unisex'],
    },

    // Temel ücret (tuvalet ücreti)
    basePrice: {
        type: Number,
        required: true,
    },

    // ✅ YENİ: Servis ücreti (kişi başına 0.75€ × personCount)
    serviceFee: {
        type: Number,
        required: true,
        // Default removed - should be calculated as 0.75 * personCount
    },

    // Toplam ücret
    totalFee: {
        type: Number,
        required: true,
    },

    // ✅ GÜNCELLENMIŞ: Kullanım durumu
    status: {
        type: String,
        enum: [
            'pending',      // Rezervasyon yapıldı, ödeme bekleniyor
            'confirmed',    // Ödeme yapıldı, onaylandı
            'active',       // Kullanıcı şu anda kullanıyor
            'completed',    // Kullanım tamamlandı
            'cancelled',    // İptal edildi
            'expired'       // Süresi doldu
        ],
        default: 'pending',
        index: true,
    },

    // ✅ GÜNCELLENMIŞ: Ödeme durumu (ayrı takip için)
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
        index: true,
    },

    // ✅ YENİ: Ödeme referansı (Payment model'e bağlantı için)
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',
    },

    // Erişim kodu
    accessCode: {
        type: String,
        unique: true,
        sparse: true, // null değerlere izin verir
    },

    // ✅ YENİ: QR kod kullanıldı mı?
    accessUsed: {
        type: Boolean,
        default: false,
    },

    // ✅ YENİ: QR kod ne zaman kullanıldı?
    accessUsedAt: {
        type: Date,
    },

    // Erişim hakkı verilme zamanı
    accessTimestamp: {
        type: Date,
    },

    // ✅ YENİ: İptal nedeni
    cancellationReason: {
        type: String,
    },

    // ✅ YENİ: İptal zamanı
    cancelledAt: {
        type: Date,
    },

    // ✅ YENİ: Notlar (admin için)
    notes: {
        type: String,
    },

}, {
    collection: "usages",
    timestamps: true,
});

// ✅ GÜNCELLENMIŞ: Sadece ödeme yapıldıktan sonra accessCode oluştur
UsageSchema.pre('save', function(next) {
    // AccessCode sadece paymentStatus 'paid' olduğunda ve henüz yoksa oluşturulur
    if (this.paymentStatus === 'paid' && !this.accessCode && this.isModified('paymentStatus')) {
        this.accessCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        this.accessTimestamp = new Date();
        this.status = 'confirmed';
    }
    next();
});

// ✅ YENİ: Toplam ücreti otomatik hesapla
UsageSchema.pre('save', function(next) {
    if (this.isNew || this.isModified('basePrice') || this.isModified('personCount') || this.isModified('serviceFee')) {
        this.totalFee = (this.basePrice * this.personCount) + this.serviceFee;
    }
    next();
});

// ✅ YENİ: Index'ler - performans için
UsageSchema.index({ userId: 1, createdAt: -1 });
UsageSchema.index({ businessId: 1, startTime: 1 });
UsageSchema.index({ status: 1, paymentStatus: 1 });
UsageSchema.index({ accessCode: 1 }, { sparse: true });

module.exports = mongoose.model("Usage", UsageSchema);