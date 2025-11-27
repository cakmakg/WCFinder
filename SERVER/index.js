/**
 * WCFinder Backend Server
 * 
 * Production-ready Express.js server with:
 * - Clean Code principles (DRY, KISS, YAGNI)
 * - Security best practices (XSS, NoSQL injection protection)
 * - Proper error handling and logging
 * - Input validation
 * - Rate limiting
 * - Dependency injection for testability
 * 
 * @author WCFinder Team
 * @version 2.0.0
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Logger
const logger = require('./src/utils/logger');

const app = express();
const HOST = process.env?.HOST || '127.0.0.1';
const PORT = process.env.PORT || 8000;

// ✅ Async error handling (must be first)
require('express-async-errors');

// ✅ Security: Helmet (HTTP headers security)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false, // PDF viewing için
    hsts: {
        maxAge: 31536000, // 1 yıl
        includeSubDomains: true,
        preload: true
    },
    noSniff: true, // MIME type sniffing koruması
    xssFilter: true, // XSS koruması (eski tarayıcılar için)
    frameguard: {
        action: 'deny' // Clickjacking koruması
    },
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    }
}));

// ✅ CORS Configuration (environment-based)
const corsOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : process.env.NODE_ENV === 'production'
        ? [] // Production'da CORS_ORIGIN environment variable'ı zorunlu
        : [
            'http://localhost:5173',  // Vite dev server
            'http://localhost:3000',  // Create React App
            'http://127.0.0.1:5173',
        ];

app.use(cors({
    origin: function (origin, callback) {
        // Same-origin istekleri (Postman, curl, vb.) için origin yok
        if (!origin) {
            // Development'ta same-origin isteklere izin ver
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            // Production'da same-origin isteklere izin verme (güvenlik)
            return callback(new Error('CORS: Origin header required'));
        }
        
        // Development'ta detaylı logging
        if (process.env.NODE_ENV === 'development') {
            logger.debug('CORS check', { origin, allowedOrigins: corsOrigins });
        }
        
        if (corsOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn('CORS blocked', { origin, allowedOrigins: corsOrigins, ip: 'req.ip' });
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 86400, // 24 saat (preflight cache)
}));

// ✅ Body Parser (JSON)
app.use(express.json({ 
    limit: process.env.MAX_BODY_SIZE || '10mb',
    strict: true 
}));

// ✅ URL Encoded (form data)
app.use(express.urlencoded({ 
    extended: true, 
    limit: process.env.MAX_BODY_SIZE || '10mb' 
}));

// ✅ Request Logger (tüm istekleri logla)
app.use(require('./src/middleware/requestLogger'));

// ✅ Input Validation & Sanitization (XSS ve NoSQL injection koruması)
const { validateAndSanitize } = require('./src/middleware/validation');
app.use(validateAndSanitize);

// ✅ Query Handler (filtering, searching, sorting, pagination)
app.use(require('./src/middleware/queryHandler'));

// ✅ Database Connection
const { dbConnection } = require('./src/config/dbConnection');
dbConnection();

// ✅ Static files (PDF'ler için)
app.use('/public', express.static(path.join(__dirname, 'public')));

// ✅ Authentication Middleware (JWT ve Token based)
app.use(require('./src/middleware/authentication'));

// ✅ Home Route (rate limiting'den önce)
app.all('/', (req, res) => {
    res.send({
        error: false,
        message: 'Welcome to WCFinder API',
        version: '2.0.0',
        environment: process.env.NODE_ENV || 'development',
        documents: {
            swagger: '/documents/swagger',
            redoc: '/documents/redoc',
            json: '/documents/json',
        },
        user: req.user ? {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role
        } : null
    });
});

// ✅ Rate Limiting Configuration
// Development'ta daha gevşek, production'da sıkı

// ✅ Auth endpoint'leri için rate limiting (brute force koruması)
// Development'ta rate limiting'i devre dışı bırak, production'da aktif et
const isDevelopment = process.env.NODE_ENV !== 'production';

// ✅ DEVELOPMENT: Rate limiting'i tamamen devre dışı bırak (login testleri için)
// ✅ PRODUCTION: Rate limiting aktif (brute force koruması)
const shouldDisableAuthRateLimit = isDevelopment || process.env.DISABLE_AUTH_RATE_LIMIT === 'true';

if (shouldDisableAuthRateLimit) {
    logger.info('Auth rate limiting DISABLED (development mode)', {
        environment: process.env.NODE_ENV
    });
    // Development'ta rate limiting'i bypass et - login yapabilirsiniz
    app.use('/api/auth/login', (req, res, next) => next());
    app.use('/api/auth/register', (req, res, next) => next());
} else {
    // Production'da rate limiting aktif
    const authRateLimitWindow = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // 15 dakika
    const authRateLimitMax = parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 5; // 5 istek/15dk
    
    const authLimiter = rateLimit({
        windowMs: authRateLimitWindow,
        max: authRateLimitMax,
        message: {
            error: true,
            message: 'Too many authentication attempts, please try again later.'
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true, // Başarılı login'leri sayma
        trustProxy: process.env.TRUST_PROXY === 'true',
        handler: (req, res) => {
            logger.warn('Rate limit exceeded for auth endpoint', {
                path: req.path,
                ip: req.ip,
                method: req.method
            });
            res.status(429).json({
                error: true,
                message: 'Too many authentication attempts, please try again later.',
                retryAfter: Math.ceil(authRateLimitWindow / 1000)
            });
        }
    });
    
    app.use('/api/auth/login', authLimiter);
    app.use('/api/auth/register', authLimiter);
}

// Payment endpoint'leri için daha sıkı rate limiting
const paymentLimiter = rateLimit({
    windowMs: parseInt(process.env.PAYMENT_RATE_LIMIT_WINDOW_MS) || 60 * 1000, // 1 dakika
    max: parseInt(process.env.PAYMENT_RATE_LIMIT_MAX_REQUESTS) || (isDevelopment ? 20 : 5), // Dev: 20, Prod: 5
    message: {
        error: true,
        message: 'Too many payment requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: process.env.TRUST_PROXY === 'true',
});
app.use('/api/payments', paymentLimiter);

// Genel API rate limiting (auth ve payment'ları zaten yukarıda handle ettik)
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || (isDevelopment ? 60 * 1000 : 15 * 60 * 1000), // Dev: 1dk, Prod: 15dk
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (isDevelopment ? 200 : 100), // Dev: 200, Prod: 100
    message: {
        error: true,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Health check endpoint'lerini rate limit'ten muaf tut
        if (req.path === '/' || req.path.startsWith('/documents')) {
            return true;
        }
        // ✅ Auth endpoint'leri zaten yukarıda handle edildi (skip et)
        if (req.path === '/api/auth/login' || req.path === '/api/auth/register' || 
            req.path.startsWith('/api/auth/login') || req.path.startsWith('/api/auth/register')) {
            return true; // Zaten authLimiter handle ediyor
        }
        return false;
    },
    trustProxy: process.env.TRUST_PROXY === 'true',
});

// ✅ Genel API Rate Limiting (auth ve payment'ları skip eder)
app.use('/api', limiter);

// ✅ API Routes
try {
    const routes = require('./src/routes');
    
    // Development'ta route bilgilerini logla
    if (process.env.NODE_ENV === 'development') {
        logger.info('Mounting API routes', { 
            totalRoutes: routes.stack?.length || 0 
        });
    }
    
    // ✅ API routes mount
    app.use('/api', routes);
    logger.info('API routes mounted successfully', {
        routes: routes.stack?.length || 0
    });
} catch (error) {
    logger.error('Failed to mount API routes', { error: error.message });
    throw error;
}

// ✅ 404 Handler (route bulunamadığında)
app.use((req, res, next) => {
    // Development'ta detaylı logging
    if (process.env.NODE_ENV === 'development') {
        logger.warn('Route not found', {
            method: req.method,
            path: req.path,
            originalUrl: req.originalUrl,
            ip: req.ip,
        });
    }
    res.errorStatusCode = 404;
    throw new Error(`Route not found: ${req.method} ${req.originalUrl}`);
});

// ✅ Error Handler (en son middleware - tüm hataları yakalar)
app.use(require('./src/middleware/errorHnadler'));

// ✅ Server Start
app.listen(PORT, HOST, () => {
    logger.info('Server started successfully', {
        host: HOST,
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Documentation: http://${HOST}:${PORT}/documents/swagger`);
});

// Syncronization (must be in commentLine):
//require('./src/helper/sync')() // !!! It clear database.
