"use strict";
/**
 * Validation Service
 * 
 * Centralized validation logic for business operations.
 * Provides reusable validation functions following DRY principle.
 * 
 * Clean Code Principles:
 * - DRY: Validation logic centralized
 * - KISS: Simple, clear validation rules
 * - Single Responsibility: Only validation logic
 * 
 * @module validationService
 */

const { validateEmail, validatePassword, validateObjectId } = require('../middleware/validation');
const { VALIDATION_RULES, STATUS, ROLES, BUSINESS_TYPES } = require('../constants');
const logger = require('../utils/logger');

/**
 * Validate owner data
 * @param {Object} ownerData - Owner data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateOwner = (ownerData) => {
    const errors = [];
    
    if (!ownerData.username || typeof ownerData.username !== 'string') {
        errors.push('Username is required');
    } else {
        const { MIN_LENGTH, MAX_LENGTH, PATTERN } = VALIDATION_RULES.USERNAME;
        if (ownerData.username.length < MIN_LENGTH || ownerData.username.length > MAX_LENGTH) {
            errors.push(`Username must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`);
        }
        if (!PATTERN.test(ownerData.username)) {
            errors.push('Username can only contain letters, numbers, and underscores');
        }
    }
    
    if (!ownerData.email || !validateEmail(ownerData.email)) {
        errors.push('Valid email is required');
    }
    
    if (!ownerData.password || !validatePassword(ownerData.password)) {
        errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }
    
    if (ownerData.role && ownerData.role !== ROLES.OWNER) {
        errors.push('Role must be "owner"');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate business data
 * @param {Object} businessData - Business data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateBusiness = (businessData) => {
    const errors = [];
    
    // Business name validation
    if (!businessData.businessName || typeof businessData.businessName !== 'string') {
        errors.push('Business name is required');
    } else {
        const { MIN_LENGTH, MAX_LENGTH } = VALIDATION_RULES.BUSINESS_NAME;
        if (businessData.businessName.length < MIN_LENGTH || businessData.businessName.length > MAX_LENGTH) {
            errors.push(`Business name must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`);
        }
    }
    
    // Business type validation
    if (!businessData.businessType || !BUSINESS_TYPES.includes(businessData.businessType)) {
        errors.push(`Business type must be one of: ${BUSINESS_TYPES.join(', ')}`);
    }
    
    // Address validation
    if (!businessData.address || typeof businessData.address !== 'object') {
        errors.push('Address is required');
    } else {
        const { street, city, postalCode, country } = businessData.address;
        if (!street || typeof street !== 'string' || street.trim().length === 0) {
            errors.push('Street address is required');
        }
        if (!city || typeof city !== 'string' || city.trim().length === 0) {
            errors.push('City is required');
        }
        if (!postalCode || typeof postalCode !== 'string' || postalCode.trim().length === 0) {
            errors.push('Postal code is required');
        }
        if (!country || typeof country !== 'string' || country.trim().length === 0) {
            errors.push('Country is required');
        }
    }
    
    // Location validation
    if (!businessData.location || !businessData.location.coordinates) {
        errors.push('Location coordinates are required');
    } else {
        const [lng, lat] = businessData.location.coordinates;
        if (!Array.isArray(businessData.location.coordinates) || 
            businessData.location.coordinates.length !== 2 ||
            typeof lng !== 'number' || typeof lat !== 'number' ||
            isNaN(lng) || isNaN(lat) ||
            lng === 0 && lat === 0) {
            errors.push('Valid location coordinates are required (longitude, latitude)');
        }
    }
    
    // Approval status validation
    if (businessData.approvalStatus && 
        !Object.values(STATUS.BUSINESS_APPROVAL).includes(businessData.approvalStatus)) {
        errors.push(`Approval status must be one of: ${Object.values(STATUS.BUSINESS_APPROVAL).join(', ')}`);
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate toilet data
 * @param {Object} toiletData - Toilet data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateToilet = (toiletData) => {
    const errors = [];
    
    // Toilet name validation
    if (!toiletData.name || typeof toiletData.name !== 'string') {
        errors.push('Toilet name is required');
    } else {
        const { MIN_LENGTH, MAX_LENGTH } = VALIDATION_RULES.TOILET_NAME;
        if (toiletData.name.length < MIN_LENGTH || toiletData.name.length > MAX_LENGTH) {
            errors.push(`Toilet name must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`);
        }
    }
    
    // Fee validation
    if (toiletData.fee !== undefined) {
        const fee = Number(toiletData.fee);
        if (isNaN(fee) || fee < 0) {
            errors.push('Fee must be a non-negative number');
        }
    }
    
    // Status validation
    if (toiletData.status && 
        !Object.values(STATUS.TOILET).includes(toiletData.status)) {
        errors.push(`Status must be one of: ${Object.values(STATUS.TOILET).join(', ')}`);
    }
    
    // Business ID validation (if provided)
    if (toiletData.business && !validateObjectId(toiletData.business)) {
        errors.push('Invalid business ID format');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate complete business management form data
 * @param {Object} data - { ownerData, businessData, toiletData }
 * @returns {Object} { isValid: boolean, errors: string[] }
 */
const validateBusinessManagement = (data) => {
    const errors = [];
    
    // Validate owner
    const ownerValidation = validateOwner(data.ownerData || {});
    if (!ownerValidation.isValid) {
        errors.push(...ownerValidation.errors.map(e => `Owner: ${e}`));
    }
    
    // Validate business
    const businessValidation = validateBusiness(data.businessData || {});
    if (!businessValidation.isValid) {
        errors.push(...businessValidation.errors.map(e => `Business: ${e}`));
    }
    
    // Validate toilet
    const toiletValidation = validateToilet(data.toiletData || {});
    if (!toiletValidation.isValid) {
        errors.push(...toiletValidation.errors.map(e => `Toilet: ${e}`));
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = {
    validateOwner,
    validateBusiness,
    validateToilet,
    validateBusinessManagement,
};

