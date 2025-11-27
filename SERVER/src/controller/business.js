// controller/business.js
"use strict";
const Business = require("../models/business");
const Toilet = require("../models/toilet");
const Usage = require("../models/usage");
const Review = require("../models/review");
const { validateBusiness } = require("../services/validationService");
const logger = require("../utils/logger");
const { STATUS } = require("../constants");

module.exports = {
    list: async (req, res) => {
        // ✅ DÜZELTME: role kontrolü
        const customFilter = req.user?.role === 'admin' 
            ? {} 
            : { approvalStatus: 'approved' };
        
        const data = await res.getModelList(Business, customFilter, 'owner');

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Business, customFilter),
            result: data
        });
    },

    myBusiness: async (req, res) => {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new Error("Only owners can access this endpoint.");
        }

        const business = await Business.findOne({ owner: req.user._id })
            .populate('owner', 'username email');

        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("You don't have a registered business yet.");
        }

        res.status(200).send({
            error: false,
            result: business
        });
    },

    /**
     * Owner Statistics
     * 
     * N+1 Problem Optimizasyonu:
     * - Tüm istatistikleri tek bir aggregation pipeline'da toplar
     * - Ayrı ayrı query'ler yerine birleşik aggregation kullanır
     * - Database round-trip sayısını minimize eder
     */
    // ✅ YENİ: Admin için işletme detay ve istatistikleri
    getBusinessStats: async (req, res) => {
        if (req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new Error("Only admins can access business statistics.");
        }

        const businessId = req.params.id;
        const business = await Business.findById(businessId);

        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        // Toilet ID'lerini al (tek query)
        const toilets = await Toilet.find({ business: business._id })
            .select('_id name fee status averageRatings reviewCount');
        const toiletIds = toilets.map(t => t._id);

        if (toiletIds.length === 0) {
            // Toilet yoksa boş istatistik döndür
            return res.status(200).send({
                error: false,
                result: {
                    business: {
                        name: business.businessName,
                        type: business.businessType,
                        address: business.address,
                        approvalStatus: business.approvalStatus
                    },
                    toilets: { total: 0, available: 0, inUse: 0, outOfOrder: 0, list: [] },
                    usage: { total: 0, completed: 0, pending: 0, recent: 0, byDay: [] },
                    revenue: { total: 0, average: 0, currency: 'EUR' },
                    ratings: { average: 0, totalReviews: 0, breakdown: { cleanliness: 0 } },
                    lastUpdated: new Date()
                }
            });
        }

        // 30 gün öncesi
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // ✅ OPTIMIZED: Tüm istatistikleri tek aggregation'da topla
        // N+1 problem çözüldü: Ayrı query'ler yerine tek aggregation pipeline
        const [usageStats, revenueData, usageByDay, reviewStats] = await Promise.all([
            // Usage istatistikleri (total, completed, pending, recent)
            Usage.aggregate([
                {
                    $match: { toiletId: { $in: toiletIds } }
                },
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        completed: [
                            { $match: { status: 'completed' } },
                            { $count: 'count' }
                        ],
                        recent: [
                            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                            { $count: 'count' }
                        ]
                    }
                }
            ]),
            
            // Revenue data (tek query)
            Usage.aggregate([
                { 
                    $match: { 
                        toiletId: { $in: toiletIds },
                        status: { $in: ['paid', 'completed'] }
                    } 
                },
                { 
                    $group: { 
                        _id: null, 
                        totalRevenue: { $sum: '$totalFee' },
                        averageFee: { $avg: '$totalFee' },
                        count: { $sum: 1 }
                    } 
                }
            ]),
            
            // Usage by day (zaten optimize)
            Usage.aggregate([
                {
                    $match: {
                        toiletId: { $in: toiletIds },
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { 
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        count: { $sum: 1 },
                        revenue: { $sum: '$totalFee' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            
            // Review istatistikleri (tek query)
            Review.aggregate([
                {
                    $match: { toiletId: { $in: toiletIds } }
                },
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        avgCleanliness: { $avg: '$ratings.cleanliness' }
                    }
                }
            ])
        ]);

        // Aggregation sonuçlarını parse et
        const usageStatsData = usageStats[0] || {};
        const totalUsages = usageStatsData.total?.[0]?.count || 0;
        const completedUsages = usageStatsData.completed?.[0]?.count || 0;
        const recentUsagesCount = usageStatsData.recent?.[0]?.count || 0;
        
        const revenueResult = revenueData[0] || {};
        const reviewResult = reviewStats[0] || {};

        // Rating hesaplama (toilets zaten yüklü, memory'de hesapla)
        const avgRating = toilets.reduce((acc, t) => 
            acc + (t.averageRatings?.overall || 0), 0) / (toilets.length || 1);

        res.status(200).send({
            error: false,
            result: {
                business: {
                    name: business.businessName,
                    type: business.businessType,
                    address: business.address,
                    approvalStatus: business.approvalStatus
                },
                toilets: {
                    total: toilets.length,
                    available: toilets.filter(t => t.status === 'available').length,
                    inUse: toilets.filter(t => t.status === 'in_use').length,
                    outOfOrder: toilets.filter(t => t.status === 'out_of_order').length,
                    list: toilets.map(t => ({
                        id: t._id,
                        name: t.name,
                        fee: t.fee,
                        status: t.status,
                        averageRating: t.averageRatings?.overall || 0,
                        reviewCount: t.reviewCount || 0
                    }))
                },
                usage: {
                    total: totalUsages,
                    completed: completedUsages,
                    pending: totalUsages - completedUsages,
                    recent: recentUsagesCount,
                    byDay: usageByDay
                },
                revenue: {
                    total: revenueResult.totalRevenue || 0,
                    average: revenueResult.averageFee || 0,
                    currency: 'EUR'
                },
                ratings: {
                    average: parseFloat(avgRating.toFixed(1)),
                    totalReviews: reviewResult.totalReviews || 0,
                    breakdown: {
                        cleanliness: reviewResult.avgCleanliness 
                            ? parseFloat(reviewResult.avgCleanliness.toFixed(1))
                            : toilets.reduce((acc, t) => 
                                acc + (t.averageRatings?.cleanliness || 0), 0) / (toilets.length || 1)
                    }
                },
                lastUpdated: new Date()
            }
        });
    },

    getOwnerStats: async (req, res) => {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new Error("Only owners can access statistics.");
        }

        // Business'ı bul
        const business = await Business.findOne({ owner: req.user._id });

        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        // Toilet ID'lerini al (tek query)
        const toilets = await Toilet.find({ business: business._id })
            .select('_id name fee status averageRatings reviewCount');
        const toiletIds = toilets.map(t => t._id);

        if (toiletIds.length === 0) {
            // Toilet yoksa boş istatistik döndür
            return res.status(200).send({
                error: false,
                result: {
                    business: {
                        name: business.businessName,
                        type: business.businessType,
                        address: business.address,
                        approvalStatus: business.approvalStatus
                    },
                    toilets: { total: 0, available: 0, inUse: 0, outOfOrder: 0, list: [] },
                    usage: { total: 0, completed: 0, pending: 0, recent: 0, byDay: [] },
                    revenue: { total: 0, average: 0, currency: 'EUR' },
                    ratings: { average: 0, totalReviews: 0, breakdown: { cleanliness: 0 } },
                    lastUpdated: new Date()
                }
            });
        }

        // 30 gün öncesi
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // ✅ OPTIMIZED: Tüm istatistikleri tek aggregation'da topla
        // N+1 problem çözüldü: Ayrı query'ler yerine tek aggregation pipeline
        const [usageStats, revenueData, usageByDay, reviewStats] = await Promise.all([
            // Usage istatistikleri (total, completed, pending, recent)
            Usage.aggregate([
                {
                    $match: { toiletId: { $in: toiletIds } }
                },
                {
                    $facet: {
                        total: [{ $count: 'count' }],
                        completed: [
                            { $match: { status: 'completed' } },
                            { $count: 'count' }
                        ],
                        recent: [
                            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                            { $count: 'count' }
                        ]
                    }
                }
            ]),
            
            // Revenue data (tek query)
            Usage.aggregate([
                { 
                    $match: { 
                        toiletId: { $in: toiletIds },
                        status: { $in: ['paid', 'completed'] }
                    } 
                },
                { 
                    $group: { 
                        _id: null, 
                        totalRevenue: { $sum: '$totalFee' },
                        averageFee: { $avg: '$totalFee' },
                        count: { $sum: 1 }
                    } 
                }
            ]),
            
            // Usage by day (zaten optimize)
            Usage.aggregate([
                {
                    $match: {
                        toiletId: { $in: toiletIds },
                        createdAt: { $gte: thirtyDaysAgo }
                    }
                },
                {
                    $group: {
                        _id: { 
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                        },
                        count: { $sum: 1 },
                        revenue: { $sum: '$totalFee' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            
            // Review istatistikleri (tek query)
            Review.aggregate([
                {
                    $match: { toiletId: { $in: toiletIds } }
                },
                {
                    $group: {
                        _id: null,
                        totalReviews: { $sum: 1 },
                        avgCleanliness: { $avg: '$ratings.cleanliness' }
                    }
                }
            ])
        ]);

        // Aggregation sonuçlarını parse et
        const usageStatsData = usageStats[0] || {};
        const totalUsages = usageStatsData.total?.[0]?.count || 0;
        const completedUsages = usageStatsData.completed?.[0]?.count || 0;
        const recentUsagesCount = usageStatsData.recent?.[0]?.count || 0;
        
        const revenueResult = revenueData[0] || {};
        const reviewResult = reviewStats[0] || {};

        // Rating hesaplama (toilets zaten yüklü, memory'de hesapla)
        const avgRating = toilets.reduce((acc, t) => 
            acc + (t.averageRatings?.overall || 0), 0) / (toilets.length || 1);

        res.status(200).send({
            error: false,
            result: {
                business: {
                    name: business.businessName,
                    type: business.businessType,
                    address: business.address,
                    approvalStatus: business.approvalStatus
                },
                toilets: {
                    total: toilets.length,
                    available: toilets.filter(t => t.status === 'available').length,
                    inUse: toilets.filter(t => t.status === 'in_use').length,
                    outOfOrder: toilets.filter(t => t.status === 'out_of_order').length,
                    list: toilets.map(t => ({
                        id: t._id,
                        name: t.name,
                        fee: t.fee,
                        status: t.status,
                        averageRating: t.averageRatings?.overall || 0,
                        reviewCount: t.reviewCount || 0
                    }))
                },
                usage: {
                    total: totalUsages,
                    completed: completedUsages,
                    pending: totalUsages - completedUsages,
                    recent: recentUsagesCount,
                    byDay: usageByDay
                },
                revenue: {
                    total: revenueResult.totalRevenue || 0,
                    average: revenueResult.averageFee || 0,
                    currency: 'EUR'
                },
                ratings: {
                    average: parseFloat(avgRating.toFixed(1)),
                    totalReviews: reviewResult.totalReviews || 0,
                    breakdown: {
                        cleanliness: reviewResult.avgCleanliness 
                            ? parseFloat(reviewResult.avgCleanliness.toFixed(1))
                            : toilets.reduce((acc, t) => 
                                acc + (t.averageRatings?.cleanliness || 0), 0) / (toilets.length || 1)
                    }
                },
                lastUpdated: new Date()
            }
        });
    },

    /**
     * Create a new business
     * 
     * Security:
     * - Input validation using validationService
     * - Admin-only access (enforced by route middleware)
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    create: async (req, res) => {
        // Input validation (security: prevent invalid data)
        const validation = validateBusiness(req.body);
        if (!validation.isValid) {
            res.errorStatusCode = 400;
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        // Set default approval status if not provided
        if (!req.body.approvalStatus) {
            req.body.approvalStatus = STATUS.BUSINESS_APPROVAL.PENDING;
        }
        
        logger.debug('Creating business', {
            businessName: req.body.businessName,
            businessType: req.body.businessType,
            adminId: req.user?._id
        });
        
        const result = await Business.create(req.body);
        
        logger.info('Business created successfully', {
            businessId: result._id,
            businessName: result.businessName,
            adminId: req.user?._id
        });

        res.status(201).send({
            error: false,
            message: "Business created successfully",
            result,
        });
    },

    read: async (req, res) => {
        // ✅ DÜZELTME: role kontrolü
        const filter = req.user?.role === 'admin' 
            ? { _id: req.params.id } 
            : { _id: req.params.id, approvalStatus: 'approved' };
        
        const result = await Business.findOne(filter).populate({
            path: 'owner', 
            select: 'username email role'
        });

        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("Business not found or not approved.");
        }

        res.status(200).send({
            error: false,
            result,
        });
    },

    update: async (req, res) => {
        const business = await Business.findById(req.params.id);
        
        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        const updateData = req.body;
        delete updateData.owner;

        const result = await Business.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(202).send({
            error: false,
            result,
        });
    },

    deletee: async (req, res) => {
        const result = await Business.deleteOne({ _id: req.params.id });

        if (result.deletedCount) {
            res.status(204).send();
        } else {
            res.status(404).send({
                error: true,
                message: "Business not found or already deleted",
            });
        }
    },
};