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
const PasswordReset = require('../models/passwordReset');
const sendMail = require('../helper/sendMail');

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

        // Account status check — pending approval gets a specific message
        if (!user.isActive) {
            logger.warn('Login attempt failed - inactive account', {
                userId: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                ip: req.ip
            });
            return res.status(403).json({
                error: true,
                code: "ACCOUNT_PENDING_APPROVAL",
                message: "Ihr Konto wartet noch auf die Genehmigung durch den Administrator. Sie erhalten eine E-Mail, sobald Ihr Konto aktiviert wurde.",
            });
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

        // Send user data including email, firstName, lastName for profile display
        // Email is not sensitive PII and is needed for profile management
        res.send({
            error: false,
            bearer: { accessToken, refreshToken },
            user: {
                _id: user._id,
                username: user.username,
                email: user.email, // Email is needed for profile display
                firstName: user.firstName,
                lastName: user.lastName,
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

        // ✅ Send welcome email to user
        // Not: SMTP configuration kontrolü sendMail helper içinde yapılıyor (custom SMTP destekli).
        // Burada ekstra EMAIL_SERVICE / EMAIL_HOST kontrolü yapmayıp, sonucu logluyoruz.
        try {
            const welcomeEmailSubject = 'Willkommen bei WCFinder!';
            const welcomeEmailMessage = `
                <h2>Willkommen bei WCFinder, ${user.firstName || user.username}!</h2>
                <p>Vielen Dank für Ihre Registrierung bei WCFinder.</p>
                <p>Ihr Konto wurde erfolgreich erstellt:</p>
                <ul>
                    <li><strong>Benutzername:</strong> ${user.username}</li>
                    <li><strong>E-Mail:</strong> ${user.email}</li>
                </ul>
                <p>Sie können sich jetzt anmelden und Toiletten in Ihrer Nähe finden und buchen.</p>
                <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
                <br>
                <p>Mit freundlichen Grüßen,<br>Das WCFinder Team</p>
            `;

            const emailSent = await sendMail(user.email, welcomeEmailSubject, welcomeEmailMessage);
            
            if (emailSent) {
                logger.info('Welcome email sent successfully', { 
                    userId: user._id, 
                    email: user.email 
                });
            } else {
                logger.warn('Welcome email send returned false', { 
                    userId: user._id, 
                    email: user.email 
                });
            }
        } catch (emailError) {
            // Email hatası register işlemini engellemez
            logger.error('Failed to send welcome email', emailError, { 
                userId: user._id, 
                email: user.email,
                errorMessage: emailError.message,
                errorStack: emailError.stack
            });
        }

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

    /**
     * Forgot Password
     * 
     * Kullanıcı şifresini unuttuğunda email adresine reset linki gönderir.
     */
    forgotPassword: async (req, res) => {
        const { email } = req.body;

        if (!email) {
            throw new ValidationError("Email is required");
        }

        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail || !validateEmail(normalizedEmail)) {
            throw new ValidationError("Invalid email format");
        }

        // Kullanıcıyı bul
        const user = await User.findOne({ email: normalizedEmail });
        
        // Güvenlik: Kullanıcı yoksa bile aynı mesajı döndür (timing attack koruması)
        if (!user) {
            logger.warn('Forgot password attempt - user not found', { 
                email: normalizedEmail, 
                ip: req.ip 
            });
            // Kullanıcı yoksa bile başarılı mesaj döndür (güvenlik)
            return res.status(200).send({
                error: false,
                message: "If the email exists, a password reset link has been sent."
            });
        }

        // Eski token'ları sil (kullanılmamış olsa bile)
        await PasswordReset.deleteMany({ 
            userId: user._id, 
            used: false 
        });

        // Yeni token oluştur
        const token = PasswordReset.generateToken();
        const resetToken = await PasswordReset.create({
            userId: user._id,
            token: token,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 saat
        });

        // Reset linki oluştur
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        // Email gönder
        try {
            console.log('📧 [forgotPassword] Preparing to send reset email', {
                userId: user._id,
                email: user.email,
                resetLink: resetLink.substring(0, 50) + '...'
            });
            
            const emailSubject = 'WCFinder - Passwort zurücksetzen';
            const emailMessage = `
                <h2>Passwort zurücksetzen</h2>
                <p>Hallo ${user.firstName || user.username},</p>
                <p>Sie haben eine Passwort-Zurücksetzung für Ihr WCFinder-Konto angefordert.</p>
                <p>Klicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:</p>
                <p><a href="${resetLink}" style="background-color: #0891b2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Passwort zurücksetzen</a></p>
                <p>Oder kopieren Sie diesen Link in Ihren Browser:</p>
                <p>${resetLink}</p>
                <p><strong>Dieser Link ist 1 Stunde gültig.</strong></p>
                <p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail bitte.</p>
                <br>
                <p>Mit freundlichen Grüßen,<br>Das WCFinder Team</p>
            `;

            const emailSent = await sendMail(user.email, emailSubject, emailMessage);
            
            if (emailSent) {
                logger.info('Password reset email sent successfully', { 
                    userId: user._id, 
                    email: user.email,
                    resetLink: resetLink.substring(0, 50) + '...'
                });
                console.log('✅ [forgotPassword] Email sent successfully to:', user.email);
            } else {
                logger.warn('Password reset email send returned false', { 
                    userId: user._id, 
                    email: user.email 
                });
                console.log('⚠️ [forgotPassword] Email send returned false');
            }

            res.status(200).send({
                error: false,
                message: "If the email exists, a password reset link has been sent."
            });
        } catch (emailError) {
            logger.error('Failed to send password reset email', emailError, {
                userId: user._id,
                email: user.email,
                errorMessage: emailError.message,
                errorStack: emailError.stack
            });
            console.error('❌ [forgotPassword] Email send failed:', emailError.message);
            // Email hatası durumunda bile başarılı mesaj döndür (güvenlik)
            res.status(200).send({
                error: false,
                message: "If the email exists, a password reset link has been sent."
            });
        }
    },

    /**
     * Reset Password
     * 
     * Token ile şifre sıfırlama işlemi.
     */
    resetPassword: async (req, res) => {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            throw new ValidationError("Token and new password are required");
        }

        // Password validation
        if (!validatePassword(newPassword)) {
            throw new ValidationError("Password must be at least 8 characters with uppercase, lowercase and number");
        }

        // Token'ı bul
        const resetToken = await PasswordReset.findOne({ 
            token: token,
            used: false,
            expiresAt: { $gt: new Date() } // Süresi dolmamış
        });

        if (!resetToken) {
            logger.warn('Password reset attempt - invalid or expired token', { 
                token: token.substring(0, 10) + '...', 
                ip: req.ip 
            });
            throw new AuthenticationError("Invalid or expired reset token");
        }

        // Kullanıcıyı bul
        const user = await User.findById(resetToken.userId);
        if (!user) {
            throw new AuthenticationError("User not found");
        }

        // Şifreyi güncelle
        user.password = passwordEncrypt(newPassword);
        await user.save();

        // Token'ı kullanıldı olarak işaretle
        await resetToken.markAsUsed();

        logger.info('Password reset successful', { 
            userId: user._id, 
            email: user.email 
        });

        res.status(200).send({
            error: false,
            message: "Password has been reset successfully. You can now login with your new password."
        });
    },
};