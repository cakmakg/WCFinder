// controllers/payment.controller.js

"use strict";

const Payment = require('../models/payment');
const Usage = require('../models/usage');
const WC = require('../models/toilet');
const Business = require('../models/bussiness');

module.exports = {
    // NOT: Bu controller'da 'create' fonksiyonu yoktur.
    // Ödemeler, sadece '/usages' endpoint'inde yeni bir kullanım oluşturulduğunda otomatik olarak yaratılır.

    list: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "List Payments"
        */
        let filter = {};

        if (req.user.isAdmin) {
            // Admin tüm ödeme kayıtlarını görür.
            filter = {};
        } else if (req.user.role === 'owner') {
            // Owner, sadece kendi işletmelerine yapılan ödemeleri görür.
            const businesses = await Business.find({ owner: req.user._id }).select('_id');
            const businessIds = businesses.map(b => b._id);
            const toilets = await WC.find({ business: { $in: businessIds } }).select('_id');
            const toiletIds = toilets.map(t => t._id);
            const usages = await Usage.find({ toiletId: { $in: toiletIds } }).select('_id');
            const usageIds = usages.map(u => u._id);
            filter = { usage: { $in: usageIds } };
        } else {
            // Normal kullanıcı sadece kendi ödemelerini görür.
            filter = { user: req.user._id };
        }

        const result = await res.getModelList(Payment, filter, ['usage', 'user']);

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Payment, filter),
            result,
        });
    },

    read: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Get a single Payment"
        */
        const result = await Payment.findOne({ _id: req.params.id });

        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("Payment record not found.");
        }

        // --- YETKİ KONTROLÜ ---
        // Kullanıcı admin değilse VE bu ödemenin sahibi de değilse, görmesini engelle.
        const isOwnerOfPayment = result.user.toString() === req.user._id.toString();
        if (!req.user.isAdmin && !isOwnerOfPayment) {
            // Not: Owner'ın kendi işletmesine ait ödemeyi görme kontrolü buraya eklenebilir.
            // Şimdilik basit tutuyoruz.
            res.errorStatusCode = 403;
            throw new Error("You are not authorized to view this payment record.");
        }

        res.status(200).send({
            error: false,
            result,
        });
    },

    // Not: Ödeme kayıtlarını güncellemek ve silmek, finansal bütünlük için
    // genellikle tehlikeli işlemlerdir ve sadece adminlere özel olmalıdır.
    update: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Update Payment (Admins Only)"
        */
        const result = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.status(202).send({
            error: false,
            result,
        });
    },

    remove: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Delete Payment (Admins Only)"
        */
        const data = await Payment.deleteOne({ _id: req.params.id });
        if (data.deletedCount) {
            res.sendStatus(204);
        } else {
            res.errorStatusCode = 404;
            throw new Error("Payment record not found.");
        }
    }
};