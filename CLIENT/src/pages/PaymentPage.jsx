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
import { OrderSummary } from '../components/payment/OrderSummary';
import { StripeCardForm } from '../components/payment/StripeCardForm';
import { PayPalButton } from '../components/payment/PayPalButton';
import { useSelector } from 'react-redux';

const PaymentPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const { token, currentUser } = useSelector((state) => state.auth);

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [paypalOrderId, setPaypalOrderId] = useState(null);
  const [paymentId, setPaymentId] = useState(null); // ✅ Payment ID'yi sakla

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
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
        <Container>
          <Alert severity="error" sx={{ borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
            {t('payment.noBookingInfo')}
          </Alert>
          <Button onClick={() => navigate('/')} sx={{ mt: 2, color: '#0891b2' }}>
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

      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
      const baseURL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseURL}/payments/stripe/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingData: bookingDataForPayment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.message || errorData.error || "Payment intent creation failed";
        
        // 409 (Conflict - Duplicate) hatası için: Mevcut payment'i sorgula ve clientSecret'ı al
        if (response.status === 409) {
          if (import.meta.env.DEV) {
            console.log('⚠️ Duplicate payment detected, fetching existing payment...');
          }
          try {
            const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
            const baseURL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
            const token = localStorage.getItem("token");
            
            // Kullanıcının pending payment'lerini sorgula
            const paymentsResponse = await fetch(`${baseURL}/payments/my-payments`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (paymentsResponse.ok) {
              const paymentsData = await paymentsResponse.json();
              const pendingPayments = paymentsData.result?.filter(p => 
                p.status === 'pending' && 
                p.paymentProvider === 'stripe' &&
                p.paymentIntentId
              );
              
              if (pendingPayments && pendingPayments.length > 0) {
                // En son oluşturulan payment'i al
                const latestPayment = pendingPayments.sort((a, b) => 
                  new Date(b.createdAt) - new Date(a.createdAt)
                )[0];
                
                if (import.meta.env.DEV) {
                  console.log('✅ Found existing payment:', latestPayment._id);
                  console.log('⚠️ Existing payment found but cannot retrieve clientSecret. Backend should handle this.');
                }
                errorMessage = 'Eine Zahlung für diese Buchung existiert bereits. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
              }
            }
            
            // Eğer mevcut payment bulunamazsa, kullanıcıya bilgi ver
            errorMessage = 'Eine Zahlung für diese Buchung existiert bereits. Bitte warten Sie einen Moment und versuchen Sie es erneut.';
          } catch (fetchErr) {
            if (import.meta.env.DEV) {
              console.error('❌ Error fetching existing payment:', fetchErr);
            }
            errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
          }
        }
        
        // 429 (Too Many Requests) hatası için özel mesaj
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          if (retryAfter) {
            errorMessage = `Zu viele Anfragen. Bitte versuchen Sie es in ${Math.ceil(parseInt(retryAfter) / 60)} Minuten erneut.`;
          } else {
            errorMessage = 'Zu viele Anfragen. Bitte versuchen Sie es in ein paar Minuten erneut.';
          }
        }
        
        if (import.meta.env.DEV) {
          console.error('❌ Payment creation error:', errorData);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // ✅ SECURITY: Sensitive data (clientSecret) loglanmıyor
      if (import.meta.env.DEV) {
        console.log('✅ Stripe response received');
        console.log('✅ PaymentId:', data.result?.paymentId);
        console.log('✅ PaymentIntentStatus:', data.result?.paymentIntentStatus);
      }
      
      // ✅ Response formatını kontrol et
      if (!data.result || !data.result.clientSecret) {
        console.error('❌ Invalid response format');
        throw new Error('Ungültige Antwort vom Server. Bitte versuchen Sie es erneut.');
      }
      
      setClientSecret(data.result.clientSecret);
      setPaymentId(data.result.paymentId);
    } catch (err) {
      console.error('❌ Stripe error:', err);
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

      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
      const baseURL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseURL}/payments/paypal/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingData: bookingDataForPayment }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.message || errorData.error || "PayPal order creation failed";
        
        // 429 (Too Many Requests) hatası için özel mesaj
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
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
          console.error('❌ PayPal creation error:', errorData);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('✅ PayPal response received');
      }
      
      setPaypalOrderId(data.result.orderId);
      setPaymentId(data.result.paymentId); // ✅ Payment ID'yi sakla
      return data.result.orderId;
    } catch (err) {
      console.error('❌ PayPal error:', err);
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

      const baseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:8000";
      const baseURL = baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
      const token = localStorage.getItem("token");

      // ✅ Backend'den payment'i confirm et ve usage oluştur
      if (import.meta.env.DEV) {
        console.log('📤 Confirming payment and creating usage...');
      }
      const confirmResponse = await fetch(`${baseURL}/payments/stripe/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.message || 'Failed to confirm payment');
      }

      const confirmData = await confirmResponse.json();
      const usageId = confirmData.result?.usageId;
      const confirmedPaymentId = confirmData.result?.paymentId;

      if (import.meta.env.DEV) {
        console.log('✅ Payment confirmed, usage created:', usageId);
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
      console.error('❌ Error in handlePaymentSuccess:', err);
      setError('Fehler beim Erstellen der Reservierung. Bitte kontaktieren Sie den Support.');
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError(t('payment.paymentFailed'));
    // State'i sıfırla
    setClientSecret(null);
    setPaypalOrderId(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ 
              mb: 2,
              bgcolor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              '&:hover': {
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }
            }}
          >
            <ArrowBackIcon sx={{ color: '#0891b2' }} />
          </IconButton>

          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              mb: 0.5,
              color: '#1e293b'
            }}
          >
            {t('payment.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            {t('payment.subtitle')}
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
              backgroundColor: '#fee2e2',
              '& .MuiAlert-icon': {
                color: '#ef4444'
              }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Payment Methods */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                border: '1px solid #e2e8f0'
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 700,
                  color: '#1e293b'
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
                      border: paymentMethod === 'card' ? '2px solid #0891b2' : '1px solid #e2e8f0',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#0891b2',
                        boxShadow: '0 4px 12px rgba(8,145,178,0.15)',
                      },
                      backgroundColor: paymentMethod === 'card' ? '#f0f9ff' : 'white'
                    }}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Radio value="card" checked={paymentMethod === 'card'} />
                        <CreditCardIcon sx={{ fontSize: '2rem', color: '#0891b2', mx: 2 }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {t('payment.creditCard')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {t('payment.creditCardDescription')}
                          </Typography>
                        </Box>
                        {paymentMethod === 'card' && (
                          <CheckCircleIcon sx={{ color: '#0891b2', fontSize: '1.5rem' }} />
                        )}
                      </Box>
                    </CardContent>
                  </Card>

                  {/* PayPal */}
                  <Card
                    sx={{
                      border: paymentMethod === 'paypal' ? '2px solid #0891b2' : '1px solid #e2e8f0',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: '#0891b2',
                        boxShadow: '0 4px 12px rgba(8,145,178,0.15)',
                      },
                      backgroundColor: paymentMethod === 'paypal' ? '#f0f9ff' : 'white'
                    }}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Radio value="paypal" checked={paymentMethod === 'paypal'} />
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
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="#0891b2">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l1.12-7.106c.082-.518.526-.9 1.05-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.294-1.867.001-3.137-1.012-4.287C19.654.543 17.645 0 15.076 0h-7.46c-.524 0-.972.382-1.054.901L3.455 20.437a.641.641 0 0 0 .633.74h4.606l1.187-7.527h2.19c4.298 0 7.664-1.747 8.647-6.797z"/>
                          </svg>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {t('payment.paypal')}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {t('payment.paypalDescription')}
                          </Typography>
                        </Box>
                        {paymentMethod === 'paypal' && (
                          <CheckCircleIcon sx={{ color: '#0891b2', fontSize: '1.5rem' }} />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </RadioGroup>
              </FormControl>

              <Divider sx={{ my: 3, borderColor: '#e2e8f0' }} />

              {/* Payment Form Area */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#0891b2' }} />
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
                        <Alert severity="warning" sx={{ mb: 2 }}>
                          Stripe ist derzeit nicht konfiguriert. Bitte verwenden Sie PayPal oder kontaktieren Sie den Administrator.
                        </Alert>
                      ) : !clientSecret ? (
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          onClick={createStripePaymentIntent}
                          disabled={loading}
                          sx={{
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
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
                            <Alert severity="error" sx={{ mb: 2 }}>
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
                          sx={{
                            py: 1.5,
                            textTransform: 'none',
                            fontSize: '1rem',
                            fontWeight: 600,
                          }}
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
                          onSuccess={handlePaymentSuccess}
                          onError={handlePaymentError}
                        />
                      )}
                    </Box>
                  )}
                </>
              )}
            </Paper>

            {/* Security Notice */}
            <Paper 
              sx={{ 
                p: 2.5, 
                borderRadius: 2,
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LockIcon sx={{ color: '#0891b2', fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0891b2' }}>
                    {t('payment.securePayment')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0369a1' }}>
                    {t('payment.securePaymentDescription')}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ 
              position: { xs: 'static', md: 'sticky' },
              top: { md: 24 } 
            }}>
              <OrderSummary bookingData={bookingData} />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default PaymentPage;
