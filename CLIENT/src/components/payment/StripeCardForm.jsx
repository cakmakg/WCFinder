// src/components/payment/StripeCardForm.jsx

import React, { useState } from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
};

export const StripeCardForm = ({ clientSecret, onSuccess, onError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardholderName, setCardholderName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');

  // ✅ SECURITY: Stripe ve Elements kontrolü
  // Eğer Elements provider yoksa veya Stripe yüklenmediyse, hata göster
  if (!stripe || !elements) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Stripe ist derzeit nicht verfügbar. Bitte verwenden Sie PayPal oder kontaktieren Sie den Administrator.
      </Alert>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardholderName.trim()) {
      setError('Bitte geben Sie den Karteninhaber ein');
      return;
    }

    if (!billingEmail.trim()) {
      setError('Bitte geben Sie Ihre E-Mail-Adresse ein');
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Payment Method oluştur
      const { error: methodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          email: billingEmail,
        },
      });

      if (methodError) {
        throw new Error(methodError.message);
      }

      // Payment Intent'i onayla
      // ✅ SECURITY: clientSecret loglanmıyor (sensitive data)
      if (import.meta.env.DEV) {
        console.log('📤 [StripeCardForm] Confirming payment intent...', {
          paymentMethodId: paymentMethod.id
        });
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      // ✅ SECURITY: Sensitive data loglanmıyor, sadece development'ta detaylı log
      if (import.meta.env.DEV) {
        console.log('📥 [StripeCardForm] Payment confirmation response:', {
          error: confirmError ? {
            type: confirmError.type,
            code: confirmError.code,
            message: confirmError.message,
            decline_code: confirmError.decline_code,
            param: confirmError.param
          } : null,
          paymentIntent: paymentIntent ? {
            id: paymentIntent.id,
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
          } : null
        });
      }

      if (confirmError) {
        // Daha detaylı hata mesajları
        let errorMessage = confirmError.message || 'Zahlung fehlgeschlagen';
        
        // ✅ 402 (Payment Required) hatası için özel kontrol
        // Bu hata genellikle payment intent'in zaten confirm edilmiş olmasından kaynaklanır
        if (confirmError.code === 'payment_intent_unexpected_state' || 
            confirmError.message?.includes('402') ||
            confirmError.message?.toLowerCase().includes('payment required')) {
          errorMessage = 'Diese Zahlung wurde bereits verarbeitet. Bitte starten Sie eine neue Zahlung.';
        } else if (confirmError.code === 'card_declined') {
          errorMessage = 'Ihre Karte wurde abgelehnt. Bitte verwenden Sie eine andere Karte oder kontaktieren Sie Ihre Bank.';
        } else if (confirmError.code === 'insufficient_funds') {
          errorMessage = 'Unzureichende Mittel auf Ihrer Karte. Bitte verwenden Sie eine andere Karte.';
        } else if (confirmError.code === 'expired_card') {
          errorMessage = 'Ihre Karte ist abgelaufen. Bitte verwenden Sie eine andere Karte.';
        } else if (confirmError.code === 'incorrect_cvc') {
          errorMessage = 'Der CVC-Code ist falsch. Bitte überprüfen Sie Ihre Kartendaten.';
        } else if (confirmError.code === 'processing_error') {
          errorMessage = 'Ein Fehler ist beim Verarbeiten Ihrer Zahlung aufgetreten. Bitte versuchen Sie es erneut.';
        } else if (confirmError.type === 'card_error') {
          errorMessage = `Kartenfehler: ${confirmError.message}`;
        } else if (confirmError.type === 'validation_error') {
          errorMessage = `Validierungsfehler: ${confirmError.message}`;
        }
        
        // ✅ SECURITY: Production'da sadece gerekli hata bilgisi loglanıyor
        if (import.meta.env.DEV) {
          console.error('❌ [StripeCardForm] Payment confirmation error:', {
            type: confirmError.type,
            code: confirmError.code,
            message: confirmError.message,
            decline_code: confirmError.decline_code,
            param: confirmError.param
          });
        }
        
        throw new Error(errorMessage);
      }

      if (paymentIntent.status === 'succeeded') {
        if (import.meta.env.DEV) {
          console.log('✅ [StripeCardForm] Payment succeeded:', paymentIntent.id);
        }
        onSuccess(paymentIntent);
      } else {
        if (import.meta.env.DEV) {
          console.error('❌ [StripeCardForm] Payment intent status is not succeeded:', paymentIntent.status);
        }
        throw new Error(`Zahlung fehlgeschlagen. Status: ${paymentIntent.status}`);
      }
    } catch (err) {
      setError(err.message);
      onError(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <TextField
        fullWidth
        label="Karteninhaber"
        placeholder="Max Mustermann"
        value={cardholderName}
        onChange={(e) => setCardholderName(e.target.value)}
        required
        disabled={processing}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        type="email"
        label="E-Mail"
        placeholder="max@example.com"
        value={billingEmail}
        onChange={(e) => setBillingEmail(e.target.value)}
        required
        disabled={processing}
        sx={{ mb: 2 }}
      />

      <Box
        sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          mb: 2,
          bgcolor: 'background.paper',
        }}
      >
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={!stripe || processing}
        sx={{
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
        }}
      >
        {processing ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          `€ ${amount.toFixed(2)} Jetzt bezahlen`
        )}
      </Button>
    </Box>
  );
};