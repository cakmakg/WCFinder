"use strict";
/**
 * Business Statistics Service
 * 
 * Business istatistik hesaplama logic'i.
 * getBusinessStats ve getOwnerStats için ortak kullanım.
 * 
 * Clean Code Principles:
 * - DRY: Tekrar eden aggregation logic'leri burada
 * - Single Responsibility: Sadece istatistik hesaplama
 * - Reusability: Farklı controller'lardan kullanılabilir
 */

const Toilet = require("../models/toilet");
const Usage = require("../models/usage");
const Review = require("../models/review");

/**
 * Business için istatistikleri hesapla
 * 
 * @param {Object} business - Business model instance
 * @returns {Promise<Object>} İstatistik objesi
 */
async function calculateBusinessStats(business) {
    // Toilet ID'lerini al
    const toilets = await Toilet.find({ business: business._id })
        .select('_id name fee status averageRatings reviewCount');
    const toiletIds = toilets.map(t => t._id);

    // Toilet yoksa boş istatistik döndür
    if (toiletIds.length === 0) {
        return {
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
        };
    }

    // 30 gün öncesi
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Tüm istatistikleri paralel olarak hesapla
    const [usageStats, revenueData, usageByDay, reviewStats] = await Promise.all([
        calculateUsageStats(toiletIds, thirtyDaysAgo),
        calculateRevenueStats(toiletIds),
        calculateUsageByDay(toiletIds, thirtyDaysAgo),
        calculateReviewStats(toiletIds)
    ]);

    // Sonuçları parse et
    const usageStatsData = usageStats[0] || {};
    const totalUsages = usageStatsData.total?.[0]?.count || 0;
    const completedUsages = usageStatsData.completed?.[0]?.count || 0;
    const recentUsagesCount = usageStatsData.recent?.[0]?.count || 0;
    
    const revenueResult = revenueData[0] || {};
    const reviewResult = reviewStats[0] || {};

    // Rating hesaplama
    const avgRating = toilets.reduce((acc, t) => 
        acc + (t.averageRatings?.overall || 0), 0) / (toilets.length || 1);

    return {
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
    };
}

/**
 * Usage istatistiklerini hesapla
 */
function calculateUsageStats(toiletIds, thirtyDaysAgo) {
    return Usage.aggregate([
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
    ]);
}

/**
 * Revenue istatistiklerini hesapla
 */
function calculateRevenueStats(toiletIds) {
    return Usage.aggregate([
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
    ]);
}

/**
 * Günlük usage istatistiklerini hesapla
 */
function calculateUsageByDay(toiletIds, thirtyDaysAgo) {
    return Usage.aggregate([
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
    ]);
}

/**
 * Review istatistiklerini hesapla
 */
function calculateReviewStats(toiletIds) {
    return Review.aggregate([
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
    ]);
}

module.exports = {
    calculateBusinessStats
};

