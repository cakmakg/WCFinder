"use strict";

const businessRepository = require("../repositories/businessRepository");
const paymentRepository = require("../repositories/paymentRepository");
const payoutRepository = require("../repositories/payoutRepository");
const Rechnung = require("../models/rechnung");

/**
 * Payout Service - Business Logic Layer
 */
class PayoutService {
  /**
   * İşletmenin bekleyen ödemelerini getir
   */
  async getPendingPayments(ownerId) {
    const business = await businessRepository.findOne({ owner: ownerId });
    if (!business) {
      throw new Error("Business not found");
    }

    const pendingPayments = await paymentRepository.findWithPopulate(
      {
        businessId: business._id,
        status: "succeeded",
        payoutStatus: "pending",
      },
      ["userId", "usageId"]
    );

    const totalPendingAmount = pendingPayments.reduce(
      (sum, p) => sum + p.businessFee,
      0
    );

    return {
      business: {
        _id: business._id,
        businessName: business.businessName,
        pendingBalance: business.pendingBalance,
        totalEarnings: business.totalEarnings,
        totalPaidOut: business.totalPaidOut,
      },
      pendingPayments,
      totalPendingAmount,
    };
  }

  /**
   * İşletmenin finansal özetini getir
   */
  async getFinancialSummary(ownerId, startDate, endDate) {
    const business = await businessRepository.findOne({ owner: ownerId });
    if (!business) {
      throw new Error("Business not found");
    }

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const successfulPayments = await paymentRepository.find({
      businessId: business._id,
      status: "succeeded",
      ...dateFilter,
    });

    const totalRevenue = successfulPayments.reduce(
      (sum, p) => sum + p.businessFee,
      0
    );
    const totalPlatformFee = successfulPayments.reduce(
      (sum, p) => sum + p.platformFee,
      0
    );
    const paidOutAmount = successfulPayments
      .filter((p) => p.payoutStatus === "paid")
      .reduce((sum, p) => sum + p.businessFee, 0);
    const pendingAmount = successfulPayments
      .filter((p) => p.payoutStatus === "pending")
      .reduce((sum, p) => sum + p.businessFee, 0);

    // Aylık breakdown
    const monthlyBreakdown = {};
    successfulPayments.forEach((payment) => {
      const month = new Date(payment.createdAt).toISOString().slice(0, 7);
      if (!monthlyBreakdown[month]) {
        monthlyBreakdown[month] = {
          month,
          revenue: 0,
          platformFee: 0,
          businessFee: 0,
          paymentCount: 0,
        };
      }
      monthlyBreakdown[month].revenue += payment.amount;
      monthlyBreakdown[month].platformFee += payment.platformFee;
      monthlyBreakdown[month].businessFee += payment.businessFee;
      monthlyBreakdown[month].paymentCount += 1;
    });

    return {
      business: {
        _id: business._id,
        businessName: business.businessName,
        pendingBalance: business.pendingBalance,
        totalEarnings: business.totalEarnings,
        totalPaidOut: business.totalPaidOut,
      },
      summary: {
        totalRevenue,
        totalPlatformFee,
        paidOutAmount,
        pendingAmount,
        paymentCount: successfulPayments.length,
      },
      monthlyBreakdown: Object.values(monthlyBreakdown).sort((a, b) =>
        b.month.localeCompare(a.month)
      ),
    };
  }

  /**
   * İşletmenin ödeme geçmişini getir
   */
  async getPayoutHistory(ownerId) {
    const business = await businessRepository.findOne({ owner: ownerId });
    if (!business) {
      throw new Error("Business not found");
    }

    return await payoutRepository.findWithPopulate(
      { businessId: business._id },
      ["approvedBy"]
    );
  }

