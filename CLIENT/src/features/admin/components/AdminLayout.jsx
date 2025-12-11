// features/admin/components/AdminLayout.jsx
// Admin panel layout with sidebar and header

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  AddBusiness as AddBusinessIcon,
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  EventNote as EventNoteIcon,
  Payment as PaymentIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Wc as WcIcon,
} from "@mui/icons-material";
import useAuthCall from "../../../hook/useAuthCall";

const DRAWER_WIDTH = 280;

const AdminLayout = ({ children, activeTab = 0, onTabChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.auth);
  const { logout } = useAuthCall();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } finally {
      handleUserMenuClose();
    }
  };

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      index: 0,
    },
    {
      text: "Kullanıcılar",
      icon: <PeopleIcon />,
      index: 1,
    },
    {
      text: "İşletmeler",
      icon: <BusinessIcon />,
      index: 2,
    },
    {
      text: "Rezervasyonlar",
      icon: <EventNoteIcon />,
      index: 3,
    },
    {
      text: "Ödemeler",
      icon: <PaymentIcon />,
      index: 4,
    },
    {
      text: "Tuvaletler",
      icon: <WcIcon />,
      index: 5,
    },
    {
      text: "Analytics",
      icon: <AnalyticsIcon />,
      index: 6,
    },
    {
      text: "Business Management",
      icon: <AddBusinessIcon />,
      index: 7,
    },
    {
      text: "Ayarlar",
      icon: <SettingsIcon />,
      index: 8,
    },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: "white", borderBottom: "1px solid #e2e8f0" }}>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, color: "#0891b2" }}>
          WCFinder Admin
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeTab === item.index}
              onClick={() => onTabChange(item.index)}
              sx={{
                borderRadius: 2,
                mx: 2,
                "&.Mui-selected": {
                  backgroundColor: "#0891b215",
                  color: "#0891b2",
                  "& .MuiListItemIcon-root": {
                    color: "#0891b2",
                  },
                  "&:hover": {
                    backgroundColor: "#0891b225",
                  },
                },
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} sx={{ fontWeight: 600 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: "white",
          color: "text.primary",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            {menuItems[activeTab]?.text}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
              <Avatar alt={currentUser?.username || "Admin"} />
            </IconButton>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleUserMenuClose}
            >
              <MenuItem onClick={handleUserMenuClose}>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profil</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                <ListItemText>Çıkış Yap</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: DRAWER_WIDTH,
              backgroundColor: "white",
              borderRight: "1px solid #e2e8f0",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: "64px",
          backgroundColor: "#f5f7fa",
          height: "calc(100vh - 64px)",
          overflow: "auto",
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "100%" }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AdminLayout;

