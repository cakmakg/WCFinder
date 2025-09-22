import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';

/**
 * Tek bir işletme verisini modern bir kart içinde gösteren component.
 * @param {object} business - Gösterilecek işletme verisi.
 */
const BusinessCard = ({ business }) => {
  if (!business) return null;

  return (
    <Card sx={{ maxWidth: 345, m: 2, boxShadow: 3 }}>
      <CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {business.businessName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CategoryIcon sx={{ mr: 1, fontSize: '1rem' }} />
            {business.businessType}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon sx={{ mr: 1, fontSize: '1rem' }} />
            {`${business.address.street}, ${business.address.postalCode} ${business.address.city}`}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BusinessCard;