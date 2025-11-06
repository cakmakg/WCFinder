// components/payment/OrderSummary.jsx
import React from 'react';
import { Paper, Box, Typography, Divider, Button, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';

export const OrderSummary = ({ bookingData, onPayment, processing }) => {
  const { business, date, personCount, pricing } = bookingData;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Buchungsübersicht
      </Typography>

      {/* Business Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
          {business.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {business.address?.street}, {business.address?.city}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Booking Details */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon fontSize="small" color="action" />
            <Typography variant="body2">Datum</Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {new Date(date).toLocaleDateString('de-DE')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon fontSize="small" color="action" />
            <Typography variant="body2">Personen</Typography>
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {personCount}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Price Breakdown */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2">
            € {pricing.basePrice.toFixed(2)} × {personCount} Personen
          </Typography>
          <Typography variant="body2">
            € {(pricing.basePrice * personCount).toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Servicegebühr
          </Typography>
          <Typography variant="body2" color="text.secondary">
            € {pricing.serviceFee.toFixed(2)}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Total */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Gesamtbetrag
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          € {pricing.total.toFixed(2)}
        </Typography>
      </Box>

      {/* Pay Button */}
      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={onPayment}
        disabled={processing}
        sx={{ 
          py: 1.5,
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600
        }}
      >
        {processing ? 'Verarbeitung...' : `€ ${pricing.total.toFixed(2)} Jetzt bezahlen`}
      </Button>
    </Paper>
  );
};