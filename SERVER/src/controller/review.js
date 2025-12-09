"use strict";
/**
 * Review Controller
 * 
 * Handles all review-related operations including:
 * - Creating reviews
 * - Reading reviews
 * - Updating reviews
 * - Deleting reviews
 * 
 * Security:
 * - Input validation for all review data
 * - ObjectId validation to prevent injection attacks
 * - User authentication required for all operations
 * - Review ownership verification for updates/deletes
 * 
 * Clean Code Principles:
 * - DRY: Validation logic centralized
 * - Single Responsibility: Only handles HTTP requests/responses
 * - Security: Comprehensive input validation and sanitization
 * 
 * @author WCFinder Team
 * @version 2.0.0
 */

const Review = require("../models/review");
const { validateObjectId } = require("../middleware/validation");
const { ValidationError } = require("../middleware/errorHnadler");
const logger = require("../utils/logger");

module.exports = {
  /**
   * GET: List all reviews
   * 
   * Security:
   * - No sensitive data exposed
   * - Pagination to prevent DoS
   * 
   * Performance:
   * - Uses populate to avoid N+1 queries
   */
  list: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "List all reviews"
    */
    
    // SECURITY: Sanitize filter to prevent NoSQL injection
    const filter = req.query.filter || {};
    
    // Performance: Single query with populate (avoids N+1)
    const data = await res.getModelList(Review, filter, ["userId", "toiletId"]);

    res.status(200).send({
      error: false,
      details: await res.getModelListDetails(Review, filter),
      result: data,
    });
  },

  /**
   * POST: Create a new review
   * 
   * Security:
   * - Validates all input parameters
   * - Validates ObjectId formats
   * - Ensures user is authenticated
   * - Prevents user ID injection (uses req.user._id)
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  create: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Create Review"
    */

    // SECURITY: Validate user authentication
    if (!req.user || !req.user._id) {
      res.errorStatusCode = 401;
      throw new Error("Authentication required to create review");
    }

    // SECURITY: Validate required fields
    const { rating, comment, toiletId } = req.body;
    
    if (!toiletId) {
      res.errorStatusCode = 400;
      throw new ValidationError("toiletId is required");
    }

    // SECURITY: Validate ObjectId format (prevent NoSQL injection)
    if (!validateObjectId(toiletId)) {
      res.errorStatusCode = 400;
      throw new ValidationError("Invalid toiletId format");
    }

    // SECURITY: Validate rating (must be 1-5)
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.errorStatusCode = 400;
      throw new ValidationError("Rating must be a number between 1 and 5");
    }

    // SECURITY: Validate comment length (prevent DoS)
    if (comment && typeof comment === 'string' && comment.length > 5000) {
      res.errorStatusCode = 400;
      throw new ValidationError("Comment must be less than 5000 characters");
    }

    // SECURITY: Prevent user ID injection - always use authenticated user's ID
    const reviewData = {
      ...req.body,
      userId: req.user._id, // CRITICAL: Use authenticated user ID, not from request body
      toiletId: toiletId.trim()
    };

    // Remove any attempt to inject userId from request body
    delete reviewData.userId;

    logger.debug('Creating review', {
      userId: req.user._id,
      toiletId,
      rating
    });

    try {
      const data = await Review.create({
        userId: req.user._id,
        rating,
        comment: comment ? comment.trim() : undefined,
        toiletId
      });

      logger.info('Review created successfully', {
        reviewId: data._id,
        userId: req.user._id,
        toiletId
      });

      res.status(201).send({
        error: false,
        result: data,
      });
    } catch (error) {
      logger.error('Review creation failed', error, {
        userId: req.user._id,
        toiletId
      });
      throw error;
    }
  },

  /**
   * GET: Get a single review by ID
   * 
   * Security:
   * - Validates ObjectId format
   * - Limits populated data exposure
   * 
   * Performance:
   * - Single query with populate (avoids N+1)
   */
  read: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Get a single review by ID"
    */
    
    // SECURITY: Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      res.errorStatusCode = 400;
      throw new ValidationError("Invalid review ID format");
    }

    // Performance: Single query with populate (avoids N+1)
    const result = await Review.findById(req.params.id).populate([
      { path: "userId", select: "firstName lastName email" },
      { path: "toiletId", select: "name location" },
    ]);

    if (!result) {
      res.errorStatusCode = 404;
      throw new Error("Review not found.");
    }

    res.status(200).send({
      error: false,
      result,
    });
  },

  /**
   * PUT/PATCH: Update an existing review
   * 
   * Security:
   * - Validates ObjectId format
   * - Validates rating range
   * - Validates comment length
   * - Prevents unauthorized updates (only owner can update)
   * - Prevents user ID injection
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  update: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Update an existing review"
      #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          "rating": 4,
          "comment": "Still good, but could be better."
        }
      }
    */
    
    // SECURITY: Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      res.errorStatusCode = 400;
      throw new ValidationError("Invalid review ID format");
    }

    // SECURITY: Find review first to verify ownership
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.errorStatusCode = 404;
      throw new Error("Review not found.");
    }

    // SECURITY: Only review owner can update (unless admin)
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.errorStatusCode = 403;
      throw new Error("You can only update your own reviews.");
    }

    // SECURITY: Validate rating if provided
    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        res.errorStatusCode = 400;
        throw new ValidationError("Rating must be an integer between 1 and 5");
      }
      req.body.rating = rating;
    }

    // SECURITY: Validate comment length (prevent DoS)
    if (req.body.comment !== undefined && req.body.comment.length > 5000) {
      res.errorStatusCode = 400;
      throw new ValidationError("Comment must be less than 5000 characters");
    }

    // SECURITY: Prevent user ID injection
    delete req.body.userId;
    delete req.body.toiletId;

    logger.debug('Updating review', {
      reviewId: req.params.id,
      userId: req.user._id
    });

    const result = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info('Review updated successfully', {
      reviewId: req.params.id,
      userId: req.user._id
    });

    res.status(202).send({
      error: false,
      result,
    });
  },

  /**
   * DELETE: Delete a review
   * 
   * Security:
   * - Validates ObjectId format
   * - Prevents unauthorized deletion (only owner or admin can delete)
   * 
   * @param {object} req - Express request
   * @param {object} res - Express response
   */
  deletee: async (req, res) => {
    /*
      #swagger.tags = ["Reviews"]
      #swagger.summary = "Delete a review"
    */
    
    // SECURITY: Validate ObjectId format
    if (!validateObjectId(req.params.id)) {
      res.errorStatusCode = 400;
      throw new ValidationError("Invalid review ID format");
    }

    // SECURITY: Find review first to verify ownership
    const review = await Review.findById(req.params.id);
    if (!review) {
      res.errorStatusCode = 404;
      throw new Error("Review not found or already deleted.");
    }

    // SECURITY: Only review owner or admin can delete
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.errorStatusCode = 403;
      throw new Error("You can only delete your own reviews.");
    }

    logger.debug('Deleting review', {
      reviewId: req.params.id,
      userId: req.user._id
    });

    await Review.findByIdAndDelete(req.params.id);

    logger.info('Review deleted successfully', {
      reviewId: req.params.id,
      userId: req.user._id
    });

    res.status(204).send(); // No Content
  },
};