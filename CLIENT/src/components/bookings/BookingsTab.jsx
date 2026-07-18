import React from 'react';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BookingCard from './BookingCard';
import { COLORS, RADII, SHADOWS } from '../../theme/designTokens';

const BookingsTab = ({ bookings, loading, onViewDetails, onViewQR }) => {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 6 },
            textAlign: 'center',
            backgroundColor: 'white',
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADII.card,
            boxShadow: SHADOWS.subtle,
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: RADII.panel,
              backgroundColor: COLORS.accentBoxBg,
              border: '1px solid #e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <CalendarTodayIcon sx={{ fontSize: 32, color: COLORS.primary }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em', mb: 0.75 }}
          >
            Noch keine Buchungen
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: COLORS.textSecondary, mb: 3, maxWidth: '42ch', mx: 'auto', lineHeight: 1.6 }}
          >
            Entdecken Sie saubere WC-Standorte in Ihrer Nähe und sichern Sie sich Ihren Zugang
            per QR-Code – ab 1,60 € pro Tag.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/home')}
            sx={{
              background: COLORS.primaryGradient,
              color: 'white',
              borderRadius: RADII.button,
              textTransform: 'none',
              fontWeight: 600,
              px: 3.5,
              py: 1.1,
              boxShadow: SHADOWS.brand,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                background: COLORS.primaryGradientHover,
                transform: 'translateY(-1px)',
                boxShadow: SHADOWS.brandHover,
              },
              '&:active': { transform: 'translateY(0) scale(0.98)' },
            }}
          >
            Jetzt buchen
          </Button>
        </Paper>
      </motion.div>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        gap: 2.5,
      }}
    >
      {bookings.map((booking, index) => (
        <motion.div
          key={booking._id}
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: reduce ? 0 : index * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{ height: '100%' }}
        >
          <BookingCard
            booking={booking}
            onViewDetails={() => onViewDetails(booking)}
            onViewQR={() => onViewQR(booking)}
          />
        </motion.div>
      ))}
    </Box>
  );
};

export default BookingsTab;
