// models/payout.model.js
// İşletmelere yapılan ödeme dağıtımlarının kaydı

"use strict";

const { mongoose } = require("../config/dbConnection");

const PayoutSchema = new mongoose.Schema({
    // ✅ Hangi işletmeye ödeme yapıldı
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true,
    },

    // ✅ Ödeme tutarı
    amount: {
        type: Number,
        required: true,
        min: 0,
    },

    // ✅ Para birimi
    currency: {
        type: String,
        required: true,
        default: 'EUR',
    },

    // ✅ Ödeme durumu
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true,
    },

    // ✅ Ödeme yöntemi
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'stripe_connect', 'paypal', 'manual'],
        required: true,
    },

    // ✅ Ödeme dönemi (hangi ay için)
    period: {
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },

    // ✅ Bu ödeme batch'inde kaç payment var?
    paymentCount: {
        type: Number,
        default: 0,
    },

    // ✅ İşlem referansı (banka transferi için)
    transactionReference: {
        type: String,
    },

    // ✅ Ödeme notu
    notes: {
        type: String,
    },

    // ✅ Hata mesajı (eğer başarısız olduysa)
    errorMessage: {
        type: String,
    },

    // ✅ Ödeme ne zaman tamamlandı?
    completedAt: {
        type: Date,
    },

    // ✅ Kim tarafından onaylandı? (admin)
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

}, {
    collection: "payouts",
    timestamps: true,
});

// ✅ Index'ler
PayoutSchema.index({ businessId: 1, createdAt: -1 });
PayoutSchema.index({ status: 1, createdAt: -1 });
PayoutSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });

module.exports = mongoose.model("Payout", PayoutSchema);

