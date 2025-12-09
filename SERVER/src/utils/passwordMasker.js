"use strict";
/**
 * Password Masking Utility
 * 
 * Masks sensitive fields (passwords, tokens, etc.) in objects before logging.
 * Prevents sensitive data from appearing in logs.
 * 
 * Security:
 * - Masks password fields
 * - Masks token fields
 * - Masks API keys and secrets
 * - Recursively processes nested objects
 * 
 * Clean Code Principles:
 * - Single Responsibility: Only masks sensitive data
 * - DRY: Reusable masking logic
 */

/**
 * List of sensitive field names to mask
 */
const SENSITIVE_FIELDS = [
    'password',
    'passwd',
    'pwd',
    'secret',
    'token',
    'accessToken',
    'refreshToken',
    'apiKey',
    'apikey',
    'secretKey',
    'privateKey',
    'authorization',
    'auth',
    'credentials',
    'creditCard',
    'cardNumber',
    'cvv',
    'cvc',
    'ssn',
    'socialSecurityNumber'
];

/**
 * Masks a sensitive value
 * @param {string} value - Value to mask
 * @returns {string} - Masked value
 */
const maskValue = (value) => {
    if (!value || typeof value !== 'string') {
        return '***REDACTED***';
    }
    
    // Show first and last character for debugging (optional)
    // Or completely mask it
    if (value.length <= 2) {
        return '***';
    }
    
    // Completely mask sensitive values
    return '***REDACTED***';
};

/**
 * Checks if a field name is sensitive
 * @param {string} fieldName - Field name to check
 * @returns {boolean} - True if sensitive
 */
const isSensitiveField = (fieldName) => {
    if (!fieldName || typeof fieldName !== 'string') {
        return false;
    }
    
    const lowerFieldName = fieldName.toLowerCase();
    return SENSITIVE_FIELDS.some(sensitive => 
        lowerFieldName.includes(sensitive.toLowerCase())
    );
};

/**
 * Masks sensitive fields in an object
 * @param {object} obj - Object to mask
 * @param {number} depth - Current recursion depth (prevents infinite loops)
 * @returns {object} - Masked object
 */
const maskSensitiveFields = (obj, depth = 0) => {
    // Prevent infinite recursion
    if (depth > 10) {
        return '[MAX_DEPTH_REACHED]';
    }
    
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    // Handle primitives
    if (typeof obj !== 'object') {
        return obj;
    }
    
    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => maskSensitiveFields(item, depth + 1));
    }
    
    // Handle Date objects
    if (obj instanceof Date) {
        return obj;
    }
    
    // Handle objects
    const masked = {};
    for (const [key, value] of Object.entries(obj)) {
        if (isSensitiveField(key)) {
            // Mask sensitive field
            masked[key] = maskValue(value);
        } else if (typeof value === 'object' && value !== null) {
            // Recursively mask nested objects
            masked[key] = maskSensitiveFields(value, depth + 1);
        } else {
            // Keep non-sensitive fields as-is
            masked[key] = value;
        }
    }
    
    return masked;
};

/**
 * Creates a safe copy of request body for logging
 * @param {object} body - Request body
 * @returns {object} - Safe copy with masked sensitive fields
 */
const safeRequestBody = (body) => {
    if (!body || typeof body !== 'object') {
        return body;
    }
    
    return maskSensitiveFields(body);
};

/**
 * Creates a safe copy of request config for logging
 * @param {object} config - Request config (axios config)
 * @returns {object} - Safe copy with masked sensitive fields
 */
const safeRequestConfig = (config) => {
    if (!config || typeof config !== 'object') {
        return config;
    }
    
    const safe = { ...config };
    
    // Mask data/body
    if (safe.data) {
        safe.data = safeRequestBody(safe.data);
    }
    
    // Mask headers (especially Authorization)
    if (safe.headers) {
        const safeHeaders = { ...safe.headers };
        if (safeHeaders.Authorization) {
            safeHeaders.Authorization = 'Bearer ***REDACTED***';
        }
        if (safeHeaders.authorization) {
            safeHeaders.authorization = 'Bearer ***REDACTED***';
        }
        safe.headers = safeHeaders;
    }
    
    return safe;
};

module.exports = {
    maskSensitiveFields,
    safeRequestBody,
    safeRequestConfig,
    isSensitiveField,
    maskValue,
    SENSITIVE_FIELDS
};

