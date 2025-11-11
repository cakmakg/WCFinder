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
    // Toilet verilerini yükle - auth gerekmeden
    getCrudData('toilet', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // getCrudData her render'da değişebilir, sadece mount'ta çalışmalı

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
          Karte wird geladen...
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
            Kartendaten konnten nicht geladen werden
          </Typography>
          Bitte aktualisieren Sie die Seite oder versuchen Sie es später erneut.
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
            Keine Toiletten gefunden
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Derzeit sind keine Toiletten in der Datenbank verfügbar.
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
      backgroundColor: '#f5f5f5'
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