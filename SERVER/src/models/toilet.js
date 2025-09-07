"use strict";
/* -------------------------------------------------------
                Toilet model 
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");


const ToiletSchema = new mongoose.Schema(
    {

        // Bu tuvaletin hangi işletmeye ait olduğunu belirten referans.
        // 'Business' modeline bağlanır ve her tuvaletin bir sahibi olmasını zorunlu kılar.
        business: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Business', 
            required: true,
            index: true, // İşletmeye göre tuvaletleri hızlıca bulmak için index eklendi.
        },

        // Tuvaletin işletme içindeki yerini veya adını belirten alan.
        // Örn: "Giriş Katı WC", "Kadınlar Tuvaleti", "Arka Bahçe".
        name: {
            type: String,
            trim: true,
            required: [true, "Tuvalet için bir isim belirtilmelidir."],
        },

        // Tuvaletin kullanım ücreti. 
        // 0, ücretsiz anlamına gelir.
        fee: { 
            type: Number, 
            required: true,
            default: 0,
            min: 0, // Ücretin negatif olmasını engeller.
        },

        // Tuvaletin spesifik özelliklerini içeren nesne.
        features: {
            // Cinsiyet kullanımı (Erkek, Kadın, Herkes için).
            gender: { 
                type: String, 
                enum: ['Unisex', 'Male', 'Female'], 
                default: 'Unisex' 
            },
            // Engelli erişimine uygun olup olmadığını belirtir.
            isAccessible: {
                type: Boolean,
                default: false 
            },
            // Bebek bakım ünitesi olup olmadığını belirtir.
            hasBabyChangingStation: {
                type: Boolean,
                default: false
            }
        },

        // Tuvaletin anlık operasyonel durumu.
        // Bu, 'isAvailable' boolean'ından daha esnektir.
        status: {
            type: String,
            enum: ['available', 'in_use', 'out_of_order'], // müsait, kullanımda, arızalı
            default: 'available',
        },

        // --- PERFORMANS İÇİN ---
        // Bu alanlar, her yorum eklendiğinde/silindiğinde 
        // Review modeli tarafından otomatik olarak hesaplanıp güncellenir.
        // Bu sayede puanları göstermek için sürekli hesaplama yapmak gerekmez.
        averageRatings: {
            cleanliness: { type: Number, default: 0 }, // Ortalama temizlik puanı
            overall: { type: Number, default: 0 },     // Genel ortalama puan
        },
        reviewCount: {
            type: Number,
            default: 0 // Toplam yorum sayısı
        }
    },

    {
        collection: "toilets",
        timestamps: true
    }
);

module.exports = mongoose.model("Toilet", ToiletSchema);
