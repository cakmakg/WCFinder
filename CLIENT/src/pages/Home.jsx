// pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Box, 
  Drawer, 
  CssBaseline, 
  Toolbar, 
  Fade, 
  useTheme, 
  useMediaQuery
} from '@mui/material';
import useAuthCall from '../hook/useAuthCall';
import { HomeAppBar } from '../components/layout/AppBar/HomeAppBar';
import DrawerContent from '../components/layout/SideBar/DrawerContent';
import BusinessList from '../components/business/BusinessList';
import Dashboard from './Dashboard';
import { DRAWER_WIDTH } from '../constants/layout';

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthCall();
  const { currentUser } = useSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [searchedLocation, setSearchedLocation] = useState(null);
  const [initialSearch, setInitialSearch] = useState('');
  const [anchorElUser, setAnchorElUser] = useState(null);

  // URL'den search parametresini oku
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('search');
    
    if (searchQuery) {
      setInitialSearch(searchQuery);
    }
  }, [location.search]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

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
    <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
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
        theme={theme}
      />

      {/* Drawer */}
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
              backgroundColor: 'white',
              border: 'none',
              mt: 8,
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
                initialSearch={initialSearch}
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
              backgroundColor: 'white',
              borderRight: `1px solid ${theme.palette.divider}`,
              mt: 8,
              height: 'calc(100% - 64px)',
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
                initialSearch={initialSearch}
              />
            }
            theme={theme}
          />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` },
          backgroundColor: '#f5f5f5',
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