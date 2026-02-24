// pages/PaymentFailedPage.jsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';

const PaymentFailedPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* ── Error Hero Banner ── */}
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          pt: { xs: 4, sm: 5 },
          pb: { xs: 4, sm: 5 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -40, right: -40,
            width: 200, height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <ErrorIcon sx={{ fontSize: '2.2rem', color: 'white' }} />
        </Box>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: '1.6rem', sm: '2rem' },
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.2,
            mb: 0.75,
          }}
        >
          {t('paymentFailed.title')}
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
          {t('paymentFailed.subtitle')}
        </Typography>
      </Box>

      {/* ── Content Card ── */}
      <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 4 } }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ color: '#64748b', fontSize: '0.9rem', mb: 3, lineHeight: 1.6 }}>
            Bitte überprüfen Sie Ihre Zahlungsdaten und versuchen Sie es erneut. Bei anhaltenden Problemen kontaktieren Sie bitte unseren Support.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{
              mb: 1.5,
              py: 1.4,
              textTransform: 'none',
              fontSize: '0.97rem',
              fontWeight: 700,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284c7 0%, #0e7490 100%)',
              },
            }}
          >
            {t('paymentFailed.retry')}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/home')}
            sx={{
              py: 1.4,
              textTransform: 'none',
              fontSize: '0.97rem',
              fontWeight: 600,
              borderRadius: '12px',
              borderColor: '#0891b2',
              color: '#0891b2',
              '&:hover': {
                borderColor: '#0891b2',
                backgroundColor: 'rgba(8,145,178,0.05)',
              },
            }}
          >
            {t('paymentFailed.backToHome')}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentFailedPage;
