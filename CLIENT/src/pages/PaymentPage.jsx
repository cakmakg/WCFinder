// pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import { COLORS, RADII, SHADOWS } from '../theme/designTokens';
import { OrderSummary } from '../components/payment/OrderSummary';
import { StripeCardForm } from '../components/payment/StripeCardForm';
import { PayPalButton } from '../components/payment/PayPalButton';
import { useSelector } from 'react-redux';
import api from '../services/api';

// Gemeinsame Feder-Animation für Bestätigungs-Icons (wie StartPage FlowDemo)
const spring = { type: 'spring', stiffness: 260, damping: 22 };

// Primär-Button im StartPage-Stil: Verlauf, Hover-Lift, Active-Scale
const PRIMARY_BUTTON_SX = {
  py: 1.5,
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: RADII.button,
  background: COLORS.primaryGradient,
  boxShadow: SHADOWS.brand,
  transition: 'all 0.2s ease',
  '&:hover': {
    background: COLORS.primaryGradientHover,
    boxShadow: SHADOWS.brandHover,
    transform: 'translateY(-1px)',
  },
  '&:active': { transform: 'scale(0.98)' },
  '&:disabled': { background: '#cbd5e1', color: 'white', boxShadow: 'none' },
};

const PaymentPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const bookingData = location.state;
  const { token } = useSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [_paymentId, setPaymentId] = useState(null); // ✅ Payment ID'yi sakla

  // Authentication kontrolü
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!token && !storedToken) {
      navigate('/login', { 
        state: { from: location.pathname },
        replace: true 
      });
    }
  }, [token, navigate, location.pathname]);

  if (!bookingData) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: COLORS.backgroundLight, py: 4 }}>
        <Container>
          <Alert severity="error" sx={{ borderRadius: RADII.button, boxShadow: SHADOWS.subtle }}>
            {t('payment.noBookingInfo')}
          </Alert>
          <Button
            onClick={() => navigate('/')}
            sx={{ mt: 2, color: COLORS.primary, textTransform: 'none', fontWeight: 600 }}
          >
            {t('common.backToHome')}
          </Button>
        </Container>
      </Box>
    );
  }

  // ✅ Booking bilgilerinden Stripe payment intent oluştur (usageId olmadan)
  const createStripePaymentIntent = async () => {
    // ✅ Çift tıklamayı engelle
    if (loading || clientSecret) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingDataForPayment = {
        businessId: bookingData.business.id,
        toiletId: bookingData.toilet.id,
        personCount: bookingData.personCount,
        startTime: new Date(bookingData.date).toISOString(),
        genderPreference: bookingData.userGender,
        totalAmount: bookingData.pricing.total,
      };

      // ✅ SECURITY: Sensitive booking data loglanmıyor
      if (import.meta.env.DEV) {
        console.log('📤 Creating Stripe payment from booking');
      }

      // Zentrale api-Instanz: Bearer-Token wird automatisch angehängt,
      // bei 401 wird der Token einmal erneuert und die Anfrage wiederholt.
      let data;
      try {
        const response = await api.post('/payments/stripe/create', {
          bookingData: bookingDataForPayment,
        });
        data = response.data;
      } catch (requestErr) {
        const status = requestErr.response?.status;
        const errorData = requestErr.response?.data || {};
        let errorMessage = errorData.message || errorData.error || "Payment intent creation failed";

        // 409 (Conflict - Duplicate) hatası için: Mevcut payment'i sorgula ve clientSecret'ı al
        if (status === 409) {
          if (import.meta.env.DEV) {
            console.log('⚠️ Duplicate payment detected, fetching existing payment...');
          }
          try {
            // Kullanıcının pending payment'lerini sorgula
            const paymentsResponse = await api.get('/payments/my-payments');
            const pendingPayments = paymentsResponse.data.result?.filter(p =>
              p.status === 'pending' &&
              p.paymentProvider === 'stripe' &&
              p.paymentIntentId
            );

            if (pendingPayments && pendingPayments.length > 0 && import.meta.env.DEV) {
              console.log('[PaymentPage] Found existing pending payment');
              console.log('[PaymentPage] Existing payment found but cannot retrieve clientSecret. Backend should handle this.');
            }

            errorMessage = 'Eine Zahlung für diese Buchung existiert bereits. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
          } catch (fetchErr) {
            if (import.meta.env.DEV) {
              console.error('❌ Error fetching existing payment:', fetchErr);
            }
            errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
          }
        }

        // 429 (Too Many Requests) hatası için özel mesaj
        if (status === 429) {
          const retryAfter = requestErr.response?.headers?.['retry-after'];
          if (retryAfter) {
            errorMessage = `Zu viele Anfragen. Bitte versuchen Sie es in ${Math.ceil(parseInt(retryAfter) / 60)} Minuten erneut.`;
          } else {
            errorMessage = 'Zu viele Anfragen. Bitte versuchen Sie es in ein paar Minuten erneut.';
          }
        }

        if (import.meta.env.DEV) {
          console.error('[PaymentPage] Stripe payment creation error, status:', status);
        }
        throw new Error(errorMessage);
      }
      // ✅ SECURITY: Sensitive data (clientSecret) loglanmıyor
      if (import.meta.env.DEV) {
        console.log('[PaymentPage] Stripe response received, status:', data.result?.paymentIntentStatus);
      }
      
      // ✅ Response formatını kontrol et
      if (!data.result || !data.result.clientSecret) {
        if (import.meta.env.DEV) {
          console.error('[PaymentPage] Invalid Stripe response format');
        }
        throw new Error('Ungültige Antwort vom Server. Bitte versuchen Sie es erneut.');
      }
      
      setClientSecret(data.result.clientSecret);
      setPaymentId(data.result.paymentId);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[PaymentPage] Stripe error:', err.message);
      }
      const errorMessage = err.message || err.response?.data?.message || t('payment.paymentInitError');
      setError(errorMessage);
      // Hata durumunda clientSecret'ı sıfırla ki kullanıcı tekrar deneyebilsin
      setClientSecret(null);
      setPaymentId(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Booking bilgilerinden PayPal order oluştur (usageId olmadan)
  const createPayPalOrder = async () => {
    // ✅ Çift tıklamayı engelle
    if (loading || paypalOrderId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingDataForPayment = {
        businessId: bookingData.business.id,
        toiletId: bookingData.toilet.id,
        personCount: bookingData.personCount,
        startTime: new Date(bookingData.date).toISOString(),
        genderPreference: bookingData.userGender,
        totalAmount: bookingData.pricing.total,
      };

      if (import.meta.env.DEV) {
        console.log('📤 Creating PayPal order from booking');
      }

      // Zentrale api-Instanz: Bearer-Token + automatischer Refresh bei 401
      let data;
      try {
        const response = await api.post('/payments/paypal/create', {
          bookingData: bookingDataForPayment,
        });
        data = response.data;
      } catch (requestErr) {
        const status = requestErr.response?.status;
        const errorData = requestErr.response?.data || {};
        let errorMessage = errorData.message || errorData.error || "PayPal order creation failed";

        // 429 (Too Many Requests) hatası için özel mesaj
        if (status === 429) {
          const retryAfter = requestErr.response?.headers?.['retry-after'];
          if (retryAfter) {
            errorMessage = `Zu viele Anfragen. Bitte versuchen Sie es in ${Math.ceil(parseInt(retryAfter) / 60)} Minuten erneut.`;
          } else {
            errorMessage = 'Zu viele Anfragen. Bitte versuchen Sie es in ein paar Minuten erneut.';
          }
        }

        // PayPal credentials hatası için özel mesaj
        if (errorMessage.includes('PayPal credentials') || errorMessage.includes('placeholder') || errorMessage.includes('Invalid PayPal')) {
          errorMessage = 'PayPal ist derzeit nicht konfiguriert. Bitte kontaktieren Sie den Administrator oder verwenden Sie die Kreditkartenzahlung.';
        }

        if (import.meta.env.DEV) {
          console.error('[PaymentPage] PayPal creation error, status:', status);
        }
        throw new Error(errorMessage);
      }
      if (import.meta.env.DEV) {
        console.log('✅ PayPal response received');
      }
      
      setPaypalOrderId(data.result.orderId);
      setPaymentId(data.result.paymentId); // ✅ Payment ID'yi sakla
      return data.result.orderId;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[PaymentPage] PayPal error:', err.message);
      }
      const errorMessage = err.message || err.response?.data?.message || t('payment.paymentInitError');
      setError(errorMessage);
      // Hata durumunda paypalOrderId'yi sıfırla ki kullanıcı tekrar deneyebilsin
      setPaypalOrderId(null);
      setPaymentId(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // ✅ Ödeme başarılı oldu, backend'de usage oluştur
      const paymentIntentId = paymentResult.id; // Stripe payment intent ID
      
      if (!paymentIntentId) {
        throw new Error('Payment intent ID not found');
      }

      // ✅ Backend'den payment'i confirm et ve usage oluştur
      // Zentrale api-Instanz: Bearer-Token + automatischer Refresh bei 401
      if (import.meta.env.DEV) {
        console.log('📤 Confirming payment and creating usage...');
      }
      let confirmData;
      try {
        const confirmResponse = await api.post('/payments/stripe/confirm', { paymentIntentId });
        confirmData = confirmResponse.data;
      } catch (requestErr) {
        const errorData = requestErr.response?.data || {};
        throw new Error(errorData.message || 'Failed to confirm payment');
      }
      const usageId = confirmData.result?.usageId;
      const confirmedPaymentId = confirmData.result?.paymentId;

      if (import.meta.env.DEV) {
        console.log('[PaymentPage] Payment confirmed, usage created');
      }

      // ✅ Success sayfasına yönlendir
      navigate('/payment/success', {
        state: {
          bookingData: {
            ...bookingData,
            usageId, // Backend'den gelen usage ID
          },
          paymentResult: {
            ...paymentResult,
            paymentId: confirmedPaymentId,
          },
          transactionId: paymentIntentId,
        },
      });
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[PaymentPage] Error in handlePaymentSuccess:', err.message);
      }
      setError('Fehler beim Erstellen der Reservierung. Bitte kontaktieren Sie den Support.');
    }
  };

  // ✅ PayPal: capture backend'de usage'ı zaten oluşturuyor — stripe/confirm ÇAĞRILMAZ.
  // Yanıt bir Payment dokümanıdır (usageId, transactionId, paymentMethod içerir).
  const handlePayPalSuccess = (payment) => {
    const usageId = payment?.usageId;

    if (!usageId) {
      if (import.meta.env.DEV) {
        console.error('[PaymentPage] PayPal capture returned no usageId');
      }
      setError('Fehler beim Erstellen der Reservierung. Bitte kontaktieren Sie den Support.');
      return;
    }

    navigate('/payment/success', {
      state: {
        bookingData: {
          ...bookingData,
          usageId,
          paymentMethod: 'paypal',
        },
        paymentResult: payment,
        transactionId: payment.transactionId || payment._id,
      },
    });
  };

  const handlePaymentError = (error) => {
    if (import.meta.env.DEV) {
      console.error('[PaymentPage] Payment error:', error?.message);
    }
    setError(t('payment.paymentFailed'));
    // State'i sıfırla
    setClientSecret(null);
    setPaypalOrderId(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: COLORS.backgroundLight }}>
      {/* ── Gradient Hero Header ── */}
      <Box
        component="header"
        sx={{
          background: COLORS.primaryGradient,
          pt: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -40, right: -40,
            width: 200, height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate(-1)}
            size="small"
            sx={{
              mb: 2.5,
              color: 'rgba(255,255,255,0.85)',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: '20px',
              px: 2,
              py: 0.5,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
              },
            }}
          >
            Zurück
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '1.6rem', sm: '2rem' },
                  color: 'white',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                {t('payment.title')}
              </Typography>
              <Typography sx={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>
                Sichere &amp; schnelle Bezahlung
              </Typography>
            </Box>
            <SecurityIcon sx={{ fontSize: '2.8rem', color: 'rgba(255,255,255,0.18)', flexShrink: 0 }} />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: RADII.button,
              boxShadow: SHADOWS.subtle,
              '& .MuiAlert-icon': { color: '#ef4444' },
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={2.5}>
          {/* Left Column - Payment Methods */}
          <Grid size={{ xs: 12, md: 7 }}>
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
            >
            <Paper
              sx={{
                p: 3,
                mb: 2.5,
                borderRadius: RADII.panel,
                boxShadow: SHADOWS.subtle,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <Typography
                sx={{
                  mb: 2.5,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: COLORS.primary,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {t('payment.paymentMethod')}
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => {
                    setPaymentMethod(e.target.value);
                    // Payment method değiştiğinde state'i sıfırla
                    setClientSecret(null);
                    setPaypalOrderId(null);
                  }}
                >
                  {/* Credit Card */}
                  <Card
                    sx={{
                      mb: 2,
                      border: paymentMethod === 'card' ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                      borderRadius: RADII.card,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: COLORS.primary,
                        boxShadow: SHADOWS.subtle,
                      },
                      backgroundColor: paymentMethod === 'card' ? COLORS.accentBoxBg : COLORS.backgroundWhite,
                    }}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Radio
                          value="card"
                          checked={paymentMethod === 'card'}
                          sx={{ '&.Mui-checked': { color: COLORS.primary } }}
                        />
                        <CreditCardIcon sx={{ fontSize: '2rem', color: COLORS.primary, mx: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: COLORS.textHeading }}>
                            {t('payment.creditCard')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            {t('payment.creditCardDescription')}
                          </Typography>
                        </Box>
                        {paymentMethod === 'card' && (
                          <motion.span
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={spring}
                            style={{ display: 'inline-flex' }}
                          >
                            <CheckCircleIcon sx={{ color: COLORS.primary, fontSize: '1.5rem' }} />
                          </motion.span>
                        )}
                      </Box>
                    </CardContent>
                  </Card>

                  {/* PayPal */}
                  <Card
                    sx={{
                      border: paymentMethod === 'paypal' ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
                      borderRadius: RADII.card,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: COLORS.primary,
                        boxShadow: SHADOWS.subtle,
                      },
                      backgroundColor: paymentMethod === 'paypal' ? COLORS.accentBoxBg : COLORS.backgroundWhite,
                    }}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Radio
                          value="paypal"
                          checked={paymentMethod === 'paypal'}
                          sx={{ '&.Mui-checked': { color: COLORS.primary } }}
                        />
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 2
                          }}
                        >
                          <svg width="32" height="32" viewBox="0 0 24 24" fill={COLORS.primary}>
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l1.12-7.106c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.294-1.867.001-3.137-1.012-4.287C19.654.543 17.645 0 15.076 0h-7.46c-.524 0-.972.382-1.054.901L3.455 20.437a.641.641 0 0 0 .633.74h4.606l1.187-7.527h2.19c4.298 0 7.664-1.747 8.647-6.797z"/>
                          </svg>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: COLORS.textHeading }}>
                            {t('payment.paypal')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                            {t('payment.paypalDescription')}
                          </Typography>
                        </Box>
                        {paymentMethod === 'paypal' && (
                          <motion.span
                            initial={reduce ? false : { scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={spring}
                            style={{ display: 'inline-flex' }}
                          >
                            <CheckCircleIcon sx={{ color: COLORS.primary, fontSize: '1.5rem' }} />
                          </motion.span>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 2.5, borderColor: COLORS.border }} />

              {/* Payment Form Area */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: COLORS.primary }} />
                </Box>
              ) : (
                <>
                  {/* Stripe Card Form */}
                  {paymentMethod === 'card' && (
                    <Box>
                      {(() => {
                        // ✅ SECURITY: Debug log sadece development'ta
                        if (import.meta.env.DEV) {
                          console.log('🔍 Payment Form Debug:', {
                            clientSecret: clientSecret ? 'SET' : 'NULL',
                            paymentMethod,
                            loading,
                            stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'MISSING',
                          });
                        }
                        return null;
                      })()}
                      {/* ✅ SECURITY: Stripe key kontrolü - eğer yoksa kullanıcıya bilgi ver */}
                      {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
                       !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_') ? (
                        <Alert severity="warning" sx={{ mb: 2, borderRadius: RADII.button }}>
                          Stripe ist derzeit nicht konfiguriert. Bitte verwenden Sie PayPal oder kontaktieren Sie den Administrator.
                        </Alert>
                      ) : !clientSecret ? (
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={createStripePaymentIntent}
                          disabled={loading}
                          startIcon={!loading && <LockIcon />}
                          sx={PRIMARY_BUTTON_SX}
                        >
                          {loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            `€ ${bookingData.pricing.total.toFixed(2)} Zahlung starten`
                          )}
                        </Button>
                      ) : (
                        <>
                          {/* ✅ SECURITY: Stripe key ve clientSecret kontrolü */}
                          {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && 
                           import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY.startsWith('pk_') && 
                           clientSecret ? (
                            <>
                              {/* ✅ SECURITY: clientSecret loglanmıyor */}
                              <StripeCardForm
                                clientSecret={clientSecret}
                                amount={bookingData.pricing.total}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                              />
                            </>
                          ) : (
                            <Alert severity="error" sx={{ mb: 2, borderRadius: RADII.button }}>
                              Stripe ist derzeit nicht verfügbar. Bitte verwenden Sie PayPal oder kontaktieren Sie den Administrator.
                            </Alert>
                          )}
                        </>
                      )}
                    </Box>
                  )}

                  {/* PayPal Button */}
                  {paymentMethod === 'paypal' && (
                    <Box>
                      {!paypalOrderId ? (
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={createPayPalOrder}
                          disabled={loading}
                          startIcon={!loading && <LockIcon />}
                          sx={PRIMARY_BUTTON_SX}
                        >
                          {loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            `€ ${bookingData.pricing.total.toFixed(2)} PayPal-Zahlung starten`
                          )}
                        </Button>
                      ) : (
                        <PayPalButton
                          usageId={paypalOrderId}
                          amount={bookingData.pricing.total}
                          onSuccess={handlePayPalSuccess}
                          onError={handlePaymentError}
                        />
                      )}
                    </Box>
                  )}
                </>
              )}
            </Paper>

            {/* Security Notice — SSL-Vertrauenssignal */}
            <Paper
              sx={{
                p: 2.5,
                borderRadius: RADII.card,
                backgroundColor: COLORS.accentBoxBg,
                borderLeft: `3px solid ${COLORS.primary}`,
                boxShadow: 'none',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LockIcon sx={{ color: COLORS.primary, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textHeading }}>
                    {t('payment.securePayment')} – SSL-verschlüsselt
                  </Typography>
                  <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                    {t('payment.securePaymentDescription')}
                  </Typography>
                </Box>
              </Box>
            </Paper>
            </motion.div>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{
              position: { xs: 'static', md: 'sticky' },
              top: { md: 24 }
            }}>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: reduce ? 0 : 0.1 }}
              >
                <OrderSummary bookingData={bookingData} />
              </motion.div>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentPage;
