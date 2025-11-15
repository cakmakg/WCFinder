"use strict";
/* -------------------------------------------------------
                Bussiness model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");

const BusinessSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        businessName: {
            type: String,
            trim: true,
            required: [true, "Business name is required."],
        },

        businessType: {
            type: String,
            enum: ['Cafe', 'Restaurant', 'Hotel', 'Shop', 'Gas Station', 'Other'],
            required: true,
        },

        // Physical location details
        address: {
            street: { type: String, trim: true, required: true },
            city: { type: String, trim: true, required: true },
            postalCode: { type: String, trim: true, required: true },
            country: { type: String, trim: true, required: true },
        },
           
        // GeoJSON for geospatial queries (e.g., "find WCs near me")
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            }
        },

        openingHours: {
            type: String, // e.g., "Mon-Fri 09:00-18:00; Sat 10:00-16:00"
            trim: true,
        },

        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },

        // ✅ YENİ: Finansal Bilgiler
        // Bekleyen ödeme (henüz dağıtılmamış)
        pendingBalance: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ✅ YENİ: Toplam kazanç (tüm zamanlar)
        totalEarnings: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ✅ YENİ: Toplam dağıtılan ödeme
        totalPaidOut: {
            type: Number,
            default: 0,
            min: 0,
        },

        // ✅ YENİ: Banka hesap bilgileri (opsiyonel - manuel ödeme için)
        bankAccount: {
            accountHolder: String,
            iban: String,
            bankName: String,
            bic: String,
        },

        // ✅ YENİ: Stripe Connect hesap ID (otomatik ödeme için - gelecekte)
        stripeAccountId: {
            type: String,
            index: true,
            sparse: true,
        },

        // ✅ YENİ: Fatura için gerekli bilgiler
        phone: {
            type: String,
            trim: true,
        },
        ustIdNr: {
            type: String,
            trim: true,
        }, // USt-IdNr (Umsatzsteuer-Identifikationsnummer)

    },
    {
        collection: "business",
        timestamps: true,
    }
);


module.exports = mongoose.model("Business", BusinessSchema);