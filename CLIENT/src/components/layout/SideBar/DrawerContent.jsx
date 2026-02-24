// src/components/layout/Sidebar/DrawerContent.jsx
import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WcIcon from '@mui/icons-material/Wc';
import { NavigationMenu } from './NavigationMenu';

export const DrawerContent = ({
  isMobile,
  onClose,
  onNavigate,
  businessListComponent,
  theme
}) => {
  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white',
    }}>
      {/* Panel Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WcIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
          </Box>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: 'white', fontWeight: 700, lineHeight: 1.2, fontSize: '0.95rem' }}
            >
              WC finden
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}
            >
              Entdecke Einrichtungen in deiner Nähe
            </Typography>
          </Box>
        </Box>

        {isMobile && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <NavigationMenu onNavigate={onNavigate} theme={theme} />

      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {businessListComponent}
      </Box>
    </Box>
  );
};
export default DrawerContent;
