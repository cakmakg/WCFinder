// components/payment/OrderSummary.jsx
import React from 'react';
import { Paper, Box, Typography, Divider } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LockIcon from '@mui/icons-material/Lock';
import { COLORS, RADII, SHADOWS } from '../../theme/designTokens';

export const OrderSummary = ({ bookingData, onPayment, processing }) => {
  const { business, date, personCount, pricing } = bookingData;

  return (
    <Paper
      sx={{
        borderRadius: RADII.panel,
        overflow: 'hidden',
        boxShadow: SHADOWS.subtle,
        border: `1px solid ${COLORS.border}`,
      }}
    >
      {/* ── Gradient Header ── */}
      <Box
        sx={{
          background: COLORS.primaryGradient,
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <ReceiptIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.3rem' }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: 'white', letterSpacing: '-0.02em' }}>
          Buchungsübersicht
        </Typography>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ p: 3 }}>
        {/* Business Info */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '0.95rem',
              color: COLORS.textHeading,
              letterSpacing: '-0.02em',
              mb: 0.75,
            }}
          >
            {business.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: '0.9rem', color: COLORS.primary, mt: '2px', flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, lineHeight: 1.5 }}>
              {business.address?.street}, {business.address?.city}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, mb: 2 }} />

        {/* Booking Details */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CalendarTodayIcon sx={{ fontSize: '0.85rem', color: COLORS.primary }} />
              <Typography sx={{ fontSize: '0.83rem', color: COLORS.textSecondary }}>Datum</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: COLORS.textHeading }}>
              {new Date(date).toLocaleDateString('de-DE')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <PeopleIcon sx={{ fontSize: '0.85rem', color: COLORS.primary }} />
              <Typography sx={{ fontSize: '0.83rem', color: COLORS.textSecondary }}>Personen</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.83rem', fontWeight: 600, color: COLORS.textHeading }}>
              {personCount}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: COLORS.border, mb: 2 }} />

        {/* Price Breakdown */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
              € {pricing.basePrice.toFixed(2)} × {personCount} Personen
            </Typography>
            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textHeading }}>
              € {(pricing.basePrice * personCount).toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>Servicegebühr</Typography>
            <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary }}>
              € {pricing.serviceFee.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Total Box — Accent-Box-Muster wie FlowDemo "Gesamt" */}
        <Box
          sx={{
            backgroundColor: COLORS.accentBoxBg,
            borderRadius: RADII.button,
            borderLeft: `3px solid ${COLORS.primary}`,
            px: 2,
            py: 1.75,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: onPayment ? 2.5 : 2,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: COLORS.textHeading }}>
            Gesamtbetrag
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: COLORS.primary }}>
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
              mb: 2,
              border: 'none',
              borderRadius: RADII.button,
              cursor: processing ? 'not-allowed' : 'pointer',
              background: processing ? '#cbd5e1' : COLORS.primaryGradient,
              boxShadow: processing ? 'none' : SHADOWS.brand,
              color: 'white',
              fontSize: '0.97rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              transition: 'all 0.2s ease',
              '&:hover': processing
                ? {}
                : {
                    background: COLORS.primaryGradientHover,
                    boxShadow: SHADOWS.brandHover,
                    transform: 'translateY(-1px)',
                  },
              '&:active': processing ? {} : { transform: 'scale(0.98)' },
            }}
          >
            <LockIcon sx={{ fontSize: '1rem' }} />
            {processing ? 'Verarbeitung...' : `€ ${pricing.total.toFixed(2)} Jetzt bezahlen`}
          </Box>
        )}

        {/* SSL-Vertrauenssignal */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
          <LockIcon sx={{ fontSize: '0.85rem', color: COLORS.textLight }} />
          <Typography sx={{ fontSize: '0.75rem', color: COLORS.textLight, fontWeight: 500 }}>
            SSL-verschlüsselt &amp; sicher bezahlen
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
