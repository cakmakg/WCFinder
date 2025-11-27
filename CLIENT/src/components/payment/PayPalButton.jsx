// src/components/payment/PayPalButton.jsx

import React, { useState } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { Box, Alert, CircularProgress } from '@mui/material';
import paymentService from '../../services/paymentService';

export const PayPalButton = ({ usageId, amount, onSuccess, onError }) => {
  const [error, setError] = useState(null);
  const [{ isResolved, isPending, isRejected }] = usePayPalScriptReducer();

  // PayPal script yüklenene kadar bekle
  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // PayPal script yüklenemediyse veya hata varsa
  if (isRejected || !isResolved) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        PayPal is not configured properly. Please check your environment variables (VITE_PAYPAL_CLIENT_ID).
      </Alert>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <PayPalButtons
        style={{
          layout: 'vertical',
          shape: 'rect',
          label: 'pay',
        }}
        createOrder={async () => {
          try {
            setError(null);
            // usageId zaten orderId (PaymentPage'de oluşturulmuş)
            if (usageId) {
              return usageId;
            }
            throw new Error('Order ID not found');
          } catch (err) {
            setError(err.message || 'Fehler beim Erstellen der Bestellung');
            onError(err);
            throw err;
          }
        }}
        onApprove={async (data) => {
          try {
            const response = await paymentService.capturePayPalOrder(data.orderID);
            onSuccess(response.result);
          } catch (err) {
            setError(err.response?.data?.message || 'Fehler bei der Zahlung');
            onError(err);
          }
        }}
        onError={(err) => {
          setError('PayPal-Fehler aufgetreten');
          onError(err);
        }}
      />
    </Box>
  );
};
