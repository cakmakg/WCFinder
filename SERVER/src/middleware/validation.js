"use strict";
/**
 * Input Validation Middleware
 * 
 * Bu middleware tüm user input'larını validate eder ve sanitize eder.
 * XSS ve NoSQL injection saldırılarına karşı koruma sağlar.
 * 
 * Clean Code Principles:
 * - DRY: Validation logic tek bir yerde toplanmış
 * - KISS: Basit ve anlaşılır validation kuralları
 * - Security: XSS ve injection koruması
 */

// Built-in validation functions (no external dependencies)

/**
 * NoSQL Injection koruması için sanitization
 * MongoDB query injection saldırılarına karşı koruma
 * 
 * Security: Prevents NoSQL injection attacks by sanitizing MongoDB operators
 * Performance: Recursive sanitization handles nested objects efficiently
 * 
 * @param {object} obj - Object to sanitize
 * @param {number} depth - Current recursion depth (prevents infinite recursion)
 * @returns {object} - Sanitized object
 */
const sanitizeInput = (obj, depth = 0) => {
    // Prevent infinite recursion (max depth: 10)
    if (depth > 10) {
        throw new Error('Maximum sanitization depth exceeded - possible circular reference');
    }
    
    if (!obj || typeof obj !== 'object') return obj;
    
    // Preserve Date objects
    if (obj instanceof Date) return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map(item => 
            typeof item === 'string' 
                ? escapeHtml(item.trim()) 
                : sanitizeInput(item, depth + 1)
        );
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        // SECURITY: Block MongoDB operators to prevent NoSQL injection
        if (key.startsWith('$')) {
            continue; // MongoDB operatörlerini atla
        }
        
        if (typeof value === 'string') {
            // XSS koruması: HTML karakterlerini escape et
            // Trim to prevent padding attacks
            const trimmed = value.trim();
            // Limit string length to prevent DoS attacks
            sanitized[key] = escapeHtml(trimmed.length > 10000 ? trimmed.substring(0, 10000) : trimmed);
        } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
            // SECURITY: Check for nested MongoDB operators
            if (Array.isArray(value)) {
                sanitized[key] = value.map(item => 
                    typeof item === 'string' 
                        ? escapeHtml(item.trim()) 
                        : sanitizeInput(item, depth + 1)
                );
            } else {
                // Recursive sanitization for nested objects
                sanitized[key] = sanitizeInput(value, depth + 1);
            }
        } else {
            // Preserve numbers, booleans, null, etc.
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * HTML escape function (XSS koruması)
 * 
 * Security: Prevents XSS attacks by escaping HTML special characters
 * Performance: Single pass replacement using regex
 * 
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML rendering
 */
const escapeHtml = (text) => {
    if (typeof text !== 'string') return text;
    
    // Comprehensive XSS protection - escape all potentially dangerous characters
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
        '/': '&#x2F;', // Prevent XSS via closing tags
        '`': '&#x60;', // Backtick can be used in XSS
        '=': '&#x3D;'  // Equals sign in attributes
    };
    
    // Replace all dangerous characters in a single pass
    return text.replace(/[&<>"'`=\/]/g, m => map[m] || m);
};

/**
 * Email validation (RFC 5322 simplified)
 */
const validateEmail = (email) => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
};

/**
 * Password validation
 * Minimum 8 karakter, en az bir büyük harf, bir küçük harf, bir rakam
 */
const validatePassword = (password) => {
    if (!password || typeof password !== 'string') return false;
    if (password.length < 8) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * ObjectId validation (MongoDB - 24 hex characters)
 */
const validateObjectId = (id) => {
    if (!id) return false;
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    return objectIdRegex.test(String(id));
};

/**
 * URL validation
 */
const validateURL = (url) => {
    if (!url || typeof url !== 'string') return false;
    try {
        const urlObj = new URL(url);
        return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
        return false;
    }
};

/**
 * Generic validation middleware
 * Request body, query ve params'ı sanitize eder
 * 
 * Security Features:
 * - XSS Protection: Escapes HTML special characters
 * - NoSQL Injection Protection: Removes MongoDB operators
 * - Input Length Limits: Prevents DoS attacks via large payloads
 * - Recursion Protection: Limits nested object depth
 * 
 * Performance:
 * - Single pass sanitization
 * - Efficient string operations
 * - Early return on invalid input
 */
const validateAndSanitize = (req, res, next) => {
    try {
        // SECURITY: Limit request body size to prevent DoS attacks
        if (req.body && typeof req.body === 'object') {
            const bodyString = JSON.stringify(req.body);
            const MAX_BODY_SIZE = 100000; // 100KB limit
            if (bodyString.length > MAX_BODY_SIZE) {
                res.errorStatusCode = 413;
                throw new Error('Request body too large');
            }
            req.body = sanitizeInput(req.body);
        }
        
        // SECURITY: Query sanitization (NoSQL injection koruması)
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeInput(req.query);
        }
        
        // SECURITY: Params sanitization (XSS and injection protection)
        if (req.params && typeof req.params === 'object') {
            for (const [key, value] of Object.entries(req.params)) {
                if (typeof value === 'string') {
                    // SECURITY: Validate ObjectId format if it looks like an ID
                    if (key.toLowerCase().includes('id') && value.length === 24) {
                        if (!validateObjectId(value)) {
                            res.errorStatusCode = 400;
                            throw new Error(`Invalid ${key} format`);
                        }
                    }
                    req.params[key] = escapeHtml(value.trim());
                }
            }
        }
        
        next();
    } catch (error) {
        res.errorStatusCode = res.errorStatusCode || 400;
        throw new Error('Input validation failed: ' + error.message);
    }
};

/**
 * Request body validation schema validator
 * Kullanım: validateSchema({ email: validateEmail, password: validatePassword })
 */
const validateSchema = (schema) => {
    return (req, res, next) => {
        try {
            const errors = [];
            
            for (const [field, validatorFn] of Object.entries(schema)) {
                const value = req.body[field];
                
                if (validatorFn.required && (value === undefined || value === null || value === '')) {
                    errors.push(`${field} is required`);
                    continue;
                }
                
                if (value !== undefined && value !== null && value !== '' && !validatorFn(value)) {
                    errors.push(`${field} is invalid`);
                }
            }
            
            if (errors.length > 0) {
                res.errorStatusCode = 400;
                throw new Error('Validation failed: ' + errors.join(', '));
            }
            
            next();
        } catch (error) {
            throw error;
        }
    };
};

/**
 * Common validation schemas (DRY principle)
 */
const commonSchemas = {
    login: {
        username: { validate: (val) => !val || typeof val === 'string', required: false },
        email: { validate: validateEmail, required: false },
        password: { validate: (val) => val && typeof val === 'string' && val.length > 0, required: true }
    },
    
    register: {
        username: { 
            validate: (val) => val && typeof val === 'string' && val.length >= 3 && val.length <= 30 && /^[a-zA-Z0-9_]+$/.test(val),
            required: true 
        },
        email: { validate: validateEmail, required: true },
        password: { validate: validatePassword, required: true }
    },
    
    objectId: {
        id: { validate: validateObjectId, required: true }
    }
};

module.exports = {
    validateAndSanitize,
    validateSchema,
    validateEmail,
    validatePassword,
    validateObjectId,
    validateURL,
    sanitizeInput,
    escapeHtml,
    commonSchemas
};

