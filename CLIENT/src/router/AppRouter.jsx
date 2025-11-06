import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import PrivateRouter from './PrivateRouter';
import BusinessDetail from '../pages/BusinessDetail';
import PaymentPage from '../pages/PaymentPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentFailedPage from '../pages/PaymentFailedPage';
import MyBookingsPage from '../pages/MyBookingsPage';

// Stripe key kontrolü
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey && stripeKey.startsWith('pk_') 
  ? loadStripe(stripeKey) 
  : null;

// PayPal kontrolü - geçersiz ID'leri filtrele
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
  paypalId: paypalClientId ? `${paypalClientId.substring(0, 10)}...` : 'None',
});

const AppRouter = () => {
  // Conditional wrapper - sadece payment key'leri varsa kullan
  const content = (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRouter />}>
          <Route path="/" element={<Home />} />
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>
      </Routes>
    </Router>
  );

  // Sadece payment key'leri varsa provider'ları kullan
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

  // Payment provider'ları olmadan çalış
  return content;
};

export default AppRouter;