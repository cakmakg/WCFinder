// components/layout/AppBar/HomeAppBar.jsx
import React from 'react';
import { AppBar, Toolbar, IconButton, Avatar, Box, Button, useMediaQuery } from '@mui/material';
import { Logo } from '../Logo';
import { UserMenu } from './UserMenu';
import { LanguageSelector } from './LanguageSelector';
import LoginIcon from '@mui/icons-material/Login';
import MenuIcon from '@mui/icons-material/Menu';

export const HomeAppBar = ({
  currentUser,
  anchorElUser,
  onUserMenuOpen,
  onUserMenuClose,
  onMyBookingsClick,
  onOwnerProfileClick,
  onAdminPanelClick,
  onLogoutClick,
  onLoginClick,
  onLogoClick,
  theme,
  onMenuClick,
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(8,145,178,0.10)',
        boxShadow: '0 1px 24px rgba(8,145,178,0.07)',
        zIndex: theme.zIndex.drawer + 1,
        transition: 'background-color 0.3s ease',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Mobile Menu Button */}
        {isMobile && onMenuClick && (
          <IconButton
            edge="start"
            onClick={onMenuClick}
            sx={{
              mr: 0.5,
              color: '#0891b2',
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: 'rgba(8,145,178,0.08)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        <Logo onClick={onLogoClick} />

        <Box sx={{ flexGrow: 1 }} />

        {/* Language Selector */}
        <LanguageSelector />

        {/* User Menu or Login Button */}
        {currentUser ? (
          <Box>
            <IconButton
              onClick={onUserMenuOpen}
              sx={{
                p: 0.5,
                borderRadius: '50%',
                border: '2px solid transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #0891b2, #06b6d4) border-box',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: '0 4px 14px rgba(8,145,178,0.3)',
                },
              }}
            >
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                  width: 36,
                  height: 36,
                  fontSize: '0.9rem',
                  fontWeight: 700,
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
              onOwnerProfileClick={onOwnerProfileClick}
              onAdminPanelClick={onAdminPanelClick}
              onLogoutClick={onLogoutClick}
              currentUser={currentUser}
              theme={theme}
            />
          </Box>
        ) : (
          <Button
            onClick={onLoginClick}
            variant="contained"
            startIcon={<LoginIcon sx={{ fontSize: '1rem !important' }} />}
            size="small"
            sx={{
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
              color: 'white',
              borderRadius: '20px',
              px: 2,
              py: 0.75,
              fontSize: '0.85rem',
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: '0 2px 10px rgba(8,145,178,0.25)',
              border: 'none',
              transition: 'all 0.25s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
                boxShadow: '0 4px 16px rgba(8,145,178,0.35)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Anmelden
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

