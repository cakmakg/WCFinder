// components/BusinessCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActionArea, 
  Box,
  Rating,
  Chip,
  useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const BusinessCard = ({ business, isSelected }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!business) return null;

  const rating = 4.2;
  const reviewCount = 156;

  const handleClick = (e) => {
    e.stopPropagation(); // Parent onClick'i engellemek için
    navigate(`/business/${business._id}`);
  };

  return (
    <Card 
      sx={{ 
        width: '100%',
        height: '100%',
        boxShadow: 'none',
        border: `2px solid ${isSelected ? theme.palette.primary.main : theme.palette.grey[300]}`,
        borderRadius: 2,
        backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'white',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: theme.shadows[2],
          borderColor: theme.palette.primary.main,
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Business Type Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Chip 
              label={business.businessType}
              size="small"
              sx={{ 
                fontSize: '0.7rem',
                height: '20px',
                backgroundColor: theme.palette.grey[100],
                color: theme.palette.text.secondary
              }}
            />
            <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
              Am beliebtesten
            </Typography>
          </Box>

          {/* Business Name */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1rem',
              mb: 1,
              color: theme.palette.text.primary,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: '2.5rem',
              lineHeight: 1.25
            }}
          >
            {business.businessName}
          </Typography>

          {/* Opening Hours */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <AccessTimeIcon sx={{ 
              fontSize: '1rem', 
              color: theme.palette.text.secondary,
              mr: 0.5
            }} />
            <Typography variant="body2" color="text.secondary">
              {business.openingHours || '09:00 - 18:00'}
            </Typography>
            
            {/* Rating */}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
              <Rating 
                value={rating} 
                precision={0.1}
                size="small" 
                readOnly 
                sx={{ mr: 0.5 }}
              />
              <Typography variant="caption" color="text.secondary">
                {rating} ({reviewCount})
              </Typography>
            </Box>
          </Box>

          {/* Address */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <LocationOnIcon sx={{ 
              fontSize: '1rem', 
              color: theme.palette.text.secondary,
              mr: 0.5,
              mt: 0.1,
              flexShrink: 0
            }} />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.8rem', 
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
            >
              {business.address?.street}, {business.address?.postalCode} {business.address?.city}
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mt: 'auto'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                von
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                € 2
              </Typography>
              <Typography variant="body2" color="text.secondary">
                /Tag
              </Typography>
            </Box>
            
            <Box sx={{ 
              px: 2, 
              py: 0.5,
              border: `1px solid ${theme.palette.primary.main}`,
              borderRadius: 1,
              color: theme.palette.primary.main,
              fontSize: '0.8rem',
              fontWeight: 500
            }}>
              →
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BusinessCard;