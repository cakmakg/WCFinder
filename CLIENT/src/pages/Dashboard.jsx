// pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
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
  useMediaQuery
} from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import { MapController } from '../components/map/MapController';
import { MapStatsPanel } from '../components/map/MapStatsPanel';
import { MapMarker } from '../components/map/MapMarker';
import { getMapCenter } from '../utils/markerUtils';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const Dashboard = ({ selectedBusiness, searchedLocation }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { getCrudData } = useCrudCall();
  const { toilet, loading, error } = useSelector((state) => state.crud);

  useEffect(() => {
    getCrudData('toilet');
  }, []);

  // Loading state
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 64px)',
        backgroundColor: theme.palette.background.default
      }}>
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
          Harita yükleniyor...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3, height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
        <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Harita verileri yüklenemedi
          </Typography>
          Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.
        </Alert>
      </Box>
    );
  }

  // No data state
  if (!toilet || toilet.length === 0) {
    return (
      <Box sx={{ p: 3, height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
        <Paper sx={{ 
          p: 4, 
          textAlign: 'center', 
          width: '100%',
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper
        }}>
          <WcIcon sx={{ fontSize: '4rem', color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
            Tuvalet verisi bulunamadı
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lütfen giriş yaptığınızdan ve verilere erişim izniniz olduğundan emin olun.
          </Typography>
        </Paper>
      </Box>
    );
  }

  const mapCenter = getMapCenter(toilet);

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      width: '100%', 
      position: 'relative',
      backgroundColor: theme.palette.background.default
    }}>
      <MapStatsPanel toilet={toilet} isMobile={isMobile} theme={theme} />

      <MapContainer 
        center={mapCenter} 
        zoom={isMobile ? 12 : 13} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        zoomControl={!isMobile}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController 
          selectedBusiness={selectedBusiness}
          searchedLocation={searchedLocation}
        />

        {toilet.map(toiletItem => (
          <MapMarker
            key={toiletItem._id}
            toiletItem={toiletItem}
            selectedBusiness={selectedBusiness}
            theme={theme}
          />
        ))}
      </MapContainer>
    </Box>
  );
};

export default Dashboard;