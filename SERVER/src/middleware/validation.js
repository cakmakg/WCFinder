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
 */
const sanitizeInput = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        // MongoDB operatörlerini temizle ($gt, $ne, $regex, vb.)
        if (key.startsWith('$')) {
            continue; // MongoDB operatörlerini atla
        }
        
        if (typeof value === 'string') {
            // XSS koruması: HTML karakterlerini escape et
            sanitized[key] = escapeHtml(value.trim());
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date)) {
            // Nested object'leri recursive olarak sanitize et
            sanitized[key] = sanitizeInput(value);
        } else if (Array.isArray(value)) {
            // Array elemanlarını sanitize et
            sanitized[key] = value.map(item => 
                typeof item === 'string' ? escapeHtml(item.trim()) : item
            );
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

/**
 * HTML escape function (XSS koruması)
 */
const escapeHtml = (text) => {
    if (typeof text !== 'string') return text;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
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
 */
const validateAndSanitize = (req, res, next) => {
    try {
        // Body sanitization
        if (req.body && typeof req.body === 'object') {
            req.body = sanitizeInput(req.body);
        }
        
        // Query sanitization (NoSQL injection koruması)
        if (req.query && typeof req.query === 'object') {
            req.query = sanitizeInput(req.query);
        }
        
        // Params sanitization
        if (req.params && typeof req.params === 'object') {
            for (const [key, value] of Object.entries(req.params)) {
                if (typeof value === 'string') {
                    req.params[key] = escapeHtml(value.trim());
                }
            }
        }
        
        next();
    } catch (error) {
        res.errorStatusCode = 400;
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

