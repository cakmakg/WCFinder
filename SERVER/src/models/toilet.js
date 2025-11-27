"use strict";
/* -------------------------------------------------------
                Toilet model - FIXED
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");

const ToiletSchema = new mongoose.Schema(
    {
        // ✅ FIX: Sadece 'business' field'ı kullan, 'businessId' kaldır
        business: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Business', 
            required: true,
            index: true, // İşletmeye göre tuvaletleri hızlıca bulmak için index
        },

        // Tuvaletin işletme içindeki yerini veya adını belirten alan
        name: {
            type: String,
            trim: true,
            required: [true, "Tuvalet için bir isim belirtilmelidir."],
        },

        // Tuvaletin kullanım ücreti
        fee: { 
            type: Number, 
            required: true,
            default: 1.00,
            min: 0,
        },

        // Tuvaletin spesifik özelliklerini içeren nesne
        features: {
            isAccessible: {
                type: Boolean,
                default: false 
            },
            hasBabyChangingStation: {
                type: Boolean,
                default: false
            }
        },

        // Tuvaletin anlık operasyonel durumu
        status: {
            type: String,
            enum: ['available', 'in_use', 'out_of_order'],
            default: 'available',
        },

        // Performans için - Review tarafından otomatik güncellenir
        averageRatings: {
            cleanliness: { type: Number, default: 0 },
            overall: { type: Number, default: 0 },
        },
        reviewCount: {
            type: Number,
            default: 0
        }
    },
    {
        collection: "toilets",
        timestamps: true
    }
);

module.exports = mongoose.model("Toilet", ToiletSchema);