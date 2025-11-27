// controllers/usage.controller.js - TAM GÜNCELLENMİŞ

"use strict";

const Usage = require('../models/usage');
const Payment = require('../models/payment');
const Toilet = require('../models/toilet');
const Business = require('../models/business');
const { validateObjectId } = require('../middleware/validation');
const logger = require('../utils/logger');
const { FEE_CONFIG, VALIDATION_RULES, STATUS, GENDER_PREFERENCES } = require('../constants');

module.exports = {
    
    /**
     * Create a new usage/booking
     * 
     * Security:
     * - Validates all input parameters
     * - Validates ObjectId formats
     * - Verifies toilet belongs to business
     * - Ensures user is authenticated
     * 
     * Performance:
     * - Parallel queries for business and toilet
     * - Single usage creation query
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    create: async (req, res) => {
        // Authentication check
        if (!req.user || !req.user._id) {
            res.errorStatusCode = 401;
            throw new Error("User not authenticated");
        }

        // Input validation and extraction
        const { 
            businessId, 
            toiletId, 
            personCount, 
            startTime, 
            genderPreference 
        } = req.body;

        // Required fields validation
        if (!businessId || !toiletId || !startTime) {
            res.errorStatusCode = 400;
            throw new Error("businessId, toiletId, and startTime are required");
        }

        // ObjectId format validation (security: prevent NoSQL injection)
        if (!validateObjectId(businessId)) {
            res.errorStatusCode = 400;
            throw new Error("Invalid businessId format");
        }

        if (!validateObjectId(toiletId)) {
            res.errorStatusCode = 400;
            throw new Error("Invalid toiletId format");
        }

        // Person count validation (using constants)
        const personCountNum = Number(personCount);
        const { MIN_PERSON_COUNT, MAX_PERSON_COUNT } = VALIDATION_RULES.BOOKING;
        if (!Number.isInteger(personCountNum) || personCountNum < MIN_PERSON_COUNT || personCountNum > MAX_PERSON_COUNT) {
            res.errorStatusCode = 400;
            throw new Error(`personCount must be between ${MIN_PERSON_COUNT} and ${MAX_PERSON_COUNT}`);
        }

        // Date validation
        const startDate = new Date(startTime);
        if (isNaN(startDate.getTime()) || startDate <= new Date()) {
            res.errorStatusCode = 400;
            throw new Error("startTime must be a valid future date");
        }

        // Gender preference validation (optional) - using constants
        const validGenders = Object.values(GENDER_PREFERENCES);
        if (genderPreference && !validGenders.includes(genderPreference)) {
            res.errorStatusCode = 400;
            throw new Error(`genderPreference must be one of: ${validGenders.join(', ')}`);
        }

        logger.debug('Creating usage', { 
            userId: req.user._id, 
            businessId, 
            toiletId 
        });

        // Parallel queries for better performance
        const [business, toilet] = await Promise.all([
            Business.findById(businessId),
            Toilet.findById(toiletId)
        ]);

        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found");
        }

        if (!toilet) {
            res.errorStatusCode = 404;
            throw new Error("Toilet not found");
        }

        // Security: Verify toilet belongs to business
        if (toilet.business && toilet.business.toString() !== businessId.toString()) {
            res.errorStatusCode = 400;
            throw new Error("Toilet does not belong to this business");
        }

        try {
        // Calculate fees using constants (DRY principle)
        const basePrice = toilet.fee || FEE_CONFIG.DEFAULT_TOILET_FEE;
        const serviceFee = FEE_CONFIG.SERVICE_FEE;
        const finalPersonCount = personCount || 1;
        const totalFee = (basePrice * finalPersonCount) + serviceFee;

        logger.debug('Calculating fees', { 
            basePrice, 
            serviceFee, 
            personCount: finalPersonCount, 
            totalFee 
        });
        
        const newUsage = await Usage.create({
            userId: req.user._id,
            businessId,
            toiletId,
            personCount: finalPersonCount,
            startTime: new Date(startTime),
            genderPreference,
            basePrice,
            serviceFee,
            totalFee,
            status: STATUS.USAGE.PENDING,
            paymentStatus: STATUS.PAYMENT.PENDING,
        });

        logger.info('Usage created successfully', { 
            usageId: newUsage._id,
            userId: req.user._id,
            businessId,
            toiletId
        });

        const populatedUsage = await Usage.findById(newUsage._id)
            .populate('businessId', 'businessName address')
            .populate('toiletId', 'name features fee')
            .populate('userId', 'firstName lastName email');

        logger.debug('Usage populated successfully', { usageId: newUsage._id });

        res.status(201).send({
            error: false,
            message: "Reservation created successfully. Please proceed to payment.",
            result: populatedUsage,
        });

    } catch (error) {
        logger.error('Failed to create usage', error, { 
            userId: req.user._id,
            businessId,
            toiletId
        });
        throw error;
    }
},

    /**
     * Get user's own usages/reservations
     * 
     * N+1 Problem Optimization:
     * - All populates are done in a single query
     * - Only necessary fields are selected
     * - Query is indexed on userId for performance
     * 
     * Security:
     * - User can only see their own usages (userId filter)
     * - Query parameters are validated
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    myUsages: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Get My Usages/Reservations"
        */

        const logger = require('../utils/logger');
        const { validateObjectId } = require('../middleware/validation');
        
        try {
            // Validate and sanitize query parameters
            const { status, paymentStatus } = req.query;
            
            // Valid status values (using constants)
            const validStatuses = Object.values(STATUS.USAGE);
            const validPaymentStatuses = Object.values(STATUS.PAYMENT);
            
            let filter = { userId: req.user._id };
            
            // Validate status if provided
            if (status) {
                if (!validStatuses.includes(status)) {
                    res.errorStatusCode = 400;
                    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
                }
                filter.status = status;
            }
            
            // Validate paymentStatus if provided
            if (paymentStatus) {
                if (!validPaymentStatuses.includes(paymentStatus)) {
                    res.errorStatusCode = 400;
                    throw new Error(`Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`);
                }
                filter.paymentStatus = paymentStatus;
            }

            logger.debug('Fetching user usages', { 
                userId: req.user._id, 
                filter 
            });

            // Optimized query: All populates in single query (no N+1 problem)
            // Only select necessary fields to reduce data transfer
            const usages = await Usage.find(filter)
                .populate('businessId', 'businessName address location')
                .populate('toiletId', 'name features fee status')
                .populate('paymentId', 'paymentMethod paymentProvider transactionId status amount')
                .select('-__v') // Exclude version key
                .sort({ createdAt: -1 })
                .lean(); // Use lean() for better performance (returns plain JS objects)

            logger.info('User usages fetched successfully', { 
                userId: req.user._id, 
                count: usages.length 
            });

            res.status(200).send({
                error: false,
                count: usages.length,
                result: usages,
            });
        } catch (error) {
            logger.error('Failed to fetch user usages', error, { 
                userId: req.user._id 
            });
            throw error;
        }
    },

    /**
     * Get single usage detail for current user
     * 
     * Security:
     * - Validates ObjectId format
     * - User can only access their own usage (userId filter)
     * - Returns 404 if not found (doesn't reveal if it exists but belongs to another user)
     * 
     * Performance:
     * - Single query with all populates (no N+1 problem)
     * - Only necessary fields selected
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    myUsageDetail: async (req, res) => {
        /*
            #swagger.tags = ["Usages"]
            #swagger.summary = "Get Single Usage Detail"
        */

        const logger = require('../utils/logger');
        const { validateObjectId } = require('../middleware/validation');
        
        try {
            const { id } = req.params;
            
            // Validate ObjectId format (security: prevent NoSQL injection)
            if (!validateObjectId(id)) {
                res.errorStatusCode = 400;
                throw new Error('Invalid usage ID format');
            }

            logger.debug('Fetching usage detail', { 
                usageId: id, 
                userId: req.user._id 
            });

            // Single optimized query with all populates
            const usage = await Usage.findOne({ 
                _id: id,
                userId: req.user._id // Security: Only user's own usage
            })
            .populate('businessId', 'businessName address location businessType')
            .populate('toiletId', 'name features fee status averageRatings')
            .populate('paymentId', 'paymentMethod paymentProvider transactionId paymentIntentId paypalOrderId status amount currency createdAt')
            .select('-__v')
            .lean();

            if (!usage) {
                // Don't reveal if usage exists but belongs to another user (security best practice)
                res.errorStatusCode = 404;
                throw new Error("Usage not found or you don't have permission");
            }

            logger.info('Usage detail fetched successfully', { 
                usageId: id, 
                userId: req.user._id 
            });

            res.status(200).send({
                error: false,
                result: usage,
            });
        } catch (error) {
            logger.error('Failed to fetch usage detail', error, { 
                usageId: req.params.id, 
                userId: req.user._id 
            });
            throw error;
        }
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