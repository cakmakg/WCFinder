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

const PaymentFailedPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon 
            sx={{ fontSize: 80, color: 'error.main', mb: 2 }} 
          />
          
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {t('paymentFailed.title')}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('paymentFailed.subtitle')}
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate(-1)}
            sx={{ mb: 1 }}
          >
            {t('paymentFailed.retry')}
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
          >
            {t('paymentFailed.backToHome')}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentFailedPage;