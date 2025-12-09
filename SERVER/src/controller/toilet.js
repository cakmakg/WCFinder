"use strict";

const Toilet = require("../models/toilet");
const logger = require("../utils/logger");
const { FEE_CONFIG, STATUS } = require("../constants");
const { validateToilet } = require("../services/validationService");

module.exports = {
  /**
   * GET: List all toilets with optional business filter
   * 
   * Performance:
   * - Uses server-side filtering to avoid N+1 query problem
   * - Efficient database queries with proper indexing
   * 
   * Security:
   * - Validates ObjectId format for business filter
   * - Prevents NoSQL injection through query sanitization
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  list: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "List all toilets"
    */
    const { validateObjectId } = require('../middleware/validation');
    const filter = {};
    
    // ✅ SECURITY: Validate and sanitize business filter parameter
    if (req.query['filter[business]']) {
      const businessId = req.query['filter[business]'];
      
      // Validate ObjectId format to prevent injection attacks
      if (!validateObjectId(businessId)) {
        res.errorStatusCode = 400;
        throw new Error('Invalid business ID format');
      }
      
      filter.business = businessId;
    }
    
    logger.debug('Fetching toilets with filter', { 
      filter,
      hasBusinessFilter: !!filter.business 
    });
    
    // ✅ OPTIMIZED: Single query with populate (avoids N+1 problem)
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

  /**
   * GET: Get a single toilet by ID
   * 
   * Security:
   * - Validates ObjectId format before querying database
   * - Prevents NoSQL injection attacks
   * 
   * Performance:
   * - Single query with populate (efficient)
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  read: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "Get a single toilet by ID"
    */
    const { validateObjectId } = require('../middleware/validation');
    
    // ✅ SECURITY: Validate ObjectId format to prevent injection
    if (!validateObjectId(req.params.id)) {
      res.errorStatusCode = 400;
      throw new Error('Invalid toilet ID format');
    }
    
    // ✅ OPTIMIZED: Single query with populate (avoids N+1)
    const result = await Toilet.findById(req.params.id).populate("business");

    if (!result) {
      res.errorStatusCode = 404;
      throw new Error("Toilet not found.");
    }

    logger.debug('Toilet retrieved successfully', { toiletId: req.params.id });

    res.status(200).send({
      error: false,
      result,
    });
  },

  /**
   * PUT/PATCH: Update an existing toilet
   * 
   * Security:
   * - Validates ObjectId format
   * - Input validation through validationService
   * - Prevents unauthorized field updates
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
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
    const { validateObjectId } = require('../middleware/validation');
    
    // ✅ SECURITY: Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      res.errorStatusCode = 400;
      throw new Error('Invalid toilet ID format');
    }
    
    // ✅ SECURITY: Prevent fee manipulation (fee should only be set via constants)
    const updateData = { ...req.body };
    delete updateData.fee; // Fee cannot be changed via update
    
    // ✅ SECURITY: Input validation
    if (Object.keys(updateData).length > 0) {
      const validation = validateToilet(updateData, true); // true = partial update
      if (!validation.isValid) {
        res.errorStatusCode = 400;
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
    }
    
    logger.debug('Updating toilet', { 
      toiletId: req.params.id,
      updateFields: Object.keys(updateData)
    });
    
    const result = await Toilet.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!result) {
      res.errorStatusCode = 404;
      throw new Error("Toilet not found for update.");
    }
    
    logger.info('Toilet updated successfully', { toiletId: req.params.id });

    res.status(202).send({
      error: false,
      result,
    });
  },

  /**
   * DELETE: Delete a toilet
   * 
   * Security:
   * - Validates ObjectId format
   * - Logs deletion for audit trail
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  deletee: async (req, res) => {
    /*
      #swagger.tags = ["Toilets"]
      #swagger.summary = "Delete a toilet"
    */
    const { validateObjectId } = require('../middleware/validation');
    
    // ✅ SECURITY: Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      res.errorStatusCode = 400;
      throw new Error('Invalid toilet ID format');
    }
    
    logger.debug('Deleting toilet', { toiletId: req.params.id });
    
    const result = await Toilet.findByIdAndDelete(req.params.id);

    if (result) {
      logger.info('Toilet deleted successfully', { toiletId: req.params.id });
      res.status(204).send(); // ✅ RESTful: 204 No Content for successful deletion
    } else {
      res.errorStatusCode = 404;
      throw new Error("Toilet not found or already deleted.");
    }
  },
};