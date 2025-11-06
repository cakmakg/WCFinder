"use strict";
/* -------------------------------------------------------
                User model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");
// passwordEncrypt burada import edilmemeli - controller'da hallediliyor

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        trim: true,
        required: true,
        index: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        trim: true,
        required: [true, "An Email address is required"],
        unique: true,
        index: true
    },
    role: {
        type: String,
        enum: ['user', 'owner', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
},
{
    collection: "users",
    timestamps: true,
});

// ❌ PRE-SAVE MIDDLEWARE SİLİNDİ
// Register/update işlemleri zaten controller'da passwordEncrypt kullanıyor

// Virtual property - geriye dönük uyumluluk için
UserSchema.virtual('isAdmin').get(function() {
    return this.role === 'admin';
});

UserSchema.virtual('isOwner').get(function() {
    return this.role === 'owner';
});

// toJSON'da virtual'ları göster
UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("User", UserSchema);