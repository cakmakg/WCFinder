// pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Drawer, CssBaseline, Toolbar, Fade, useTheme, useMediaQuery } from '@mui/material';
import useAuthCall from '../hook/useAuthCall';
import { AppBarComponent } from '../components/layout/AppBar/AppBarComponent';
import DrawerContent from '../components/layout/SideBar/DrawerContent';
import BusinessList from '../components/business/BusinessList';
import Dashboard from './Dashboard';



const DRAWER_WIDTH = 500;

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const navigate = useNavigate();
  const { logout } = useAuthCall();
  const { currentUser } = useSelector((state) => state.auth);
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  
  const handleUserMenuOpen = (event) => setAnchorElUser(event.currentTarget);
  const handleUserMenuClose = () => setAnchorElUser(null);
  
  // *** YENİ FONKSİYON: My Bookings sayfasına yönlendirme ***
  const handleMyBookingsClick = () => {
    navigate('/my-bookings');
    handleUserMenuClose();
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      handleUserMenuClose();
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      <AppBarComponent
        onMenuClick={handleDrawerToggle}
        currentUser={currentUser}
        anchorElUser={anchorElUser}
        onUserMenuOpen={handleUserMenuOpen}
        onUserMenuClose={handleUserMenuClose}
        onMyBookingsClick={handleMyBookingsClick}
        onLogoutClick={handleLogout}
        theme={theme}
      />

      <Box
        component="nav"
        sx={{ 
          width: { lg: DRAWER_WIDTH }, 
          flexShrink: { lg: 0 }
        }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', lg: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.default,
              border: 'none'
            },
          }}
        >
          <DrawerContent
            isMobile={true}
            onClose={handleDrawerToggle}
            onNavigate={handleNavigate}
            businessListComponent={
              <BusinessList 
                onBusinessClick={setSelectedBusiness}
                selectedBusinessId={selectedBusiness?._id}
                onLocationSearch={setSearchedLocation}
              />
            }
            theme={theme}
          />
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          <DrawerContent
            isMobile={false}
            onClose={handleDrawerToggle}
            onNavigate={handleNavigate}
            businessListComponent={
              <BusinessList 
                onBusinessClick={setSelectedBusiness}
                selectedBusinessId={selectedBusiness?._id}
                onLocationSearch={setSearchedLocation}
              />
            }
            theme={theme}
          />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          overflow: 'hidden'
        }}
      >
        <Toolbar />
        
        <Fade in timeout={500}>
          <Box sx={{ height: 'calc(100vh - 64px)' }}>
            <Dashboard 
              selectedBusiness={selectedBusiness}
              searchedLocation={searchedLocation}
            />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}