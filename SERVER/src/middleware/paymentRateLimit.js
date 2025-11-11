// middleware/paymentRateLimit.js
const rateLimit = require('express-rate-limit');

// Payment endpoint'leri için özel rate limiter
// Daha sıkı limitler - ödeme işlemleri kritik
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 15 dakikada maksimum 5 payment isteği
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
});

module.exports = paymentLimiter;

