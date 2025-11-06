// components/business/ToiletList.jsx
import React from 'react';
import { Paper, Box, Typography, Chip } from '@mui/material';
import WcIcon from '@mui/icons-material/Wc';
import AccessibleIcon from '@mui/icons-material/Accessible';
import ChildCareIcon from '@mui/icons-material/ChildCare';

export const ToiletList = ({ toilets }) => {
  if (!toilets || toilets.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Verfügbare Toiletten
      </Typography>

      {toilets.map((toilet) => (
        <Box 
          key={toilet._id}
          sx={{ 
            p: 2, 
            mb: 2, 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            '&:last-child': { mb: 0 }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {toilet.name}
              </Typography>
             
            </Box>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              €{toilet.fee > 0 ? toilet.fee.toFixed(2) : 'Kostenlos'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<WcIcon />}
              label={toilet.status === 'available' ? 'Verfügbar' : 'Besetzt'} 
              size="small"
              color={toilet.status === 'available' ? 'success' : 'warning'}
            />
            {toilet.features?.isAccessible && (
              <Chip 
                icon={<AccessibleIcon />}
                label="Barrierefrei" 
                size="small"
                variant="outlined"
              />
            )}
            {toilet.features?.hasBabyChangingStation && (
              <Chip 
                icon={<ChildCareIcon />}
                label="Wickeltisch" 
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      ))}
    </Paper>
  );
};