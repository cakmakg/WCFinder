// components/payment/OrderSummary.jsx
import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LockIcon from '@mui/icons-material/Lock';

export const OrderSummary = ({ bookingData, onPayment, processing }) => {
  const { business, date, personCount, pricing } = bookingData;

  return (
    <Paper
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        border: '1px solid rgba(8,145,178,0.1)',
      }}
    >
      {/* ── Gradient Header ── */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <ReceiptIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.3rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'white' }}>
          Buchungsübersicht
        </Typography>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ p: 3 }}>
        {/* Business Info */}
        <Box sx={{ mb: 2.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a', mb: 0.75 }}>
            {business.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: '0.9rem', color: '#0891b2', mt: '2px', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5 }}>
              {business.address?.street}, {business.address?.city}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)', mb: 2 }} />

        {/* Booking Details */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarTodayIcon sx={{ fontSize: '0.85rem', color: '#0891b2' }} />
              <Typography sx={{ fontSize: '0.83rem', color: '#64748b' }}>Datum</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#0f172a' }}>
              {new Date(date).toLocaleDateString('de-DE')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <PeopleIcon sx={{ fontSize: '0.85rem', color: '#0891b2' }} />
              <Typography sx={{ fontSize: '0.83rem', color: '#64748b' }}>Personen</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: '#0f172a' }}>
              {personCount}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: 'rgba(8,145,178,0.1)', mb: 2 }} />

        {/* Price Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
              € {pricing.basePrice.toFixed(2)} × {personCount} Personen
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#0f172a' }}>
              € {(pricing.basePrice * personCount).toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>Servicegebühr</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748b' }}>
              € {pricing.serviceFee.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Total Box */}
        <Box
          sx={{
            backgroundColor: '#f0f9ff',
            borderRadius: '12px',
            borderLeft: '3px solid #0891b2',
            px: 2,
            py: 1.75,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: onPayment ? 2.5 : 0,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
            Gesamtbetrag
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0891b2' }}>
            € {pricing.total.toFixed(2)}
          </Typography>
        </Box>

        {/* Pay Button (optional) */}
        {onPayment && (
          <Box
            component="button"
            onClick={onPayment}
            disabled={processing}
            sx={{
              width: '100%',
              py: 1.5,
              px: 2,
              border: 'none',
              borderRadius: '12px',
              cursor: processing ? 'not-allowed' : 'pointer',
              background: processing
                ? '#94a3b8'
                : 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              color: 'white',
              fontSize: '0.97rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'opacity 0.2s',
              '&:hover': { opacity: processing ? 1 : 0.9 },
            }}
          >
            <LockIcon sx={{ fontSize: '1rem' }} />
            {processing ? 'Verarbeitung...' : `€ ${pricing.total.toFixed(2)} Jetzt bezahlen`}
          </Box>
        )}
      </Box>
    </Paper>
  );
};
