// review.model.js

"use strict";

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
            required: true 
        },
        usage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usage',
            required: false,
            unique: true,
            sparse: true,
        },
        rating: {
            cleanliness: { type: Number, min: 1, max: 5, required: true },
            accessibility: { type: Number, min: 1, max: 5, required: true },
            overall: { type: Number, min: 1, max: 5, required: true },
        },
        comment: { 
            type: String,
            trim: true,
            maxlength: 1000,
        },
    },
    {
        collection: "reviews",
        timestamps: true,
    }
);

// DÜZELTME 1: Index, şemadaki doğru alan adlarını ('userId', 'toiletId') kullanmalı.
ReviewSchema.index({ userId: 1, toiletId: 1 }, { unique: true });

// --- PERFORMANS İÇİN OTOMATİK PUAN HESAPLAMA MEKANİZMASI ---
ReviewSchema.statics.calculateAverageRatings = async function(toiletId) {
    // Fonksiyona gelen toiletId'nin null veya undefined olmaması için bir kontrol eklemek iyi bir pratiktir.
    if (!toiletId) return;

    const stats = await this.aggregate([
        // DÜZELTME 2: $match sorgusu, doğru alan adını ('toiletId') kullanmalı.
        { $match: { toiletId: new mongoose.Types.ObjectId(toiletId) } },
        {
            $group: {
                // DÜZELTME 2: $group, doğru alan adını ('$toiletId') kullanmalı.
                _id: '$toiletId', 
                reviewCount: { $sum: 1 },
                avgCleanliness: { $avg: '$rating.cleanliness' }, 
                avgAccessibility: { $avg: '$rating.accessibility' }, 
                avgOverall: { $avg: '$rating.overall' }
            }
        }
    ]);

    // İlgili Toilet modelini import etmek yerine doğrudan mongoose üzerinden erişmek daha esnektir.
    const Toilet = mongoose.model('Toilet');

    if (stats.length > 0) {
        await Toilet.findByIdAndUpdate(toiletId, {
            reviewCount: stats[0].reviewCount,
            averageRatings: {
                cleanliness: stats[0].avgCleanliness.toFixed(1),
                overall: stats[0].avgOverall.toFixed(1)
            }
        });
    } else {
        await Toilet.findByIdAndUpdate(toiletId, {
            reviewCount: 0,
            averageRatings: { cleanliness: 0, overall: 0 }
        });
    }
};

// YENİ BİR YORUM KAYDEDİLDİKTEN SONRA
ReviewSchema.post('save', async function() {
    // DÜZELTME 3: Fonksiyona doğru parametre ('this.toiletId') gönderilmeli.
    await this.constructor.calculateAverageRatings(this.toiletId);
});

// BİR YORUM SİLİNDİKTEN SONRA (findOneAndDelete gibi metodlar için)
ReviewSchema.post('findOneAndDelete', async function(doc) {
    // 'remove' yerine 'findOneAndDelete' hook'unu kullanmak daha modern ve güvenilirdir.
    // 'doc' silinen dokümanı temsil eder.
    if (doc) {
        await doc.constructor.calculateAverageRatings(doc.toiletId);
    }
});

module.exports = mongoose.model("Review", ReviewSchema);