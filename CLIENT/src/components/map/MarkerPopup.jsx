// src/components/map/MarkerPopup.jsx
import { Popup } from 'react-leaflet';
import { Paper, Box, Typography, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EuroIcon from '@mui/icons-material/Euro';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ChildCareIcon from '@mui/icons-material/ChildCare';

export const MarkerPopup = ({ toiletItem, theme, isMobile }) => {
  return (
    <Popup maxWidth={isMobile ? 280 : 320}>
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
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {toiletItem.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EuroIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {toiletItem.fee > 0 ? `${toiletItem.fee.toFixed(2)}€` : 'Ücretsiz'}
            </Typography>
          </Box>

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

          <Box sx={{ mb: 2 }}>
            <Chip 
              label={
                toiletItem.status === 'available' ? 'Müsait' : 
                toiletItem.status === 'in_use' ? 'Kullanımda' : 
                'Arızalı'
              } 
              size="small"
              color={
                toiletItem.status === 'available' ? 'success' : 
                toiletItem.status === 'in_use' ? 'warning' : 'error'
              }
              variant="filled"
            />
          </Box>

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
  );
};