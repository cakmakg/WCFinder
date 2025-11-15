// src/components/map/UserLocationMarker.jsx
import { Marker, Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { createUserLocationIcon } from '../../utils/markerUtils';
import { Paper, Box, Typography } from '@mui/material';
import MyLocationIcon from '@mui/icons-material/MyLocation';

export const UserLocationMarker = ({ userLocation, theme }) => {
  const { t } = useTranslation();
  
  if (!userLocation || !userLocation.lat || !userLocation.lng) {
    return null;
  }

  return (
    <Marker 
      position={[userLocation.lat, userLocation.lng]}
      icon={createUserLocationIcon()}
    >
      <Popup>
        <Paper sx={{ p: 1.5, borderRadius: 2, minWidth: 150 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MyLocationIcon sx={{ color: theme.palette.primary.main, fontSize: '1.2rem' }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('map.yourLocation')}
            </Typography>
          </Box>
          {userLocation.accuracy && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {t('map.accuracy')}: ±{Math.round(userLocation.accuracy)}m
            </Typography>
          )}
        </Paper>
      </Popup>
    </Marker>
  );
};

