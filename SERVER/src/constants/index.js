"use strict";
/**
 * Application Constants
 * 
 * Centralized configuration for business logic constants.
 * All magic numbers and repeated values should be defined here.
 * 
 * Clean Code Principles:
 * - DRY: Constants defined once, used everywhere
 * - KISS: Simple constant definitions
 * - Maintainability: Easy to update values
 * 
 * @module constants
 */

/**
 * Fee Configuration
 * These values can be overridden by environment variables
 */
const FEE_CONFIG = {
    /**
     * Service fee (platform commission) in EUR
     * Default: 0.75 EUR
     * Can be overridden by SERVICE_FEE environment variable
     */
    SERVICE_FEE: parseFloat(process.env.SERVICE_FEE) || 0.75,
    
    /**
     * Default toilet fee in EUR
     * Default: 1.00 EUR
     * Can be overridden by DEFAULT_TOILET_FEE environment variable
     */
    DEFAULT_TOILET_FEE: parseFloat(process.env.DEFAULT_TOILET_FEE) || 1.00,
};

/**
 * Validation Rules
 */
const VALIDATION_RULES = {
    /**
     * Password requirements
     */
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: true,
        REQUIRE_LOWERCASE: true,
        REQUIRE_NUMBER: true,
        REQUIRE_SPECIAL: false, // Can be enabled if needed
    },
    
    /**
     * Username requirements
     */
    USERNAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 30,
        PATTERN: /^[a-zA-Z0-9_]+$/, // Alphanumeric and underscore only
    },
    
    /**
     * Email requirements
     */
    EMAIL: {
        MAX_LENGTH: 254, // RFC 5321
    },
    
    /**
     * Person count limits for bookings
     */
    BOOKING: {
        MIN_PERSON_COUNT: 1,
        MAX_PERSON_COUNT: 10,
    },
    
    /**
     * Business name requirements
     */
    BUSINESS_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },
    
    /**
     * Toilet name requirements
     */
    TOILET_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },
};

/**
 * Status Values
 * Enum-like constants for status fields
 */
const STATUS = {
    /**
     * Business approval status
     */
    BUSINESS_APPROVAL: {
        PENDING: 'pending',
        APPROVED: 'approved',
        REJECTED: 'rejected',
    },
    
    /**
     * Toilet status
     */
    TOILET: {
        AVAILABLE: 'available',
        IN_USE: 'in_use',
        OUT_OF_ORDER: 'out_of_order',
    },
    
    /**
     * Usage/Booking status
     */
    USAGE: {
        PENDING: 'pending',
        CONFIRMED: 'confirmed',
        ACTIVE: 'active',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled',
        EXPIRED: 'expired',
    },
    
    /**
     * Payment status
     */
    PAYMENT: {
        PENDING: 'pending',
        PAID: 'paid',
        FAILED: 'failed',
        REFUNDED: 'refunded',
    },
};

/**
 * User Roles
 */
const ROLES = {
    USER: 'user',
    OWNER: 'owner',
    ADMIN: 'admin',
};

/**
 * Gender Preferences
 */
const GENDER_PREFERENCES = {
    MALE: 'male',
    FEMALE: 'female',
    UNISEX: 'unisex',
};

/**
 * Business Types
 */
const BUSINESS_TYPES = [
    'Cafe',
    'Restaurant',
    'Hotel',
    'Shop',
    'Gas Station',
    'Other',
];

/**
 * Access Code Configuration
 */
const ACCESS_CODE = {
    /**
     * Length of access code
     */
    LENGTH: 6,
    
    /**
     * Access code expiry time in hours
     */
    EXPIRY_HOURS: 24,
    
    /**
     * Characters used in access code generation
     */
    CHARACTERS: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excludes confusing characters
};

/**
 * Pagination Defaults
 */
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 1000,
};

/**
 * Date/Time Configuration
 */
const TIME_CONFIG = {
    /**
     * Statistics period in days
     */
    STATS_PERIOD_DAYS: 30,
    
    /**
     * Token expiry times
     */
    TOKEN_EXPIRY: {
        ACCESS_TOKEN: '1h',
        REFRESH_TOKEN: '7d',
    },
};

module.exports = {
    FEE_CONFIG,
    VALIDATION_RULES,
    STATUS,
    ROLES,
    GENDER_PREFERENCES,
    BUSINESS_TYPES,
    ACCESS_CODE,
    PAGINATION,
    TIME_CONFIG,
};

