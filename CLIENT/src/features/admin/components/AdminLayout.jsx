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
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  EventNote as EventNoteIcon,
  Settings as SettingsIcon,
  Euro as FinanzIcon,
} from "@mui/icons-material";
import useAuthCall from "../../../hook/useAuthCall";
import { COLORS, RADII } from "../../../theme/designTokens";

const DRAWER_WIDTH = 280;

const AdminLayout = ({ children, activeTab = 0, onTabChange }) => {
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
      text: "Übersicht",
      icon: <DashboardIcon />,
      index: 0,
    },
    {
      text: "Benutzer",
      icon: <PeopleIcon />,
      index: 1,
    },
    {
      text: "Betriebe",
      icon: <BusinessIcon />,
      index: 2,
    },
    {
      text: "Buchungen",
      icon: <EventNoteIcon />,
      index: 3,
    },
    {
      text: "Finanzen",
      icon: <FinanzIcon />,
      index: 4,
    },
    {
      text: "Einstellungen",
      icon: <SettingsIcon />,
      index: 5,
    },
  ];

  const drawer = (
    <Box>
      <Toolbar sx={{ bgcolor: COLORS.backgroundWhite, borderBottom: `1px solid ${COLORS.border}` }}>
        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{ fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.primary }}
        >
          WCFinder Admin
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: COLORS.border }} />
      <List sx={{ py: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={activeTab === item.index}
              onClick={() => onTabChange(item.index)}
              sx={{
                borderRadius: RADII.button,
                mx: 2,
                color: COLORS.textPrimary,
                // Platzhalter-Bar, damit der aktive Zustand nicht springt
                borderLeft: "3px solid transparent",
                "& .MuiListItemIcon-root": {
                  color: COLORS.textSecondary,
                },
                "&.Mui-selected": {
                  backgroundColor: COLORS.accentBoxBg,
                  color: COLORS.primary,
                  borderLeft: `3px solid ${COLORS.primary}`,
                  "& .MuiListItemIcon-root": {
                    color: COLORS.primary,
                  },
                  "& .MuiListItemText-primary": {
                    fontWeight: 700,
                  },
                  "&:hover": {
                    backgroundColor: COLORS.accentBoxBg,
                  },
                },
                "&:hover": {
                  backgroundColor: COLORS.backgroundLight,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: 600, fontSize: "0.95rem" }}
              />
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
          bgcolor: COLORS.backgroundWhite,
          color: "text.primary",
          boxShadow: "none",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="Menü öffnen"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: "-0.02em", color: COLORS.textHeading }}
          >
            {menuItems[activeTab]?.text}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
              <Avatar
                alt={currentUser?.username || "Admin"}
                sx={{ background: COLORS.primaryGradient, fontWeight: 600 }}
              />
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
                <ListItemText>Abmelden</ListItemText>
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
              backgroundColor: COLORS.backgroundWhite,
              borderRight: `1px solid ${COLORS.border}`,
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
          backgroundColor: COLORS.backgroundLight,
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

