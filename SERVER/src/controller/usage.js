// controllers/usage.controller.js - TAM GÜNCELLENMİŞ

"use strict";

const Usage = require('../models/usage');
const Payment = require('../models/payment');
const Toilet = require('../models/toilet');
const Business = require('../models/business');

module.exports = {
    
    // ✅ YENİ: Kullanıcı rezervasyon oluşturur (ÖDEME YAPILMADAN!)
    create: async (req, res) => {
    console.log('🔍 REQUEST INFO:');
    console.log('User:', req.user);
    console.log('Body:', req.body);
    
    if (!req.user) {
        res.errorStatusCode = 401;
        throw new Error("User not authenticated - req.user is undefined");
    }

    const { 
        businessId, 
        toiletId, 
        personCount, 
        startTime, 
        genderPreference 
    } = req.body;

    if (!businessId || !toiletId || !startTime) {
        res.errorStatusCode = 400;
        throw new Error("businessId, toiletId, and startTime are required");
    }

    console.log('✅ Validation passed');

    const business = await Business.findById(businessId);
    console.log('Business:', business ? `Found: ${business.businessName}` : 'Not found');

    if (!business) {
        res.errorStatusCode = 404;
        throw new Error("Business not found");
    }

    const toilet = await Toilet.findById(toiletId);
    console.log('Toilet:', toilet ? `Found: ${toilet.name}` : 'Not found');

    if (!toilet) {
        res.errorStatusCode = 404;
        throw new Error("Toilet not found");
    }

    console.log('Toilet business:', toilet.business);
    console.log('Requested businessId:', businessId);

    if (toilet.business && toilet.business.toString() !== businessId.toString()) {
        res.errorStatusCode = 400;
        throw new Error("Toilet does not belong to this business");
    }

    try {
        console.log('Creating usage...');
        
        const basePrice = toilet.fee || 0;
        const serviceFee = 1.75;
        const totalFee = (basePrice * (personCount || 1)) + serviceFee;

        console.log('Fees:', { basePrice, serviceFee, personCount, totalFee });
        
        const newUsage = await Usage.create({
            userId: req.user._id,
            businessId,
            toiletId,
            personCount: personCount || 1,
            startTime: new Date(startTime),
            genderPreference,
            basePrice,
            serviceFee,
            totalFee,
            status: 'pending',
            paymentStatus: 'pending',
        });

        console.log('✅ Usage created successfully:', newUsage._id);

        const populatedUsage = await Usage.findById(newUsage._id)
            .populate('businessId', 'businessName address')
            .populate('toiletId', 'name features fee')
            .populate('userId', 'firstName lastName email');

        console.log('✅ Usage populated successfully');

        res.status(201).send({
            error: false,
            message: "Reservation created successfully. Please proceed to payment.",
            result: populatedUsage,
        });

    } catch (error) {
        console.error('❌ ERROR CREATING USAGE:', error);
        console.error('Error message:', error.message);
        throw error;
    }
},

    // ✅ YENİ: Kullanıcı kendi rezervasyonlarını görür
    myUsages: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Get My Usages/Reservations"
        */

        const { status, paymentStatus } = req.query;
        
        let filter = { userId: req.user._id };
        
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;

        const usages = await Usage.find(filter)
            .populate('businessId', 'businessName address')
            .populate('toiletId', 'name features')
            .populate('paymentId')
            .sort({ createdAt: -1 });

        res.status(200).send({
            error: false,
            count: usages.length,
            result: usages,
        });
    },

    // ✅ YENİ: Kullanıcı tek bir rezervasyonunu görür
    myUsageDetail: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Get Single Usage Detail"
        */

        const usage = await Usage.findOne({ 
            _id: req.params.id,
            userId: req.user._id // Sadece kendi rezervasyonu
        })
        .populate('businessId')
        .populate('toiletId')
        .populate('paymentId');

        if (!usage) {
            res.errorStatusCode = 404;
            throw new Error("Usage not found or you don't have permission");
        }

        res.status(200).send({
            error: false,
            result: usage,
        });
    },

    // ✅ GÜNCELLENMIŞ: Ödeme tamamlandıktan sonra usage'ı güncelle
    confirmPayment: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Confirm Payment and Generate Access Code (Internal)"
            #swagger.description = "This endpoint is called internally after successful payment"
        */

        const { usageId, paymentId } = req.body;

        const usage = await Usage.findById(usageId);
        
        if (!usage) {
            res.errorStatusCode = 404;
            throw new Error("Usage not found");
        }

        // Kullanıcı kontrolü
        if (usage.userId.toString() !== req.user._id.toString()) {
            res.errorStatusCode = 403;
            throw new Error("Unauthorized");
        }

        // Zaten ödendi mi kontrol et
        if (usage.paymentStatus === 'paid') {
            res.errorStatusCode = 400;
            throw new Error("This usage has already been paid");
        }

        // ✅ Ödeme durumunu güncelle (pre-save hook QR kod oluşturacak)
        usage.paymentStatus = 'paid';
        usage.paymentId = paymentId;
        await usage.save();

        // Güncellenmiş usage'ı döndür
        const updatedUsage = await Usage.findById(usageId)
            .populate('businessId')
            .populate('toiletId')
            .populate('paymentId');

        res.status(200).send({
            error: false,
            message: "Payment confirmed. Access code generated.",
            result: updatedUsage,
        });
    },

    // ✅ YENİ: QR kod ile giriş yap
    useAccessCode: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Use Access Code (QR Scan)"
        */

        const { accessCode } = req.body;

        if (!accessCode) {
            res.errorStatusCode = 400;
            throw new Error("Access code is required");
        }

        const usage = await Usage.findOne({ accessCode: accessCode.toUpperCase() })
            .populate('businessId')
            .populate('toiletId')
            .populate('userId', 'firstName lastName');

        if (!usage) {
            res.errorStatusCode = 404;
            throw new Error("Invalid access code");
        }

        // Zaten kullanıldı mı?
        if (usage.accessUsed) {
            res.errorStatusCode = 400;
            throw new Error("This access code has already been used");
        }

        // Ödeme yapılmış mı?
        if (usage.paymentStatus !== 'paid') {
            res.errorStatusCode = 400;
            throw new Error("Payment not completed for this reservation");
        }

        // Süresi dolmuş mu? (örnek: başlangıç zamanından 24 saat sonra)
        const expiryTime = new Date(usage.startTime);
        expiryTime.setHours(expiryTime.getHours() + 24);
        
        if (new Date() > expiryTime) {
            usage.status = 'expired';
            await usage.save();
            res.errorStatusCode = 400;
            throw new Error("This access code has expired");
        }

        // ✅ Erişim kodunu kullan
        usage.accessUsed = true;
        usage.accessUsedAt = new Date();
        usage.status = 'active';
        await usage.save();

        res.status(200).send({
            error: false,
            message: "Access granted successfully",
            result: {
                user: usage.userId,
                business: usage.businessId,
                toilet: usage.toiletId,
                personCount: usage.personCount,
                accessTime: usage.accessUsedAt,
            },
        });
    },

    // ✅ YENİ: Rezervasyonu iptal et
    cancel: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Cancel Reservation"
        */

        const { reason } = req.body;

        const usage = await Usage.findOne({
            _id: req.params.id,
            userId: req.user._id,
        });

        if (!usage) {
            res.errorStatusCode = 404;
            throw new Error("Usage not found");
        }

        // Zaten kullanıldıysa iptal edilemez
        if (usage.accessUsed) {
            res.errorStatusCode = 400;
            throw new Error("Cannot cancel a reservation that has been used");
        }

        // Tamamlanmışsa iptal edilemez
        if (usage.status === 'completed') {
            res.errorStatusCode = 400;
            throw new Error("Cannot cancel a completed reservation");
        }

        usage.status = 'cancelled';
        usage.cancellationReason = reason;
        usage.cancelledAt = new Date();
        await usage.save();

        // Eğer ödeme yapıldıysa, iade işlemi başlatılmalı (ayrı endpoint'te)

        res.status(200).send({
            error: false,
            message: "Reservation cancelled successfully",
            result: usage,
        });
    },

    // --- ADMIN ENDPOINTS ---

    list: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "List All Usages (Admin)"
        */

        const { status, paymentStatus, businessId } = req.query;
        
        let filter = {};
        if (status) filter.status = status;
        if (paymentStatus) filter.paymentStatus = paymentStatus;
        if (businessId) filter.businessId = businessId;

        const result = await res.getModelList(
            Usage, 
            filter, 
            ['userId', 'toiletId', 'businessId', 'paymentId']
        );

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Usage, filter),
            result,
        });
    },

    read: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Get Single Usage (Admin)"
        */

        const result = await Usage.findById(req.params.id)
            .populate('userId')
            .populate('toiletId')
            .populate('businessId')
            .populate('paymentId');

        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("Usage not found");
        }

        res.status(200).send({
            error: false,
            result,
        });
    },

    update: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Update Usage (Admin)"
        */

        const allowedUpdates = ['status', 'notes', 'paymentStatus'];
        const updates = {};

        for (let key of allowedUpdates) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        const result = await Usage.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("Usage not found");
        }

        res.status(202).send({
            error: false,
            result,
        });
    },

    deletee: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Delete Usage (Admin)"
        */

        const data = await Usage.deleteOne({ _id: req.params.id });
        
        if (data.deletedCount) {
            res.sendStatus(204);
        } else {
            res.errorStatusCode = 404;
            throw new Error("Usage not found");
        }
    },
};