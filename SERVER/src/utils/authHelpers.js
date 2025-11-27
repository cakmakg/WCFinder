"use strict";
/**
 * Authentication Helper Functions
 * 
 * DRY: Tekrar eden authentication logic'i buraya toplanır
 * Best Practice: Reusable utility functions
 */

const passwordEncrypt = require("../helper/passwordEncrypt");
const jwt = require("jsonwebtoken");
const logger = require("./logger");

/**
 * Email normalize et (lowercase + trim)
 * @param {string} email 
 * @returns {string|null} Normalized email veya null
 */
const normalizeEmail = (email) => {
    return email ? email.trim().toLowerCase() : null;
};

/**
 * Username normalize et (trim)
 * @param {string} username 
 * @returns {string|null} Normalized username veya null
 */
const normalizeUsername = (username) => {
    return username ? username.trim() : null;
};

/**
 * Email için regex escape yap ve case-insensitive regex oluştur
 * @param {string} email 
 * @returns {RegExp} Email regex
 */
const createEmailRegex = (email) => {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) return null;
    
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^${escapedEmail}$`, 'i');
};

/**
 * JWT Access Token payload oluştur
 * @param {object} user 
 * @returns {object} Access token payload
 */
const createAccessTokenPayload = (user) => {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
    };
};

/**
 * JWT tokens oluştur (access + refresh)
 * @param {object} user 
 * @returns {object} { accessToken, refreshToken }
 */
const createJwtTokens = (user) => {
    if (!process.env.ACCESS_KEY || !process.env.REFRESH_KEY) {
        logger.error('JWT secret keys not configured');
        throw new Error('Server configuration error');
    }

    const accessData = createAccessTokenPayload(user);
    
    const accessToken = jwt.sign(accessData, process.env.ACCESS_KEY, { expiresIn: '1h' });
    const refreshToken = jwt.sign(
        { _id: user._id, password: user.password }, 
        process.env.REFRESH_KEY, 
        { expiresIn: '3d' }
    );

    return { accessToken, refreshToken };
};

/**
 * User lookup query oluştur (email/username ile)
 * @param {string|null} email 
 * @param {string|null} username 
 * @returns {object} MongoDB query object
 */
const createUserLookupQuery = (email, username) => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);

    if (normalizedEmail) {
        const emailRegex = createEmailRegex(email);
        
        if (normalizedUsername) {
            return {
                $or: [
                    { username: normalizedUsername },
                    { email: emailRegex }
                ]
            };
        } else {
            return { email: emailRegex };
        }
    } else if (normalizedUsername) {
        return { username: normalizedUsername };
    } else {
        return null; // Invalid query
    }
};

module.exports = {
    normalizeEmail,
    normalizeUsername,
    createEmailRegex,
    createAccessTokenPayload,
    createJwtTokens,
    createUserLookupQuery
};

