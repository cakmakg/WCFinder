"use strict";
/* -------------------------------------------------------
                Toilet model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");


const ReservationSchema = new mongoose.Schema(
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
    },

    {
        collection: "reservation",
        timestamps: true,
    }
);

module.exports = mongoose.model("Reservation", ReservationSchema);
