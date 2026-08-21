"use strict";

const paymentRepository = require("../repositories/paymentRepository");
const usageRepository = require("../repositories/usageRepository");
const businessRepository = require("../repositories/businessRepository");
const User = require("../models/user");
const getStripe = require("../config/stripe");
const getPayPalClient = require("../config/paypal");
const paypal = require("@paypal/checkout-server-sdk");
const { FEE_CONFIG, STATUS } = require("../constants");
const sendMail = require("../helper/sendMail");
const logger = require("../utils/logger");
const QRCode = require('qrcode');

/**
 * Payment Service - Business Logic Layer
 */
class PaymentService {
  /**
   * Calculate platform and business fees
   * 
   * Business Logic:
   * - Platform fee is fixed (from FEE_CONFIG)
   * - Business fee is calculated as totalAmount - platformFee
   * - Fees are rounded to 2 decimal places for currency precision
   * 
   * Security:
   * - Input validation should be done at controller layer
   * - Amount should be validated before calling this method
   * 
   * @param {number} totalAmount - Total payment amount in EUR
   * @returns {Object} { platformFee: number, businessFee: number }
   */
  calculateFees(totalAmount, personCount = 1) {
    // SECURITY: Use constant from environment/config (prevents hardcoded fees)
    // Service fee is per person (0.75€ × personCount)
    const platformFee = (FEE_CONFIG.SERVICE_FEE || 0.75) * personCount;
    const businessFee = totalAmount - platformFee;

    return {
      platformFee: Math.round(platformFee * 100) / 100,
      businessFee: Math.round(businessFee * 100) / 100,
    };
  }

  /**
   * ✅ Helper: Mobil (redirect tabanlı) PayPal onayı için return/cancel URL'leri üret.
   *
   * PayPal Orders v2 return_url yalnızca http/https kabul eder; mobil uygulama
   * ise özel şema (wcfinder://) kullanır. Bu yüzden return/cancel URL'lerini
   * sunucunun kendi /payments/paypal/redirect endpoint'ine yönlendiririz; o da
   * uygulamanın deep-link'ine 302 yapar. Yalnızca app deep-link şemalarına
   * (open-redirect'i önlemek için) izin verilir.
   *
   * Web (PayPal JS SDK) akışı returnUrl/cancelUrl göndermediği için null döner
   * ve davranışı değişmez.
   */
  buildPayPalRedirectUrls(serverBase, returnUrl, cancelUrl) {
    const isAppDeepLink = (u) =>
      typeof u === "string" &&
      u.length > 0 &&
      u.length <= 512 &&
      /^(wcfinder|exp|exps):\/\//i.test(u);

    if (!serverBase || !isAppDeepLink(returnUrl) || !isAppDeepLink(cancelUrl)) {
      return null;
    }

    const base = serverBase.replace(/\/+$/, "");
    return {
      return_url: `${base}/api/payments/paypal/redirect?to=${encodeURIComponent(returnUrl)}`,
      cancel_url: `${base}/api/payments/paypal/redirect?to=${encodeURIComponent(cancelUrl)}`,
    };
  }

  /**
   * ✅ Helper: Oluşturulan PayPal order'ından alıcıya gösterilecek onay URL'ini çıkar.
   */
  extractPayPalApproveUrl(order) {
    const links = order?.result?.links;
    if (!Array.isArray(links)) return undefined;
    const approve = links.find(
      (l) => l && (l.rel === "approve" || l.rel === "payer-action")
    );
    return approve?.href;
  }

  /**
   * ✅ Helper: Booking metadata'sını normalize et (tutarlı karşılaştırma için)
   */
  normalizeBookingMetadata(bookingData) {
    const { toiletId, personCount, startTime, genderPreference, totalAmount } = bookingData;
    
    return {
      toiletId: toiletId ? toiletId.toString() : null,
      personCount: personCount ? parseInt(personCount) : null,
      startTime: startTime instanceof Date ? startTime.toISOString() : (typeof startTime === 'string' ? startTime : null),
      genderPreference: genderPreference || null,
      totalAmount: totalAmount ? parseFloat(totalAmount) : null,
    };
  }

