// components/payment/PaymentMethodCard.jsx
import React from 'react';
import { Box, FormControlLabel, Radio, Paper } from '@mui/material';
import { COLORS, RADII, SHADOWS } from '../../theme/designTokens';

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
        border: selected ? `2px solid ${COLORS.primary}` : `1px solid ${COLORS.border}`,
        borderRadius: RADII.card,
        bgcolor: selected ? COLORS.accentBoxBg : COLORS.backgroundWhite,
        boxShadow: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: COLORS.primary,
          boxShadow: SHADOWS.subtle,
        },
      }}
    >
      <FormControlLabel
        value={value}
        control={<Radio sx={{ '&.Mui-checked': { color: COLORS.primary } }} />}
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>
            <Box sx={{ color: selected ? COLORS.primary : COLORS.textSecondary }}>
              {icon}
            </Box>
            <Box>
              <Box sx={{ fontWeight: 600, color: COLORS.textHeading }}>{title}</Box>
              <Box sx={{ fontSize: '0.875rem', color: COLORS.textSecondary }}>
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
