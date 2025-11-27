"use strict";
/**
 * Error Handler Middleware
 * 
 * Production-ready error handling.
 * Hassas bilgileri production'da gizler, development'ta detaylı bilgi verir.
 * Tüm hataları loglar.
 * 
 * Clean Code Principles:
 * - Single Responsibility: Sadece error handling
 * - Security: Production'da stack trace gizlenir
 * - DRY: Error handling logic tek bir yerde
 */

const logger = require('../utils/logger');

/**
 * Custom Error sınıfları (daha iyi error handling için)
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

/**
 * Error Handler Middleware
 * 
 * Production'da:
 * - Stack trace gösterilmez
 * - Hassas bilgiler (database connection strings, etc.) gizlenir
 * - Sadece user-friendly mesajlar döner
 * 
 * Development'ta:
 * - Detaylı error bilgileri gösterilir
 * - Stack trace gösterilir
 */
module.exports = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || res?.errorStatusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errorDetails = null;

    // Development'ta detaylı error logging
    if (process.env.NODE_ENV === 'development') {
        logger.debug('Error caught', {
            statusCode,
            message,
            name: err.name,
            path: req.path,
            method: req.method,
        });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation Error';
        errorDetails = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate entry';
        const field = Object.keys(err.keyPattern)[0];
        errorDetails = { field, message: `${field} already exists` };
    }

    // Mongoose cast error (invalid ObjectId, etc.)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    // Operational errors (bizim oluşturduğumuz hatalar)
    // Bu hatalar güvenli bir şekilde kullanıcıya gösterilebilir
    const isOperational = err.isOperational !== false;

    // Error logging
    // Kritik hatalar her zaman loglanır
    if (statusCode >= 500 || !isOperational) {
        logger.error('Server Error', err, {
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userId: req.user?._id,
            body: process.env.NODE_ENV === 'development' ? req.body : undefined
        });
    } else {
        // Client errors (4xx) warn olarak loglanır
        logger.warn('Client Error', {
            message: err.message,
            statusCode,
            url: req.originalUrl,
            method: req.method,
            ip: req.ip,
            userId: req.user?._id
        });
    }

    // Response oluştur
    const response = {
        error: true,
        message: isOperational ? message : 'An unexpected error occurred',
        ...(errorDetails && { details: errorDetails })
    };

    // Development'ta ekstra bilgiler
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
        response.cause = err.cause;
        if (req.body && Object.keys(req.body).length > 0) {
            response.body = req.body;
        }
    }

    // Production'da hassas bilgileri gizle
    if (process.env.NODE_ENV === 'production') {
        // Stack trace asla production'da gösterilmez
        // Database connection strings, API keys, vb. gizlenir
        if (statusCode >= 500) {
            response.message = 'Internal Server Error';
        }
    }

    // Status code'u set et
    res.status(statusCode);

    // Response gönder
    res.send(response);
};

// Custom error sınıflarını export et
module.exports.AppError = AppError;
module.exports.ValidationError = ValidationError;
module.exports.AuthenticationError = AuthenticationError;
module.exports.AuthorizationError = AuthorizationError;
module.exports.NotFoundError = NotFoundError;
