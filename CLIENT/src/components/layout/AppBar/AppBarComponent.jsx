// src/components/layout/AppBar/AppBarComponent.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { NotificationIcons } from './NotificationIcons';
import { UserMenu } from './UserMenu';

export const AppBarComponent = ({ 
  onMenuClick, 
  currentUser,
  anchorElUser,
  onUserMenuOpen,
  onUserMenuClose,
  onMyBookingsClick,
  onLogoutClick,
  theme,
  onTitleClick
}) => {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ 
            mr: 2, 
            display: { lg: 'none' },
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          sx={{ 
            flexGrow: 1,
            fontWeight: 700,
            letterSpacing: '0.5px',
            cursor: 'pointer'
          }}
          onClick={onTitleClick}
        >
          WCFINDER
        </Typography>
        
        <NotificationIcons />
        
        <IconButton 
          onClick={onUserMenuOpen} 
          sx={{ 
            p: 0.5, 
            ml: 1,
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
          }}
        >
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontWeight: 600
            }}
          >
            {currentUser?.username?.[0]?.toUpperCase() || 'U'}
          </Avatar>
        </IconButton>
        
        <UserMenu
          anchorEl={anchorElUser}
          open={Boolean(anchorElUser)}
          onClose={onUserMenuClose}
          onMyBookingsClick={onMyBookingsClick}
          onLogoutClick={onLogoutClick}
          theme={theme}
        />
      </Toolbar>
    </AppBar>
  );
};