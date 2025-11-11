// components/layout/AppBar/HomeAppBar.jsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Box } from '@mui/material';
import { Logo } from '../Logo';
import { UserMenu } from './UserMenu';
import LoginIcon from '@mui/icons-material/Login';

export const HomeAppBar = ({
  currentUser,
  anchorElUser,
  onUserMenuOpen,
  onUserMenuClose,
  onMyBookingsClick,
  onLogoutClick,
  onLoginClick,
  onLogoClick,
  theme
}) => {
  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Logo onClick={onLogoClick} />

        {/* User Menu or Login Button */}
        {currentUser ? (
          <Box>
            <IconButton onClick={onUserMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  bgcolor: '#0891b2',
                  width: 40,
                  height: 40,
                }}
              >
                {currentUser.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
            </IconButton>

            <UserMenu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={onUserMenuClose}
              onMyBookingsClick={onMyBookingsClick}
              onLogoutClick={onLogoutClick}
              currentUser={currentUser}
              theme={theme}
            />
          </Box>
        ) : (
          <IconButton
            onClick={onLoginClick}
            sx={{
              bgcolor: '#0891b2',
              color: 'white',
              '&:hover': {
                bgcolor: '#0e7490',
              },
            }}
          >
            <LoginIcon />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

