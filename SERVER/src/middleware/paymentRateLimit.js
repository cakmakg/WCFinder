// middleware/paymentRateLimit.js
const rateLimit = require('express-rate-limit');

// Development modunda rate limit'i daha esnek yap
const isDevelopment = process.env.NODE_ENV !== 'production';
const shouldDisablePaymentRateLimit = isDevelopment || process.env.DISABLE_PAYMENT_RATE_LIMIT === 'true';

// Payment endpoint'leri için özel rate limiter
// Development'da daha esnek, production'da sıkı limitler
const paymentLimiter = rateLimit({
  windowMs: isDevelopment ? 1 * 60 * 1000 : 15 * 60 * 1000, // Development: 1 dakika, Production: 15 dakika
  max: isDevelopment ? 20 : 10, // Development: 20 istek/dakika, Production: 10 istek/15dk
  message: {
    error: true,
    message: 'Too many payment requests. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // IP bazlı limitleme
  keyGenerator: (req) => {
    // Kullanıcı login olmuşsa user ID, değilse IP
    return req.user?._id?.toString() || req.ip;
  },
  // Development'da skip function - rate limit'i bypass et
  skip: (req) => {
    if (shouldDisablePaymentRateLimit) {
      return true; // Rate limit'i bypass et
    }
    return false;
  },
});

module.exports = paymentLimiter;

