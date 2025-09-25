import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import { useSelector } from 'react-redux';
import useCrudCall from '../hook/useCrudCall';
import { 
  Box, 
  CircularProgress, 
  Alert, 
  Typography, 
  Chip, 
  Paper,
  useTheme,
  useMediaQuery,
  Fade
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WcIcon from '@mui/icons-material/Wc';
import BusinessIcon from '@mui/icons-material/Business';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import EuroIcon from '@mui/icons-material/Euro';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom marker styles for different toilet types
const createCustomIcon = (color = '#2196f3') => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          color: white;
          font-size: 14px;
          transform: rotate(45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        ">
          🚻
        </div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

const Dashboard = () => {
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
        <Alert 
          severity="error"
          sx={{ width: '100%', borderRadius: 2 }}
        >
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

  // Calculate map center
  const getMapCenter = () => {
    const validToilets = toilet.filter(t => 
      t.business?.location?.coordinates?.[0] && 
      t.business?.location?.coordinates?.[1]
    );
    
    if (validToilets.length > 0) {
      return [
        validToilets[0].business.location.coordinates[1], // lat
        validToilets[0].business.location.coordinates[0]  // lng
      ];
    }
    return [50.7374, 7.0982]; // Bonn default
  };

  const mapCenter = getMapCenter();

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      width: '100%', 
      position: 'relative',
      backgroundColor: theme.palette.background.default
    }}>
      {/* Stats Panel */}
      <Fade in timeout={500}>
        <Paper sx={{ 
          position: 'absolute', 
          top: 16, 
          left: 16, 
          zIndex: 1000,
          p: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          minWidth: isMobile ? 200 : 250
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WcIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Tuvalet Haritası
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              label={`${toilet.length} Tuvalet`}
              size="small"
              color="primary"
              variant="filled"
            />
            <Chip 
              label={`${toilet.filter(t => t.fee === 0).length} Ücretsiz`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip 
              label={`${toilet.filter(t => t.features?.isAccessible).length} Erişilebilir`}
              size="small"
              color="info"
              variant="outlined"
            />
          </Box>
        </Paper>
      </Fade>

      {/* Map Container */}
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

        {/* Toilet Markers */}
        {toilet.map(toiletItem => {
          // Skip invalid locations
          if (!toiletItem.business?.location?.coordinates) {
            console.warn('Toilet missing location data:', toiletItem._id);
            return null;
          }

          const coordinates = toiletItem.business.location.coordinates;
          const position = [coordinates[1], coordinates[0]]; // [lat, lng]

          if (!position[0] || !position[1]) {
            console.warn('Invalid coordinates for toilet:', toiletItem._id);
            return null;
          }

          // Determine marker color based on features
          let markerColor = theme.palette.primary.main;
          if (toiletItem.fee === 0) markerColor = theme.palette.success.main;
          if (toiletItem.features?.isAccessible) markerColor = theme.palette.info.main;

          return (
            <Marker 
              key={toiletItem._id} 
              position={position}
              icon={createCustomIcon(markerColor)}
            >
              <Popup 
                maxWidth={isMobile ? 280 : 320}
                className="custom-popup"
              >
                <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
                  {/* Header */}
                  <Box sx={{ 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    color: 'white',
                    p: 2
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <BusinessIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                        {toiletItem.business.businessName}
                      </Typography>
                    </Box>
                    <Chip 
                      label={toiletItem.business.businessType} 
                      size="small" 
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 500
                      }}
                    />
                  </Box>

                  {/* Content */}
                  <Box sx={{ p: 2 }}>
                    {/* Toilet Info */}
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      {toiletItem.name}
                    </Typography>

                    {/* Fee */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EuroIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {toiletItem.fee > 0 
                          ? `${toiletItem.fee.toFixed(2)}€` 
                          : 'Ücretsiz'
                        }
                      </Typography>
                    </Box>

                    {/* Features */}
                    {toiletItem.features && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" sx={{ 
                          display: 'block', 
                          mb: 1, 
                          fontWeight: 600,
                          color: 'text.secondary'
                        }}>
                          Özellikler:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={toiletItem.features.gender || 'Unisex'} 
                            size="small" 
                            color="default"
                            variant="outlined"
                          />
                          {toiletItem.features.isAccessible && (
                            <Chip 
                              icon={<AccessibleIcon />}
                              label="Erişilebilir" 
                              size="small" 
                              color="info"
                              variant="filled"
                            />
                          )}
                          {toiletItem.features.hasBabyChangingStation && (
                            <Chip 
                              icon={<ChildCareIcon />}
                              label="Bebek Bakım" 
                              size="small" 
                              color="secondary"
                              variant="filled"
                            />
                          )}
                        </Box>
                      </Box>
                    )}

                    {/* Status */}
                    <Box sx={{ mb: 2 }}>
                      <Chip 
                        label={
                          toiletItem.status === 'available' ? 'Müsait' : 
                          toiletItem.status === 'in_use' ? 'Kullanımda' : 
                          'Bakımda'
                        } 
                        size="small"
                        color={
                          toiletItem.status === 'available' ? 'success' : 
                          toiletItem.status === 'in_use' ? 'warning' : 'error'
                        }
                        variant="filled"
                      />
                    </Box>

                    {/* Address */}
                    {toiletItem.business.address && (
                      <Box sx={{ 
                        pt: 1, 
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        alignItems: 'flex-start'
                      }}>
                        <LocationOnIcon sx={{ 
                          fontSize: '1rem', 
                          color: 'text.secondary',
                          mr: 0.5,
                          mt: 0.1
                        }} />
                        <Typography variant="caption" sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.3,
                          fontSize: '0.75rem'
                        }}>
                          {toiletItem.business.address.street}<br/>
                          {toiletItem.business.address.postalCode} {toiletItem.business.address.city}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default Dashboard;