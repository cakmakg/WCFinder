"use strict";
/* -------------------------------------------------------
                Toilet model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");


const ReviewSchema = new mongoose.Schema(
    {
         userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User', 
            required: true 
        },

       toiletId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Toilet', 
        required: true },

         rating: { 
            type: Number, 
            min: 1, max: 5, 
            required: true 
        },
        comment: { 
            type: String 
        },
    },

    {
        collection: "toilet",
        timestamps: true,
    }
);

module.exports = mongoose.model("Review", ReviewSchema);
