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
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent);
      } else {
        throw new Error('Zahlung fehlgeschlagen');
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