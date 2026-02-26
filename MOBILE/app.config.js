/**
 * Expo Dynamic Config
 *
 * Reads environment-specific values from .env (EXPO_PUBLIC_*) so that
 * app.json stays commit-safe and the same build works on any machine.
 *
 * NOTE: Must use CommonJS (module.exports), NOT ES module (export default).
 * Expo processes this file with Node.js directly; ESM syntax is not supported.
 */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    // API base URL — override via EXPO_PUBLIC_API_URL in .env
    // Physical device (same WiFi):  http://192.168.x.x:8000
    // iOS Simulator / Android Emu:  http://localhost:8000
    apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',

    // Stripe publishable key (pk_test_... or pk_live_...)
    stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_KEY || '',

    // PayPal client ID
    paypalClientId: process.env.EXPO_PUBLIC_PAYPAL_CLIENT_ID || '',
  },
});
