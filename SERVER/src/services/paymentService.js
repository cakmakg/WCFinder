"use strict";

const paymentRepository = require("../repositories/paymentRepository");
const usageRepository = require("../repositories/usageRepository");
const businessRepository = require("../repositories/businessRepository");
const getStripe = require("../config/stripe");
const getPayPalClient = require("../config/paypal");
const paypal = require("@paypal/checkout-server-sdk");
const { FEE_CONFIG, STATUS } = require("../constants");

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
   * ✅ Helper: Booking metadata'sını normalize et (tutarlı karşılaştırma için)
   */
  normalizeBookingMetadata(bookingData) {
    const { toiletId, personCount, startTime, genderPreference, totalAmount } = bookingData;
    
    return {
      toiletId: toiletId?.toString() || toiletId,
      personCount: personCount?.toString() || personCount?.toString(),
      startTime: startTime instanceof Date ? startTime.toISOString() : startTime,
      genderPreference: genderPreference || null,
      totalAmount: totalAmount?.toString() || totalAmount,
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
        console.log(`✅ Found duplicate payment for booking: ${payment._id}`);
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

    // Komisyon hesapla
    const fees = this.calculateFees(usage.totalFee);

    // Stripe PaymentIntent oluştur
    const stripe = getStripe();
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
        
        // Eğer payment intent hala geçerliyse, onu döndür
        if (paymentIntent.status === "requires_payment_method" || paymentIntent.status === "requires_confirmation") {
          console.log("✅ Using existing payment intent:", existingPayment.paymentIntentId);
          return {
            paymentId: existingPayment._id,
            clientSecret: paymentIntent.client_secret,
            amount: existingPayment.amount,
            currency: existingPayment.currency || "EUR",
          };
        }
      } catch (err) {
        // Payment intent bulunamadı veya geçersiz, yeni bir tane oluştur
        console.log("⚠️ Existing payment intent not found, creating new one:", err.message);
      }
    }

    // Business kontrolü
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
    }

    // Komisyon hesapla
    const fees = this.calculateFees(totalAmount);

    // Stripe PaymentIntent oluştur (usageId olmadan)
    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: "eur",
      metadata: {
        userId: userId.toString(),
        businessId: businessId.toString(),
        toiletId: toiletId.toString(),
        personCount: personCount.toString(),
        startTime: startTime,
        genderPreference: genderPreference,
        totalAmount: totalAmount.toString(),
      },
      description: `Payment for booking at ${business.businessName}`,
    });

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
      console.log("✅ Updated existing payment:", payment._id);
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
        console.log("✅ Payment created with ID:", payment._id);
      } catch (createError) {
        console.error("❌ Payment creation error:", createError);
        
        // Eğer duplicate hatası alırsak (paymentIntentId unique constraint), mevcut payment'i bul
        if (createError.code === 11000 && createError.keyPattern?.paymentIntentId) {
          console.log("⚠️ Duplicate paymentIntentId detected, finding existing payment...");
          
          const duplicatePayment = await paymentRepository.findOne({
            paymentIntentId: paymentIntent.id,
          });
          
          if (duplicatePayment) {
            console.log("✅ Found duplicate payment by paymentIntentId:", duplicatePayment._id);
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
            console.log("✅ Found duplicate payment by metadata, updating paymentIntentId...");
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
    };
  }

  /**
   * PayPal ödeme başlat (usageId ile - mevcut kullanım)
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
    let paypalClient;
    try {
      paypalClient = getPayPalClient();
    } catch (paypalConfigError) {
      console.error('❌ PayPal client error:', paypalConfigError.message);
      throw new Error(`PayPal configuration error: ${paypalConfigError.message}. Please check your PayPal credentials in .env file.`);
    }
    
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
   * ✅ YENİ: PayPal ödeme başlat (booking bilgileri ile - ödeme sonrası usage oluşturulacak)
   */
  async createPayPalOrderFromBooking(bookingData, userId) {
    const { businessId, toiletId, personCount, startTime, genderPreference, totalAmount } = bookingData;

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
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found");
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
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "EUR",
            value: totalAmount.toFixed(2),
          },
          description: `Payment for booking at ${business.businessName}`,
        },
      ],
    });

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

    // Komisyon hesapla
    const fees = this.calculateFees(totalAmount);

    // Payment kaydı oluştur (usageId olmadan - ödeme sonrası eklenecek)
    // Booking bilgilerini metadata olarak sakla
    const normalizedMetadata = this.normalizeBookingMetadata(bookingData);
    let payment;

    if (existingPayment) {
      // Mevcut payment'i güncelle
      payment = await paymentRepository.findByIdAndUpdate(existingPayment._id, {
        paypalOrderId: order.result.id,
        amount: totalAmount,
        platformFee: fees.platformFee,
        businessFee: fees.businessFee,
        status: "pending",
        metadata: normalizedMetadata,
      });
      console.log("✅ Updated existing PayPal payment:", payment._id);
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
          paymentMethod: "paypal",
          paymentProvider: "paypal",
          paypalOrderId: order.result.id,
          metadata: normalizedMetadata,
        });
        console.log("✅ PayPal payment created with ID:", payment._id);
      } catch (createError) {
        console.error("❌ PayPal payment creation error:", createError);
        
        // Eğer duplicate hatası alırsak (paypalOrderId unique constraint), mevcut payment'i bul
        if (createError.code === 11000 && createError.keyPattern?.paypalOrderId) {
          const duplicatePayment = await paymentRepository.findOne({
            paypalOrderId: order.result.id,
          });
          
          if (duplicatePayment) {
            console.log("✅ Found duplicate PayPal payment by orderId, updating...");
            payment = await paymentRepository.findByIdAndUpdate(duplicatePayment._id, {
              amount: totalAmount,
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

    return {
      paymentId: payment._id,
      orderId: order.result.id,
      amount: totalAmount,
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
    const paypalClient = getPayPalClient();
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    const capture = await paypalClient.execute(request);

    // Payment durumunu güncelle
    await paymentRepository.findByIdAndUpdate(payment._id, {
      status: "succeeded",
      transactionId: capture.result.purchase_units[0].payments.captures[0].id,
      gatewayResponse: capture.result,
    });

    // ✅ Eğer usageId yoksa (booking'den geldiyse), usage oluştur
    if (!payment.usageId) {
      const metadata = payment.metadata || {};
      const usage = await usageRepository.create({
        userId: payment.userId,
        businessId: payment.businessId,
        toiletId: metadata.toiletId,
        personCount: parseInt(metadata.personCount) || 1,
        startTime: new Date(metadata.startTime),
        genderPreference: metadata.genderPreference,
        basePrice: payment.amount - FEE_CONFIG.SERVICE_FEE, // Service fee'yi çıkar (using constant)
        serviceFee: FEE_CONFIG.SERVICE_FEE,
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

    // Payment durumunu güncelle
    await paymentRepository.findByIdAndUpdate(payment._id, {
      status: "succeeded",
      transactionId: paymentIntentId,
    });

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

      console.log("📝 Creating usage from payment metadata:", {
        toiletId: toiletIdObj,
        startTime: startTimeObj,
        personCount: metadata.personCount,
        genderPreference: metadata.genderPreference,
      });

      const usage = await usageRepository.create({
        userId: payment.userId,
        businessId: payment.businessId,
        toiletId: toiletIdObj,
        personCount: parseInt(metadata.personCount) || 1,
        startTime: startTimeObj,
        genderPreference: metadata.genderPreference,
        basePrice: payment.amount - FEE_CONFIG.SERVICE_FEE, // Service fee'yi çıkar (using constant)
        serviceFee: FEE_CONFIG.SERVICE_FEE,
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

      return await paymentRepository.findById(payment._id);
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
        await paymentRepository.findByIdAndUpdate(payment._id, {
          status: "succeeded",
          transactionId: paymentIntent.id,
          gatewayResponse: paymentIntent,
        });

        // ✅ Eğer usageId yoksa (booking'den geldiyse), usage oluştur
        if (!payment.usageId) {
          const metadata = payment.metadata || paymentIntent.metadata || {};
          const usage = await usageRepository.create({
            userId: payment.userId,
            businessId: payment.businessId,
            toiletId: metadata.toiletId,
            personCount: parseInt(metadata.personCount) || 1,
            startTime: new Date(metadata.startTime),
            genderPreference: metadata.genderPreference,
            basePrice: payment.amount - FEE_CONFIG.SERVICE_FEE, // Service fee'yi çıkar (using constant)
            serviceFee: FEE_CONFIG.SERVICE_FEE,
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

