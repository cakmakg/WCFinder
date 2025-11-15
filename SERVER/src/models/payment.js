// payment.model.js - GÜNCELLENMİŞ HALİ
const { mongoose } = require("../config/dbConnection");
const PaymentSchema = new mongoose.Schema({
    usageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usage',
        required: true,
        unique: true,
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },

    // ✅ YENİ: İşletme referansı (komisyon dağıtımı için)
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
        index: true,
    },

    amount: {
        type: Number,
        required: true,
    },

    // ✅ YENİ: Platform komisyonu (örn: 0.50€)
    platformFee: {
        type: Number,
        required: true,
        default: 0,
    },

    // ✅ YENİ: İşletme payı (örn: 1.00€)
    businessFee: {
        type: Number,
        required: true,
        default: 0,
    },

    // ✅ YENİ: Ödeme işletmeye dağıtıldı mı?
    payoutStatus: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed'],
        default: 'pending',
        index: true,
    },

    // ✅ YENİ: Ödeme ne zaman dağıtıldı?
    paidOutAt: {
        type: Date,
    },

    // ✅ YENİ: Ödeme dağıtım ID'si (payout batch için)
    payoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payout',
        index: true,
    },

    currency: {
        type: String,
        required: true,
        default: 'EUR',
    },

    status: {
        type: String,
        enum: ['pending', 'processing', 'succeeded', 'failed', 'refunded', 'cancelled'],
        required: true,
        default: 'pending',
    },

    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'wallet'], // Ödeme yöntemleri
        required: true,
    },

    // ✅ YENİ: Ödeme sağlayıcısı
    paymentProvider: {
        type: String,
        enum: ['stripe', 'paypal'],
        required: true,
    },

    transactionId: {
        type: String,
        unique: true,
        index: true,
        sparse: true,
    },

    // ✅ YENİ: Stripe için PaymentIntent ID
    paymentIntentId: {
        type: String,
        index: true,
        sparse: true,
    },

    // ✅ YENİ: PayPal için Order ID
    paypalOrderId: {
        type: String,
        index: true,
        sparse: true,
    },

    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
    },

    // ✅ YENİ: Hata mesajı
    errorMessage: {
        type: String,
    },

    // ✅ YENİ: İade bilgileri
    refund: {
        refundId: String,
        refundedAt: Date,
        refundAmount: Number,
        refundReason: String,
    },

    // ✅ YENİ: IP adresi (güvenlik için)
    ipAddress: {
        type: String,
    },

    // ✅ YENİ: User agent (güvenlik için)
    userAgent: {
        type: String,
    },

}, {
    collection: "payments",
    timestamps: true,
});

// ✅ YENİ: Index'ler - Performans için
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ businessId: 1, createdAt: -1 });
PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ payoutStatus: 1, createdAt: -1 });
PaymentSchema.index({ businessId: 1, payoutStatus: 1 });

module.exports = mongoose.model("Payment", PaymentSchema);