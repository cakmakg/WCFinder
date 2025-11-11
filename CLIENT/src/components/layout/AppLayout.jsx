// src/components/layout/AppLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Toolbar, useTheme } from '@mui/material';
import { useSelector } from 'react-redux';
import useAuthCall from '../../hook/useAuthCall';
import { HomeAppBar } from './AppBar/HomeAppBar';

const AppLayout = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuthCall();
  const { currentUser } = useSelector((state) => state.auth);

  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleUserMenuOpen = (event) => setAnchorElUser(event.currentTarget);
  const handleUserMenuClose = () => setAnchorElUser(null);

  const handleMyBookingsClick = () => {
    navigate('/my-bookings');
    handleUserMenuClose();
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
    } finally {
      handleUserMenuClose();
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <CssBaseline />

            {/* AppBar */}
            <HomeAppBar
              currentUser={currentUser}
              anchorElUser={anchorElUser}
              onUserMenuOpen={handleUserMenuOpen}
              onUserMenuClose={handleUserMenuClose}
              onMyBookingsClick={handleMyBookingsClick}
              onLogoutClick={handleLogoutClick}
              onLoginClick={() => navigate('/')}
              onLogoClick={() => navigate('/home')}
              onMenuClick={undefined} // AppLayout'ta drawer yok, menu button gösterme
              theme={theme}
            />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Toolbar /> {/* AppBar spacing */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default AppLayout;