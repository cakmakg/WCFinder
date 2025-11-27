// config/paypal.js - YENİ DOSYA
"use strict";

// Lazy loading: PayPal sadece kullanıldığında initialize edilir
let paypalClientInstance = null;

const getPayPalClient = () => {
  if (!paypalClientInstance) {
    const paypal = require('@paypal/checkout-server-sdk');
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    
    // Debug: Environment variables kontrolü
    console.log('🔍 PayPal Config Check:');
    console.log('  - PAYPAL_CLIENT_ID exists:', !!clientId);
    console.log('  - PAYPAL_CLIENT_SECRET exists:', !!clientSecret);
    if (clientId) {
      console.log('  - PAYPAL_CLIENT_ID length:', clientId.length);
      console.log('  - PAYPAL_CLIENT_ID starts with:', clientId.substring(0, 5) + '...');
    }
    if (clientSecret) {
      console.log('  - PAYPAL_CLIENT_SECRET length:', clientSecret.length);
      console.log('  - PAYPAL_CLIENT_SECRET starts with:', clientSecret.substring(0, 5) + '...');
    }
    
    if (!clientId || !clientSecret) {
      const errorMsg = 'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be configured in environment variables';
      console.error('❌ PayPal Configuration Error:', errorMsg);
      console.error('💡 Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to your .env file');
      throw new Error(errorMsg);
    }

    // Trim ve boş kontrolü
    const trimmedClientId = clientId.trim();
    const trimmedClientSecret = clientSecret.trim();
    
    if (trimmedClientId === '' || trimmedClientSecret === '') {
      const errorMsg = 'PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET cannot be empty';
      console.error('❌ PayPal Configuration Error:', errorMsg);
      throw new Error(errorMsg);
    }

    // Sadece açıkça placeholder olan değerleri kontrol et
    const placeholderPatterns = ['xxx', 'xxxxx', 'your_', 'YOUR_', 'placeholder', 'PLACEHOLDER', 'example', 'EXAMPLE', 'test', 'TEST'];
    const isPlaceholder = (value) => {
      const lowerValue = value.toLowerCase();
      return placeholderPatterns.some(pattern => lowerValue.includes(pattern.toLowerCase()));
    };

    // PayPal credentials genellikle 20+ karakter uzunluğundadır
    // Eğer çok kısa ise veya placeholder içeriyorsa hata ver
    if (isPlaceholder(trimmedClientId) || isPlaceholder(trimmedClientSecret) || 
        trimmedClientId.length < 20 || trimmedClientSecret.length < 20) {
      const errorMsg = 'Invalid PayPal credentials detected. Your credentials appear to be placeholder values. Please check your PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in .env file. Make sure they are valid PayPal Sandbox credentials from https://developer.paypal.com/';
      console.error('❌ PayPal Configuration Error:', errorMsg);
      console.error('💡 Current values:');
      console.error('   - PAYPAL_CLIENT_ID length:', trimmedClientId.length, '(should be 20+ characters)');
      console.error('   - PAYPAL_CLIENT_SECRET length:', trimmedClientSecret.length, '(should be 20+ characters)');
      console.error('💡 Get your PayPal Sandbox credentials from: https://developer.paypal.com/');
      console.error('   1. Go to https://developer.paypal.com/');
      console.error('   2. Log in or create an account');
      console.error('   3. Go to Dashboard > Sandbox > Apps > Create App');
      console.error('   4. Copy the Client ID and Secret');
      console.error('   5. Add them to your .env file');
      throw new Error(errorMsg);
    }

    try {
      const environment = process.env.NODE_ENV === 'production'
        ? new paypal.core.LiveEnvironment(clientId, clientSecret)
        : new paypal.core.SandboxEnvironment(clientId, clientSecret);

      paypalClientInstance = new paypal.core.PayPalHttpClient(environment);
      console.log('✅ PayPal client initialized successfully');
    } catch (err) {
      console.error('❌ PayPal client initialization error:', err.message);
      throw new Error(`PayPal client initialization failed: ${err.message}`);
    }
  }
  return paypalClientInstance;
};

module.exports = getPayPalClient;