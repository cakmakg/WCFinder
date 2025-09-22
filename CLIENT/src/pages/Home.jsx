import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  AppBar, Box, Toolbar, Typography, IconButton, Menu, MenuItem,
  styled, alpha, Badge, Avatar, Drawer, CssBaseline, Grid,
  CircularProgress, Alert
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MailIcon from '@mui/icons-material/Mail';
import BusinessCard from '../components/BusinessCard';
import useCrudCall from '../hook/useCrudCall'; // GENEL VERİ ÇEKME HOOK'U
import useAuthCall from '../hook/useAuthCall'; // AUTH İŞLEMLERİ İÇİN HOOK
import Dashboard from './Dashboard';



const drawerWidth = 500;

// === STYLED COMPONENTS (DEĞİŞİKLİK YOK) ===
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));
// ===============================================

export default function Home() {
  const navigate = useNavigate();
  // === YENİ EKLENEN STATE'LER VE HOOK'LAR ===
  const { logout } = useAuthCall();
  const { getCrudData } = useCrudCall();
  const { user } = useSelector((state) => state.auth);
  const { businesses, loading, error } = useSelector((state) => state.crud);
  const [search, setSearch] = useState("");
  // ==========================================

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // === VERİ ÇEKME İŞLEMİ ===
  useEffect(() => {
    getCrudData('bussiness');
  }, []);
  // ==========================

  // === FİLTRELEME MANTIĞI ===
  const normalize = (str) => (str || "").toLocaleLowerCase("tr-TR").trim();

  const filteredBusinesses = businesses?.filter((business) => {
    const searchableValues = [
      business.businessName,
      business.businessType,
      business.address.city,
      business.address.street,
    ];
    return searchableValues.some((value) =>
      normalize(String(value)).includes(normalize(search))
    );
  });
  // ===========================

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    logout(); // Artık gerçek logout fonksiyonunu çağırıyoruz
    // navigate('/'); // logout fonksiyonu zaten yönlendirme yapabilir
    handleCloseUserMenu();
  };

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
      <MenuItem onClick={() => navigate('/profile')}>
        <Typography textAlign="center">Profile</Typography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <Typography textAlign="center">Logout</Typography>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#454F5B',
        }}
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
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1 }}
          >
            WCFINDER
          </Typography>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
              // Arama state'ini input'a bağlıyoruz
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Search>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton color="inherit">
              <Badge badgeContent={9} color="error">
                <NotificationsIcon />
              </Badge>
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
        aria-label="mailbox folders"
      >
        {/* Drawer'lar şimdilik statik kalabilir veya buraya da dinamik veri basılabilir */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#F4F6F8' },
          }}
        >
          <Toolbar />
          <Typography variant="h6" sx={{ p: 2 }}>Map & Filters</Typography>
          {/* Buraya harita ve filtre component'leri gelecek */}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, backgroundColor: '#F4F6F8' },
          }}
          open
        >
          <Toolbar />
           <Typography variant="h6" sx={{ p: 2 }}>Map & Filters</Typography>
           {/* Buraya harita ve filtre component'leri gelecek */}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />

        {/* === DİNAMİK İÇERİK BURADA RENDER EDİLİYOR === */}
        {loading && <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />}
        {error && <Alert severity="error">Veriler yüklenirken bir hata oluştu.</Alert>}
        {!loading && !error && (
          <Grid container spacing={2}>
            {filteredBusinesses?.length > 0 ? (
              filteredBusinesses.map((business) => (
                <Grid item key={business._id} xs={12} sm={6} md={4} lg={3}>
                  <BusinessCard business={business} />
                </Grid>
              ))
            ) : (
              <Box textAlign="center" mt={3} width="100%">
                <Typography>
                  {search ? `"${search}" için sonuç bulunamadı.` : "Gösterilecek işletme bulunamadı."}
                </Typography>
              </Box>
            )}
          </Grid>
        )}
        <Dashboard />
        <Outlet />
      </Box>
    </Box>
  );
}