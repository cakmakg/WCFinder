// src/components/payment/PayPalButton.jsx

import React, { useState } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { Box, Alert } from '@mui/material';
import paymentService from '../../services/paymentService';

export const PayPalButton = ({ usageId, amount, onSuccess, onError }) => {
  const [error, setError] = useState(null);

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
            const response = await paymentService.createPayPalOrder(usageId);
            return response.result.orderId;
          } catch (err) {
            setError(err.response?.data?.message || 'Fehler beim Erstellen der Bestellung');
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