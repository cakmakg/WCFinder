// src/components/layout/Sidebar/DrawerContent.jsx
import React from 'react';
import { Box, IconButton, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { NavigationMenu } from './NavigationMenu';

export const DrawerContent = ({ 
  isMobile, 
  onClose, 
  onNavigate, 
  businessListComponent,
  theme 
}) => {
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
        color: 'white',
        position: 'relative'
      }}>
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <NavigationMenu onNavigate={onNavigate} theme={theme} />
      <Divider sx={{ mx: 2 }} />
      
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {businessListComponent}
      </Box>
    </Box>
  );
};
export default DrawerContent; 