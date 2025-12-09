"use strict";
/**
 * User Controller
 * 
 * Handles all user-related operations including:
 * - User registration
 * - User profile management
 * - User listing (admin only)
 * - User deletion
 * 
 * Security:
 * - Input validation for all user data
 * - Password hashing before storage
 * - Role-based access control
 * - Prevents unauthorized role/privilege escalation
 * 
 * Clean Code Principles:
 * - DRY: Validation logic centralized
 * - Single Responsibility: Only handles HTTP requests/responses
 * - Security: Comprehensive input validation and sanitization
 * 
 * @author WCFinder Team
 * @version 2.0.0
 */

const User = require("../models/user");
const passwordEncrypt = require("../helper/passwordEncrypt");
const { validateEmail, validatePassword, validateObjectId } = require("../middleware/validation");
const { ValidationError, AuthorizationError } = require("../middleware/errorHnadler");
const logger = require("../utils/logger");

module.exports = {
    /**
     * GET: List all users (Admin only)
     * 
     * Security:
     * - Admin-only endpoint (enforced by route middleware)
     * - Pagination to prevent DoS
     * - Excludes sensitive data (passwords)
     * 
     * Performance:
     * - Efficient pagination using getModelList
     */
    list: async (req, res) => {
        // SECURITY: Route is protected by isAdmin middleware, but double-check
        if (req.user?.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new AuthorizationError("Only admins can list all users");
        }

        // Performance: Use pagination to prevent large data dumps
        const filter = req.query.filter || {};
        
        const data = await res.getModelList(User, filter);
        
        res.status(200).send({
            error: false,
            details: await res.getModelListDetails(User, filter),
            result: data,
        });
    },

    /**
     * POST: Create a new user (Registration)
     * 
     * Security:
     * - Validates all input parameters
     * - Validates email format
     * - Validates password strength
     * - Hashes password before storage
     * - Prevents role escalation (default role: 'user')
     * - Prevents duplicate email/username
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    create: async (req, res) => {
        const { firstName, lastName, username, email, password, role } = req.body;
        
        // SECURITY: Validate required fields
        if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
            res.errorStatusCode = 400;
            throw new ValidationError("First name is required and must be at least 2 characters");
        }
        
        if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
            res.errorStatusCode = 400;
            throw new ValidationError("Last name is required and must be at least 2 characters");
        }

        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            res.errorStatusCode = 400;
            throw new ValidationError("Username is required and must be at least 3 characters");
        }

        // SECURITY: Validate email format
        if (!email || !validateEmail(email)) {
            res.errorStatusCode = 400;
            throw new ValidationError("Valid email address is required");
        }

        // SECURITY: Validate password strength
        if (!password || !validatePassword(password)) {
            res.errorStatusCode = 400;
            throw new ValidationError("Password must be at least 8 characters with uppercase, lowercase, and number");
        }

        // SECURITY: Check for duplicate email
        const existingUserByEmail = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUserByEmail) {
            res.errorStatusCode = 409;
            throw new ValidationError("Email already registered");
        }

        // SECURITY: Check for duplicate username
        const existingUserByUsername = await User.findOne({ username: username.trim() });
        if (existingUserByUsername) {
            res.errorStatusCode = 409;
            throw new ValidationError("Username already taken");
        }

        // SECURITY: Prevent role escalation - new users are always 'user' role
        // Only admins can create users with other roles (via admin endpoints)
        const userData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: passwordEncrypt(password), // SECURITY: Hash password before storage
            role: role && req.user?.role === 'admin' ? role : 'user' // Default to 'user', allow admin override
        };

        logger.debug('Creating new user', {
            username: userData.username,
            email: userData.email,
            role: userData.role
        });

        try {
            const data = await User.create(userData);
            
            // SECURITY: Don't expose password hash in response
            const userResponse = data.toObject();
            delete userResponse.password;

            logger.info('User created successfully', {
                userId: data._id,
                username: data.username,
                email: data.email
            });

            res.status(201).send({
                error: false,
                result: userResponse,
            });
        } catch (error) {
            logger.error('User creation failed', error, {
                username: userData.username,
                email: userData.email
            });
            throw error;
        }
    },

    /**
     * GET: Get user by ID
     * 
     * Security:
     * - Validates ObjectId format
     * - Route protected by isSelfOrAdmin middleware
     * - Excludes password from response
     */
    read: async (req, res) => {
        // SECURITY: Validate ObjectId format
        if (!validateObjectId(req.params.id)) {
            res.errorStatusCode = 400;
            throw new ValidationError("Invalid user ID format");
        }

        // SECURITY: Route is protected by isSelfOrAdmin middleware
        // Double-check authorization
        if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new AuthorizationError("You can only view your own profile");
        }

        const data = await User.findOne({ _id: req.params.id }).select('-password');
        
        if (!data) {
            res.errorStatusCode = 404;
            throw new Error("User not found.");
        }

        res.status(200).send({
            error: false,
            result: data,
        });
    },

    /**
     * PUT/PATCH: Update user profile
     * 
     * Security:
     * - Validates ObjectId format
     * - Prevents role escalation (users can't promote themselves to admin)
     * - Validates email if provided
     * - Validates password strength if provided
     * - Hashes password before storage
     * - Prevents unauthorized field updates
     * 
     * @param {object} req - Express request
     * @param {object} res - Express response
     */
    update: async (req, res) => {
        // SECURITY: Validate ObjectId format
        if (!validateObjectId(req.params.id)) {
            res.errorStatusCode = 400;
            throw new ValidationError("Invalid user ID format");
        }

        // SECURITY: Only user can update their own profile, or admin can update anyone
        if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
            res.errorStatusCode = 403;
            throw new AuthorizationError("You can only update your own profile");
        }

        // SECURITY: Prevent role escalation - users cannot change their own role
        const updateData = { ...req.body };
        
        if (!req.user.isAdmin) {
            // Non-admin users cannot modify sensitive fields
            delete updateData.role;
            delete updateData.isActive;
        }

        // SECURITY: Validate email if provided
        if (updateData.email && !validateEmail(updateData.email)) {
            res.errorStatusCode = 400;
            throw new ValidationError("Invalid email format");
        }

        // SECURITY: Check for duplicate email if email is being updated
        if (updateData.email) {
            const existingUser = await User.findOne({ 
                email: updateData.email.toLowerCase().trim(),
                _id: { $ne: req.params.id } // Exclude current user
            });
            if (existingUser) {
                res.errorStatusCode = 409;
                throw new ValidationError("Email already registered");
            }
            updateData.email = updateData.email.toLowerCase().trim();
        }

        // SECURITY: Validate and hash password if provided
        if (updateData.password) {
            if (!validatePassword(updateData.password)) {
                res.errorStatusCode = 400;
                throw new ValidationError("Password must be at least 8 characters with uppercase, lowercase, and number");
            }
            updateData.password = passwordEncrypt(updateData.password);
        }

        // SECURITY: Sanitize string fields
        if (updateData.firstName) updateData.firstName = updateData.firstName.trim();
        if (updateData.lastName) updateData.lastName = updateData.lastName.trim();
        if (updateData.username) updateData.username = updateData.username.trim();

        logger.debug('Updating user', {
            userId: req.params.id,
            updatedBy: req.user._id
        });

        const result = await User.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true, runValidators: true }
        ).select('-password');

        if (!result) {
            res.errorStatusCode = 404;
            throw new Error("User not found.");
        }

        logger.info('User updated successfully', {
            userId: req.params.id,
            updatedBy: req.user._id
        });

        res.status(202).send({
            error: false,
            result,
        });
    },

    // ✅ YENİ: Kullanıcının kendi profilini silmesi için /users/me endpoint'i
    deleteMe: async (req, res) => {
        const logger = require("../utils/logger");
        
        try {
            // ✅ DEBUG: req.user'ı kontrol et
            if (!req.user || !req.user._id) {
                logger.error('User deletion failed - req.user or req.user._id is missing', {
                    hasUser: !!req.user,
                    userId: req.user?._id,
                    userType: typeof req.user,
                    path: req.path
                });
                return res.status(401).send({
                    error: true,
                    message: "Authentication required"
                });
            }
            
            // ✅ Güvenlik: req.user.id kullan (frontend'den ID göndermeye gerek yok)
            // JWT payload'ından gelen _id zaten string olabilir, toString() ile güvence altına al
            const userId = req.user._id.toString();
            
            logger.info('User deletion request (deleteMe)', {
                userId,
                userIdType: typeof req.user._id,
                username: req.user.username,
                email: req.user.email,
                role: req.user.role,
                fullUser: req.user
            });
            
            // ✅ Kullanıcıyı sil
            const data = await User.deleteOne({ _id: userId });
            
            if (!data.deletedCount) {
                logger.warn('User deletion failed - user not found', {
                    userId
                });
                return res.status(404).send({
                    error: true,
                    message: "User not found or already deleted"
                });
            }
            
            logger.info('User deleted successfully (deleteMe)', {
                userId,
                username: req.user.username
            });
            
            // 204 No Content - body gönderilmez
            res.status(204).send();
        } catch (error) {
            logger.error('User deletion error (deleteMe)', error, {
                userId: req.user?._id?.toString()
            });
            res.status(500).send({
                error: true,
                message: "An error occurred while deleting the user"
            });
        }
    },

    // ✅ ESKİ: Admin veya kendi profilini silmek için /users/:id endpoint'i (backward compatibility)
    deletee: async (req, res) => {
        const logger = require("../utils/logger");
        
        try {
            const userId = req.params.id;
            const loggedInUserId = req.user._id.toString();
            
            logger.info('User deletion request (deletee)', {
                userId,
                loggedInUserId,
                isAdmin: req.user.role === 'admin',
                isSelf: userId === loggedInUserId
            });
            
            // Rota zaten isSelfOrAdmin tarafından korunduğu için, güvenle silebiliriz.
            const data = await User.deleteOne({ _id: userId });
            
            if (!data.deletedCount) {
                logger.warn('User deletion failed - user not found', {
                    userId,
                    loggedInUserId
                });
                return res.status(404).send({
                    error: true,
                    message: "User not found or already deleted"
                });
            }
            
            logger.info('User deleted successfully (deletee)', {
                userId,
                deletedBy: loggedInUserId
            });
            
            // 204 No Content - body gönderilmez
            res.status(204).send();
        } catch (error) {
            logger.error('User deletion error (deletee)', error, {
                userId: req.params.id,
                loggedInUserId: req.user._id.toString()
            });
            res.status(500).send({
                error: true,
                message: "An error occurred while deleting the user"
            });
        }
    }
};