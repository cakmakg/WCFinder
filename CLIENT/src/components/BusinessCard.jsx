// components/BusinessCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const BusinessCard = ({ business, isSelected }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const { currentUser, token } = useSelector((state) => state.auth);

  if (!business) return null;

  const rating = 4.2;
  const reviewCount = 156;

  const handleClick = (e) => {
    e.stopPropagation();
    
    // Business detail sayfası private route, login kontrolü PrivateRouter'da yapılıyor
    if (!currentUser || !token) {
      navigate('/', { 
        state: { 
          openLoginModal: true,
          from: `/business/${business._id}`,
          businessName: business.businessName 
        } 
      });
      return;
    }
    
    navigate(`/business/${business._id}`);
  };

  return (
    <Card 
      sx={{ 
        width: '100%',
        maxWidth: '100%',
        boxShadow: isSelected ? '0 4px 16px rgba(8,145,178,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
        border: `1.5px solid ${isSelected ? '#0891b2' : 'transparent'}`,
        borderRadius: 2.5,
        backgroundColor: isSelected ? 'rgba(8,145,178,0.03)' : 'white',
        transition: 'all 0.3s ease',
        mb: 1.5,
        '&:hover': {
          boxShadow: '0 6px 20px rgba(8,145,178,0.15)',
          transform: 'translateY(-2px)',
          borderColor: '#0891b2',
        },
        '&:hover .arrow-icon': {
          transform: 'translateX(3px)',
        }
      }}
    >
      <CardActionArea 
        onClick={handleClick}
        sx={{ 
          height: '100%',
        }}
      >
        <CardContent sx={{ p: 1.5 }}>
          {/* Header: Badge & Popular */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 1,
            gap: 0.5
          }}>
            <Chip 
              label={business.businessType}
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
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 600,
                color: '#0891b2',
                fontSize: '0.65rem',
                whiteSpace: 'nowrap',
              }}
            >
              ⭐
            </Typography>
          </Box>

          {/* Business Name - Compact */}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700,
              fontSize: '0.875rem',
              mb: 1,
              color: '#1e293b',
              height: '2.4rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
            }}
            title={business.businessName}
          >
            {business.businessName}
          </Typography>

          {/* Opening Hours & Rating - Single Row */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.75,
            gap: 1
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
              <AccessTimeIcon sx={{ 
                fontSize: '0.875rem', 
                color: '#64748b',
                mr: 0.4,
                flexShrink: 0
              }} />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#64748b', 
                  fontSize: '0.7rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {business.openingHours || '09:00-18:00'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexShrink: 0 }}>
              <Rating 
                value={rating} 
                precision={0.1}
                size="small" 
                readOnly 
                sx={{ 
                  fontSize: '0.875rem',
                  '& .MuiRating-iconFilled': {
                    color: '#f59e0b',
                  }
                }}
              />
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {rating}
              </Typography>
            </Box>
          </Box>

          {/* Address - Compact */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            mb: 1,
          }}>
            <LocationOnIcon sx={{ 
              fontSize: '0.875rem', 
              color: '#0891b2',
              mr: 0.4,
              mt: 0.1,
              flexShrink: 0
            }} />
            <Typography 
              variant="body2" 
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
              title={`${business.address?.street}, ${business.address?.postalCode} ${business.address?.city}`}
            >
              {business.address?.street}, {business.address?.postalCode} {business.address?.city}
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ 
            borderTop: '1px solid #e2e8f0',
            my: 1
          }} />

          {/* Price & Action Button - Compact */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3 }}>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontSize: '0.65rem' 
                }}
              >
                ab
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: '#0891b2', 
                  fontSize: '1rem',
                  lineHeight: 1
                }}
              >
                €2
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: '#64748b', 
                  fontSize: '0.65rem' 
                }}
              >
                /Tag
              </Typography>
            </Box>
            
            <Box 
              className="arrow-icon"
              sx={{ 
                width: 28,
                height: 28,
                background: 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'transform 0.3s ease',
                boxShadow: '0 2px 6px rgba(8,145,178,0.25)',
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: '0.875rem' }} />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BusinessCard;