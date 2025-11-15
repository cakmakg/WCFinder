"use strict";

const paymentRepository = require("../repositories/paymentRepository");
const usageRepository = require("../repositories/usageRepository");
const businessRepository = require("../repositories/businessRepository");
const stripe = require("../config/stripe");
const paypalClient = require("../config/paypal");
const paypal = require("@paypal/checkout-server-sdk");

/**
 * Payment Service - Business Logic Layer
 */
class PaymentService {
  /**
   * Komisyon hesaplama
   */
  calculateFees(totalAmount) {
    const platformFee = 0.5; // Sabit 0.50€
    const businessFee = totalAmount - platformFee;

    return {
      platformFee: Math.round(platformFee * 100) / 100,
      businessFee: Math.round(businessFee * 100) / 100,
    };
  }

  /**
   * Stripe ödeme başlat
   */
  async createStripePayment(usageId, userId) {
    // Usage kontrolü
    const usage = await usageRepository.findById(usageId);
    if (!usage) {
      throw new Error("Usage not found");
    }

    // Kullanıcı kontrolü
    if (usage.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    // Ödeme kontrolü
    const existingPayment = await paymentRepository.findOne({
      usageId,
      status: "succeeded",
    });
    if (existingPayment) {
      throw new Error("This usage has already been paid");
    }

    // Business bilgisi
    const usageWithBusiness = await usageRepository.findById(usageId);
    if (!usageWithBusiness) {
      throw new Error("Usage not found");
    }
    
    // Business'ı populate et
    await usageWithBusiness.populate("businessId");
    if (!usageWithBusiness.businessId) {
      throw new Error("Business not found for this usage");
    }

    // Komisyon hesapla
    const fees = this.calculateFees(usage.totalFee);

    // Stripe PaymentIntent oluştur
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(usage.totalFee * 100),
      currency: "eur",
      metadata: {
        usageId: usageId.toString(),
        userId: userId.toString(),
        businessId: usageWithBusiness.businessId._id.toString(),
      },
      description: `Payment for usage #${usageId}`,
    });

    // Payment kaydı oluştur
    const payment = await paymentRepository.create({
      usageId,
      userId,
      businessId: usageWithBusiness.businessId._id,
      amount: usage.totalFee,
      platformFee: fees.platformFee,
      businessFee: fees.businessFee,
      currency: "EUR",
      status: "pending",
      paymentMethod: "credit_card",
      paymentProvider: "stripe",
      paymentIntentId: paymentIntent.id,
    });

