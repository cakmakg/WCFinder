// pages/BusinessDetail.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedIcon from '@mui/icons-material/Verified';
import WcIcon from '@mui/icons-material/Wc';
import { MapContainer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BookingPanel } from '../components/business/BookingPanel';
import { ToiletList } from '../components/business/ToiletList';
import { MapTileLayer } from '../components/map/MapTileLayer';
import useAxios from '../hook/useAxios';
import SEOHead from '../components/SEO/SEOHead';
import { generateLocalBusinessSchema, generateBreadcrumbSchema, generateTitle, generateDescription, generateKeywords } from '../utils/seoHelpers';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const BusinessDetail = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { id } = useParams();
  const navigate = useNavigate();
  const { axiosWithToken } = useAxios();
  
  const [business, setBusiness] = useState(null);
  const [toilets, setToilets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusinessDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Business bilgisi
        const { data } = await axiosWithToken.get(`/business/${id}`);
        setBusiness(data.result);

        // Tüm tuvaletleri çek
        const toiletsResponse = await axiosWithToken.get(`/toilets`);
        const allToilets = toiletsResponse.data.result;
        
        // Bu business'a ait olanları filtrele ve null business'ları atla
        const businessToilets = allToilets.filter(toilet => {
          const toiletBusinessId = toilet.business?._id || toilet.business;
          
          // Null business'ları atla
          if (!toiletBusinessId) {
            console.warn('⚠️ Toilet with null business:', toilet.name);
            return false;
          }
          
          // Bu business'a ait mi kontrol et
          return String(toiletBusinessId) === String(id);
        });
        
        console.log(`✅ Found ${businessToilets.length} toilets for business:`, data.result.businessName);
        setToilets(businessToilets);
        
      } catch (err) {
        console.error('❌ Error fetching business:', err);
        setError(err.response?.data?.message || t('businessDetail.businessLoadError'));
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusinessDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !business) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || t('businessDetail.businessNotFound')}
        </Alert>
        <IconButton onClick={() => navigate('/home')}>
          <ArrowBackIcon />
          <Typography sx={{ ml: 1 }}>{t('common.backToHome')}</Typography>
        </IconButton>
      </Container>
    );
  }

  const position = business.location?.coordinates 
    ? [business.location.coordinates[1], business.location.coordinates[0]]
    : [50.7374, 7.0982];

  // SEO için structured data ve meta tags
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;
  const businessUrl = `${baseUrl}/business/${id}`;
  const businessSchema = business ? generateLocalBusinessSchema(business) : null;
  const breadcrumbSchema = business ? generateBreadcrumbSchema([
    { name: 'Home', url: baseUrl },
    { name: 'Businesses', url: `${baseUrl}/home` },
    { name: business.businessName, url: businessUrl },
  ]) : null;

  const seoTitle = business ? generateTitle(business) : 'Business Details | WCFinder';
  const seoDescription = business ? generateDescription(business) : 'Find and book toilets at this business location.';
  const seoKeywords = business ? generateKeywords(business) : 'toilet, wc, tuvalet, booking';

  return (
    <Box component="main" sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/business/${id}`}
        type="website"
        structuredData={businessSchema ? [businessSchema, breadcrumbSchema].filter(Boolean) : null}
        canonical={businessUrl}
      />
      <Container maxWidth="lg">
        {/* Header */}
        <Box component="header" sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/home')} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>

          <Paper sx={{ p: 3, mb: 3 }} component="article">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h1" component="h1" sx={{ fontWeight: 600, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    {business.businessName}
                  </Typography>
                  {business.approvalStatus === 'approved' && (
                    <VerifiedIcon color="primary" />
                  )}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    icon={<BusinessIcon />}
                    label={business.businessType} 
                    size="small" 
                    color="primary"
                  />
                  <Chip 
                    label={business.approvalStatus === 'approved' ? t('businessDetail.verified') : t('businessDetail.pending')} 
                    size="small" 
                    color={business.approvalStatus === 'approved' ? 'success' : 'warning'}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                      {business.openingHours || t('businessDetail.today')}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WcIcon fontSize="small" />
                    <Typography variant="body2">
                      {toilets.length} {toilets.length === 1 ? t('businessDetail.toilet') : t('businessDetail.toilets')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, mt: 1 }}>
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {business.address?.street}, {business.address?.postalCode} {business.address?.city}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Main Content Grid */}
        <Grid container spacing={3} component="article">
          {/* Left Column - Details */}
          <Grid item xs={12} md={7} component="section">
            {/* Map */}
            <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 2 }} component="section">
              <MapContainer 
                center={position} 
                zoom={15} 
                style={{ height: isMobile ? '250px' : '300px', width: '100%' }}
                scrollWheelZoom={false}
              >
                {/* Modern CartoDB Positron harita teması */}
                <MapTileLayer mapStyle="positron" />
                <Marker position={position} />
              </MapContainer>
            </Paper>

            {/* Standort Info */}
            <Paper sx={{ p: 3, mb: 3 }} component="section">
              <Typography variant="h2" component="h2" sx={{ mb: 2, fontWeight: 600, fontSize: '1.25rem' }}>
                {t('businessDetail.location')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('businessDetail.locationDescription')}
              </Typography>
            </Paper>

            {/* Available Toilets */}
            {toilets.length > 0 ? (
              <Box component="section">
                <ToiletList toilets={toilets} />
              </Box>
            ) : (
              <Paper sx={{ p: 3 }} component="section">
                <Alert severity="info">
                  {t('businessDetail.noToilets')}
                </Alert>
              </Paper>
            )}
          </Grid>

          {/* Right Column - Booking Panel */}
          <Grid item xs={12} md={5} component="aside">
            <Box sx={{ 
              position: { xs: 'static', md: 'sticky' }, // Mobile'da sticky kaldır
              top: { md: 24 } 
            }}>
              {toilets.length > 0 ? (
                <BookingPanel business={business} toilets={toilets} />
              ) : (
                <Paper sx={{ p: 3 }}>
                  <Alert severity="warning">
                    {t('businessDetail.reservationNotPossible')}
                  </Alert>
                </Paper>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default BusinessDetail;