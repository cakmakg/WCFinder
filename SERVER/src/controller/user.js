"use strict";
const User = require("../models/user");
const passwordEncrypt = require("../helper/passwordEncrypt");

module.exports = {
    list: async (req, res) => {
        // Rota zaten isAdmin tarafından korunduğu için, tüm kullanıcıları güvenle listeleyebiliriz.
        const data = await res.getModelList(User);
        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(User),
            result: data,
        });
    },

    create: async (req, res) => {
        // Yeni kullanıcı kaydı herkese açıktır.
        // ✅ SECURITY: Password'u hash'le
        const userData = { ...req.body };
        if (userData.password) {
            userData.password = passwordEncrypt(userData.password);
        }
        const data = await User.create(userData);
        res.status(201).send({
            error: false,
            result: data,
        });
    },

    read: async (req, res) => {
        // Rota zaten isSelfOrAdmin tarafından korunduğu için,
        // bu fonksiyona ulaşan kişinin bu veriyi görmeye yetkisi vardır.
        const data = await User.findOne({ _id: req.params.id });
        res.status(200).send({
            error: false,
            result: data,
        });
    },

    update: async (req, res) => {
        // EK GÜVENLİK: Normal bir kullanıcının kendisini admin yapmasını engelle.
        if (!req.user.isAdmin) {
            delete req.body.isAdmin; // Gelen istekte isAdmin alanı varsa bile sil.
            delete req.body.role;    // Rolünü değiştirmesini engelle.
        }
        
        // ✅ SECURITY: Password güncelleniyorsa hash'le
        const updateData = { ...req.body };
        if (updateData.password) {
            updateData.password = passwordEncrypt(updateData.password);
        }
        
        const data = await User.updateOne({ _id: req.params.id }, updateData, { runValidators: true });
        res.status(202).send({
            error: false,
            data,
            new: await User.findOne({ _id: req.params.id })
        });
    },

    deletee: async (req, res) => {
        // Rota zaten isAdmin tarafından korunduğu için, güvenle silebiliriz.
        const data = await User.deleteOne({ _id: req.params.id });
        res.status(data.deletedCount ? 204 : 404).send({
            error: !data.deletedCount,
            message: "User not found or already deleted"
        });
    }
};