// src/components/map/MarkerPopup.jsx
import { Popup } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Paper, Box, Typography, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EuroIcon from '@mui/icons-material/Euro';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ChildCareIcon from '@mui/icons-material/ChildCare';

export const MarkerPopup = ({ toiletItem, theme, isMobile }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, token } = useSelector((state) => state.auth);

  const handlePopupClick = () => {
    // Popup'a tıklandığında booking paneline git
    if (!currentUser || !token) {
      navigate('/', { 
        state: { 
          openLoginModal: true,
          from: `/business/${toiletItem.business._id}`,
          businessName: toiletItem.business.businessName 
        } 
      });
      return;
    }
    
    navigate(`/business/${toiletItem.business._id}`);
  };
  
  return (
    <Popup maxWidth={isMobile ? 240 : 260}>
      <Paper 
        onClick={handlePopupClick}
        sx={{ 
          p: 1.5, 
          borderRadius: 2.5, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          backgroundColor: 'white',
          minWidth: 220,
          maxWidth: 260,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease'
          }
        }}
      >
        {/* Business Type Chip */}
        <Box sx={{ mb: 0.75 }}>
          <Chip 
            label={toiletItem.business.businessType}
            size="small"
            sx={{ 
              fontSize: '0.65rem',
              height: '20px',
              px: 0.75,
              backgroundColor: '#e0f2fe',
              color: '#0891b2',
              fontWeight: 600,
              borderRadius: 1,
            }}
          />
        </Box>

        {/* Business Name - Compact */}
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            fontSize: '0.875rem',
            mb: 0.75,
            color: '#1e293b',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
          title={toiletItem.business.businessName}
        >
          {toiletItem.business.businessName}
        </Typography>

        {/* Toilet Name */}
        <Typography 
          variant="body2" 
          sx={{ 
            fontSize: '0.75rem',
            color: '#64748b',
            mb: 0.75,
            fontWeight: 500
          }}
        >
          {toiletItem.name}
        </Typography>

        {/* Price & Status - Single Row */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 0.75,
          gap: 0.5
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EuroIcon sx={{ fontSize: '0.75rem', mr: 0.3, color: '#0891b2' }} />
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700, 
                color: '#0891b2', 
                fontSize: '0.8rem',
                lineHeight: 1
              }}
            >
              {toiletItem.fee > 0 ? `${toiletItem.fee.toFixed(2)}€` : t('map.free', 'Free')}
            </Typography>
          </Box>
          
          <Chip 
            label={
              toiletItem.status === 'available' ? t('myBookings.available', 'Available') : 
              toiletItem.status === 'in_use' ? t('myBookings.inUse', 'In Use') : 
              t('myBookings.outOfOrder', 'Out of Order')
            } 
            size="small"
            sx={{
              fontSize: '0.65rem',
              height: '18px',
              px: 0.5
            }}
            color={
              toiletItem.status === 'available' ? 'success' : 
              toiletItem.status === 'in_use' ? 'warning' : 'error'
            }
            variant="filled"
          />
        </Box>

        {/* Features - Compact */}
        {toiletItem.features && (toiletItem.features.isAccessible || toiletItem.features.hasBabyChangingStation) && (
          <Box sx={{ mb: 0.75 }}>
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {toiletItem.features.isAccessible && (
                <Chip 
                  icon={<AccessibleIcon sx={{ fontSize: '0.75rem !important' }} />}
                  label={t('map.accessible', 'Accessible')}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: '20px',
                    px: 0.5
                  }}
                  color="info"
                  variant="outlined"
                />
              )}
              {toiletItem.features.hasBabyChangingStation && (
                <Chip 
                  icon={<ChildCareIcon sx={{ fontSize: '0.75rem !important' }} />}
                  label="Bebek Bakım"
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: '20px',
                    px: 0.5
                  }}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Address - Compact */}
        {toiletItem.business.address && (
          <Box sx={{ 
            pt: 0.75, 
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'flex-start'
          }}>
            <LocationOnIcon sx={{ 
              fontSize: '0.75rem', 
              color: '#0891b2',
              mr: 0.4,
              mt: 0.1,
              flexShrink: 0
            }} />
            <Typography 
              variant="caption" 
              sx={{ 
                fontSize: '0.7rem', 
                lineHeight: 1.3,
                color: '#64748b',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
              title={`${toiletItem.business.address.street}, ${toiletItem.business.address.postalCode} ${toiletItem.business.address.city}`}
            >
              {toiletItem.business.address.street}, {toiletItem.business.address.postalCode} {toiletItem.business.address.city}
            </Typography>
          </Box>
        )}
      </Paper>
    </Popup>
  );
};