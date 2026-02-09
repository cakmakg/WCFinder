/**
 * Payment Controller
 * 
 * Handles all payment-related operations including:
 * - Stripe payment processing
 * - PayPal payment processing
 * - Payment status updates
 * - Webhook handling
 * 
 * Security:
 * - Input validation for all payment data
 * - ObjectId validation to prevent injection attacks
 * - User authentication required for all endpoints
 * - Payment ownership verification
 * 
 * Clean Code Principles:
 * - DRY: Business logic delegated to paymentService
 * - Single Responsibility: Only handles HTTP requests/responses
 * - Dependency Injection: Services can be mocked for testing
 * 
 * Error Handling:
 * - Comprehensive error logging
 * - User-friendly error messages
 * - Proper HTTP status codes
 * 
 * @author WCFinder Team
 * @version 2.0.0
 */

"use strict";

/**
 * Payment Controller - Dependency Injection Pattern
 * 
 * Dependencies are injected at the top of the file for better testability.
 * In tests, these can be easily mocked by reassigning the module exports.
 * 
 * Clean Code Principles:
 * - Dependency Injection: Services and utilities are injected, not hardcoded
 * - Testability: All dependencies can be mocked
 * - Single Responsibility: Only handles HTTP requests/responses
 */
const paymentService = require("../services/paymentService");
const paymentRepository = require("../repositories/paymentRepository");
const getStripe = require("../config/stripe");
const logger = require("../utils/logger");
const { validateObjectId } = require("../middleware/validation");

module.exports = {
  /**
   * POST: Create Stripe Payment Intent
   * 
   * Creates a Stripe payment intent for either:
   * - An existing usage/booking (usageId provided)
   * - A new booking (bookingData provided)
   * 
   * Security:
   * - Validates ObjectId format if usageId is provided
   * - Validates bookingData structure
   * - Ensures user is authenticated
   * - Verifies payment ownership
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  createStripePayment: async (req, res) => {
    /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Create Stripe Payment Intent"
        */

    try {
      const { usageId, bookingData } = req.body;

      // ✅ SECURITY: Validate usageId format if provided
      if (usageId && !validateObjectId(usageId)) {
        res.errorStatusCode = 400;
        throw new Error("Invalid usageId format");
      }

      // ✅ VALIDATION: Ensure at least one identifier is provided
      if (!usageId && !bookingData) {
        res.errorStatusCode = 400;
        throw new Error("usageId or bookingData is required");
      }

      let result;
      if (usageId) {
        // Existing usage: Create payment for already-created booking
        logger.debug('Creating Stripe payment for existing usage', {
          usageId,
          userId: req.user._id
        });
        result = await paymentService.createStripePayment(
          usageId,
          req.user._id
        );
      } else if (bookingData) {
        // New booking: Create payment first, usage will be created after successful payment
        logger.debug('Creating Stripe payment from booking data', {
          userId: req.user._id,
          businessId: bookingData.business?.id
        });
        result = await paymentService.createStripePaymentFromBooking(
          bookingData,
          req.user._id
        );
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

      logger.debug('createPayPalOrder called', {
        userId: req.user._id,
        hasUsageId: !!usageId,
        hasBookingData: !!bookingData,
        bookingDataKeys: bookingData ? Object.keys(bookingData) : null,
      });

      let result;
      if (usageId) {
        // Mevcut usage için payment oluştur
        result = await paymentService.createPayPalOrder(
          usageId,
          req.user._id
        );
      } else if (bookingData) {
        // ✅ YENİ: Booking bilgilerinden payment oluştur (ödeme sonrası usage oluşturulacak)
        logger.debug('Creating PayPal order from booking data', {
          businessId: bookingData.businessId,
          totalAmount: bookingData.totalAmount,
        });
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
      logger.error('PayPal order creation failed', error, {
        userId: req.user?._id,
        hasBookingData: !!req.body.bookingData,
        hasUsageId: !!req.body.usageId,
        bookingDataKeys: req.body.bookingData ? Object.keys(req.body.bookingData) : null,
        errorMessage: error.message,
        errorStack: error.stack,
      });
      
      // Return more detailed error message
      const errorMessage = error.message || 'Failed to create PayPal order';
      const statusCode = error.statusCode || 500;
      
      res.status(statusCode).send({
        error: true,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
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
      ["usageId", "userId", "businessId"]
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
      ["usageId", "userId", "businessId"]
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