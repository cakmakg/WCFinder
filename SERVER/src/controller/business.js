// controller/business.js
"use strict";
const Business = require("../models/business");
const Toilet = require("../models/toilet");
const Usage = require("../models/usage");
const Review = require("../models/review");

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

    getOwnerStats: async (req, res) => {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new Error("Only owners can access statistics.");
        }

        const business = await Business.findOne({ owner: req.user._id });

        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        const toilets = await Toilet.find({ business: business._id });
        const toiletIds = toilets.map(t => t._id);

        const totalUsages = await Usage.countDocuments({ 
            toiletId: { $in: toiletIds } 
        });

        const completedUsages = await Usage.countDocuments({ 
            toiletId: { $in: toiletIds },
            status: 'completed'
        });

        const revenueData = await Usage.aggregate([
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
                    averageFee: { $avg: '$totalFee' }
                } 
            }
        ]);

        const reviews = await Review.find({ 
            toiletId: { $in: toiletIds } 
        });

        const avgRating = toilets.reduce((acc, t) => 
            acc + (t.averageRatings?.overall || 0), 0) / (toilets.length || 1);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentUsages = await Usage.find({
            toiletId: { $in: toiletIds },
            createdAt: { $gte: thirtyDaysAgo }
        }).sort({ createdAt: -1 });

        const usageByDay = await Usage.aggregate([
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
                    recent: recentUsages.length,
                    byDay: usageByDay
                },
                revenue: {
                    total: revenueData[0]?.totalRevenue || 0,
                    average: revenueData[0]?.averageFee || 0,
                    currency: 'EUR'
                },
                ratings: {
                    average: parseFloat(avgRating.toFixed(1)),
                    totalReviews: reviews.length,
                    breakdown: {
                        cleanliness: toilets.reduce((acc, t) => 
                            acc + (t.averageRatings?.cleanliness || 0), 0) / (toilets.length || 1),
                    }
                },
                lastUpdated: new Date()
            }
        });
    },

    create: async (req, res) => {
        req.body.approvalStatus = 'pending';
        const result = await Business.create(req.body);

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