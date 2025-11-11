// src/components/layout/AppBar/UserMenu.jsx
import React from 'react';
import { Menu, MenuItem, Divider, Typography, Box, ListItemIcon } from '@mui/material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import LogoutIcon from '@mui/icons-material/Logout';

export const UserMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  onMyBookingsClick, 
  onLogoutClick,
  currentUser,
  theme 
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          mt: 1.5,
          minWidth: 200,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 2,
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {/* User Info */}
      {currentUser && (
        <>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {currentUser.username}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {currentUser.email}
            </Typography>
          </Box>
          <Divider />
        </>
      )}

      {/* My Bookings */}
      <MenuItem onClick={onMyBookingsClick}>
        <ListItemIcon>
          <BookmarksIcon fontSize="small" sx={{ color: '#0891b2' }} />
        </ListItemIcon>
        <Typography>Meine Buchungen</Typography>
      </MenuItem>

      <Divider />

      {/* Logout */}
      <MenuItem onClick={onLogoutClick}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
        </ListItemIcon>
        <Typography color="error">Abmelden</Typography>
      </MenuItem>
    </Menu>
  );
};