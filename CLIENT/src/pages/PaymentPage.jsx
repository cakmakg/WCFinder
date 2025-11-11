// pages/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  FormControlLabel,
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
import { PaymentMethodCard } from '../components/payment/PaymentMethodCard';
import { OrderSummary } from '../components/payment/OrderSummary';
import { StripeCardForm } from '../components/payment/StripeCardForm';
import { PayPalButton } from '../components/payment/PayPalButton';
import paymentService from '../services/paymentService';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [usageId, setUsageId] = useState(null);

  if (!bookingData) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
        <Container>
          <Alert 
            severity="error"
            sx={{ 
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
            }}
          >
            Keine Buchungsinformationen gefunden
          </Alert>
          <Button 
            onClick={() => navigate('/')} 
            sx={{ 
              mt: 2,
              color: '#0891b2',
              '&:hover': { backgroundColor: 'rgba(8,145,178,0.08)' }
            }}
          >
            Zurück zur Startseite
          </Button>
        </Container>
      </Box>
    );
  }

  useEffect(() => {
    if (paymentMethod === 'card' && bookingData?.usageId) {
      createStripePaymentIntent();
    }
  }, [paymentMethod, bookingData]);

  const createStripePaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating Stripe payment for usageId:', bookingData.usageId);

      const response = await paymentService.createStripePayment(bookingData.usageId);
      
      console.log('Stripe response:', response);
      
      setClientSecret(response.result.clientSecret);
      setUsageId(response.result.paymentId);
    } catch (err) {
      console.error('Stripe error:', err);
      setError(err.response?.data?.message || 'Fehler beim Initialisieren der Zahlung');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentResult) => {
    navigate('/payment/success', {
      state: {
        bookingData,
        paymentResult,
        transactionId: paymentResult.id,
      },
    });
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setError('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
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
            Zahlung
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Wählen Sie Ihre bevorzugte Zahlungsmethode
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
          <Grid item xs={12} md={7}>
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
                Zahlungsmethode
              </Typography>

              <FormControl component="fieldset" fullWidth>
                <RadioGroup
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
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
                            Kredit- oder Debitkarte
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Visa, Mastercard, American Express
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
                            PayPal
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            Zahlen Sie sicher mit PayPal
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
                  {paymentMethod === 'card' && clientSecret && (
                    <StripeCardForm
                      clientSecret={clientSecret}
                      amount={bookingData.pricing.total}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  )}

                  {/* PayPal Button */}
                  {paymentMethod === 'paypal' && bookingData.usageId && (
                    <PayPalButton
                      usageId={bookingData.usageId}
                      amount={bookingData.pricing.total}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
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
                    Sichere Zahlung
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0369a1' }}>
                    Ihre Zahlung ist durch SSL-Verschlüsselung geschützt
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column - Order Summary */}
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              position: { xs: 'static', md: 'sticky' }, // Mobile'da sticky kaldır
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