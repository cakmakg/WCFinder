"use strict";

const BussinessType = require("../models/bussinessType");

module.exports = {
  // GET: Tüm işletme türlerini listeleme
  list: async (req, res) => {
    /*
      #swagger.tags = ["Business Types"]
      #swagger.summary = "List all business types"
    */
    const data = await BussinessType.find();
    res.status(200).send({
      error: false,
      count: data.length,
      result: data,
    });
  },

  // POST: Yeni bir işletme türü oluşturma
  create: async (req, res) => {
    /*
      #swagger.tags = ["Business Types"]
      #swagger.summary = "Create a new business type"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "name": "Restaurant"
        }
      }
    */
    const result = await BussinessType.create(req.body);
    res.status(201).send({
      error: false,
      result,
    });
  },

  // GET: Belirli bir işletme türünü ID ile okuma
  read: async (req, res) => {
    /*
      #swagger.tags = ["Business Types"]
      #swagger.summary = "Get a single business type by ID"
    */
    const result = await BussinessType.findById(req.params.id);

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Business type not found.",
      });
    }

    res.status(200).send({
      error: false,
      result,
    });
  },

  // PUT/PATCH: Belirli bir işletme türünü güncelleme
  update: async (req, res) => {
    /*
      #swagger.tags = ["Business Types"]
      #swagger.summary = "Update an existing business type"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "name": "Hotel"
        }
      }
    */
    const result = await BussinessType.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Business type not found for update.",
      });
    }

    res.status(202).send({
      error: false,
      result,
    });
  },

  // DELETE: Belirli bir işletme türünü silme
  deletee: async (req, res) => {
    /*
      #swagger.tags = ["Business Types"]
      #swagger.summary = "Delete a business type"
    */
    const result = await BussinessType.findByIdAndDelete(req.params.id);

    if (result) {
      // Silme başarılıysa 204 No Content döndür
      res.status(204).send();
    } else {
      // Doküman bulunamazsa 404 döndür
      res.status(404).send({
        error: true,
        message: "Business type not found or already deleted.",
      });
    }
  },
};