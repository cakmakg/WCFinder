import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Box, CircularProgress } from '@mui/material';

import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import Home from '../pages/Home';
import PrivateRouter from './PrivateRouter';
import AppLayout from '../components/layout/AppLayout';
import BusinessDetail from '../pages/BusinessDetail';
import PaymentPage from '../pages/PaymentPage';
import PaymentSuccessPage from '../pages/PaymentSuccessPage';
import PaymentFailedPage from '../pages/PaymentFailedPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import OwnerProfilePage from '../pages/OwnerProfilePage';
import StartPage from '../pages/StartPage';
import NotFoundPage from '../pages/NotFoundPage';
import Impressum from '../pages/Impressum';
import Datenschutz from '../pages/Datenschutz';
import AGB from '../pages/AGB';
import CookieConsent from '../components/legal/CookieConsent';

// Admin paneli lazy: recharts/jspdf/xlsx zinciri ana bundle'a girmesin
const AdminPanel = lazy(() => import('../pages/AdminPanel'));

const SuspenseFallback = (
  <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress sx={{ color: '#0891b2' }} />
  </Box>
);

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

if (import.meta.env.DEV) {
  console.log('Payment Config:', {
    stripe: stripePromise ? 'Configured' : 'Not configured',
    paypal: paypalOptions ? 'Configured' : 'Not configured',
  });
}

const AppRouter = () => {
  const content = (
    <Router>
      <Suspense fallback={SuspenseFallback}>
      <Routes>
        {/* ========== PUBLIC ROUTES (Login gerektirmez) ========== */}
        
        {/* StartPage */}
        <Route path="/" element={<StartPage />} />
        
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Home/Dashboard - PUBLIC! */}
        <Route path="/home" element={<Home />} />

        {/* Rechtliche Seiten - PUBLIC (Impressumspflicht, DSGVO) */}
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/agb" element={<AGB />} />
        
        {/* ========== PRIVATE ROUTES (Login gerektirir) ========== */}
        
        <Route element={<PrivateRouter />}>
          <Route element={<AppLayout />}>
          <Route path="/business/:id" element={<BusinessDetail />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/owner-profile" element={<OwnerProfilePage />} />
          </Route>
        </Route>

        {/* ========== 404 ========== */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
      <CookieConsent />
    </Router>
  );

  // Payment providers
  // PayPalScriptProvider her zaman render edilmeli (PayPalButtons kullanılıyorsa)
  // Eğer paypalOptions null ise, geçerli bir sandbox ID kullan
  const finalPaypalOptions = paypalOptions || {
    'client-id': 'test', // Test mode - script yüklenir ama gerçek ödeme yapılmaz
    currency: 'EUR',
    intent: 'capture',
  };

  // Her durumda PayPalScriptProvider ile sar (PayPalButtons için gerekli)
  let wrappedContent = (
    <PayPalScriptProvider 
      options={finalPaypalOptions}
    >
      {content}
    </PayPalScriptProvider>
  );

  // ✅ FIX: Elements provider'ı sadece Stripe key varsa render et
  // PaymentPage'de Stripe key kontrolü yapılıyor, sadece key varsa StripeCardForm render ediliyor
  // Bu sayede Elements provider olmadan StripeCardForm render edilmeyecek
  if (stripePromise) {
    wrappedContent = (
      <Elements stripe={stripePromise} options={{ locale: 'de' }}>
        {wrappedContent}
      </Elements>
    );
  }

  return wrappedContent;
};

export default AppRouter;