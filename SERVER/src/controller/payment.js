// controllers/payment.controller.js - GÜNCELLENMİŞ HALİ

"use strict";

const Payment = require('../models/payment');
const Usage = require('../models/usage');
const stripe = require('../config/stripe');
const paypalClient = require('../config/paypal');
const paypal = require('@paypal/checkout-server-sdk');

module.exports = {

    
    // ✅ YENİ: Stripe ile ödeme başlatma
    createStripePayment: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Create Stripe Payment Intent"
        */
        
        try {
            const { usageId } = req.body;
            
             console.log('Creating Stripe payment for usageId:', usageId);
         
            
            if (!usageId) {
                res.errorStatusCode = 404;
                throw new Error("usageId is required");
            }
               // Usage kaydını bul
            const usage = await Usage.findById(usageId).populate('userId');

             if (!usage) {
            res.errorStatusCode = 404;
            throw new Error("Usage not found");
        }

            // Kullanıcı kontrolü - sadece kendi kullanımı için ödeme yapabilir
            if (usage.userId._id.toString() !== req.user._id.toString()) {
                res.errorStatusCode = 403;
                throw new Error("Unauthorized");
            }

            // Daha önce ödeme yapılmış mı kontrol et
            const existingPayment = await Payment.findOne({ usage: usageId });
            if (existingPayment && existingPayment.status === 'succeeded') {
                res.errorStatusCode = 400;
                throw new Error("This usage has already been paid");
            }

            // Stripe PaymentIntent oluştur
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(usage.totalFee * 100), // Cent/kuruş cinsine çevir
                currency: 'eur',
                metadata: {
                    usageId: usageId,
                    userId: req.user._id.toString(),
                },
                description: `Payment for usage #${usageId}`,
            });

            // Payment kaydı oluştur
            const payment = await Payment.create({
                usage: usageId,
                user: req.user._id,
                amount: usage.totalFee,
                currency: 'EUR',
                status: 'pending',
                paymentMethod: 'credit_card',
                paymentProvider: 'stripe',
                paymentIntentId: paymentIntent.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });

            res.status(201).send({
                error: false,
                result: {
                    paymentId: payment._id,
                    clientSecret: paymentIntent.client_secret, // Frontend için gerekli
                    amount: usage.totalFee,
                    currency: 'EUR',
                },
            });

        } catch (error) {
            throw error;
        }
    },

    // ✅ YENİ: PayPal ile ödeme başlatma
    createPayPalOrder: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Create PayPal Order"
        */
        
        try {
            const { usageId } = req.body;
            
            const usage = await Usage.findById(usageId).populate('user');
            
            if (!usage) {
                res.errorStatusCode = 404;
                throw new Error("Usage not found");
            }

            if (usage.userId._id.toString() !== req.user._id.toString()) {
                res.errorStatusCode = 403;
                throw new Error("Unauthorized");
            }

            const existingPayment = await Payment.findOne({ usage: usageId });
            if (existingPayment && existingPayment.status === 'succeeded') {
                res.errorStatusCode = 400;
                throw new Error("This usage has already been paid");
            }

            // PayPal Order oluştur
            const request = new paypal.orders.OrdersCreateRequest();
            request.prefer("return=representation");
            request.requestBody({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: usage.totalFee.toFixed(2),
                    },
                    description: `Payment for usage #${usageId}`,
                }],
            });

            const order = await paypalClient.execute(request);

            // Payment kaydı oluştur
            const payment = await Payment.create({
                usage: usageId,
                user: req.user._id,
                amount: usage.totalFee,
                currency: 'EUR',
                status: 'pending',
                paymentMethod: 'paypal',
                paymentProvider: 'paypal',
                paypalOrderId: order.result.id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'],
            });

            res.status(201).send({
                error: false,
                result: {
                    paymentId: payment._id,
                    orderId: order.result.id, // Frontend için gerekli
                    amount: usage.totalFee,
                    currency: 'EUR',
                },
            });

        } catch (error) {
            throw error;
        }
    },

    // ✅ YENİ: PayPal ödeme onaylama
    capturePayPalOrder: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Capture PayPal Order"
        */
        
        try {
            const { orderId } = req.body;

            const payment = await Payment.findOne({ paypalOrderId: orderId });
            
            if (!payment) {
                res.errorStatusCode = 404;
                throw new Error("Payment not found");
            }

            // PayPal Order'ı yakala (capture)
            const request = new paypal.orders.OrdersCaptureRequest(orderId);
            const capture = await paypalClient.execute(request);

            // Payment durumunu güncelle
            payment.status = 'succeeded';
            payment.transactionId = capture.result.purchase_units[0].payments.captures[0].id;
            payment.gatewayResponse = capture.result;
            await payment.save();

            // Usage durumunu güncelle (eğer usage modelinizde status varsa)
            await Usage.findByIdAndUpdate(payment.usage, { 
                paymentStatus: 'paid' 
            });

            res.status(200).send({
                error: false,
                result: payment,
            });

        } catch (error) {
            throw error;
        }
    },

    // ✅ YENİ: Stripe Webhook Handler
    stripeWebhook: async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Ödeme başarılı olduğunda
        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            
            const payment = await Payment.findOne({ 
                paymentIntentId: paymentIntent.id 
            });

            if (payment) {
                payment.status = 'succeeded';
                payment.transactionId = paymentIntent.id;
                payment.gatewayResponse = paymentIntent;
                await payment.save();

                // ✅ YENİ: Usage'ı güncelle ve QR kod oluştur
            const Usage = require('../models/usage.model');
            const usage = await Usage.findById(payment.usage);
            
            if (usage) {
                usage.paymentStatus = 'paid';
                usage.paymentId = payment._id;
                await usage.save(); // pre-save hook QR kod oluşturacak
            }
            }
        }

        // Ödeme başarısız olduğunda
        if (event.type === 'payment_intent.payment_failed') {
            const paymentIntent = event.data.object;
            
            const payment = await Payment.findOne({ 
                paymentIntentId: paymentIntent.id 
            });

            if (payment) {
                payment.status = 'failed';
                payment.errorMessage = paymentIntent.last_payment_error?.message;
                payment.gatewayResponse = paymentIntent;
                await payment.save();

                // ✅ Usage'ı başarısız olarak işaretle
            const Usage = require('../models/usage.model');
            await Usage.findByIdAndUpdate(payment.usage, {
                paymentStatus: 'failed'
            });
            }
        }

        res.json({ received: true });
    },

    // ✅ YENİ: İade işlemi
    refundPayment: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Refund Payment (Admin Only)"
        */
        
        try {
            const { id } = req.params;
            const { reason } = req.body;

            const payment = await Payment.findById(id);

            if (!payment) {
                res.errorStatusCode = 404;
                throw new Error("Payment not found");
            }

            if (payment.status !== 'succeeded') {
                res.errorStatusCode = 400;
                throw new Error("Only succeeded payments can be refunded");
            }

            let refund;

            // Stripe iadesi
            if (payment.paymentProvider === 'stripe') {
                refund = await stripe.refunds.create({
                    payment_intent: payment.paymentIntentId,
                });

                payment.status = 'refunded';
                payment.refund = {
                    refundId: refund.id,
                    refundedAt: new Date(),
                    refundAmount: payment.amount,
                    refundReason: reason || 'Requested by admin',
                };
            }

            // PayPal iadesi
            if (payment.paymentProvider === 'paypal') {
                const request = new paypal.payments.CapturesRefundRequest(
                    payment.transactionId
                );
                request.requestBody({});
                
                refund = await paypalClient.execute(request);

                payment.status = 'refunded';
                payment.refund = {
                    refundId: refund.result.id,
                    refundedAt: new Date(),
                    refundAmount: payment.amount,
                    refundReason: reason || 'Requested by admin',
                };
            }

            await payment.save();

            res.status(200).send({
                error: false,
                result: payment,
            });

        } catch (error) {
            throw error;
        }
    },

    // ✅ YENİ: Kullanıcının kendi ödemelerini görebilmesi
    myPayments: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Get My Payments"
        */

        const data = await Payment.find({ user: req.user._id })
            .populate('usage')
            .sort({ createdAt: -1 });

        res.status(200).send({
            error: false,
            result: data,
        });
    },

    // Mevcut fonksiyonlar...
    list: async (req, res) => {
        const data = await res.getModelList(Payment, {}, ['usage', 'user']);
        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Payment),
            result: data,
        });
    },

    read: async (req, res) => {
        const data = await Payment.findOne({ _id: req.params.id })
            .populate(['usage', 'user']);
        res.status(200).send({
            error: false,
            result: data,
        });
    },

    update: async (req, res) => {
        const data = await Payment.updateOne(
            { _id: req.params.id }, 
            req.body, 
            { runValidators: true }
        );
        res.status(202).send({
            error: false,
            data,
            new: await Payment.findOne({ _id: req.params.id })
        });
    },

    deletee: async (req, res) => {
        const data = await Payment.deleteOne({ _id: req.params.id });
        if (data.deletedCount) {
            res.sendStatus(204);
        } else {
            res.errorStatusCode = 404;
            throw new Error("Payment record not found.");
        }
    }
};