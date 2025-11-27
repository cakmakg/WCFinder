// src/components/layout/AppBar/UserMenu.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, Divider, Typography, Box, ListItemIcon } from '@mui/material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export const UserMenu = ({ 
  anchorEl, 
  open, 
  onClose, 
  onMyBookingsClick, 
  onAdminPanelClick,
  onLogoutClick,
  currentUser,
  theme 
}) => {
  const { t } = useTranslation();
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
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {currentUser.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {currentUser.email}
          </Typography>
        </Box>
      )}
      {currentUser && <Divider />}

      {/* My Bookings */}
      <MenuItem onClick={onMyBookingsClick}>
        <ListItemIcon>
          <BookmarksIcon fontSize="small" sx={{ color: '#0891b2' }} />
        </ListItemIcon>
        <Typography>{t('userMenu.myBookings')}</Typography>
      </MenuItem>

      {/* Admin Panel - Sadece admin için */}
      {currentUser?.role === 'admin' && <Divider />}
      {currentUser?.role === 'admin' && (
        <MenuItem onClick={onAdminPanelClick}>
          <ListItemIcon>
            <AdminPanelSettingsIcon fontSize="small" sx={{ color: '#7c3aed' }} />
          </ListItemIcon>
          <Typography>{t('userMenu.adminPanel')}</Typography>
        </MenuItem>
      )}

      <Divider />

      {/* Logout */}
      <MenuItem onClick={onLogoutClick}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" sx={{ color: '#ef4444' }} />
        </ListItemIcon>
        <Typography color="error">{t('userMenu.logout')}</Typography>
      </MenuItem>
    </Menu>
  );
};