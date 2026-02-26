import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, Divider } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import { getStatusColor, getStatusLabel, getPaymentStatusColor, getPaymentStatusLabel } from './bookingUtils';

const statusBorderColors = {
  confirmed: '#10b981',
  active: '#0891b2',
  pending: '#f59e0b',
  completed: '#64748b',
  cancelled: '#ef4444',
  expired: '#94a3b8',
};

const BookingCard = ({ booking, onViewDetails, onViewQR }) => {
  const borderColor = statusBorderColors[booking.status] || '#94a3b8';

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: '14px',
        borderLeft: `3px solid ${borderColor}`,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 8px 24px rgba(8,145,178,0.12)',
        },
      }}
      onClick={onViewDetails}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Status Badges */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={getStatusLabel(booking.status)}
            color={getStatusColor(booking.status)}
            size="small"
            sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600 }}
          />
          <Chip
            label={getPaymentStatusLabel(booking.paymentStatus)}
            color={getPaymentStatusColor(booking.paymentStatus)}
            size="small"
            sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600 }}
          />
        </Box>

        {/* Business Info */}
        <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
          {booking.businessId?.businessName || 'N/A'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          <LocationOnIcon sx={{ fontSize: '0.85rem', color: '#0891b2' }} />
          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
            {booking.businessId?.address?.street}, {booking.businessId?.address?.city}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Booking Details Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.85rem', color: '#64748b' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#334155' }}>
              {new Date(booking.startTime).toLocaleDateString('de-DE')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon sx={{ fontSize: '0.85rem', color: '#64748b' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#334155' }}>
              {booking.personCount} {booking.personCount === 1 ? 'Person' : 'Personen'}
            </Typography>
          </Box>
        </Box>

        {/* Price Box */}
        <Box
          sx={{
            backgroundColor: '#f0f9ff',
            borderLeft: '3px solid #0891b2',
            borderRadius: '10px',
            px: 1.5,
            py: 1,
            mb: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0891b2', fontSize: '1.1rem' }}>
            {'\u20AC'}{Number(booking.totalFee).toFixed(2)}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<InfoIcon sx={{ fontSize: '0.85rem !important' }} />}
            onClick={(e) => { e.stopPropagation(); onViewDetails(); }}
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                boxShadow: '0 2px 8px rgba(8,145,178,0.3)',
              },
            }}
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
                borderRadius: '10px',
                minWidth: 'auto',
                px: 1.5,
                color: '#0891b2',
                borderColor: '#0891b2',
                '&:hover': {
                  borderColor: '#0e7490',
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
          sx={{ display: 'block', mt: 1.5, fontSize: '0.7rem', color: '#94a3b8' }}
        >
          Reserviert am {new Date(booking.createdAt).toLocaleDateString('de-DE')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
