import React from 'react';
import { Card, CardContent, Box, Typography, Chip, Button, Divider } from '@mui/material';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import { getStatusColor, getStatusLabel, getPaymentStatusColor, getPaymentStatusLabel } from './bookingUtils';

const BookingCard = ({ booking, onViewDetails, onViewQR }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }
      }}
      onClick={onViewDetails}
    >
      <CardContent sx={{ p: 2 }}>
        {/* Status Badges */}
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip 
            label={getStatusLabel(booking.status)} 
            color={getStatusColor(booking.status)}
            size="small"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
          <Chip 
            label={getPaymentStatusLabel(booking.paymentStatus)} 
            color={getPaymentStatusColor(booking.paymentStatus)}
            size="small"
            sx={{ fontSize: '0.7rem', height: 24 }}
          />
        </Box>

        {/* Business Info */}
        <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 600, fontSize: '0.95rem' }}>
          {booking.businessId?.businessName || 'N/A'}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationOnIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            {booking.businessId?.address?.street}, {booking.businessId?.address?.city}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Booking Details */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {new Date(booking.startTime).toLocaleDateString('de-DE')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleIcon fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
              {booking.personCount}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mt: 1, color: 'primary.main', fontSize: '1.1rem', fontWeight: 700 }}>
          €{Number(booking.totalFee).toFixed(2)}
        </Typography>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
          <Button
            fullWidth
            variant="contained"
            size="small"
            startIcon={<InfoIcon />}
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
            sx={{ fontSize: '0.75rem' }}
          >
            Details
          </Button>
          {booking.accessCode && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<QrCodeIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onViewQR();
              }}
              sx={{ fontSize: '0.75rem', minWidth: 'auto', px: 1 }}
            >
              QR
            </Button>
          )}
        </Box>

        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ display: 'block', mt: 1, fontSize: '0.7rem' }}
        >
          Reserviert am {new Date(booking.createdAt).toLocaleDateString('de-DE')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default BookingCard;

