// components/owner/OwnerProfileForm.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Paper,
  Box,
  Typography,
  TextField,
  Grid,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';

/**
 * OwnerProfileForm Component
 * Owner'ın kişisel bilgilerini ve business bilgilerini gösteren form component'i
 * 
 * @param {Object} ownerUser - Owner user bilgileri (currentUser)
 * @param {Object} ownerBusiness - Owner'ın business bilgileri
 */
export const OwnerProfileForm = ({ ownerUser, ownerBusiness }) => {
  const { t } = useTranslation();

  if (!ownerUser) {
    return null;
  }

  return (
    <Grid container spacing={3}>
      {/* Owner Kişisel Bilgileri */}
      <Grid item xs={12} md={4}>
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#0891b2',
                mb: 2,
                fontSize: '2.5rem',
                fontWeight: 600,
              }}
            >
              {ownerUser?.username?.[0]?.toUpperCase() || 'O'}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
              {ownerUser?.username || 'Owner'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {ownerUser?.email}
            </Typography>
            <Chip 
              label={t('myBookings.businessOwner')} 
              color="primary" 
              size="small" 
              sx={{ mt: 1 }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Kişisel Bilgiler */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PersonIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('myBookings.username')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ownerUser?.username}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('myBookings.email')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ownerUser?.email}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BusinessIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('myBookings.status')}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ownerUser?.isActive ? t('common.active') : t('common.inactive')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>

      {/* Business Bilgileri */}
      <Grid item xs={12} md={8}>
        <Paper 
          sx={{ 
            p: 3, 
            borderRadius: 3,
            boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
            border: '1px solid #e2e8f0',
            height: '100%'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <BusinessIcon sx={{ color: '#0891b2', fontSize: '2rem' }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {ownerBusiness?.businessName || t('myBookings.noBusiness')}
            </Typography>
          </Box>

          {ownerBusiness ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('myBookings.businessType')}
                  value={ownerBusiness.businessType || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('myBookings.status')}
                  value={
                    ownerBusiness.approvalStatus === 'approved' 
                      ? t('myBookings.approved') 
                      : ownerBusiness.approvalStatus === 'pending' 
                      ? t('myBookings.pending') 
                      : t('myBookings.rejected')
                  }
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('myBookings.street')}
                  value={ownerBusiness.address?.street || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('myBookings.postalCode')}
                  value={ownerBusiness.address?.postalCode || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('myBookings.city')}
                  value={ownerBusiness.address?.city || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('myBookings.openingHours')}
                  value={ownerBusiness.openingHours || t('myBookings.notSpecified')}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  size="small"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {t('myBookings.noBusiness')}
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default OwnerProfileForm;

