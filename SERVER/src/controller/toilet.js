"use strict";

const Toilet = require("../models/toilet");

module.exports = {
  // GET: Tüm tuvaletleri listeleme
  list: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "List all toilets"
    */
    // Query parametrelerinden business filter al
    const filter = {};
    
    if (req.query['filter[business]']) {
      filter.business = req.query['filter[business]'];
    }
    
    console.log('Toilet filter:', filter);
    
    const data = await res.getModelList(Toilet, filter, "business");

  res.status(200).send({
    error: false,
    details: await res.getModelListDetails(Toilet, filter),
    result: data,
  });
},

  // POST: Yeni bir tuvalet oluşturma
  create: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "Create a new toilet"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "business": "60c72b2f9b1e8e001c8e4a9e",
          "isAvailable": true,
          "price": 10,
          "gender": "Male",
          "accessible": true
        }
      }
    */
    const result = await Toilet.create(req.body);

    res.status(201).send({
      error: false,
      result,
    });
  },

  // GET: Belirli bir tuvaleti ID ile okuma
  read: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "Get a single toilet by ID"
    */
    const result = await Toilet.findById(req.params.id).populate("business");

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Toilet not found.",
      });
    }

    res.status(200).send({
      error: false,
      result,
    });
  },

  // PUT/PATCH: Belirli bir tuvaleti güncelleme
  update: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "Update an existing toilet"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "isAvailable": false,
          "price": 5
        }
      }
    */
    const result = await Toilet.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      return res.status(404).send({
        error: true,
        message: "Toilet not found for update.",
      });
    }

    res.status(202).send({
      error: false,
      result,
    });
  },

  // DELETE: Belirli bir tuvaleti silme
  deletee: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "Delete a toilet"
    */
    const result = await Toilet.findByIdAndDelete(req.params.id);

    if (result) {
      res.status(204).send(); // Silme başarılıysa 204 No Content döndür
    } else {
      res.status(404).send({
        error: true,
        message: "Toilet not found or already deleted.",
      });
    }
  },
};