    return {
      paymentId: payment._id,
      clientSecret: paymentIntent.client_secret,
      amount: usage.totalFee,
      currency: "EUR",
    };
  }

  /**
   * PayPal ödeme başlat
   */
  async createPayPalOrder(usageId, userId) {
    // Usage kontrolü
    const usage = await usageRepository.findById(usageId);
    if (!usage) {
      throw new Error("Usage not found");
    }

    // Kullanıcı kontrolü
    if (usage.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    // Ödeme kontrolü
    const existingPayment = await paymentRepository.findOne({
      usageId,
      status: "succeeded",
    });
    if (existingPayment) {
      throw new Error("This usage has already been paid");
    }

    // PayPal Order oluştur
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: usage.totalFee.toFixed(2),
          },
          description: `Payment for usage #${usageId}`,
        },
      ],
    });

    const order = await paypalClient.execute(request);

    // Business bilgisi
    const usageWithBusiness = await usageRepository.findById(usageId);
    if (!usageWithBusiness) {
      throw new Error("Usage not found");
    }
    
    // Business'ı populate et
    await usageWithBusiness.populate("businessId");
    if (!usageWithBusiness.businessId) {
      throw new Error("Business not found for this usage");
    }

    // Komisyon hesapla
    const fees = this.calculateFees(usage.totalFee);

    // Payment kaydı oluştur
    const payment = await paymentRepository.create({
      usageId,
      userId,
      businessId: usageWithBusiness.businessId._id,
      amount: usage.totalFee,
      platformFee: fees.platformFee,
      businessFee: fees.businessFee,
      currency: "EUR",
      status: "pending",
      paymentMethod: "paypal",
      paymentProvider: "paypal",
      paypalOrderId: order.result.id,
    });

    return {
      paymentId: payment._id,
      orderId: order.result.id,
      amount: usage.totalFee,
      currency: "EUR",
    };
  }

  /**
   * PayPal ödeme onayla
   */
  async capturePayPalOrder(orderId) {
    const payment = await paymentRepository.findOne({ paypalOrderId: orderId });
    if (!payment) {
      throw new Error("Payment not found");
    }

    // PayPal Order'ı yakala
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await paypalClient.execute(request);

    // Payment durumunu güncelle
    await paymentRepository.findByIdAndUpdate(payment._id, {
      status: "succeeded",
      transactionId: capture.result.purchase_units[0].payments.captures[0].id,
      gatewayResponse: capture.result,
    });

    // Usage durumunu güncelle
    await usageRepository.findByIdAndUpdate(payment.usageId, {
      paymentStatus: "paid",
      paymentId: payment._id,
    });

    // Business balance'ı güncelle
    if (payment.businessId) {
      await businessRepository.findByIdAndUpdate(payment.businessId, {
        $inc: {
          pendingBalance: payment.businessFee,
          totalEarnings: payment.businessFee,
        },
      });
    }

    return await paymentRepository.findById(payment._id);
  }

  /**
   * Stripe webhook işle
   */
  async handleStripeWebhook(event) {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      const payment = await paymentRepository.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (payment) {
        await paymentRepository.findByIdAndUpdate(payment._id, {
          status: "succeeded",
          transactionId: paymentIntent.id,
          gatewayResponse: paymentIntent,
        });

        // Usage'ı güncelle
        await usageRepository.findByIdAndUpdate(payment.usageId, {
          paymentStatus: "paid",
          paymentId: payment._id,
        });

        // Business balance'ı güncelle
        if (payment.businessId) {
          await businessRepository.findByIdAndUpdate(payment.businessId, {
            $inc: {
              pendingBalance: payment.businessFee,
              totalEarnings: payment.businessFee,
            },
          });
        }
      }
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      const payment = await paymentRepository.findOne({
        paymentIntentId: paymentIntent.id,
      });

      if (payment) {
        await paymentRepository.findByIdAndUpdate(payment._id, {
          status: "failed",
          errorMessage: paymentIntent.last_payment_error?.message,
          gatewayResponse: paymentIntent,
        });

        await usageRepository.findByIdAndUpdate(payment.usageId, {
          paymentStatus: "failed",
        });
      }
    }
  }

  /**
   * İade işlemi
   */
  async refundPayment(paymentId, reason) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.status !== "succeeded") {
      throw new Error("Only succeeded payments can be refunded");
    }

    let refund;

    if (payment.paymentProvider === "stripe") {
      refund = await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
      });

      await paymentRepository.findByIdAndUpdate(payment._id, {
        status: "refunded",
        refund: {
          refundId: refund.id,
          refundedAt: new Date(),
          refundAmount: payment.amount,
          refundReason: reason || "Requested by admin",
        },
      });
    }

    if (payment.paymentProvider === "paypal") {
      const request = new paypal.payments.CapturesRefundRequest(
        payment.transactionId
      );
      request.requestBody({});
      refund = await paypalClient.execute(request);

      await paymentRepository.findByIdAndUpdate(payment._id, {
        status: "refunded",
        refund: {
          refundId: refund.result.id,
          refundedAt: new Date(),
          refundAmount: payment.amount,
          refundReason: reason || "Requested by admin",
        },
      });
    }

    return await paymentRepository.findById(payment._id);
  }

  /**
   * Kullanıcının ödemelerini getir
   */
  async getUserPayments(userId) {
    return await paymentRepository.findWithPopulate(
      { userId },
      ["usageId", "userId"]
    );
  }
}

module.exports = new PaymentService();

