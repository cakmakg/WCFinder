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
import LockIcon from '@mui/icons-material/Lock';

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

const INPUT_SX = {
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#0891b2',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#0891b2',
  },
};

export const StripeCardForm = ({ clientSecret, onSuccess, onError, amount }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardholderName, setCardholderName] = useState('');
  const [billingEmail, setBillingEmail] = useState('');

  // ✅ SECURITY: Stripe ve Elements kontrolü
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

      if (import.meta.env.DEV) {
        console.log('[StripeCardForm] Confirming payment intent...');
      }

      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (import.meta.env.DEV) {
        console.log('[StripeCardForm] Payment confirmation response:', {
          hasError: !!confirmError,
          errorCode: confirmError?.code,
          status: paymentIntent?.status,
        });
      }

      if (confirmError) {
        let errorMessage = confirmError.message || 'Zahlung fehlgeschlagen';

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

        if (import.meta.env.DEV) {
          console.error('[StripeCardForm] Payment confirmation error:', confirmError.code, confirmError.type);
        }

        throw new Error(errorMessage);
      }

      if (paymentIntent.status === 'succeeded') {
        if (import.meta.env.DEV) {
          console.log('[StripeCardForm] Payment succeeded');
        }
        onSuccess(paymentIntent);
      } else {
        if (import.meta.env.DEV) {
          console.error('[StripeCardForm] Payment intent status is not succeeded:', paymentIntent.status);
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
        sx={INPUT_SX}
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
        sx={INPUT_SX}
      />

      <Box
        sx={{
          p: 2,
          border: '1.5px solid rgba(8,145,178,0.2)',
          borderRadius: '12px',
          mb: 2,
          bgcolor: 'background.paper',
          transition: 'border-color 0.2s',
          '&:focus-within': {
            borderColor: '#0891b2',
          },
        }}
      >
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={!stripe || processing}
        startIcon={!processing && <LockIcon />}
        sx={{
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 700,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0284c7 0%, #0e7490 100%)',
          },
          '&:disabled': {
            background: '#94a3b8',
            color: 'white',
          },
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
