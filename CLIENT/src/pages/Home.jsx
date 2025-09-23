import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar, Box, Toolbar, Typography, IconButton, Menu, MenuItem,
  Badge, Avatar, Drawer, CssBaseline
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import useAuthCall from '../hook/useAuthCall';
import BusinessList from './BusinessList'; // Sol menüde göstereceğimiz component

const drawerWidth = 500;

export default function Home() {
  const navigate = useNavigate();
  const { logout } = useAuthCall();
  const { user } = useSelector((state) => state.auth);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  // Kullanıcı menüsü (değişiklik yok)
  const userMenu = (
    <Menu
      sx={{ mt: '45px' }}
      anchorEl={anchorElUser}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorElUser)}
      onClose={handleCloseUserMenu}
    >
      <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
        <Typography textAlign="center">Profile</Typography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Typography textAlign="center">Logout</Typography>
      </MenuItem>
    </Menu>
  );

  // Sol menünün (Drawer) içeriği artık SADECE BusinessList'ten oluşuyor.
  const drawerContent = (
    <div>
      <Toolbar />
      <BusinessList />
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#454F5B' }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            WCFINDER
          </Typography>
          <Box sx={{ flexGrow: 1 }} /> 
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error"><MailIcon /></Badge>
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={9} color="error"><NotificationsIcon /></Badge>
            </IconButton>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml: 1 }}>
              <Avatar alt={user?.username} src="/static/images/avatar/1.jpg" />
            </IconButton>
          </Box>
          {userMenu}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 0, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {/*
          ANA İÇERİK ALANI: AppRouter buraya haritayı (`Dashboard`) veya başka bir sayfayı yerleştirecek.
        */}
        <Outlet />
      </Box>
    </Box>
  );
}