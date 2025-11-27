"use strict";
/**
 * Request Logger Middleware
 * 
 * Tüm HTTP isteklerini loglar.
 * Response time tracking ile performance monitoring.
 * 
 * Clean Code Principles:
 * - Single Responsibility: Sadece request logging
 * - DRY: Logging logic tek bir yerde
 */

const logger = require('../utils/logger');

/**
 * Request logger middleware
 * Her isteği loglar ve response time'ı ölçer
 */
module.exports = (req, res, next) => {
    const startTime = Date.now();
    
    // Response tamamlandığında logla
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logger.request(req, res, responseTime);
    });
    
    next();
};

