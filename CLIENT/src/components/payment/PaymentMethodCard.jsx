// components/payment/PaymentMethodCard.jsx
import React from 'react';
import { Box, FormControlLabel, Radio, Paper } from '@mui/material';

export const PaymentMethodCard = ({ 
  value, 
  selected, 
  icon, 
  title, 
  description 
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        border: 2,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'primary.lighter' : 'background.paper',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      <FormControlLabel
        value={value}
        control={<Radio />}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
            <Box sx={{ color: selected ? 'primary.main' : 'text.secondary' }}>
              {icon}
            </Box>
            <Box>
              <Box sx={{ fontWeight: 600 }}>{title}</Box>
              <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
                {description}
              </Box>
            </Box>
          </Box>
        }
        sx={{ width: '100%', m: 0 }}
      />
    </Paper>
  );
};