"use strict";
/**
 * Monthly Report Model
 * 
 * İşletme bazlı aylık raporları saklar.
 * Her rapor belirli bir işletme ve ay/yıl için oluşturulur.
 * Raporlar bir kez oluşturulduktan sonra kalıcı olarak saklanır.
 */

const mongoose = require("mongoose");

const MonthlyReportSchema = new mongoose.Schema(
  {
    // Rapor tanımlayıcı bilgileri
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    // İşletme bilgileri (rapor oluşturulduğu andaki snapshot)
    businessSnapshot: {
      businessName: String,
      businessType: String,
      address: String,
      ownerName: String,
      ownerEmail: String,
    },

    // Finansal veriler
    financials: {
      totalRevenue: {
        type: Number,
        default: 0,
      },
      platformCommission: {
        type: Number,
        default: 0,
      },
      businessRevenue: {
        type: Number,
        default: 0,
      },
      commissionRate: {
        type: Number,
        default: 0,
      },
      averageTransactionValue: {
        type: Number,
        default: 0,
      },
    },

    // Rezervasyon istatistikleri
    bookings: {
      total: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Number,
        default: 0,
      },
      cancelled: {
        type: Number,
        default: 0,
      },
      pending: {
        type: Number,
        default: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
      },
    },

    // Günlük breakdown (her gün için veri)
    dailyBreakdown: [
      {
        date: Date,
        revenue: Number,
        bookings: Number,
        commission: Number,
      },
    ],

    // Tuvalet bazlı istatistikler
    toiletStats: [
      {
        toiletId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Toilet",
        },
        toiletName: String,
        usageCount: Number,
        revenue: Number,
      },
    ],

    // Rating/Review istatistikleri
    ratings: {
      averageRating: {
        type: Number,
        default: 0,
      },
      totalReviews: {
        type: Number,
        default: 0,
      },
      newReviews: {
        type: Number,
        default: 0,
      },
    },

    // Karşılaştırma verileri (önceki aya göre)
    comparison: {
      revenueChange: Number, // Yüzde değişim
      bookingsChange: Number,
      ratingChange: Number,
    },

    // Rapor metadata
    status: {
      type: String,
      enum: ["draft", "finalized", "archived"],
      default: "finalized",
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      maxLength: 1000,
    },

    // PDF dosya bilgisi (opsiyonel)
    pdfUrl: String,
    pdfGeneratedAt: Date,
  },
  {
    timestamps: true,
    collection: "monthlyReports",
  }
);

// Compound index: Her işletme için her ay/yıl kombinasyonu benzersiz
MonthlyReportSchema.index({ businessId: 1, year: 1, month: 1 }, { unique: true });

// İşletme bazlı sorgu indexi
MonthlyReportSchema.index({ businessId: 1, createdAt: -1 });

// Tarih bazlı sorgu indexi
MonthlyReportSchema.index({ year: 1, month: 1 });

// Virtual: Rapor dönemi label
MonthlyReportSchema.virtual("periodLabel").get(function () {
  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  return `${monthNames[this.month - 1]} ${this.year}`;
});

// Virtual: Türkçe dönem label
MonthlyReportSchema.virtual("periodLabelTR").get(function () {
  const monthNames = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  return `${monthNames[this.month - 1]} ${this.year}`;
});

// JSON dönüşümünde virtual'ları dahil et
MonthlyReportSchema.set("toJSON", { virtuals: true });
MonthlyReportSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("MonthlyReport", MonthlyReportSchema);

