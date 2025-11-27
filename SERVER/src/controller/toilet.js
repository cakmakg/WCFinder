"use strict";

const Toilet = require("../models/toilet");
const logger = require("../utils/logger");
const { FEE_CONFIG, STATUS } = require("../constants");
const { validateToilet } = require("../services/validationService");

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
    
    logger.debug('Fetching toilets with filter', { filter });
    
    const data = await res.getModelList(Toilet, filter, "business");

  res.status(200).send({
    error: false,
    details: await res.getModelListDetails(Toilet, filter),
    result: data,
  });
},

  /**
   * POST: Create a new toilet
   * 
   * Security:
   * - Input validation using validationService
   * - Fee always set to DEFAULT_TOILET_FEE (prevents fee manipulation)
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
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
    
    // Input validation (security: prevent invalid data)
    const validation = validateToilet(req.body);
    if (!validation.isValid) {
      res.errorStatusCode = 400;
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // ✅ Yeni tuvalet kayıtlarında fee her zaman DEFAULT_TOILET_FEE olmalı (DRY principle)
    // Security: Prevent fee manipulation by always using constant
    const toiletData = {
      ...req.body,
      fee: FEE_CONFIG.DEFAULT_TOILET_FEE  // Always use constant
    };
    
    logger.debug('Creating toilet', { 
      businessId: toiletData.business,
      fee: toiletData.fee,
      name: toiletData.name
    });
    
    const result = await Toilet.create(toiletData);
    
    logger.info('Toilet created successfully', {
      toiletId: result._id,
      businessId: toiletData.business,
      name: result.name
    });

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