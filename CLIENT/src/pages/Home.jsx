import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  IconButton, 
  Menu, 
  MenuItem,
  Badge, 
  Avatar, 
  Drawer, 
  CssBaseline,
  useTheme,
  useMediaQuery,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Fade
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import BusinessIcon from '@mui/icons-material/Business';
import MapIcon from '@mui/icons-material/Map';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import CloseIcon from '@mui/icons-material/Close';
import useAuthCall from '../hook/useAuthCall';
import BusinessList from './BusinessList';
import Dashboard from './Dashboard';

const drawerWidth = 500;

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  
  const navigate = useNavigate();
  const { logout } = useAuthCall();
  const { currentUser } = useSelector((state) => state.auth);
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  const handleLogout = () => {
    logout();
    handleCloseUserMenu();
  };

  // Navigation menu items
  const navigationItems = [
    {
      text: 'İşletmeler',
      icon: <BusinessIcon />,
      path: '/',
      active: true
    },
    {
      text: 'Harita',
      icon: <MapIcon />,
      path: '/dashboard'
    }
  ];

  const userMenu = (
    <Menu
      sx={{ 
        mt: '45px',
        '& .MuiPaper-root': {
          borderRadius: 2,
          minWidth: 180,
          boxShadow: theme.shadows[8]
        }
      }}
      anchorEl={anchorElUser}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={Boolean(anchorElUser)}
      onClose={handleCloseUserMenu}
    >
      <MenuItem 
        onClick={() => { 
          navigate('/profile'); 
          handleCloseUserMenu(); 
        }}
        sx={{ py: 1.5 }}
      >
        <AccountCircleIcon sx={{ mr: 2, color: 'text.secondary' }} />
        <Typography>Profil</Typography>
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
        <LogoutIcon sx={{ mr: 2 }} />
        <Typography>Çıkış Yap</Typography>
      </MenuItem>
    </Menu>
  );

  // Enhanced Drawer Content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Drawer Header */}
      <Box sx={{ 
        p: 2, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        color: 'white',
        position: 'relative'
      }}>
        {isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white'
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        
      </Box>

      {/* Navigation Menu */}
      <List sx={{ px: 1, py: 2 }}>
        {navigationItems.map((item, index) => (
          <ListItem key={index} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1,
                backgroundColor: item.active ? theme.palette.primary.main + '15' : 'transparent',
                color: item.active ? theme.palette.primary.main : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main + '10',
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: 'inherit',
                minWidth: 40
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: item.active ? 600 : 400
                  }
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2 }} />

      {/* Business List */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <BusinessList />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      
      {/* Modern AppBar */}
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
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { lg: 'none' },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          
          {/* Logo */}
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: '0.5px'
            }}
          >
            WCFINDER
          </Typography>
          
          {/* Right Side Actions */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 1
          }}>
            <IconButton 
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            
            <IconButton 
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              <Badge badgeContent={9} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            
            <IconButton 
              onClick={handleOpenUserMenu} 
              sx={{ 
                p: 0.5, 
                ml: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
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
          </Box>
          {userMenu}
        </Toolbar>
      </AppBar>

      {/* Responsive Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { lg: drawerWidth }, 
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
              width: drawerWidth,
              backgroundColor: theme.palette.background.default,
              border: 'none'
            },
          }}
        >
          {drawerContent}
        </Drawer>
        
        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', lg: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
          overflow: 'hidden'
        }}
      >
        <Toolbar />
        
        {/* Content */}
        <Fade in timeout={500}>
          <Box sx={{ height: 'calc(100vh - 64px)' }}>
            <Dashboard />
            <Outlet />
          </Box>
        </Fade>
      </Box>
    </Box>
  );
}