// components/layout/AppBar/HomeAppBar.jsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Box, useMediaQuery, useTheme } from '@mui/material';
import { Logo } from '../Logo';
import { UserMenu } from './UserMenu';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';

export const HomeAppBar = ({
  currentUser,
  anchorElUser,
  onUserMenuOpen,
  onUserMenuClose,
  onMyBookingsClick,
  onLogoutClick,
  onLoginClick,
  onLogoClick,
  theme,
  onMenuClick // Home.jsx'den gelen drawer toggle fonksiyonu
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
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
        {/* Mobile Menu Button - Sadece Home sayfasında görünür */}
        {isMobile && onMenuClick && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{ mr: 1, color: '#0891b2' }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
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

