// src/components/layout/AppBar/UserMenu.jsx
import React from 'react';
import { Menu, MenuItem, Divider, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

export const UserMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  onProfileClick, 
  onLogoutClick,
  theme 
}) => {
  return (
    <Menu
      sx={{ 
        mt: '45px',
        '& .MuiPaper-root': {
          borderRadius: 2,
          minWidth: 180,
          boxShadow: theme.shadows[8]
        }
      }}
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={open}
      onClose={onClose}
    >
      <MenuItem onClick={onProfileClick} sx={{ py: 1.5 }}>
        <AccountCircleIcon sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography>My Booking</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={onLogoutClick} sx={{ py: 1.5, color: 'error.main' }}>
        <LogoutIcon sx={{ mr: 2 }} />
        <Typography>Logout</Typography>
      </MenuItem>
    </Menu>
  );
};