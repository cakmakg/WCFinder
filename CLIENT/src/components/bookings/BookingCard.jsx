import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, Divider } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import { getStatusLabel, getPaymentStatusLabel } from './bookingUtils';
import { COLORS, RADII, SHADOWS } from '../../theme/designTokens';

// Weiche Pill-Farben je Status — gleiche Semantik wie bookingUtils.getStatusColor
const STATUS_CHIP_COLORS = {
  pending: { bg: '#fffbeb', fg: '#b45309' },
  confirmed: { bg: '#ecfdf5', fg: '#047857' },
  active: { bg: COLORS.accentBoxBg, fg: COLORS.primary },
  completed: { bg: '#f1f5f9', fg: COLORS.textSecondary },
  cancelled: { bg: '#fef2f2', fg: '#dc2626' },
  expired: { bg: '#f1f5f9', fg: COLORS.textSecondary },
};

const PAYMENT_CHIP_COLORS = {
  pending: { bg: '#fffbeb', fg: '#b45309' },
  paid: { bg: '#ecfdf5', fg: '#047857' },
  failed: { bg: '#fef2f2', fg: '#dc2626' },
  refunded: { bg: '#f1f5f9', fg: COLORS.textSecondary },
};

const FALLBACK_CHIP = { bg: '#f1f5f9', fg: COLORS.textSecondary };

const pillChipSx = (palette = FALLBACK_CHIP) => ({
  borderRadius: '999px',
  height: 24,
  fontSize: '0.72rem',
  fontWeight: 600,
  backgroundColor: palette.bg,
  color: palette.fg,
  '& .MuiChip-label': { px: 1.25 },
});

const gradientButtonSx = {
  background: COLORS.primaryGradient,
  color: 'white',
  borderRadius: RADII.button,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: SHADOWS.brand,
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    background: COLORS.primaryGradientHover,
    transform: 'translateY(-1px)',
    boxShadow: SHADOWS.brandHover,
  },
  '&:active': { transform: 'translateY(0) scale(0.98)' },
};

const BookingCard = ({ booking, onViewDetails, onViewQR }) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        backgroundColor: 'white',
        border: `1px solid ${COLORS.border}`,
        borderRadius: RADII.card,
        boxShadow: SHADOWS.subtle,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: SHADOWS.hover,
        },
      }}
      onClick={onViewDetails}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Status-Pills */}
        <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={getStatusLabel(booking.status)}
            size="small"
            sx={pillChipSx(STATUS_CHIP_COLORS[booking.status])}
          />
          <Chip
            label={getPaymentStatusLabel(booking.paymentStatus)}
            size="small"
            sx={pillChipSx(PAYMENT_CHIP_COLORS[booking.paymentStatus])}
          />
        </Box>

        {/* Standort-Info */}
        <Typography
          variant="subtitle1"
          sx={{
            mb: 0.5,
            fontWeight: 700,
            fontSize: '0.95rem',
            color: COLORS.textHeading,
            letterSpacing: '-0.01em',
          }}
        >
          {booking.businessId?.businessName || 'N/A'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <LocationOnIcon sx={{ fontSize: '0.85rem', color: COLORS.primary }} />
          <Typography variant="caption" sx={{ color: COLORS.textSecondary, fontSize: '0.75rem' }}>
            {booking.businessId?.address?.street}, {booking.businessId?.address?.city}
          </Typography>
        </Box>

        <Divider sx={{ my: 1, borderColor: COLORS.border }} />

        {/* Detailzeile */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.85rem', color: COLORS.textSecondary }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: COLORS.textPrimary }}>
              {new Date(booking.startTime).toLocaleDateString('de-DE')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: '0.85rem', color: COLORS.textSecondary }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: COLORS.textPrimary }}>
              {booking.personCount} {booking.personCount === 1 ? 'Person' : 'Personen'}
            </Typography>
          </Box>
        </Box>

        {/* Preis-Akzentbox */}
        <Box
          sx={{
            backgroundColor: COLORS.accentBoxBg,
            borderLeft: `3px solid ${COLORS.primary}`,
            borderRadius: '10px',
            px: 1.5,
            py: 1,
            mb: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.primary, fontSize: '1.1rem' }}>
            {'€'}{Number(booking.totalFee).toFixed(2)}
          </Typography>
        </Box>

        {/* Aktionen */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<InfoIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            sx={{ ...gradientButtonSx, fontSize: '0.75rem' }}
          >
            Details
          </Button>
          {booking.accessCode && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<QrCodeIcon sx={{ fontSize: '0.85rem !important' }} />}
              onClick={(e) => { e.stopPropagation(); onViewQR(); }}
              sx={{
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: RADII.button,
                minWidth: 'auto',
                px: 1.5,
                color: COLORS.primary,
                borderColor: COLORS.primary,
                '&:hover': {
                  borderColor: COLORS.primaryDark,
                  backgroundColor: 'rgba(8,145,178,0.06)',
                },
              }}
            >
              QR
            </Button>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 1.5, fontSize: '0.7rem', color: COLORS.textLight }}
        >
          Reserviert am {new Date(booking.createdAt).toLocaleDateString('de-DE')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
