// controllers/usage.controller.js

"use strict";

const Usage = require('../models/usage.model');
const Payment = require('../models/payment.model');
const Toilet = require('../models/toilet.model');

module.exports = {
    // --- ADMIN: TÜM USAGE KAYITLARINI GÖRÜNTÜLE ---
    list: async (req, res) => {
        if (!req.user.isAdmin) {
            res.errorStatusCode = 403;
            throw new Error("Only admins can view usage records.");
        }

        const result = await res.getModelList(Usage, {}, ['userId', 'toiletId']);

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Usage, {}),
            result,
        });
    },

    // --- USER: YENİ USAGE OLUŞTURMA ---
    create: async (req, res) => {
        const { toiletId } = req.body;

        if (!toiletId) {
            res.errorStatusCode = 400;
            throw new Error("toiletId is required to create a usage record.");
        }

        const toilet = await Toilet.findById(toiletId);
        if (!toilet) {
            res.errorStatusCode = 404;
            throw new Error("Toilet not found.");
        }

        const newUsage = await Usage.create({
            userId: req.user._id,
            toiletId: toiletId,
            totalFee: toilet.fee,
        });

        await Payment.create({
            usage: newUsage._id,
            user: req.user._id,
            amount: newUsage.totalFee,
            status: 'succeeded',
            transactionId: 'txn_' + require('crypto').randomBytes(12).toString('hex')
        });

        res.status(201).send({
            error: false,
            result: newUsage,
        });
    },

    // --- ADMIN: TEK BİR USAGE KAYDI GETİRME ---
    read: async (req, res) => {
        if (!req.user.isAdmin) {
            res.errorStatusCode = 403;
            throw new Error("Only admins can view usage records.");
        }

        const result = await Usage.findOne({ _id: req.params.id });
        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("Usage record not found.");
        }

        res.status(200).send({
            error: false,
            result,
        });
    },

    // --- ADMIN: USAGE GÜNCELLEME ---
    update: async (req, res) => {
        if (!req.user.isAdmin) {
            res.errorStatusCode = 403;
            throw new Error("Only admins can update usage records.");
        }

        const { status } = req.body;
        if (!status) {
            res.errorStatusCode = 400;
            throw new Error("The 'status' field is required for an update.");
        }

        const usage = await Usage.findById(req.params.id);
        if (!usage) {
            res.errorStatusCode = 404;
            throw new Error("Usage record not found.");
        }

        const result = await Usage.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true, runValidators: true }
        );

        res.status(202).send({
            error: false,
            result
        });
    },

    // --- ADMIN: USAGE SİLME ---
    deletee: async (req, res) => {
        if (!req.user.isAdmin) {
            res.errorStatusCode = 403;
            throw new Error("Only admins can delete usage records.");
        }

        const data = await Usage.deleteOne({ _id: req.params.id });
        if (data.deletedCount) {
            res.sendStatus(204);
        } else {
            res.errorStatusCode = 404;
            throw new Error("Usage record not found.");
        }
    }
};