  /**
   * Tüm işletmelerin bekleyen ödemelerini getir (Admin)
   */
  async getAllPendingPayments() {
    const pendingPayments = await paymentRepository.aggregate([
      {
        $match: {
          status: "succeeded",
          payoutStatus: "pending",
        },
      },
      {
        $group: {
          _id: "$businessId",
          totalPending: { $sum: "$businessFee" },
          paymentCount: { $sum: 1 },
          payments: { $push: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "business",
          localField: "_id",
          foreignField: "_id",
          as: "business",
        },
      },
      {
        $unwind: "$business",
      },
      {
        $project: {
          businessId: "$_id",
          businessName: "$business.businessName",
          owner: "$business.owner",
          totalPending: 1,
          paymentCount: 1,
          payments: {
            $slice: ["$payments", 10],
          },
        },
      },
      {
        $sort: { totalPending: -1 },
      },
    ]);

    const totalPending = pendingPayments.reduce(
      (sum, p) => sum + p.totalPending,
      0
    );

    return {
      businesses: pendingPayments,
      totalPending,
      businessCount: pendingPayments.length,
    };
  }

  /**
   * Payout oluştur
   */
  async createPayout(businessId, amount, paymentMethod, notes, periodStart, periodEnd, approvedBy) {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    const pendingPayments = await paymentRepository.find({
      businessId: business._id,
      status: "succeeded",
      payoutStatus: "pending",
    });

    const totalPending = pendingPayments.reduce(
      (sum, p) => sum + p.businessFee,
      0
    );

    if (amount > totalPending) {
      throw new Error(
        `Amount (${amount}) exceeds pending balance (${totalPending})`
      );
    }

    // Payout kaydı oluştur
    const payout = await payoutRepository.create({
      businessId: business._id,
      amount,
      currency: "EUR",
      status: "pending",
      paymentMethod,
      period: {
        startDate: periodStart
          ? new Date(periodStart)
          : new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        endDate: periodEnd ? new Date(periodEnd) : new Date(),
      },
      paymentCount: pendingPayments.length,
      notes,
      approvedBy,
    });

    // Payment'ları güncelle
    await paymentRepository.updateMany(
      {
        businessId: business._id,
        status: "succeeded",
        payoutStatus: "pending",
        _id: { $in: pendingPayments.map((p) => p._id) },
      },
      {
        $set: {
          payoutStatus: "processing",
          payoutId: payout._id,
        },
      }
    );

    // Business balance'ı güncelle
    await businessRepository.findByIdAndUpdate(business._id, {
      $inc: {
        pendingBalance: -amount,
        totalPaidOut: amount,
      },
    });

    return payout;
  }

  /**
   * Payout'u tamamla
   */
  async completePayout(payoutId, transactionReference, notes) {
    const payout = await payoutRepository.findById(payoutId);
    if (!payout) {
      throw new Error("Payout not found");
    }

    if (payout.status !== "pending" && payout.status !== "processing") {
      throw new Error("Payout is already completed or cancelled");
    }

    await payoutRepository.findByIdAndUpdate(payoutId, {
      status: "completed",
      completedAt: new Date(),
      transactionReference,
      notes,
    });

    // Payment'ları güncelle
    await paymentRepository.updateMany(
      { payoutId: payout._id },
      {
        $set: {
          payoutStatus: "paid",
          paidOutAt: new Date(),
        },
      }
    );

    return await payoutRepository.findById(payoutId);
  }

  /**
   * İşletmeler ve payout'larını getir (Rechnung için)
   */
  async getBusinessesWithPayouts() {
    const businesses = await businessRepository.findWithPopulate(
      { approvalStatus: "approved" },
      ["owner"]
    );

    const businessesWithPayouts = await Promise.all(
      businesses.map(async (business) => {
        const payouts = await payoutRepository.findWithPopulate(
          {
            businessId: business._id,
            status: "completed",
          },
          ["approvedBy"]
        );

        const payoutsWithRechnung = await Promise.all(
          payouts.map(async (payout) => {
            const rechnung = await Rechnung.findOne({ payoutId: payout._id });
            return {
              ...payout.toObject(),
              hasRechnung: !!rechnung,
              rechnungId: rechnung?._id,
              rechnungsnummer: rechnung?.rechnungsnummer,
            };
          })
        );

        return {
          _id: business._id,
          businessName: business.businessName,
          businessType: business.businessType,
          owner: business.owner,
          address: business.address,
          pendingBalance: business.pendingBalance,
          totalEarnings: business.totalEarnings,
          totalPaidOut: business.totalPaidOut,
          payouts: payoutsWithRechnung,
          payoutCount: payoutsWithRechnung.length,
        };
      })
    );

    return businessesWithPayouts.filter((b) => b.payoutCount > 0);
  }

  /**
   * Aylık özet (Admin)
   */
  async getMonthlySummary(year, month) {
    const startDate =
      year && month
        ? new Date(year, month - 1, 1)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate =
      year && month
        ? new Date(year, month, 0, 23, 59, 59)
        : new Date();

    const payments = await paymentRepository.findWithPopulate(
      {
        status: "succeeded",
        createdAt: { $gte: startDate, $lte: endDate },
      },
      ["businessId"]
    );

    const totalPlatformFee = payments.reduce(
      (sum, p) => sum + p.platformFee,
      0
    );
    const totalBusinessFee = payments.reduce(
      (sum, p) => sum + p.businessFee,
      0
    );

    const businessBreakdown = {};
    payments.forEach((payment) => {
      const businessId =
        payment.businessId?._id?.toString() || "unknown";
      if (!businessBreakdown[businessId]) {
        businessBreakdown[businessId] = {
          businessId: payment.businessId?._id,
          businessName: payment.businessId?.businessName || "Unknown",
          totalRevenue: 0,
          platformFee: 0,
          businessFee: 0,
          paymentCount: 0,
        };
      }
      businessBreakdown[businessId].totalRevenue += payment.amount;
      businessBreakdown[businessId].platformFee += payment.platformFee;
      businessBreakdown[businessId].businessFee += payment.businessFee;
      businessBreakdown[businessId].paymentCount += 1;
    });

    return {
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalRevenue: totalPlatformFee + totalBusinessFee,
        totalPlatformFee,
        totalBusinessFee,
        paymentCount: payments.length,
      },
      businessBreakdown: Object.values(businessBreakdown),
    };
  }
}

module.exports = new PayoutService();

