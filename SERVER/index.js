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

// ✅ ENVIRONMENT VALIDATION: Validate all required environment variables on startup
// This ensures the application fails fast if configuration is missing
const { validateAndLogEnvironment } = require('./src/utils/envValidator');
validateAndLogEnvironment();

// ✅ EMAIL CONFIGURATION CHECK: Log email configuration status on startup
const hasEmailService = !!process.env.EMAIL_SERVICE;
const hasEmailHost = !!process.env.EMAIL_HOST;
const hasEmailPort = !!process.env.EMAIL_PORT;
const hasEmailUser = !!process.env.EMAIL_USER;
const hasEmailPassword = !!process.env.EMAIL_PASSWORD;
const hasEmailPass = !!process.env.EMAIL_PASS;
const hasEmailConfig = (hasEmailService || (hasEmailHost && hasEmailPort)) && hasEmailUser && (hasEmailPassword || hasEmailPass);

console.log('📧 Email Configuration Check:', {
    configured: hasEmailConfig,
    method: hasEmailService ? 'SERVICE' : (hasEmailHost ? 'SMTP' : 'NONE'),
    hasEmailService,
    hasEmailHost: hasEmailHost ? `${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}` : false,
    hasEmailUser: hasEmailUser ? `${process.env.EMAIL_USER.substring(0, 10)}...` : false,
    hasEmailPassword: hasEmailPassword || hasEmailPass
});
logger.info('📧 Email Configuration Check', {
    configured: hasEmailConfig,
    method: hasEmailService ? 'SERVICE' : (hasEmailHost ? 'SMTP' : 'NONE'),
    hasEmailService,
    hasEmailHost: !!hasEmailHost,
    hasEmailPort: !!hasEmailPort,
    hasEmailUser: !!hasEmailUser,
    hasEmailPassword: hasEmailPassword || hasEmailPass
});

const app = express();
//const HOST = process.env?.HOST || '127.0.0.1';
const PORT = process.env.PORT || 8000;

// ✅ Trust Proxy (Railway ve diğer proxy'ler için)
// Railway proxy arkasında çalıştığı için X-Forwarded-For header'ını doğru işlemek için gerekli
app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

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
// CORS_ORIGIN'i parse et - virgülle ayrılmış, boşlukları temizle
let corsOrigins = [];
if (process.env.CORS_ORIGIN) {
    corsOrigins = process.env.CORS_ORIGIN
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => origin.length > 0);
} else if (process.env.NODE_ENV !== 'production') {
    // Development default origins
    corsOrigins = [
        'http://localhost:5173',  // Vite dev server
        'http://localhost:5174',  // Vite dev server (alternatif port)
        'http://localhost:5175',  // Vite dev server (alternatif port)
        'http://localhost:3000',  // Create React App
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
    ];
}

// CORS origins'i logla (startup'ta) - detaylı debug için
console.log('🔧 CORS Configuration:', {
    corsOrigins, 
    corsOriginEnv: process.env.CORS_ORIGIN,
    corsOriginLength: corsOrigins.length,
    nodeEnv: process.env.NODE_ENV
});
logger.info('🔧 CORS Configuration', { 
    corsOrigins, 
    corsOriginEnv: process.env.CORS_ORIGIN,
    corsOriginLength: corsOrigins.length,
    nodeEnv: process.env.NODE_ENV,
    parsedOrigins: corsOrigins.map((o, i) => `${i}: "${o}"`).join(', ')
});

// CORS middleware - basitleştirilmiş ve daha güvenilir
app.use(cors({
    origin: function (origin, callback) {
        // OPTIONS preflight request'lerde origin olmayabilir
        if (!origin) {
            // Development'ta same-origin isteklere izin ver
            if (process.env.NODE_ENV === 'development') {
                return callback(null, true);
            }
            // Production'da origin olmayan isteklere izin verme
            return callback(null, false);
        }
        
        // Origin kontrolü - case-insensitive ve exact match
        const normalizedOrigin = origin.trim();
        const isAllowed = corsOrigins.some(allowedOrigin => 
            allowedOrigin.trim() === normalizedOrigin
        );
        
        // Her zaman logging (console.log da ekle - Railway logs'da görünsün)
        console.log('🔍 CORS check:', {
            origin: normalizedOrigin,
            allowedOrigins: corsOrigins,
            isAllowed
        });
        logger.info('🔍 CORS check', { 
            origin: normalizedOrigin, 
            allowedOrigins: corsOrigins,
            isAllowed
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            // CORS blocked - detaylı log
            console.error('❌ CORS BLOCKED:', {
                origin: normalizedOrigin,
                allowedOrigins: corsOrigins,
                corsOriginEnv: process.env.CORS_ORIGIN
            });
            logger.error('❌ CORS BLOCKED', { 
                origin: normalizedOrigin, 
                allowedOrigins: corsOrigins,
                corsOriginEnv: process.env.CORS_ORIGIN
            });
            // CORS hatası için false döndür
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Per-Page'],
    maxAge: 86400, // 24 saat (preflight cache)
    optionsSuccessStatus: 200, // OPTIONS request'ler için 200 döndür
}));

// ✅ Stripe Webhook (JSON body parser'dan ÖNCE mount edilmeli):
// Stripe imza doğrulaması (constructEvent) gövdenin HAM (raw Buffer) halini gerektirir.
// Bu route global express.json ve validateAndSanitize'dan ÖNCE kendi raw parser'ıyla
// mount edilir; aksi halde gövde parse/sanitize edilir ve imza doğrulaması her zaman başarısız olur.
const { stripeWebhook } = require('./src/controller/payment');
app.post('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

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

// ✅ Auth rate limiting SADECE gerçek development'ta veya açık opt-in ile kapatılır.
// `isDevelopment` (NODE_ENV !== 'production') kullanmak; staging, test, boş veya
// yanlış yazılmış (ör. 'prod') ortamlarda brute-force korumasını sessizce kapatırdı.
const shouldDisableAuthRateLimit =
    process.env.NODE_ENV === 'development' || process.env.DISABLE_AUTH_RATE_LIMIT === 'true';

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
app.listen(PORT, () => {
    logger.info('Server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version
    });
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📚 API Documentation: /documents/swagger`);
});

// Syncronization (must be in commentLine):
//require('./src/helper/sync')() // !!! It clear database.
