"use strict";
/* -------------------------------------------------------
                User model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");
 const passwordEncrypt = require("../helper/passwordEncrypt");
// const emailValidation = require("../helper/emailValidation");

const UserSchema = new mongoose.Schema(
    {
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
            unique: true, // mongodb uniqe veriler için kendi mesajını gönderir
            index:true
        },

        role: {
            type: String,
            enum: ['user', 'owner'],
            default: 'user'
        },
          isActive: {
        type: Boolean,
        default: true
    },
        isStaff: {
            type: Boolean,
            default: false
        },
        isAdmin: {
            type: Boolean,
            default: false
        }
    },

    {
        collection: "users",
        timestamps: true,
    }
    
);


UserSchema.pre(['save', 'updateOne'], function (next) {

    // console.log('pre-save worked.');
    // console.log(this);

    const data = this?._update ?? this;

    // Email Control:
    const isEmailValidated = data.email ? /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(data.email) : true;

    if (!isEmailValidated) {
        next(new Error('Email is not validated.'));
    };

    const isPasswordValidated = data.password ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(data.password) : true;

    if (!isPasswordValidated) {
        next(new Error('Password is not validated.'));
    };

    if (this._update) { // Update

        this._update.password = passwordEncrypt(data.password);

    } else { // Save

        this.password = passwordEncrypt(data.password);
    };

    next();
});

module.exports = mongoose.model("User", UserSchema);
