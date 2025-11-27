// config/stripe.js - YENİ DOSYA
"use strict";

// Lazy loading: Stripe sadece kullanıldığında initialize edilir
let stripeInstance = null;

const getStripe = () => {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured in environment variables');
    }
    stripeInstance = require('stripe')(secretKey);
  }
  return stripeInstance;
};

module.exports = getStripe;