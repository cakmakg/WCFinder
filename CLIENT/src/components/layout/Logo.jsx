// components/layout/Logo.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';

export const Logo = ({ 
  onClick, 
  size = 'medium',
  showText = true,
  variant = 'h5' 
}) => {
  const sizes = {
    small: { icon: 24, box: 32 },
    medium: { icon: 28, box: 40 },
    large: { icon: 32, box: 48 }
  };

  const { icon, box } = sizes[size] || sizes.medium;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexGrow: 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          width: box,
          height: box,
          background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WcIcon sx={{ color: 'white', fontSize: icon }} />
      </Box>
      {showText && (
        <Typography
          variant={variant}
          sx={{
            fontWeight: 'bold',
            color: '#0891b2',
            display: { xs: 'none', sm: 'block' },
          }}
        >
          WCFinder
        </Typography>
      )}
    </Box>
  );
};

