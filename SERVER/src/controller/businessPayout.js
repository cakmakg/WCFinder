// controllers/businessPayout.js - REFACTORED
// İşletmelere ödeme dağıtımı ve finansal yönetim

"use strict";

const payoutService = require("../services/payoutService");

module.exports = {
  // ✅ İşletmenin bekleyen ödemelerini getir (Owner için)
  getPendingPayments: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Get Pending Payments for Business (Owner)"
        */

    try {
      const result = await payoutService.getPendingPayments(req.user._id);

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ İşletmenin finansal özetini getir (Owner için)
  getFinancialSummary: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Get Financial Summary for Business (Owner)"
        */

    try {
      const { startDate, endDate } = req.query;

      const result = await payoutService.getFinancialSummary(
        req.user._id,
        startDate,
        endDate
      );

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ İşletmenin ödeme geçmişini getir (Owner için)
  getPayoutHistory: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Get Payout History for Business (Owner)"
        */

    try {
      const result = await payoutService.getPayoutHistory(req.user._id);

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ Tüm işletmelerin bekleyen ödemelerini getir (Admin için)
  getAllPendingPayments: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Get All Pending Payments (Admin)"
        */

    try {
      const result = await payoutService.getAllPendingPayments();

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ İşletmeye ödeme dağıt (Admin için)
  createPayout: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Create Payout for Business (Admin)"
        */

    try {
      const {
        businessId,
        amount,
        paymentMethod,
        notes,
        periodStart,
        periodEnd,
      } = req.body;

      if (!businessId || !amount || !paymentMethod) {
        res.errorStatusCode = 400;
        throw new Error(
          "businessId, amount, and paymentMethod are required"
        );
      }

      const result = await payoutService.createPayout(
        businessId,
        amount,
        paymentMethod,
        notes,
        periodStart,
        periodEnd,
        req.user._id
      );

      res.status(201).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ Payout'u tamamla (Admin için - manuel ödeme sonrası)
  completePayout: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Complete Payout (Admin)"
        */

    try {
      const { payoutId } = req.params;
      const { transactionReference, notes } = req.body;

      const result = await payoutService.completePayout(
        payoutId,
        transactionReference,
        notes
      );

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ İşletmeler ve payout'larını getir (Admin - Rechnung için)
  getBusinessesWithPayouts: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Get Businesses with Completed Payouts (Admin - for Rechnung)"
        */

    try {
      const result = await payoutService.getBusinessesWithPayouts();

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ Aylık özet (Admin için - tüm işletmeler)
  getMonthlySummary: async (req, res) => {
    /*
            #swagger.tags = ["Business Payouts"]
            #swagger.summary = "Get Monthly Summary (Admin)"
        */

    try {
      const { year, month } = req.query;

      const result = await payoutService.getMonthlySummary(
        year ? parseInt(year) : null,
        month ? parseInt(month) : null
      );

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },
};
