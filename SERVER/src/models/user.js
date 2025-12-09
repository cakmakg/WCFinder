"use strict";
/**
 * User Model
 * 
 * User schema definition for WCFinder application.
 * Supports roles: user, owner, admin
 * 
 * Clean Code Principles:
 * - Single Responsibility: Sadece schema definition
 * - DRY: Password encryption controller'da yapılıyor
 */
const { mongoose } = require("../config/dbConnection");

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
    firstName: {
        type: String,
        trim: true,
        required: false, // Optional for existing users, but should be provided during registration
        minlength: [2, "First name must be at least 2 characters"],
        maxlength: [50, "First name must not exceed 50 characters"],
    },
    lastName: {
        type: String,
        trim: true,
        required: false, // Optional for existing users, but should be provided during registration
        minlength: [2, "Last name must be at least 2 characters"],
        maxlength: [50, "Last name must not exceed 50 characters"],
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

// Virtual properties for role checks (computed properties)
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