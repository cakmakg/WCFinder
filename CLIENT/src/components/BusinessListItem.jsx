// components/BusinessListItem.jsx (SADELEŞTİRİLMİŞ HALİ)

import React from 'react';
import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const BusinessListItem = ({ business }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ mb: 1.5, borderRadius: 2 }}>
      <CardActionArea onClick={() => navigate(`/businesses/${business._id}`)}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {business.businessName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {business.address.city}, {business.businessType}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BusinessListItem;