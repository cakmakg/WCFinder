// components/BusinessListItem.jsx (SADELEŞTİRİLMİŞ HALİ)

import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { COLORS, RADII, SHADOWS } from '../theme/designTokens';

const BusinessListItem = ({ business }) => {
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        mb: 1.5,
        borderRadius: RADII.card,
        backgroundColor: 'white',
        border: `1px solid ${COLORS.border}`,
        boxShadow: SHADOWS.subtle,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: SHADOWS.hover,
          borderColor: COLORS.primary,
        },
      }}
    >
      <CardActionArea onClick={() => navigate(`/businesses/${business._id}`)}>
        <CardContent>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: COLORS.textHeading, letterSpacing: '-0.02em' }}
          >
            {business.businessName}
          </Typography>
          <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
            {business.address.city}, {business.businessType}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BusinessListItem;
