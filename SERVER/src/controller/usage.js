// controllers/usage.controller.js

"use strict";

const Usage = require('../models/usage.model'); // Dosya adınızın bu şekilde olduğundan emin olun
const Payment = require('../models/payment.model');
const Toilet = require('../models/toilet.model');
const Business = require('../models/business.model');

module.exports = {
    list: async (req, res) => {
        let filter = {};

        if (req.user.isAdmin) {
            filter = {};
        } else if (req.user.role === 'owner') {
            const businesses = await Business.find({ owner: req.user._id }).select('_id');
            const businessIds = businesses.map(b => b._id);
            
            // DÜZELTME: Model adı 'Toilet' (büyük harf) ve değişken adı 'toilets' (çoğul) olarak düzeltildi.
            const toilets = await Toilet.find({ business: { $in: businessIds } }).select('_id');
            const toiletIds = toilets.map(t => t._id);

            // DÜZELTME: Filtredeki alan adı model ile uyumlu hale getirildi ('toiletId').
            filter = { toiletId: { $in: toiletIds } };
        } else {
            // DÜZELTME: Filtredeki alan adı model ile uyumlu hale getirildi ('userId').
            filter = { userId: req.user._id };
        }

        // DÜZELTME: Populate edilecek alan adları model ile uyumlu hale getirildi.
        const result = await res.getModelList(Usage, filter, ['userId', 'toiletId']);

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Usage, filter),
            result,
        });
    },

    create: async (req, res) => {
        // DÜZELTME: Değişken adı ve hata mesajları 'toiletId' ile tutarlı hale getirildi.
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

        // Bu kısımdaki alan adları ('userId', 'toiletId') zaten modelinizle uyumluydu, korundu.
        const newUsage = await Usage.create({
            userId: req.user._id,
            toiletId: toiletId,
            totalFee: toilet.fee,
        });

        await Payment.create({
            usage: newUsage._id,
            user: req.user._id, // Payment modelindeki alan adı 'user' idi, bu doğru.
            amount: newUsage.totalFee,
            status: 'succeeded',
            transactionId: 'txn_' + require('crypto').randomBytes(12).toString('hex')
        });

        res.status(201).send({
            error: false,
            result: newUsage,
        });
    },

    read: async (req, res) => {
        const result = await Usage.findOne({ _id: req.params.id });

        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("Usage record not found.");
        }
        
        // DÜZELTME: Sahiplik kontrolü için modeldeki 'userId' alanı kullanıldı.
        const isOwnerOfUsage = result.userId.toString() === req.user._id.toString();

        if (!req.user.isAdmin && !isOwnerOfUsage) {
            res.errorStatusCode = 403;
            throw new Error("You are not authorized to view this record.");
        }

        res.status(200).send({
            error: false,
            result,
        });
    },

    update: async (req, res) => {
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
        
        // DÜZELTME: Model adı 'Toilet' ve usage modelindeki alan adı 'toiletId' olarak düzeltildi.
        const toilet = await Toilet.findById(usage.toiletId);
        // Hata kontrolü: Eğer tuvalet bir şekilde silindiyse...
        if (!toilet) {
             res.errorStatusCode = 404;
             throw new Error("The toilet associated with this usage record could not be found.");
        }
        const business = await Business.findById(toilet.business);

        const isOwner = business.owner.toString() === req.user._id.toString();
        if (!req.user.isAdmin && !isOwner) {
            res.errorStatusCode = 403;
            throw new Error("You can only update usage records for your own businesses.");
        }

        const result = await Usage.findByIdAndUpdate(req.params.id, { status: status }, { new: true, runValidators: true });

        res.status(202).send({
            error: false,
            result
        });
    },
    
    // Router'ınızda 'deletee' olmadığı için bu fonksiyonu isterseniz silebilir veya adını düzeltebilirsiniz.
    // Şimdilik koruyorum.
    remove: async (req, res) => {
        const data = await Usage.deleteOne({ _id: req.params.id });
        if (data.deletedCount) {
            res.sendStatus(204);
        } else {
            res.errorStatusCode = 404;
            throw new Error("Usage record not found.");
        }
    }
};