"use strict";
/**
 * Password Reset Token Model
 * 
 * Şifre sıfırlama token'larını saklar.
 * Token'lar 1 saat geçerlidir ve tek kullanımlıktır.
 */
const { mongoose } = require("../config/dbConnection");
const crypto = require('crypto');

const PasswordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 saat
        index: { expireAfterSeconds: 0 }, // TTL index - otomatik silme
    },
    used: {
        type: Boolean,
        default: false,
        index: true,
    },
}, {
    collection: "passwordResets",
    timestamps: true,
});

// Token oluşturma helper method
PasswordResetSchema.statics.generateToken = function() {
    return crypto.randomBytes(32).toString('hex');
};

// Token'ı kullanıldı olarak işaretle
PasswordResetSchema.methods.markAsUsed = async function() {
    this.used = true;
    await this.save();
};

module.exports = mongoose.model("PasswordReset", PasswordResetSchema);

