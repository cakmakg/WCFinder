// controllers/payment.controller.js - REFACTORED

"use strict";

const paymentService = require("../services/paymentService");
const paymentRepository = require("../repositories/paymentRepository");
const getStripe = require("../config/stripe");
const logger = require("../utils/logger");

module.exports = {
  // ✅ Stripe ile ödeme başlatma (usageId ile - mevcut kullanım)
  createStripePayment: async (req, res) => {
    /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Create Stripe Payment Intent"
        */

    try {
      const { usageId, bookingData } = req.body;

      let result;
      if (usageId) {
        // Mevcut usage için payment oluştur
        result = await paymentService.createStripePayment(
          usageId,
          req.user._id
        );
      } else if (bookingData) {
        // ✅ YENİ: Booking bilgilerinden payment oluştur (ödeme sonrası usage oluşturulacak)
        result = await paymentService.createStripePaymentFromBooking(
          bookingData,
          req.user._id
        );
      } else {
        res.errorStatusCode = 400;
        throw new Error("usageId or bookingData is required");
      }

      // IP ve User Agent bilgilerini ekle
      await paymentRepository.findByIdAndUpdate(result.paymentId, {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.status(201).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ PayPal ile ödeme başlatma (usageId ile - mevcut kullanım)
  createPayPalOrder: async (req, res) => {
    /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Create PayPal Order"
        */

    try {
      const { usageId, bookingData } = req.body;

      let result;
      if (usageId) {
        // Mevcut usage için payment oluştur
        result = await paymentService.createPayPalOrder(
          usageId,
          req.user._id
        );
      } else if (bookingData) {
        // ✅ YENİ: Booking bilgilerinden payment oluştur (ödeme sonrası usage oluşturulacak)
        result = await paymentService.createPayPalOrderFromBooking(
          bookingData,
          req.user._id
        );
      } else {
        res.errorStatusCode = 400;
        throw new Error("usageId or bookingData is required");
      }

      // IP ve User Agent bilgilerini ekle
      await paymentRepository.findByIdAndUpdate(result.paymentId, {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.status(201).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ PayPal ödeme onaylama
  capturePayPalOrder: async (req, res) => {
    /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Capture PayPal Order"
        */

    try {
      const { orderId } = req.body;

      if (!orderId) {
        res.errorStatusCode = 400;
        throw new Error("orderId is required");
      }

      const result = await paymentService.capturePayPalOrder(orderId);

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ YENİ: Stripe payment'i confirm et ve usage oluştur (frontend'den çağrılır)
  confirmStripePayment: async (req, res) => {
    /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Confirm Stripe Payment and Create Usage"
        */

    try {
      const { paymentIntentId } = req.body;

      if (!paymentIntentId) {
        res.errorStatusCode = 400;
        throw new Error("paymentIntentId is required");
      }

      const result = await paymentService.confirmStripePayment(
        paymentIntentId,
        req.user._id
      );

      res.status(200).send({
        error: false,
        result: {
          paymentId: result._id,
          usageId: result.usageId,
        },
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ Stripe Webhook Handler
  stripeWebhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await paymentService.handleStripeWebhook(event);
      res.json({ received: true });
    } catch (error) {
      logger.error("Stripe webhook processing failed", error, {
        eventType: event?.type,
        eventId: event?.id
      });
      res.status(500).json({ error: "Webhook processing failed" });
    }
  },

  // ✅ İade işlemi
  refundPayment: async (req, res) => {
    /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Refund Payment (Admin Only)"
        */

    try {
      const { id } = req.params;
      const { reason } = req.body;

      const result = await paymentService.refundPayment(id, reason);

      res.status(200).send({
        error: false,
        result,
      });
    } catch (error) {
      throw error;
    }
  },

  // ✅ Kullanıcının kendi ödemelerini görebilmesi
  myPayments: async (req, res) => {
    /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Get My Payments"
        */

    try {
      const data = await paymentService.getUserPayments(req.user._id);

      res.status(200).send({
        error: false,
        result: data,
      });
    } catch (error) {
      throw error;
    }
  },

  // CRUD Operations
  list: async (req, res) => {
    const data = await res.getModelList(
      require("../models/payment"),
      {},
      ["usageId", "userId"]
    );
    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(require("../models/payment")),
      result: data,
    });
  },

  read: async (req, res) => {
    const data = await paymentRepository.findWithPopulate(
      { _id: req.params.id },
      ["usageId", "userId"]
    );
    res.status(200).send({
      error: false,
      result: data[0] || null,
    });
  },

  update: async (req, res) => {
    const result = await paymentRepository.findByIdAndUpdate(
      req.params.id,
      req.body
    );
    res.status(202).send({
      error: false,
      result,
    });
  },

  deletee: async (req, res) => {
    const result = await paymentRepository.deleteOne({ _id: req.params.id });
    if (result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.errorStatusCode = 404;
      throw new Error("Payment record not found.");
    }
  },
};