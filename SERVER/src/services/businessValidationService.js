"use strict";
/**
 * Business Validation Service
 * 
 * Business ile ilgili validation logic'i.
 * 
 * Clean Code Principles:
 * - DRY: Validation logic tek yerde
 * - Single Responsibility: Sadece validation
 */

const Business = require("../models/business");
const User = require("../models/user");
const { validateEmail, validatePassword } = require("../middleware/validation");
const { ValidationError } = require("../middleware/errorHnadler");
const {
    normalizeEmail,
    normalizeUsername,
    createUserLookupQuery
} = require("../utils/authHelpers");

/**
 * Partner registration için owner ve business validation
 * 
 * @param {Object} owner - Owner data
 * @param {Object} business - Business data
 * @throws {ValidationError} Validation hatası
 */
function validatePartnerRegistration(owner, business) {
    // Input validation
    if (!owner || !business) {
        throw new ValidationError("Owner and business information are required");
    }

    // Owner validation
    if (!owner.username || !owner.email || !owner.password || !owner.firstName || !owner.lastName) {
        throw new ValidationError("All owner fields are required: username, email, password, firstName, lastName");
    }

    // Business validation
    if (!business.businessName || !business.businessType || !business.address || !business.location) {
        throw new ValidationError("All business fields are required: businessName, businessType, address, location");
    }

    // Normalize ve validate owner input
    const normalizedEmail = normalizeEmail(owner.email);
    const normalizedUsername = normalizeUsername(owner.username);

    if (!validateEmail(normalizedEmail)) {
        throw new ValidationError("Invalid email format");
    }

    if (!validatePassword(owner.password)) {
        throw new ValidationError("Password must be at least 8 characters with uppercase, lowercase and number");
    }

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
        throw new ValidationError("Username must be 3-30 characters, alphanumeric and underscore only");
    }

    return { normalizedEmail, normalizedUsername };
}

/**
 * Duplicate user kontrolü
 * 
 * @param {String} email - Email
 * @param {String} username - Username
 * @throws {Error} Duplicate user hatası
 */
async function checkDuplicateUser(email, username) {
    const duplicateQuery = createUserLookupQuery(email, username);
    const isUserExist = await User.findOne(duplicateQuery);

    if (isUserExist) {
        const error = new Error("Already used username or email.");
        error.statusCode = 409;
        throw error;
    }
}

/**
 * Duplicate business name kontrolü
 * 
 * @param {String} businessName - Business name
 * @throws {Error} Duplicate business hatası
 */
async function checkDuplicateBusinessName(businessName) {
    const existingBusiness = await Business.findOne({ businessName: businessName.trim() });
    if (existingBusiness) {
        const error = new Error("Business name already exists.");
        error.statusCode = 409;
        throw error;
    }
}

/**
 * Business ID validation
 * 
 * @param {String} id - Business ID
 * @param {Object} res - Express response
 * @throws {Error} Invalid ID hatası
 */
function validateBusinessId(id, res) {
    const { validateObjectId } = require('../middleware/validation');
    
    if (!validateObjectId(id)) {
        res.errorStatusCode = 400;
        throw new Error('Invalid business ID format');
    }
}

module.exports = {
    validatePartnerRegistration,
    checkDuplicateUser,
    checkDuplicateBusinessName,
    validateBusinessId
};

