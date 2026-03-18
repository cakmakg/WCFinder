// components/BusinessCard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Card,
  CardContent,
  Typography,
  CardActionArea,
  Box,
  Chip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

// İşletme tipine göre renk
const TYPE_COLORS = {
  Cafe:         { bg: '#fef3c7', color: '#d97706' },
  Restaurant:   { bg: '#fce7f3', color: '#db2777' },
  Hotel:        { bg: '#ede9fe', color: '#7c3aed' },
  Shop:         { bg: '#dcfce7', color: '#16a34a' },
  'Gas Station':{ bg: '#ffedd5', color: '#ea580c' },
  Other:        { bg: '#f1f5f9', color: '#64748b' },
};

const BusinessCard = ({ business, isSelected }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, token } = useSelector((state) => state.auth);

  if (!business) return null;

  const rating = 4.2;
  const typeStyle = TYPE_COLORS[business.businessType] || TYPE_COLORS.Other;

  const handleDoubleClick = (e) => {
    e.stopPropagation();
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
        borderRadius: '14px',
        border: `1.5px solid ${isSelected ? '#0891b2' : '#e2e8f0'}`,
        boxShadow: isSelected
          ? '0 4px 20px rgba(8,145,178,0.15)'
          : '0 1px 4px rgba(0,0,0,0.05)',
        backgroundColor: isSelected ? 'rgba(8,145,178,0.02)' : 'white',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(8,145,178,0.14)',
          transform: 'translateY(-2px)',
          border: '1.5px solid #0891b2',
        },
        // Sol accent çizgisi
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3px',
          borderRadius: '14px 0 0 14px',
          background: isSelected
            ? 'linear-gradient(180deg, #0891b2, #06b6d4)'
            : 'transparent',
          transition: 'background 0.25s ease',
        },
        '&:hover::before': {
          background: 'linear-gradient(180deg, #0891b2, #06b6d4)',
        },
      }}
    >
      <CardActionArea
        onDoubleClick={handleDoubleClick}
        onClick={() => {}}
        disableRipple
        sx={{
          height: '100%',
          '&:hover .MuiCardActionArea-focusHighlight': { opacity: 0 },
        }}
      >
        <CardContent sx={{ p: 1.75, pb: '14px !important' }}>
          {/* Header: type badge + rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              label={business.businessType}
              size="small"
              sx={{
                fontSize: '0.72rem',
                height: '20px',
                px: 0.75,
                backgroundColor: typeStyle.bg,
                color: typeStyle.color,
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <StarRoundedIcon sx={{ fontSize: '0.9rem', color: '#f59e0b' }} />
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, fontSize: '0.78rem' }}>
                {rating}
              </Typography>
            </Box>
          </Box>

          {/* Business Name */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              mb: 0.75,
              color: '#0f172a',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
            title={business.businessName}
          >
            {business.businessName}
          </Typography>

          {/* Opening hours */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: '0.85rem', color: '#94a3b8', mr: 0.5, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
              {business.openingHours || '09:00 – 18:00'}
            </Typography>
          </Box>

          {/* Address */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.25 }}>
            <LocationOnIcon sx={{ fontSize: '0.85rem', color: '#0891b2', mr: 0.5, mt: 0.15, flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.8rem',
                color: '#64748b',
                lineHeight: 1.4,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {business.address?.street}, {business.address?.postalCode} {business.address?.city}
            </Typography>
          </Box>

          {/* Divider */}
          <Box sx={{ borderTop: '1px solid #f1f5f9', mb: 1.25 }} />

          {/* Footer: price + arrow */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.25 }}>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                {t('businessCard.from')}
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  color: '#0891b2',
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  mx: 0.25,
                }}
              >
                €1
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                {t('common.perDay')}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '9px',
                background: isSelected
                  ? 'linear-gradient(135deg, #0891b2, #06b6d4)'
                  : 'rgba(8,145,178,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.25s ease',
                '.MuiCard-root:hover &': {
                  background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
                },
              }}
            >
              <ArrowForwardIosIcon
                sx={{
                  fontSize: '0.7rem',
                  color: isSelected ? 'white' : '#0891b2',
                  '.MuiCard-root:hover &': { color: 'white' },
                  transition: 'color 0.25s ease',
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BusinessCard;
