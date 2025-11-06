// src/components/layout/AppBar/NotificationIcons.jsx
import React from 'react';
import { Box, IconButton, Badge } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';

export const NotificationIcons = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton 
        color="inherit"
        sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
      >
        <Badge badgeContent={4} color="error">
          <MailIcon />
        </Badge>
      </IconButton>
      
      <IconButton 
        color="inherit"
        sx={{ '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
      >
        <Badge badgeContent={9} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Box>
  );
};