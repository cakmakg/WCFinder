"use strict";
/* -------------------------------------------------------
                BussinessType model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");

const BussinessTypeSchema = new mongoose.Schema(
    {
         name: { 
            type: String, 
            required: true 
        },               // örn: Restaurant, Hotel, Cafe

    },

    {
        collection: "bussinessType",
        timestamps: true,
    }
);

module.exports = mongoose.model("BussinessType", BussinessTypeSchema);
