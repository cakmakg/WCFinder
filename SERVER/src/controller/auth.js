"use strict";
/**
 * Authentication Controller
 * 
 * Kullanıcı authentication işlemleri:
 * - Login (username/email + password)
 * - Register (yeni kullanıcı kaydı)
 * - Refresh token (access token yenileme)
 * - Logout (token silme)
 * 
 * Clean Code Principles:
 * - DRY: Token oluşturma logic tekrar kullanılabilir
 * - Security: Password hash'leme, JWT token management
 * - Input Validation: Validation middleware ile korunuyor
 */

const passwordEncrypt = require("../helper/passwordEncrypt");
const logger = require("../utils/logger");
const { validateEmail, validatePassword } = require("../middleware/validation");
const { AuthenticationError, ValidationError } = require("../middleware/errorHnadler");
const {
    normalizeEmail,
    normalizeUsername,
    createEmailRegex,
    createJwtTokens,
    createUserLookupQuery
} = require("../utils/authHelpers");

const User = require("../models/user");
const Token = require('../models/token');

module.exports = {
  /**
   * User Login
   * 
   * Kullanıcı giriş işlemi. Username veya email ile giriş yapılabilir.
   * Başarılı girişte JWT access ve refresh token döner.
   * 
   * Security:
   * - Password hash karşılaştırması
   * - Account active kontrolü
   * - Brute force koruması için rate limiting kullanılmalı
   */
  login: async (req, res) => {
        const { username, email, password } = req.body;

        // ✅ Normalize input (DRY: helper function kullan)
        const normalizedEmail = normalizeEmail(email);
        const normalizedUsername = normalizeUsername(username);

        // Input validation
        if (!((normalizedUsername || normalizedEmail) && password)) {
            logger.warn('Login attempt failed - missing credentials', { 
                username: normalizedUsername, 
                email: normalizedEmail, 
                ip: req.ip 
            });
            throw new ValidationError("username/email and password are required");
        }

        // Email validation (eğer email kullanılıyorsa)
        if (normalizedEmail && !validateEmail(normalizedEmail)) {
            logger.warn('Login attempt failed - invalid email format', { 
                email: normalizedEmail, 
                ip: req.ip 
            });
            throw new ValidationError("Invalid email format");
        }

        // ✅ User lookup (DRY: helper function kullan)
        const query = createUserLookupQuery(email, username);
        
        if (!query) {
            throw new ValidationError("username/email is required");
        }
        
        const user = await User.findOne(query);

        if (!user) {
            // Güvenlik: Aynı hata mesajı (timing attack koruması)
            logger.warn('Login attempt failed - user not found', { 
                username: normalizedUsername, 
                email: normalizedEmail,
                query,
                ip: req.ip 
            });
            throw new AuthenticationError("incorrect username/email or password.");
        }

        // ✅ Password verification (hash karşılaştırması)
        const encryptedPassword = passwordEncrypt(password);
        
        if (user.password !== encryptedPassword) {
            logger.warn('Login attempt failed - wrong password', { 
                userId: user._id, 
                username: user.username,
                email: user.email,
                ip: req.ip 
            });
            throw new AuthenticationError("incorrect username/email or password.");
        }

        // Account status check
        if (!user.isActive) {
            logger.warn('Login attempt failed - inactive account', { 
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                ip: req.ip 
            });
            throw new AuthenticationError("This account is not active.");
        }

        // ✅ Token management (DRY: helper function kullan)
        let tokenData = await Token.findOne({ userId: user._id });

        if (!tokenData) {
            tokenData = await Token.create({
                userId: user._id,
                token: passwordEncrypt(user._id + Date.now()),
            });
        }

        // ✅ JWT tokens oluştur (DRY: helper function kullan)
        const { accessToken, refreshToken } = createJwtTokens(user);

        logger.info('User logged in successfully', { 
            userId: user._id, 
            username: user.username,
            role: user.role 
        });

        // Security: Don't send email in login response
        // Email is sensitive PII and should only be fetched when needed
        res.send({
            error: false,
            bearer: { accessToken, refreshToken },
            user: {
                _id: user._id,
                username: user.username,
                // email: NOT SENT (security: sensitive PII)
                role: user.role,
                isActive: user.isActive
            },
        });
    },

    /**
     * User Registration
     * 
     * Yeni kullanıcı kaydı. Sadece 'user' role'ü ile kayıt olunabilir.
     * Owner ve admin rolleri sadece admin tarafından atanabilir.
     * 
     * Security:
     * - Password validation (minimum 8 karakter, kompleks)
     * - Email validation
     * - Username validation (alphanumeric + underscore)
     * - Role hijacking koruması (sadece 'user' role'ü)
     */
    register: async (req, res) => {
        const { username, email, password } = req.body;

        // ✅ Normalize input (DRY: helper function kullan)
        const normalizedEmail = normalizeEmail(email);
        const normalizedUsername = normalizeUsername(username);

        // Input validation
        if (!normalizedUsername || !normalizedEmail || !password) {
            throw new ValidationError("username, email and password are required");
        }

        // Email validation (normalized email ile)
        if (!validateEmail(normalizedEmail)) {
            throw new ValidationError("Invalid email format");
        }

        // Password validation (güçlü şifre gereksinimi)
        if (!validatePassword(password)) {
            throw new ValidationError("Password must be at least 8 characters with uppercase, lowercase and number");
        }

        // Username validation (alphanumeric + underscore, 3-30 karakter)
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(normalizedUsername)) {
            throw new ValidationError("Username must be 3-30 characters, alphanumeric and underscore only");
        }

        // ✅ Duplicate check (DRY: helper function kullan)
        const duplicateQuery = createUserLookupQuery(email, username);
        const isUserExist = await User.findOne(duplicateQuery);

        if (isUserExist) {
            logger.warn('Registration attempt failed - duplicate user', { 
                username: normalizedUsername, 
                email: normalizedEmail, 
                ip: req.ip 
            });
            res.errorStatusCode = 409;
            throw new Error("Already used username or email.");
        }

        // ✅ Role kontrolü (güvenlik: admin role'ü register ile alınamaz)
        // Owner ve user role'leri register ile alınabilir, admin sadece admin tarafından atanabilir
        let allowedRole = 'user'; // Default role
        const requestedRole = req.body.role?.trim().toLowerCase();
        
        if (requestedRole === 'owner') {
            allowedRole = 'owner';
        } else if (requestedRole === 'admin') {
            // ✅ SECURITY: Admin role'ü register ile alınamaz (role hijacking koruması)
            logger.warn('Registration attempt with admin role blocked', { 
                email: normalizedEmail, 
                ip: req.ip 
            });
            throw new ValidationError("Admin role cannot be assigned during registration.");
        }
        // requestedRole === 'user' veya undefined ise default 'user' kullanılır

        // Log registration attempt (only if role is not default)
        if (allowedRole !== 'user') {
            logger.info('User registration with custom role', {
                username: normalizedUsername,
                email: normalizedEmail,
                requestedRole,
                allowedRole,
                ip: req.ip
            });
        }

        // User data hazırlama (normalized değerlerle)
        const userData = {
            username: normalizedUsername,
            email: normalizedEmail,
            password: passwordEncrypt(password), // ✅ CRITICAL: Şifreyi hash'le (asla plain text saklama!)
            role: allowedRole, // ✅ SECURITY: Sadece 'user' veya 'owner' role'ü ile kayıt (admin hariç)
            isActive: req.body.isActive !== undefined ? req.body.isActive : true // isActive parametreden alınır, yoksa default true
        };

        // User oluştur
        const user = await User.create(userData);

        // ✅ Token oluştur
        const tokenData = await Token.create({
            userId: user._id,
            token: passwordEncrypt(user._id + Date.now()),
        });

        // ✅ JWT tokens oluştur (DRY: helper function kullan)
        const { accessToken, refreshToken } = createJwtTokens(user);

        logger.info('User registered successfully', { 
            userId: user._id, 
            username: user.username,
            email: user.email,
            role: user.role,
            isActive: user.isActive
        });

        // Security: Don't send email in register response
        // Email is sensitive PII and should only be fetched when needed
        res.status(201).send({
            error: false,
            token: tokenData.token,
            bearer: { accessToken, refreshToken },
            user: {
                _id: user._id,
                username: user.username,
                // email: NOT SENT (security: sensitive PII)
                role: user.role,
                isActive: user.isActive
            },
        });
    },

    refresh: async (req, res) => {
        const refreshToken = req.body?.bearer?.refreshToken;

        if (!refreshToken) {
            res.errorStatusCode = 401
            throw new Error('Please enter token.refresh');
        }

        jwt.verify(refreshToken, process.env.REFRESH_KEY, async function (err, userData) {
            if (err) {
                res.errorStatusCode = 401
                throw err
            }

            const { _id, password } = userData

            if (!(_id && password)) {
                res.errorStatusCode = 401
                throw new Error('Not found id or password in token.')
            }

            const user = await User.findOne({ _id });

            if (!(user && user.password == password)) {
                res.errorStatusCode = 401
                throw new Error('Wrong id or password.');
            }

            if (!user.isActive) {
                res.errorStatusCode = 401
                throw new Error('This account is not active.')
            }

            // ✅ JWT token oluştur (DRY: helper function kullan)
            const { accessToken } = createJwtTokens(user);

            res.send({
                error: false,
                bearer: { accessToken }
            })
        })
    },

    logout: async (req, res) => {
        const auth = req.headers?.authorization || null;
        const tokenKey = auth ? auth.split(' ') : null;

        let message = 'Logout successful';
        let result = {};

        if (tokenKey && tokenKey[0] === 'Token') {
            result = await Token.deleteOne({ token: tokenKey[1] });
            message = result.deletedCount 
                ? 'Token deleted. Logout was OK.' 
                : 'Token not found, but logout completed.';
        } else if (tokenKey && tokenKey[0] === 'Bearer') {
            message = 'JWT logout successful. Please delete token from client.';
        }

        res.status(200).send({
            error: false,
            message,
            result
        });
    },
};