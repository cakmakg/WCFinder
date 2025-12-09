// controller/business.js
"use strict";
/**
 * Business Controller
 * 
 * Business CRUD ve business logic işlemleri.
 * 
 * Clean Code Principles:
 * - Single Responsibility: Sadece request/response handling
 * - DRY: Business logic service layer'da
 * - Separation of Concerns: Controller sadece HTTP işlemleri
 */

const Business = require("../models/business");
const User = require("../models/user");
const { validateBusiness } = require("../services/validationService");
const passwordEncrypt = require("../helper/passwordEncrypt");
const { ValidationError } = require("../middleware/errorHnadler");
const logger = require("../utils/logger");
const { STATUS } = require("../constants");

// Services
const businessStatsService = require("../services/businessStatsService");
const businessEmailService = require("../services/businessEmailService");
const businessValidationService = require("../services/businessValidationService");

module.exports = {
    /**
     * GET: List all businesses
     * 
     * Security:
     * - Admin sees all businesses (including pending/rejected)
     * - Regular users only see approved businesses
     * 
     * Performance:
     * - Uses populate to avoid N+1 queries
     * - Efficient pagination
     * - Single query with populate (not N+1)
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    list: async (req, res) => {
        // SECURITY: Apply role-based filtering
        const customFilter = req.user?.role === 'admin' 
            ? {} 
            : { approvalStatus: 'approved' };
        
        // PERFORMANCE: Single query with populate (avoids N+1)
        // This is better than fetching businesses and then populating owner for each
        const data = await res.getModelList(
            Business, 
            customFilter, 
            {
                path: 'owner',
                select: 'username email firstName lastName' // SECURITY: Only expose necessary fields
            }
        );

        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(Business, customFilter),
            result: data
        });
    },

    /**
     * Get owner's business
     */
    myBusiness: async (req, res) => {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new Error("Only owners can access this endpoint.");
        }

        const business = await Business.findOne({ owner: req.user._id })
            .populate('owner', 'username email');

        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("You don't have a registered business yet.");
        }

        res.status(200).send({
            error: false,
            result: business
        });
    },

    /**
     * Get business statistics (Admin)
     */
    getBusinessStats: async (req, res) => {
        if (req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new Error("Only admins can access business statistics.");
        }

        const business = await Business.findById(req.params.id);
        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        const stats = await businessStatsService.calculateBusinessStats(business);

        res.status(200).send({
            error: false,
            result: stats
        });
    },

    /**
     * Get owner statistics
     */
    getOwnerStats: async (req, res) => {
        if (req.user.role !== 'owner' && req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new Error("Only owners can access statistics.");
        }

        const business = await Business.findOne({ owner: req.user._id });
        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        const stats = await businessStatsService.calculateBusinessStats(business);

        res.status(200).send({
            error: false,
            result: stats
        });
    },

    /**
     * Create a new business (Admin only)
     */
    create: async (req, res) => {
        const validation = validateBusiness(req.body);
        if (!validation.isValid) {
            res.errorStatusCode = 400;
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }
        
        if (!req.body.approvalStatus) {
            req.body.approvalStatus = STATUS.BUSINESS_APPROVAL.PENDING;
        }
        
        logger.debug('Creating business', {
            businessName: req.body.businessName,
            businessType: req.body.businessType,
            adminId: req.user?._id
        });
        
        const result = await Business.create(req.body);
        
        logger.info('Business created successfully', {
            businessId: result._id,
            businessName: result.businessName,
            adminId: req.user?._id
        });

        res.status(201).send({
            error: false,
            message: "Business created successfully",
            result,
        });
    },

    /**
     * Get a single business by ID
     */
    read: async (req, res) => {
        businessValidationService.validateBusinessId(req.params.id, res);
        
        const filter = req.user?.role === 'admin' 
            ? { _id: req.params.id } 
            : { _id: req.params.id, approvalStatus: 'approved' };
        
        const result = await Business.findOne(filter).populate({
            path: 'owner', 
            select: 'username email role'
        });

        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("Business not found or not approved.");
        }
        
        logger.debug('Business retrieved successfully', { 
            businessId: req.params.id,
            role: req.user?.role 
        });

        res.status(200).send({
            error: false,
            result,
        });
    },

    /**
     * PUT/PATCH: Update an existing business
     * 
     * Security:
     * - Validates ObjectId format
     * - Verifies business exists
     * - Prevents unauthorized field updates (owner, approvalStatus)
     * - Only owner or admin can update
     * 
     * Performance:
     * - Single update query
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    update: async (req, res) => {
        businessValidationService.validateBusinessId(req.params.id, res);
        
        // SECURITY: Find business first to verify ownership
        const business = await Business.findById(req.params.id);
        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        // SECURITY: Only owner or admin can update business
        const isOwner = business.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            res.errorStatusCode = 403;
            throw new Error("You can only update your own business.");
        }

        // SECURITY: Prevent unauthorized field updates
        const updateData = { ...req.body };
        
        // SECURITY: Only admin can change owner or approval status
        if (!isAdmin) {
            delete updateData.owner;
            delete updateData.approvalStatus;
        }

        // SECURITY: Validate business data if updating
        if (Object.keys(updateData).length > 0) {
            const validation = validateBusiness({ ...business.toObject(), ...updateData });
            if (!validation.isValid) {
                res.errorStatusCode = 400;
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
        }

        logger.debug('Updating business', {
            businessId: req.params.id,
            userId: req.user._id,
            isAdmin
        });

        const result = await Business.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        );

        logger.info('Business updated successfully', {
            businessId: req.params.id,
            updatedBy: req.user._id
        });

        res.status(202).send({
            error: false,
            result,
        });
    },

    /**
     * DELETE: Delete a business
     * 
     * Security:
     * - Validates ObjectId format
     * - Verifies business exists
     * - Only owner or admin can delete
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    deletee: async (req, res) => {
        businessValidationService.validateBusinessId(req.params.id, res);
        
        // SECURITY: Find business first to verify ownership
        const business = await Business.findById(req.params.id);
        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        // SECURITY: Only owner or admin can delete business
        const isOwner = business.owner.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        
        if (!isOwner && !isAdmin) {
            res.errorStatusCode = 403;
            throw new Error("You can only delete your own business.");
        }

        logger.debug('Deleting business', {
            businessId: req.params.id,
            businessName: business.businessName,
            deletedBy: req.user._id
        });

        const result = await Business.deleteOne({ _id: req.params.id });

        if (result.deletedCount) {
            logger.info('Business deleted successfully', {
                businessId: req.params.id,
                deletedBy: req.user._id
            });
            res.status(204).send();
        } else {
            res.errorStatusCode = 404;
            throw new Error("Business not found or already deleted");
        }
    },

    /**
     * Partner Registration
     * Creates new owner and business (pending approval)
     */
    partnerRegistration: async (req, res) => {
        const { owner, business } = req.body;

        // Validate input
        const { normalizedEmail, normalizedUsername } = businessValidationService.validatePartnerRegistration(owner, business);

        // Check duplicates
        await businessValidationService.checkDuplicateUser(owner.email, owner.username);
        await businessValidationService.checkDuplicateBusinessName(business.businessName);

        try {
            // Create owner user (isActive: false - pending admin approval)
            const ownerUser = await User.create({
                username: normalizedUsername,
                email: normalizedEmail,
                password: passwordEncrypt(owner.password),
                firstName: owner.firstName.trim(),
                lastName: owner.lastName.trim(),
                role: 'owner',
                isActive: false,
            });

            logger.info('Owner user created for partner registration', { 
                userId: ownerUser._id, 
                username: ownerUser.username,
                email: ownerUser.email 
            });

            // Create business (approvalStatus: 'pending')
            const businessData = {
                owner: ownerUser._id,
                businessName: business.businessName.trim(),
                businessType: business.businessType,
                address: {
                    street: business.address.street.trim(),
                    city: business.address.city.trim(),
                    postalCode: business.address.postalCode.trim(),
                    country: business.address.country.trim() || 'Deutschland',
                },
                location: {
                    type: 'Point',
                    coordinates: business.location.coordinates,
                },
                approvalStatus: 'pending',
                openingHours: business.openingHours?.trim() || undefined,
                phone: business.phone?.trim() || undefined,
                ustIdNr: business.ustIdNr?.trim() || undefined,
            };

            const newBusiness = await Business.create(businessData);

            logger.info('Business created for partner registration', { 
                businessId: newBusiness._id, 
                businessName: newBusiness.businessName,
                ownerId: ownerUser._id 
            });

            // Send notification to admins (non-blocking)
            await businessEmailService.sendPartnerRegistrationNotification(
                ownerUser, 
                newBusiness, 
                { firstName: owner.firstName, lastName: owner.lastName }
            );

            res.status(201).send({
                error: false,
                message: "Partner registration submitted successfully. Your application is pending admin approval.",
                result: {
                    owner: {
                        _id: ownerUser._id,
                        username: ownerUser.username,
                        email: ownerUser.email,
                    },
                    business: {
                        _id: newBusiness._id,
                        businessName: newBusiness.businessName,
                        approvalStatus: newBusiness.approvalStatus,
                    },
                },
            });
        } catch (error) {
            logger.error('Partner registration failed', error, {
                email: normalizedEmail,
                username: normalizedUsername,
                ip: req.ip
            });
            throw error;
        }
    },

    /**
     * Approve/Reject Business (Admin only)
     */
    approveBusiness: async (req, res) => {
        const { id } = req.params;
        const { action } = req.body;

        if (!action || !['approve', 'reject'].includes(action)) {
            throw new ValidationError("Action must be 'approve' or 'reject'");
        }

        const business = await Business.findById(id).populate('owner', 'email firstName lastName isActive');
        if (!business) {
            res.errorStatusCode = 404;
            throw new Error("Business not found.");
        }

        if (business.approvalStatus !== 'pending') {
            throw new ValidationError(`Business is already ${business.approvalStatus}.`);
        }

        // Update business approval status
        business.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
        await business.save();

        // Update owner isActive status
        if (business.owner) {
            business.owner.isActive = action === 'approve';
            await business.owner.save();
        }

        logger.info('Business approval status updated', {
            businessId: business._id,
            businessName: business.businessName,
            action,
            adminId: req.user._id
        });

        // Send email to owner (non-blocking)
        await businessEmailService.sendBusinessApprovalEmail(business, action);

        res.status(200).send({
            error: false,
            message: `Business ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
            result: {
                _id: business._id,
                businessName: business.businessName,
                approvalStatus: business.approvalStatus,
                owner: {
                    _id: business.owner._id,
                    isActive: business.owner.isActive,
                },
            },
        });
    },
};
