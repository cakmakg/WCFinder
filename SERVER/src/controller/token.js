"use strict"
/* -------------------------------------------------------
    | FULLSTACK TEAM | NODEJS / EXPRESS |
------------------------------------------------------- */

const Token = require('../models/token');

module.exports = {

    list: async (req, res) => {
        /*
            #swagger.ignore = true
        */

        const data = await res.getModelList(Token);

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Token),
            data
        });
    },

    create: async (req, res) => {
        /*
            #swagger.ignore = true
        */

        const data = await Token.create(req.body);

        res.status(201).send({
            error: false,
            data
        });
    },

    read: async (req, res) => {
        /*
            #swagger.ignore = true
        */
        const data = await Token.findById(req.params.id);

        res.status(200).send({
            error: false,
            data
        });
    },

    update: async (req, res) => {
        /*
            #swagger.ignore = true
        */

        const data = await Token.updateOne({ _id: req.params.id }, req.body, { runValidators: true });

        res.status(200).send({
            error: false,
            data,
            new: await Token.findById(req.params.id)
        });
    },

    deletee: async (req, res) => {
        /*
            #swagger.ignore = true
        */

        const data = await Token.deleteOne({ _id: req.params.id });

        res.status(data.deletedCount ? 204 : 404).send({
            error: !data.deletedCount,
            message: data.deletedCount ? 'Data deleted.' : 'Data is not found or already deleted.',
            data
        });
    },
};