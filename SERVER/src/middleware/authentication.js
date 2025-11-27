
"use strict"
/**
 * Authentication Middleware
 * 
 * JWT ve SimpleToken authentication işlemlerini yönetir.
 * Request header'dan Authorization token'ı alır ve doğrular.
 * 
 * Clean Code Principles:
 * - Security: Token validation
 * - Error Handling: JWT hatalarını yakalar
 * - Logging: Authentication attempts loglanır
 */

const jwt = require('jsonwebtoken');
const Token = require('../models/token');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
    // Default: user null
    req.user = null;

    // Authorization header'dan token al
    const auth = req.headers?.authorization || null;
    const tokenKey = auth ? auth.split(' ') : null;

    if (tokenKey && tokenKey.length >= 2) {
        const tokenType = tokenKey[0]; // 'Token' veya 'Bearer'
        const tokenValue = tokenKey[1]; // Token değeri

        try {
            if (tokenType === 'Token') {
                // SimpleToken authentication
                const tokenData = await Token.findOne({ token: tokenValue }).populate('userId');
                if (tokenData && tokenData.userId) {
                    req.user = tokenData.userId;
                    logger.debug('SimpleToken authentication successful', {
                        userId: req.user._id,
                        path: req.path
                    });
                } else {
                    logger.warn('SimpleToken not found', {
                        token: tokenValue.substring(0, 10) + '...',
                        path: req.path
                    });
                }
            } else if (tokenType === 'Bearer') {
                // JWT authentication
                if (!process.env.ACCESS_KEY) {
                    logger.error('ACCESS_KEY not configured in environment variables');
                    return next();
                }

                // ✅ CRITICAL FIX: JWT verify callback'i await ile beklemeliyiz
                // Callback asenkron çalıştığı için Promise wrapper kullanıyoruz
                try {
                    const userData = jwt.verify(tokenValue, process.env.ACCESS_KEY);
                    
                    if (userData) {
                        req.user = userData;
                        logger.debug('JWT authentication successful', {
                            userId: req.user._id,
                            path: req.path
                        });
                    } else {
                        req.user = null;
                    }
                } catch (err) {
                    // JWT verification hatası
                    req.user = null;
                    
                    if (err.name === 'TokenExpiredError') {
                        logger.warn('JWT token expired', {
                            path: req.path,
                            ip: req.ip,
                            expiresAt: err.expiredAt
                        });
                    } else if (err.name === 'JsonWebTokenError') {
                        logger.warn('Invalid JWT token', {
                            path: req.path,
                            ip: req.ip,
                            error: err.message
                        });
                    } else {
                        logger.error('JWT verification error', err, {
                            path: req.path,
                            ip: req.ip
                        });
                    }
                }
            } else {
                logger.warn('Unknown token type', {
                    tokenType,
                    path: req.path
                });
            }
        } catch (error) {
            logger.error('Authentication middleware error', error, {
                path: req.path,
                tokenType
            });
            req.user = null;
        }
    } else if (auth) {
        // Authorization header var ama format yanlış
        logger.warn('Invalid authorization header format', {
            auth: auth.substring(0, 20) + '...',
            path: req.path
        });
    }

    next();
}