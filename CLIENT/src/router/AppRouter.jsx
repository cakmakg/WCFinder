import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import PrivateRouter from './PrivateRouter';
import AppLayout from '../components/layout/AppLayout';
import BusinessDetail from '../pages/BusinessDetail';
import PaymentPage from '../pages/PaymentPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentFailedPage from '../pages/PaymentFailedPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import StartPage from '../pages/StartPage';

// Stripe key kontrolü
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey && stripeKey.startsWith('pk_') 
  ? loadStripe(stripeKey) 
  : null;

// PayPal kontrolü
const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const isValidPayPalId = paypalClientId && 
  paypalClientId.length > 20 && 
  !paypalClientId.includes('xxx') && 
  paypalClientId.startsWith('A');

const paypalOptions = isValidPayPalId ? {
  'client-id': paypalClientId,
  currency: 'EUR',
  intent: 'capture',
} : null;

console.log('Payment Config:', {
  stripe: stripePromise ? 'Configured' : 'Not configured',
  paypal: paypalOptions ? 'Configured' : 'Not configured',
});

const AppRouter = () => {
  const content = (
    <Router>
      <Routes>
        {/* ========== PUBLIC ROUTES (Login gerektirmez) ========== */}
        
        {/* StartPage */}
        <Route path="/" element={<StartPage />} />
        
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Home/Dashboard - PUBLIC! */}
        <Route path="/home" element={<Home />} />
        
        {/* ========== PRIVATE ROUTES (Login gerektirir) ========== */}
        
        <Route element={<PrivateRouter />}>
          <Route element={<AppLayout />}>
            <Route path="/business/:id" element={<BusinessDetail />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );

  // Payment providers
  if (paypalOptions && stripePromise) {
    return (
      <PayPalScriptProvider options={paypalOptions}>
        <Elements stripe={stripePromise}>
          {content}
        </Elements>
      </PayPalScriptProvider>
    );
  }

  if (stripePromise) {
    return (
      <Elements stripe={stripePromise}>
        {content}
      </Elements>
    );
  }

  if (paypalOptions) {
    return (
      <PayPalScriptProvider options={paypalOptions}>
        {content}
      </PayPalScriptProvider>
    );
  }

  return content;
};

export default AppRouter;