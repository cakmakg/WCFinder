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
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Turkuaz şerit kaldırıldı */}
      {isMobile && (
        <Box sx={{ position: 'relative', p: 1 }}>
          <IconButton
            onClick={onClose}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#64748b',
              zIndex: 1
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      )}

      <NavigationMenu onNavigate={onNavigate} theme={theme} />
      <Divider sx={{ mx: 2 }} />
      
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {businessListComponent}
      </Box>
    </Box>
  );
};
export default DrawerContent; 