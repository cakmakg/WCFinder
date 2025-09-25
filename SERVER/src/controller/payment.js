// controllers/payment.controller.js

"use strict";

const Payment = require('../models/payment');
const Business = require('../models/business');

module.exports = {
    // NOT: 'create' fonksiyonu yoktur ve olmamalıdır.
    // Ödemeler, sadece '/usages' endpoint'inde yeni bir kullanım oluşturulduğunda otomatik olarak yaratılır.

    list: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "List All Payments (Admins Only)"
        */

        // Rota zaten `isAdmin` tarafından korunduğu için, burada ek bir kontrol yapmaya gerek yok.
        // Gelen admin kullanıcısı tüm ödemeleri görebilir.
        const data = await res.getModelList(Payment, {}, ['usage', 'user']);

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Payment),
            result: data,
        });
    },

    read: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Get a single Payment (Admins Only)"
        */

        // Rota zaten `isAdmin` tarafından korunduğu için, burada ek bir yetki kontrolüne gerek yok.
        const data = await Payment.findOne({ _id: req.params.id }).populate(['usage', 'user']);

        res.status(200).send({
            error: false,
            result: data,
        });
    },

    update: async (req, res) => {
        /*
            #swagger.tags = ["Payments"]
            #swagger.summary = "Update Payment (Admins Only)"
        */
        const data = await Payment.updateOne({ _id: req.params.id }, req.body, { runValidators: true });

        res.status(202).send({
            error: false,
            data,
            new: await Payment.findOne({ _id: req.params.id })
        });
    },

    deletee: async (req, res) => {
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