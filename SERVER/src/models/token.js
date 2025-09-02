"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */
const { mongoose: { model, Schema } } = require('../config/dbConnection');
/* ------------------------------------------------------- */

const TokenSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
        unique: true
    },

    token: {
        type: String,
        trim: true,
        required: true,
        unique: true
    }

}, {
    collection: 'tokens',
    timestamps: true
});

module.exports = model('Token', TokenSchema);