// pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import useCrudCall from '../hook/useCrudCall';
import { 
  Box, 
  CircularProgress, 
  Alert, 
  Typography, 
  Paper,
  useTheme,
  useMediaQuery,
  Fab,
  Snackbar,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip
} from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MapIcon from '@mui/icons-material/Map';
import PaletteIcon from '@mui/icons-material/Palette';
import { MapController } from '../components/map/MapController';
import { MapMarker } from '../components/map/MapMarker';
import { MapTileLayer } from '../components/map/MapTileLayer';
import { UserLocationMarker } from '../components/map/UserLocationMarker';
import { getMapCenter, findNearestToilet } from '../utils/markerUtils';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Dashboard = ({ selectedBusiness, searchedLocation }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  // Home.jsx ile tutarlı olması için lg breakpoint kullanıyoruz
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  
  const { getCrudData } = useCrudCall();
  const { toilet, loading, error } = useSelector((state) => state.crud);

  // Kullanıcı konumu state'leri
  const [userLocation, setUserLocation] = useState(null);
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [nearestToilet, setNearestToilet] = useState(null);
  const [showLocationSnackbar, setShowLocationSnackbar] = useState(false);
  const [mapStyle, setMapStyle] = useState('voyager'); // Daha renkli ve anlaşılır harita
  const [mapStyleMenuAnchor, setMapStyleMenuAnchor] = useState(null);

  // Harita stil isimleri
  const mapStyleNames = {
    voyager: 'Voyager',
    positron: 'Positron',
    dark: 'Dark Matter',
    terrain: 'Terrain',
    osm: 'OpenStreetMap'
  };

  useEffect(() => {
    // Toilet verilerini yükle - auth gerekmeden
    getCrudData('toilet', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // getCrudData her render'da değişebilir, sadece mount'ta çalışmalı

  // Kullanıcı konumu değiştiğinde en yakın tuvaleti bul
  useEffect(() => {
    if (userLocation && toilet && toilet.length > 0) {
      const nearest = findNearestToilet(toilet, userLocation.lat, userLocation.lng);
      setNearestToilet(nearest);
      if (nearest) {
        setShowLocationSnackbar(true);
      }
    }
  }, [userLocation, toilet]);

  // Arama yapıldığında userLocation'ı temizle (arama öncelikli olmalı)
  useEffect(() => {
    if (searchedLocation) {
      setUserLocation(null);
      setNearestToilet(null);
    }
  }, [searchedLocation]);

  // Konum bulma fonksiyonu
  const handleFindLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(t('map.locationError'));
      return;
    }

    setIsFindingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setUserLocation(location);
        setIsFindingLocation(false);
      },
      (error) => {
        setIsFindingLocation(false);
        let errorMessage = t('map.locationError');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = t('map.locationErrorDescription');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = t('map.locationErrorDescription');
            break;
          case error.TIMEOUT:
            errorMessage = t('map.locationErrorDescription');
            break;
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Loading state - StartPage renk teması
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 64px)',
        backgroundColor: '#f5f5f5'
      }}>
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ color: '#0891b2' }}
        />
        <Typography variant="h6" sx={{ mt: 2, color: '#64748b', fontWeight: 500 }}>
          {t('map.loading')}
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ 
        p: 3, 
        height: 'calc(100vh - 64px)', 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            borderRadius: 2,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('map.error')}
          </Typography>
          {t('map.errorDescription', 'Bitte aktualisieren Sie die Seite oder versuchen Sie es später erneut.')}
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!toilet || toilet.length === 0) {
    return (
      <Box sx={{ 
        p: 3, 
        height: 'calc(100vh - 64px)', 
        display: 'flex', 
        alignItems: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center', 
          width: '100%',
          borderRadius: 3,
          backgroundColor: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <WcIcon sx={{ fontSize: '3rem', color: 'white' }} />
          </Box>
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600, color: '#1e293b' }}>
            {t('map.noToilets')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('map.noToiletsDescription', 'Derzeit sind keine Toiletten in der Datenbank verfügbar.')}
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Map center: searchedLocation > userLocation > default
  const mapCenter = searchedLocation
    ? [searchedLocation.lat, searchedLocation.lng]
    : userLocation 
    ? [userLocation.lat, userLocation.lng]
    : getMapCenter(toilet);

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      width: '100%', 
      position: 'relative',
      backgroundColor: '#f5f5f5'
    }}>
      {/* En yakın tuvalet bilgisi */}
      {nearestToilet && (
        <Paper sx={{
          position: 'absolute',
          top: { xs: 8, sm: 16 },
          right: { xs: 64, sm: 72 }, // Harita stil butonundan kaçınmak için
          zIndex: 1000,
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          minWidth: { xs: 200, sm: 250 },
          maxWidth: { xs: 'calc(100% - 80px)', sm: 'none' }
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            {t('map.nearestToilet')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
            {nearestToilet.toilet.business.businessName}
          </Typography>
          <Chip
            label={
              nearestToilet.distance < 1
                ? `${Math.round(nearestToilet.distance * 1000)} ${t('map.m')}`
                : `${nearestToilet.distance.toFixed(2)} ${t('map.km')}`
            }
            size="small"
            color="primary"
            variant="filled"
          />
        </Paper>
      )}

      {/* Harita stil seçici butonu */}
      <Tooltip title="Harita Stili">
        <IconButton
          onClick={(e) => setMapStyleMenuAnchor(e.currentTarget)}
          sx={{
            position: 'absolute',
            top: { xs: 8, sm: 16 },
            right: { xs: 8, sm: 16 },
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: theme.shadows[4],
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 1)',
            }
          }}
        >
          <PaletteIcon sx={{ color: theme.palette.primary.main }} />
        </IconButton>
      </Tooltip>

      {/* Harita stil menüsü */}
      <Menu
        anchorEl={mapStyleMenuAnchor}
        open={Boolean(mapStyleMenuAnchor)}
        onClose={() => setMapStyleMenuAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {Object.keys(mapStyleNames).map((style) => (
          <MenuItem
            key={style}
            selected={mapStyle === style}
            onClick={() => {
              setMapStyle(style);
              setMapStyleMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <MapIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{mapStyleNames[style]}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Konum bulma butonu */}
      <Fab
        color="primary"
        aria-label={t('map.findMyLocation')}
        onClick={handleFindLocation}
        disabled={isFindingLocation}
        sx={{
          position: 'absolute',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          zIndex: 1000,
          backgroundColor: '#0891b2',
          '&:hover': {
            backgroundColor: '#06b6d4',
          },
          boxShadow: theme.shadows[4]
        }}
      >
        {isFindingLocation ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          <MyLocationIcon />
        )}
      </Fab>

      <MapContainer 
        center={mapCenter} 
        zoom={searchedLocation ? (isMobile ? 13 : 14) : userLocation ? (isMobile ? 14 : 15) : (isMobile ? 12 : 13)} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={!isMobile}
      >
        {/* Harita tile layer - voyager daha renkli ve anlaşılır */}
        <MapTileLayer mapStyle={mapStyle} />

        <MapController 
          selectedBusiness={selectedBusiness}
          searchedLocation={searchedLocation}
          userLocation={userLocation}
        />

        {/* Kullanıcı konumu marker'ı */}
        {userLocation && (
          <UserLocationMarker userLocation={userLocation} theme={theme} />
        )}

        {toilet.map(toiletItem => (
          <MapMarker
            key={toiletItem._id}
            toiletItem={toiletItem}
            selectedBusiness={selectedBusiness}
            theme={theme}
          />
        ))}
      </MapContainer>

      {/* Hata mesajı snackbar */}
      <Snackbar
        open={!!locationError}
        autoHideDuration={6000}
        onClose={() => setLocationError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setLocationError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {locationError}
        </Alert>
      </Snackbar>

      {/* Konum bulundu snackbar */}
      <Snackbar
        open={showLocationSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowLocationSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowLocationSnackbar(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {t('map.locationFound')}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;