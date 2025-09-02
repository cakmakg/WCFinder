"use strict";
/* -------------------------------------------------------
                Bussiness model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");

const BussinessSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
     
        location: { // GeoJSON formatı için güncellendi
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
                required: true
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
                index: '2dsphere'
            }
        },
        type: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BusinessType',
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    {
        collection: "bussiness",
        timestamps: true,
    }
);

module.exports = mongoose.model("Bussiness", BussinessSchema);