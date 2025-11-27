"use strict";
/**
 * Logger Utility
 * 
 * Production-ready logging sistemi.
 * Farklı log seviyeleri (error, warn, info, debug) ve structured logging.
 * 
 * Clean Code Principles:
 * - Single Responsibility: Sadece logging işlevi
 * - DRY: Logging logic tek bir yerde
 * - Production-ready: Environment'a göre log seviyesi
 */

/**
 * Log seviyeleri
 */
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

/**
 * Mevcut log seviyesi (environment variable'dan alınır)
 */
const getLogLevel = () => {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase();
    return LOG_LEVELS[envLevel] ?? (process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG);
};

const currentLogLevel = getLogLevel();

/**
 * Timestamp formatı
 */
const getTimestamp = () => {
    return new Date().toISOString();
};

/**
 * Structured log formatı
 */
const formatLog = (level, message, meta = {}) => {
    return {
        timestamp: getTimestamp(),
        level: level.toUpperCase(),
        message,
        ...meta,
        environment: process.env.NODE_ENV || 'development'
    };
};

/**
 * Console'a yazdır (production'da sadece error ve warn)
 */
const writeLog = (level, message, meta = {}) => {
    const logEntry = formatLog(level, message, meta);
    const logString = JSON.stringify(logEntry);
    
    // Production'da sadece error ve warn console'a yazılır
    if (process.env.NODE_ENV === 'production') {
        if (level === 'error' || level === 'warn') {
            console[level === 'error' ? 'error' : 'warn'](logString);
        }
    } else {
        // Development'ta tüm loglar
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](logString);
    }
};

/**
 * Logger object
 */
const logger = {
    /**
     * Error log - Kritik hatalar
     */
    error: (message, error = null, meta = {}) => {
        if (LOG_LEVELS.ERROR <= currentLogLevel) {
            const errorMeta = {
                ...meta,
                ...(error && {
                    error: {
                        name: error.name,
                        message: error.message,
                        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                    }
                })
            };
            writeLog('error', message, errorMeta);
        }
    },

    /**
     * Warn log - Uyarılar
     */
    warn: (message, meta = {}) => {
        if (LOG_LEVELS.WARN <= currentLogLevel) {
            writeLog('warn', message, meta);
        }
    },

    /**
     * Info log - Bilgilendirme
     */
    info: (message, meta = {}) => {
        if (LOG_LEVELS.INFO <= currentLogLevel) {
            writeLog('info', message, meta);
        }
    },

    /**
     * Debug log - Debug bilgileri (sadece development)
     */
    debug: (message, meta = {}) => {
        if (LOG_LEVELS.DEBUG <= currentLogLevel) {
            writeLog('debug', message, meta);
        }
    },

    /**
     * Request log - HTTP istekleri için
     */
    request: (req, res, responseTime = null) => {
        const meta = {
            method: req.method,
            url: req.originalUrl || req.url,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            userId: req.user?._id,
            statusCode: res.statusCode,
            ...(responseTime && { responseTime: `${responseTime}ms` })
        };
        
        if (res.statusCode >= 400) {
            logger.warn(`HTTP ${req.method} ${req.originalUrl}`, meta);
        } else {
            logger.info(`HTTP ${req.method} ${req.originalUrl}`, meta);
        }
    }
};

module.exports = logger;

