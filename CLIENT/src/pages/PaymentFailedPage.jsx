// pages/PaymentFailedPage.jsx

import React from 'react';
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
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 8 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon 
            sx={{ fontSize: 80, color: 'error.main', mb: 2 }} 
          />
          
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Zahlung fehlgeschlagen
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Ihre Zahlung konnte nicht verarbeitet werden. 
            Bitte versuchen Sie es erneut.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate(-1)}
            sx={{ mb: 1 }}
          >
            Erneut versuchen
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/')}
          >
            Zur Startseite
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default PaymentFailedPage;