  /**
   * ✅ Helper: İki booking metadata'sının aynı olup olmadığını kontrol et
   */
  isSameBooking(metadata1, metadata2) {
    if (!metadata1 || !metadata2) return false;

    // startTime'ı normalize et
    const normalizeStartTime = (time) => {
      if (time instanceof Date) return time.toISOString();
      if (typeof time === 'string') return time;
      return null;
    };

    const time1 = normalizeStartTime(metadata1.startTime);
    const time2 = normalizeStartTime(metadata2.startTime);

    return (
      metadata1.toiletId?.toString() === metadata2.toiletId?.toString() &&
      time1 === time2 &&
      metadata1.personCount?.toString() === metadata2.personCount?.toString()
    );
  }

  /**
   * ✅ Helper: Aynı booking için duplicate payment bul (metadata ile)
   * @param {Object} params - { userId, businessId, bookingData, paymentProvider }
   * @returns {Promise<Object|null>} Existing payment or null
   */
  async findDuplicatePaymentByBooking({ userId, businessId, bookingData, paymentProvider }) {
    const normalizedMetadata = this.normalizeBookingMetadata(bookingData);

    // Tüm pending payment'leri al
    const allPendingPayments = await paymentRepository.find({
      userId,
      businessId,
      status: "pending",
      paymentProvider,
    });

    if (allPendingPayments.length === 0) {
      return null;
    }

    // Metadata ile aynı booking'i bul
    for (const payment of allPendingPayments) {
      if (payment.metadata && this.isSameBooking(payment.metadata, normalizedMetadata)) {
        logger.debug('Found duplicate payment for booking', { paymentId: payment._id.toString() });
        return payment;
      }
    }

    return null;
  }

  /**
   * Stripe ödeme başlat (usageId ile - mevcut kullanım)
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

    // Komisyon hesapla (personCount ile)
    const fees = this.calculateFees(usage.totalFee, usage.personCount);

    // Stripe PaymentIntent oluştur
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(usage.totalFee * 100),
      currency: "eur",
      confirmation_method: "automatic", // ✅ Otomatik confirmation (test kartları için gerekli)
      capture_method: "automatic", // ✅ Otomatik capture
      payment_method_types: ["card"], // ✅ Sadece kart ödemeleri
      payment_method_options: {
        card: {
          request_three_d_secure: "automatic", // ✅ 3D Secure otomatik (test kartları için)
        },
      },
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
   * ✅ YENİ: Stripe ödeme başlat (booking bilgileri ile - ödeme sonrası usage oluşturulacak)
   */
  async createStripePaymentFromBooking(bookingData, userId) {
    const { businessId, toiletId, personCount, startTime, genderPreference, totalAmount } = bookingData;

    // ✅ Duplicate kontrolü: Aynı booking için zaten bir pending payment var mı?
    const existingPayment = await this.findDuplicatePaymentByBooking({
      userId,
      businessId,
      bookingData,
      paymentProvider: "stripe",
    });

    // Eğer duplicate payment varsa ve geçerli bir paymentIntentId'si varsa, onu kullan
    if (existingPayment?.paymentIntentId) {
      const stripe = getStripe();
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(existingPayment.paymentIntentId);
        
        logger.debug('Checking existing payment intent', {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          userId: userId.toString()
        });
        
        // ✅ SADECE geçerli durumlardaki payment intent'leri kullan
        // "succeeded", "canceled", "processing" durumlarındaki payment intent'ler tekrar confirm edilemez (402 hatası)
        const validStatuses = ["requires_payment_method", "requires_confirmation"];
        
        if (validStatuses.includes(paymentIntent.status)) {
          logger.info('Using existing payment intent', {
            paymentId: existingPayment._id.toString(),
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            userId: userId.toString()
          });
          return {
            paymentId: existingPayment._id,
            clientSecret: paymentIntent.client_secret,
            amount: existingPayment.amount,
            currency: existingPayment.currency || "EUR",
            paymentIntentStatus: paymentIntent.status,
          };
        } else {
          // Payment intent zaten confirm edilmiş veya geçersiz durumda, yeni bir tane oluştur
          logger.warn('Existing payment intent not in valid state', {
            status: paymentIntent.status,
            paymentIntentId: paymentIntent.id,
            userId: userId.toString(),
            reason: "Payment intent is already succeeded, canceled, or in an invalid state. Creating new one."
          });
          
          // Eğer payment intent "succeeded" ise, mevcut payment'i "succeeded" olarak işaretle
          if (paymentIntent.status === "succeeded") {
            await paymentRepository.findByIdAndUpdate(existingPayment._id, {
              status: "succeeded"
            });
            logger.info('Updated existing payment status to succeeded', {
              paymentId: existingPayment._id.toString(),
              userId: userId.toString()
            });
          }
        }
      } catch (err) {
        // Payment intent bulunamadı veya geçersiz, yeni bir tane oluştur
        logger.warn('Existing payment intent not found or error retrieving', {
          error: err.message,
          paymentIntentId: existingPayment.paymentIntentId,
          userId: userId.toString()
        });
      }
    }

    // Business kontrolü
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Komisyon hesapla (personCount ile)
    const fees = this.calculateFees(totalAmount, personCount || 1);

    // ✅ VALIDATION: Amount kontrolü
    if (!totalAmount || totalAmount <= 0) {
      throw new Error("Invalid amount: Amount must be greater than 0");
    }

    // SECURITY: Validate minimum payment amount (using constant)
    const MIN_PAYMENT_AMOUNT_EUR = FEE_CONFIG.MIN_PAYMENT_AMOUNT || 0.50;
    const amountInCents = Math.round(totalAmount * 100);
    const minAmountInCents = Math.round(MIN_PAYMENT_AMOUNT_EUR * 100);
    
    if (amountInCents < minAmountInCents) {
      throw new Error(`Invalid amount: Amount must be at least ${MIN_PAYMENT_AMOUNT_EUR} EUR`);
    }

    logger.debug('Creating payment intent from booking', {
      amount: totalAmount,
      amountInCents,
      currency: 'eur',
      userId: userId.toString(),
      businessId: businessId.toString(),
      businessName: business.businessName
    });

    // Stripe PaymentIntent oluştur (usageId olmadan)
    const stripe = getStripe();
    
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "eur",
        confirmation_method: "automatic", // ✅ Otomatik confirmation (test kartları için gerekli)
        capture_method: "automatic", // ✅ Otomatik capture
        payment_method_types: ["card"], // ✅ Sadece kart ödemeleri
        payment_method_options: {
          card: {
            request_three_d_secure: "automatic", // ✅ 3D Secure otomatik (test kartları için)
          },
        },
        metadata: {
          userId: userId.toString(),
          businessId: businessId.toString(),
          toiletId: toiletId.toString(),
          personCount: personCount.toString(),
          startTime: startTime,
          genderPreference: genderPreference || '',
          totalAmount: totalAmount.toString(),
        },
        description: `Payment for booking at ${business.businessName}`,
      });

      logger.info('Payment intent created successfully', {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        userId: userId.toString(),
        businessId: businessId.toString()
        // ✅ SECURITY: clientSecret loglanmıyor (sensitive data)
      });
    } catch (stripeError) {
      logger.error('Stripe payment intent creation failed', stripeError, {
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
        userId: userId.toString(),
        businessId: businessId.toString()
      });
      throw new Error(`Stripe payment intent creation failed: ${stripeError.message}`);
    }

    // Payment kaydı oluştur (usageId olmadan - ödeme sonrası eklenecek)
    // Booking bilgilerini metadata olarak sakla
    const normalizedMetadata = this.normalizeBookingMetadata(bookingData);
    let payment;

    if (existingPayment) {
      // Mevcut payment'i güncelle
      payment = await paymentRepository.findByIdAndUpdate(existingPayment._id, {
        paymentIntentId: paymentIntent.id,
        amount: totalAmount,
        platformFee: fees.platformFee,
        businessFee: fees.businessFee,
        status: "pending",
        metadata: normalizedMetadata,
      });
      logger.info('Updated existing payment', { paymentId: payment._id.toString() });
    } else {
      // Yeni payment oluştur
      try {
        payment = await paymentRepository.create({
          userId,
          businessId,
          amount: totalAmount,
          platformFee: fees.platformFee,
          businessFee: fees.businessFee,
          currency: "EUR",
          status: "pending",
          paymentMethod: "credit_card",
          paymentProvider: "stripe",
          paymentIntentId: paymentIntent.id,
          metadata: normalizedMetadata,
        });
        logger.info('Payment created successfully', { paymentId: payment._id.toString() });
      } catch (createError) {
        logger.error('Payment creation error', createError, { userId: userId.toString() });
        
        // Eğer duplicate hatası alırsak (paymentIntentId unique constraint), mevcut payment'i bul
        if (createError.code === 11000 && createError.keyPattern?.paymentIntentId) {
          logger.warn('Duplicate paymentIntentId detected', { paymentIntentId: paymentIntent.id });
          
          const duplicatePayment = await paymentRepository.findOne({
            paymentIntentId: paymentIntent.id,
          });
          
          if (duplicatePayment) {
            logger.info('Found duplicate payment by paymentIntentId', { paymentId: duplicatePayment._id.toString() });
            return {
              paymentId: duplicatePayment._id,
              clientSecret: paymentIntent.client_secret,
              amount: duplicatePayment.amount || totalAmount,
              currency: duplicatePayment.currency || "EUR",
            };
          }
        }
        
        // Eğer duplicate hatası alırsak ama paymentIntentId ile bulunamazsa, metadata ile tekrar kontrol et
        if (createError.code === 11000) {
          const duplicateByMetadata = await this.findDuplicatePaymentByBooking({
            userId,
            businessId,
            bookingData,
            paymentProvider: "stripe",
          });
          
          if (duplicateByMetadata) {
            logger.info('Found duplicate payment by metadata', { paymentId: duplicateByMetadata._id.toString() });
            await paymentRepository.findByIdAndUpdate(duplicateByMetadata._id, {
              paymentIntentId: paymentIntent.id,
            });
            
            return {
              paymentId: duplicateByMetadata._id,
              clientSecret: paymentIntent.client_secret,
              amount: duplicateByMetadata.amount || totalAmount,
              currency: duplicateByMetadata.currency || "EUR",
            };
          }
        }
        
        throw createError;
      }
    }

    return {
      paymentId: payment._id,
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      currency: "EUR",
      paymentIntentStatus: paymentIntent.status, // ✅ Status bilgisini ekle
    };
  }

  /**
   * PayPal ödeme başlat (usageId ile - mevcut kullanım)
   */
  async createPayPalOrder(usageId, userId, options = {}) {
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
    let paypalClient;
    try {
      paypalClient = getPayPalClient();
    } catch (paypalConfigError) {
      console.error('❌ PayPal client error:', paypalConfigError.message);
      throw new Error(`PayPal configuration error: ${paypalConfigError.message}. Please check your PayPal credentials in .env file.`);
    }
    
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    const usageOrderBody = {
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
    };
    // Mobil redirect akışı için return/cancel URL'leri ekle (web'de null → değişmez)
    const usageRedirectUrls = this.buildPayPalRedirectUrls(
      options.serverBase,
      options.returnUrl,
      options.cancelUrl
    );
    if (usageRedirectUrls) {
      usageOrderBody.application_context = {
        brand_name: "WCFinder",
        landing_page: "LOGIN",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        ...usageRedirectUrls,
      };
    }
    request.requestBody(usageOrderBody);

    let order;
    try {
      order = await paypalClient.execute(request);
    } catch (paypalError) {
      console.error('❌ PayPal order creation error:', paypalError);
      // PayPal hatasını daha anlaşılır hale getir
      if (paypalError.message && paypalError.message.includes('invalid_client')) {
        throw new Error('PayPal authentication failed. Please check your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file.');
      }
      throw paypalError;
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

    // Komisyon hesapla (personCount ile)
    const fees = this.calculateFees(usage.totalFee, usage.personCount);

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
      approveUrl: this.extractPayPalApproveUrl(order),
    };
  }

  /**
   * ✅ YENİ: PayPal ödeme başlat (booking bilgileri ile - ödeme sonrası usage oluşturulacak)
   */
  async createPayPalOrderFromBooking(bookingData, userId, options = {}) {
    try {
      console.log('[PayPal] createPayPalOrderFromBooking started with userId:', userId);
      
      const { businessId, toiletId, personCount, startTime, genderPreference, totalAmount } = bookingData;
      
      console.log('[PayPal] Input data:', {
        businessId,
        totalAmount,
        personCount,
        hasToiletId: !!toiletId,
      });
      
      // Validate and convert totalAmount to number
      const amount = typeof totalAmount === 'string' ? parseFloat(totalAmount) : Number(totalAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid totalAmount: ${totalAmount}. Must be a positive number.`);
      }

      // ✅ Duplicate kontrolü: Aynı booking için zaten bir pending payment var mı?
      const existingPayment = await this.findDuplicatePaymentByBooking({
        userId,
        businessId,
        bookingData,
        paymentProvider: "paypal",
      });

      // Eğer duplicate payment varsa ve geçerli bir paypalOrderId'si varsa, onu kullan
      if (existingPayment?.paypalOrderId) {
        console.log("✅ Using existing PayPal order:", existingPayment.paypalOrderId);
        return {
          paymentId: existingPayment._id,
          orderId: existingPayment.paypalOrderId,
          amount: existingPayment.amount,
          currency: existingPayment.currency || "EUR",
        };
      }

      // Business kontrolü
      console.log('[PayPal] Looking up business with ID:', businessId);
      const business = await businessRepository.findById(businessId);
      if (!business) {
        console.error('[PayPal] ❌ Business not found for ID:', businessId);
        throw new Error("Business not found");
      }
      console.log('[PayPal] ✅ Business found:', business._id, business.businessName);

      // PayPal Order oluştur
      let paypalClient;
      try {
        console.log('[PayPal] Initializing PayPal client...');
        paypalClient = getPayPalClient();
        console.log('[PayPal] ✅ PayPal client initialized');
      } catch (paypalConfigError) {
        console.error('❌ PayPal client error:', paypalConfigError.message);
        throw new Error(`PayPal configuration error: ${paypalConfigError.message}. Please check your PayPal credentials in .env file.`);
      }
      
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      const bookingOrderBody = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: amount.toFixed(2),
            },
            description: `Payment for booking at ${business.businessName}`,
          },
        ],
      };
      // Mobil redirect akışı için return/cancel URL'leri ekle (web'de null → değişmez)
      const bookingRedirectUrls = this.buildPayPalRedirectUrls(
        options.serverBase,
        options.returnUrl,
        options.cancelUrl
      );
      if (bookingRedirectUrls) {
        bookingOrderBody.application_context = {
          brand_name: "WCFinder",
          landing_page: "LOGIN",
          shipping_preference: "NO_SHIPPING",
          user_action: "PAY_NOW",
          ...bookingRedirectUrls,
        };
      }
      request.requestBody(bookingOrderBody);

      let order;
      try {
        console.log('[PayPal] Creating PayPal order for amount:', amount.toFixed(2), 'EUR');
        order = await paypalClient.execute(request);
        console.log('✅ PayPal order created successfully:', order?.result?.id || 'unknown');
      } catch (paypalError) {
        console.error('❌ PayPal order creation error:', paypalError.message);
        // PayPal hatasını daha anlaşılır hale getir
        if (paypalError.message && paypalError.message.includes('invalid_client')) {
          throw new Error('PayPal authentication failed. Please check your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file.');
        }
        throw paypalError;
      }

      // Validate PayPal order response
      if (!order || !order.result || !order.result.id) {
        console.error('❌ Invalid PayPal order response:', JSON.stringify(order, null, 2));
        throw new Error('PayPal order creation failed: Invalid response structure');
      }

      // Komisyon hesapla (personCount ile) - use validated 'amount' not 'totalAmount'
      const fees = this.calculateFees(amount, personCount || 1);
      console.log('[PayPal] Fees calculated:', fees);

      // Payment kaydı oluştur (usageId olmadan - ödeme sonrası eklenecek)
      // Booking bilgilerini metadata olarak sakla
      const normalizedMetadata = this.normalizeBookingMetadata(bookingData);
      console.log('[PayPal] Metadata normalized:', normalizedMetadata);
      
      let payment;

      if (existingPayment) {
        // Mevcut payment'i güncelle
        console.log('[PayPal] Updating existing payment:', existingPayment._id);
        payment = await paymentRepository.findByIdAndUpdate(existingPayment._id, {
          paypalOrderId: order.result.id,
          amount: amount,
          platformFee: fees.platformFee,
          businessFee: fees.businessFee,
          status: "pending",
          metadata: normalizedMetadata,
        });
        console.log("✅ Updated existing PayPal payment:", payment._id);
      } else {
        // Yeni payment oluştur
        try {
          console.log('[PayPal] Creating new payment with:', {
            userId,
            businessId,
            amount,
            paypalOrderId: order.result.id,
          });
          payment = await paymentRepository.create({
            userId,
            businessId,
            amount: amount,
            platformFee: fees.platformFee,
            businessFee: fees.businessFee,
            currency: "EUR",
            status: "pending",
            paymentMethod: "paypal",
            paymentProvider: "paypal",
            paypalOrderId: order.result.id,
            metadata: normalizedMetadata,
          });
          console.log("✅ PayPal payment created with ID:", payment._id);
        } catch (createError) {
          console.error("❌ PayPal payment creation error:", createError.message);
          
          // Eğer duplicate hatası alırsak (paypalOrderId unique constraint), mevcut payment'i bul
          if (createError.code === 11000 && createError.keyPattern?.paypalOrderId) {
            const duplicatePayment = await paymentRepository.findOne({
              paypalOrderId: order.result.id,
            });
            
            if (duplicatePayment) {
              console.log("✅ Found duplicate PayPal payment by orderId, updating...");
              payment = await paymentRepository.findByIdAndUpdate(duplicatePayment._id, {
                amount: amount,
                platformFee: fees.platformFee,
                businessFee: fees.businessFee,
                status: "pending",
                metadata: normalizedMetadata,
              });
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
      }

      console.log('[PayPal] ✅ createPayPalOrderFromBooking completed successfully');
      return {
        paymentId: payment._id,
        orderId: order.result.id,
        amount: amount,
        currency: "EUR",
        approveUrl: this.extractPayPalApproveUrl(order),
      };
    } catch (err) {
      console.error('[PayPal] ❌ createPayPalOrderFromBooking error:', err.message || err);
      throw err;
    }
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
    const paypalClient = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await paypalClient.execute(request);

    // Payment durumunu atomik olarak güncelle (mükerrer capture/onay çağrılarında
    // usage'ın ikinci kez oluşmasını ve bakiyenin iki kez artmasını engeller).
    const claimed = await paymentRepository.markSucceededOnce(payment._id, {
      transactionId: capture.result.purchase_units[0].payments.captures[0].id,
      gatewayResponse: capture.result,
    });

    if (!claimed) {
      logger.info("PayPal payment already captured, skipping", {
        paymentId: payment._id.toString(),
        orderId,
      });
      return await paymentRepository.findById(payment._id);
    }

    // ✅ Eğer usageId yoksa (booking'den geldiyse), usage oluştur
    if (!payment.usageId) {
      const metadata = payment.metadata || {};
      const personCount = parseInt(metadata.personCount) || 1;
      // Service fee is per person (0.75€ × personCount)
      const serviceFee = FEE_CONFIG.SERVICE_FEE * personCount;
      const usage = await usageRepository.create({
        userId: payment.userId,
        businessId: payment.businessId,
        toiletId: metadata.toiletId,
        personCount: personCount,
        startTime: new Date(metadata.startTime),
        genderPreference: metadata.genderPreference,
        // basePrice kişi başıdır: Usage pre-save hook'u totalFee'yi
        // (basePrice * personCount) + serviceFee olarak yeniden hesaplar.
        basePrice: (payment.amount - serviceFee) / personCount,
        serviceFee: serviceFee,
        totalFee: payment.amount,
        status: 'pending',
        paymentStatus: 'paid',
        paymentId: payment._id,
      });

      // Payment'a usageId'yi ekle
      await paymentRepository.findByIdAndUpdate(payment._id, {
        usageId: usage._id,
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

      // ✅ Send payment success email with QR code
      await this.sendPaymentSuccessEmail(usage._id, payment._id);

      return await paymentRepository.findById(payment._id);
    } else {
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

      // ✅ Send payment success email with QR code
      await this.sendPaymentSuccessEmail(payment.usageId, payment._id);

      return await paymentRepository.findById(payment._id);
    }
  }

  /**
   * ✅ YENİ: Stripe payment'i confirm et ve usage oluştur (frontend'den çağrılır)
   */
  async confirmStripePayment(paymentIntentId, userId) {
    const payment = await paymentRepository.findOne({
      paymentIntentId: paymentIntentId,
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    console.log("📋 Payment found:", {
      _id: payment._id,
      paymentIntentId: payment.paymentIntentId,
      hasMetadata: !!payment.metadata,
      metadata: payment.metadata,
    });

    // Kullanıcı kontrolü
    if (payment.userId.toString() !== userId.toString()) {
      throw new Error("Unauthorized");
    }

    // Payment durumunu atomik olarak güncelle. Aynı ödeme için Stripe webhook'u
    // da çalıştığından, usage oluşturma ve bakiye artırma yalnızca ilk kazanan
    // yolda yapılmalı (bkz. paymentRepository.markSucceededOnce).
    const claimed = await paymentRepository.markSucceededOnce(payment._id, {
      transactionId: paymentIntentId,
    });

    if (!claimed) {
      logger.info("Payment already completed by another path, skipping", {
        paymentId: payment._id.toString(),
        paymentIntentId,
      });
      return await paymentRepository.findById(payment._id);
    }

    // ✅ Eğer usageId yoksa (booking'den geldiyse), usage oluştur
    if (!payment.usageId) {
      let metadata = payment.metadata || {};
      
      console.log("📋 Payment metadata:", JSON.stringify(metadata, null, 2));
      
      // Eğer metadata yoksa, Stripe payment intent'ten metadata'yı al
      if (!metadata.toiletId || !metadata.startTime) {
        console.log("⚠️ Metadata missing, trying to get from Stripe payment intent...");
        try {
          const stripe = getStripe();
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          if (paymentIntent.metadata) {
            metadata = {
              ...metadata,
              ...paymentIntent.metadata,
            };
            console.log("✅ Got metadata from Stripe payment intent:", JSON.stringify(metadata, null, 2));
          }
        } catch (stripeErr) {
          console.error("❌ Error retrieving payment intent metadata:", stripeErr);
        }
      }
      
      // Metadata kontrolü ve validasyon
      if (!metadata.toiletId) {
        throw new Error("toiletId is missing in payment metadata");
      }
      
      if (!metadata.startTime) {
        throw new Error("startTime is missing in payment metadata");
      }

      // ObjectId'ye çevir (eğer string ise)
      const mongoose = require("mongoose");
      let toiletIdObj;
      if (mongoose.Types.ObjectId.isValid(metadata.toiletId)) {
        // Zaten ObjectId veya geçerli string
        toiletIdObj = typeof metadata.toiletId === 'string' 
          ? new mongoose.Types.ObjectId(metadata.toiletId)
          : metadata.toiletId;
      } else {
        throw new Error(`Invalid toiletId: ${metadata.toiletId}`);
      }

      // Date'e çevir
      let startTimeObj;
      if (metadata.startTime instanceof Date) {
        startTimeObj = metadata.startTime;
      } else if (typeof metadata.startTime === 'string') {
        startTimeObj = new Date(metadata.startTime);
      } else {
        throw new Error(`Invalid startTime type: ${typeof metadata.startTime}`);
      }

      if (isNaN(startTimeObj.getTime())) {
        throw new Error(`Invalid startTime: ${metadata.startTime}`);
      }

      const usagePersonCount = parseInt(metadata.personCount) || 1;
      // Service fee is per person (0.75€ × personCount)
      const usageServiceFee = FEE_CONFIG.SERVICE_FEE * usagePersonCount;

      console.log("📝 Creating usage from payment metadata:", {
        toiletId: toiletIdObj,
        startTime: startTimeObj,
        personCount: usagePersonCount,
        genderPreference: metadata.genderPreference,
        serviceFee: usageServiceFee,
      });

      const usage = await usageRepository.create({
        userId: payment.userId,
        businessId: payment.businessId,
        toiletId: toiletIdObj,
        personCount: usagePersonCount,
        startTime: startTimeObj,
        genderPreference: metadata.genderPreference,
        // basePrice kişi başıdır (bkz. Usage pre-save totalFee hesabı)
        basePrice: (payment.amount - usageServiceFee) / usagePersonCount,
        serviceFee: usageServiceFee,
        totalFee: payment.amount,
        status: 'pending',
        paymentStatus: 'paid',
        paymentId: payment._id,
      });

      // Payment'a usageId'yi ekle
      await paymentRepository.findByIdAndUpdate(payment._id, {
        usageId: usage._id,
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

      // ✅ Send payment success email with QR code
      await this.sendPaymentSuccessEmail(usage._id, payment._id);

      return await paymentRepository.findById(payment._id);
    } else {
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

      // ✅ Send payment success email with QR code
      await this.sendPaymentSuccessEmail(payment.usageId, payment._id);

      return await paymentRepository.findById(payment._id);
    }
  }

  /**
   * ✅ Send payment success email with QR code
   */
  async sendPaymentSuccessEmail(usageId, paymentId) {
    try {
      // Usage bilgilerini al (populate ile)
      const usage = await usageRepository.findById(usageId, {
        populate: [
          { path: 'userId', select: 'email firstName lastName' },
          { path: 'businessId', select: 'businessName address' },
          { path: 'toiletId', select: 'name' },
        ],
      });

      if (!usage || !usage.userId) {
        logger.warn('Cannot send payment email - usage or user not found', { usageId, paymentId });
        return;
      }

      const user = usage.userId;
      const business = usage.businessId;
      const toilet = usage.toiletId;

      // Payment bilgilerini al
      const payment = await paymentRepository.findById(paymentId);

      if (!payment) {
        logger.warn('Cannot send payment email - payment not found', { paymentId });
        return;
      }

      // QR code oluştur (accessCode varsa)
      let qrCodeDataUrl = null;
      if (usage.accessCode) {
        try {
          qrCodeDataUrl = await QRCode.toDataURL(usage.accessCode, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 200,
            margin: 1,
          });
        } catch (qrError) {
          logger.warn('Failed to generate QR code for email', { 
            accessCode: usage.accessCode,
            error: qrError.message 
          });
        }
      }

      // Email içeriği oluştur
      const emailSubject = 'WCFinder - Zahlung erfolgreich';
      const startTime = new Date(usage.startTime).toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      let emailMessage = `
        <h2>Zahlung erfolgreich!</h2>
        <p>Hallo ${user.firstName || user.username},</p>
        <p>Ihre Zahlung war erfolgreich. Ihre Reservierung wurde bestätigt.</p>
        
        <h3>Zahlungsdetails:</h3>
        <ul>
          <li><strong>Betrag:</strong> ${payment.amount.toFixed(2)} €</li>
          <li><strong>Zahlungsmethode:</strong> ${payment.paymentMethod === 'credit_card' ? 'Kreditkarte' : payment.paymentMethod}</li>
          <li><strong>Transaktions-ID:</strong> ${payment.transactionId || payment._id}</li>
        </ul>

        <h3>Reservierungsdetails:</h3>
        <ul>
          <li><strong>Geschäft:</strong> ${business?.businessName || 'N/A'}</li>
          <li><strong>Toilette:</strong> ${toilet?.name || 'N/A'}</li>
          <li><strong>Datum/Zeit:</strong> ${startTime}</li>
          <li><strong>Personenanzahl:</strong> ${usage.personCount}</li>
        </ul>
      `;

      // QR code ekle (varsa)
      if (qrCodeDataUrl && usage.accessCode) {
        emailMessage += `
          <h3>Zugangscode:</h3>
          <p><strong>${usage.accessCode}</strong></p>
          <p>Zeigen Sie diesen QR-Code beim Geschäft vor:</p>
          <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 200px; border: 2px solid #0891b2; padding: 10px; background: white;" />
        `;
      }

      emailMessage += `
        <p>Vielen Dank für Ihre Buchung!</p>
        <br>
        <p>Mit freundlichen Grüßen,<br>Das WCFinder Team</p>
      `;

      // Email gönder
      await sendMail(user.email, emailSubject, emailMessage);
      logger.info('Payment success email sent', { 
        userId: user._id, 
        email: user.email,
        usageId,
        paymentId 
      });
    } catch (error) {
      // Email hatası ödeme işlemini engellemez
      logger.error('Failed to send payment success email', error, {
        usageId,
        paymentId
      });
    }
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
        const claimed = await paymentRepository.markSucceededOnce(payment._id, {
          transactionId: paymentIntent.id,
          gatewayResponse: paymentIntent,
        });

        // Stripe aynı event'i birden fazla kez teslim edebilir ve frontend
        // /stripe/confirm çağrısı da aynı ödemeyi tamamlar. İlk kazanan dışındaki
        // teslimatlarda hiçbir yan etki uygulanmaz.
        if (!claimed) {
          logger.info("Stripe webhook: payment already succeeded, skipping", {
            paymentId: payment._id.toString(),
            paymentIntentId: paymentIntent.id,
          });
          return;
        }

        // ✅ Eğer usageId yoksa (booking'den geldiyse), usage oluştur
        if (!payment.usageId) {
          const metadata = payment.metadata || paymentIntent.metadata || {};
          const webhookPersonCount = parseInt(metadata.personCount) || 1;
          // Service fee is per person (0.75€ × personCount)
          const webhookServiceFee = FEE_CONFIG.SERVICE_FEE * webhookPersonCount;
          const usage = await usageRepository.create({
            userId: payment.userId,
            businessId: payment.businessId,
            toiletId: metadata.toiletId,
            personCount: webhookPersonCount,
            startTime: new Date(metadata.startTime),
            genderPreference: metadata.genderPreference,
            // basePrice kişi başıdır (bkz. Usage pre-save totalFee hesabı)
            basePrice: (payment.amount - webhookServiceFee) / webhookPersonCount,
            serviceFee: webhookServiceFee,
            totalFee: payment.amount,
            status: 'pending',
            paymentStatus: 'paid',
            paymentId: payment._id,
          });

          // Payment'a usageId'yi ekle
          await paymentRepository.findByIdAndUpdate(payment._id, {
            usageId: usage._id,
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
        } else {
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

        // ✅ Eğer usageId varsa, usage durumunu güncelle
        if (payment.usageId) {
          await usageRepository.findByIdAndUpdate(payment.usageId, {
            paymentStatus: "failed",
          });
        }
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
      const stripe = getStripe();
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
      const paypalClient = getPayPalClient();
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

