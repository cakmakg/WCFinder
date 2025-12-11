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
  const apiUrls = {
    development: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',
    staging: process.env.EXPO_PUBLIC_API_URL || 'https://your-staging-url.railway.app',
    production: process.env.EXPO_PUBLIC_API_URL || 'https://your-production-url.railway.app',
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

