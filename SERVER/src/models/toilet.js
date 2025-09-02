"use strict";
/* -------------------------------------------------------
                Toilet model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");


const ToiletSchema = new mongoose.Schema(
    {
         business: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Business', 
            required: true 
        },

       isAvailable: { type: Boolean, 
        default: true 
    },

        price: { 
            type: Number, 
            default: 0 
        },
        gender: { 
            type: String, 
            enum: ['Unisex', 'Male', 'Female'], 
            default: 'Unisex' 
        },
        accessible: {
             type: Boolean,
              default: false 
            },
    },

    {
        collection: "toilet",
        timestamps: true,
    }
);

module.exports = mongoose.model("Toilet", ToiletSchema);
