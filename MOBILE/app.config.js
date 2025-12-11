/**
 * Expo App Configuration
 * 
 * Environment-based configuration for different build profiles
 * Supports: development, staging, production
 */

export default ({ config }) => {
  // Get environment from process.env or default to development
  const env = process.env.EXPO_PUBLIC_ENV || process.env.NODE_ENV || 'development';
  
  // API URLs for different environments
  // ⚠️ ÖNEMLİ: Web uygulaması ile aynı backend URL'ini kullanın!
  // Web uygulaması: https://wcfinder-production.up.railway.app
  const apiUrls = {
    // Development: Web uygulaması ile aynı backend URL'ini kullan
    development: process.env.EXPO_PUBLIC_API_URL || 'https://wcfinder-production.up.railway.app',  // ← Web ile aynı backend
    staging: process.env.EXPO_PUBLIC_API_URL || 'https://wcfinder-production.up.railway.app',  // ← Staging (varsa)
    production: process.env.EXPO_PUBLIC_API_URL || 'https://wcfinder-production.up.railway.app',  // ← Production Railway URL (Web ile aynı)
  };

  const apiUrl = apiUrls[env] || apiUrls.development;

  return {
    ...config,
    name: env === 'production' ? 'WCFinder' : `WCFinder (${env})`,
    slug: 'wcfinder',
    extra: {
      apiUrl,
      env,
      // Add other environment variables here
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_KEY || '',
      paypalClientId: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID || '',
    },
    ios: {
      ...config.ios,
      bundleIdentifier: 'com.wcfinder.app',
      config: {
        usesNonExemptEncryption: false,
      },
    },
    android: {
      ...config.android,
      package: 'com.wcfinder.app',
    },
  };
};

