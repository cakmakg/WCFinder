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
  Button,
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

        if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
          setError(t('businessDetail.invalidBusinessId'));
          setLoading(false);
          return;
        }

        const [businessResponse, toiletsResponse] = await Promise.all([
          axiosWithToken.get(`/business/${id}`),
          axiosWithToken.get(`/toilets?filter[business]=${id}`)
        ]);

        const businessData = businessResponse.data.result;
        const businessToilets = toiletsResponse.data.result || [];

        if (!businessData) {
          setError(t('businessDetail.businessNotFound'));
          setLoading(false);
          return;
        }

        setBusiness(businessData);
        setToilets(businessToilets);

      } catch (err) {
        const errorMessage = err.response?.data?.message ||
          err.message ||
          t('businessDetail.businessLoadError');

        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching business detail:', {
            businessId: id,
            status: err.response?.status,
            message: errorMessage
          });
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusinessDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Loading ──
  if (loading) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', gap: 2, bgcolor: '#f8fafc',
      }}>
        <CircularProgress size={48} thickness={3} sx={{ color: '#0891b2' }} />
        <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  // ── Error ──
  if (error || !business) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {error || t('businessDetail.businessNotFound')}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{
              color: '#0891b2', textTransform: 'none', fontWeight: 600,
              borderRadius: '20px', px: 2,
              '&:hover': { backgroundColor: 'rgba(8,145,178,0.07)' },
            }}
          >
            {t('common.backToHome')}
          </Button>
        </Container>
      </Box>
    );
  }

  const position = business.location?.coordinates
    ? [business.location.coordinates[1], business.location.coordinates[0]]
    : [50.7374, 7.0982];

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
    <Box component="main" sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/business/${id}`}
        type="website"
        structuredData={businessSchema ? [businessSchema, breadcrumbSchema].filter(Boolean) : null}
        canonical={businessUrl}
      />

      {/* ── Hero Header ── */}
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          pt: { xs: 3, sm: 4 },
          pb: { xs: 3, sm: 4 },
          px: 0,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: -40, right: -40,
            width: 200, height: 200,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container maxWidth="lg">
          {/* Geri butonu */}
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
            onClick={() => navigate('/home')}
            size="small"
            sx={{
              mb: 2.5,
              color: 'rgba(255,255,255,0.85)',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: '20px',
              px: 2,
              py: 0.5,
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'none',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.18)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
              },
            }}
          >
            Zurück
          </Button>

          {/* Badges */}
          <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
            <Chip
              icon={<BusinessIcon sx={{ fontSize: '0.8rem !important', color: 'rgba(255,255,255,0.9) !important' }} />}
              label={business.businessType}
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.18)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.72rem',
                border: '1px solid rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                '& .MuiChip-icon': { color: 'rgba(255,255,255,0.9)' },
              }}
            />
            <Chip
              label={business.approvalStatus === 'approved' ? t('businessDetail.verified') : t('businessDetail.pending')}
              size="small"
              sx={{
                backgroundColor: business.approvalStatus === 'approved'
                  ? 'rgba(22,163,74,0.25)' : 'rgba(234,179,8,0.25)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.72rem',
                border: `1px solid ${business.approvalStatus === 'approved' ? 'rgba(22,163,74,0.4)' : 'rgba(234,179,8,0.4)'}`,
              }}
            />
          </Box>

          {/* İşletme adı */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.6rem', sm: '2rem' },
                color: 'white',
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
              }}
            >
              {business.businessName}
            </Typography>
            {business.approvalStatus === 'approved' && (
              <VerifiedIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.4rem', flexShrink: 0 }} />
            )}
          </Box>

          {/* İstatistik satırı */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <AccessTimeIcon sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }} />
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {business.openingHours || t('businessDetail.today')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <WcIcon sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }} />
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {toilets.length} {toilets.length === 1 ? t('businessDetail.toilet') : t('businessDetail.toilets')}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <LocationOnIcon sx={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }} />
              <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {business.address?.street}, {business.address?.postalCode} {business.address?.city}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ── Main Content ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
        <Grid container spacing={2.5} component="article">

          {/* Sol kolon */}
          <Grid item xs={12} md={7} component="section">

            {/* Harita */}
            <Paper
              sx={{
                mb: 2.5,
                overflow: 'hidden',
                borderRadius: '16px',
                border: '1px solid rgba(8,145,178,0.1)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
              component="section"
            >
              <MapContainer
                center={position}
                zoom={15}
                style={{ height: isMobile ? '220px' : '280px', width: '100%' }}
                scrollWheelZoom={false}
              >
                <MapTileLayer mapStyle="positron" />
                <Marker position={position} />
              </MapContainer>
            </Paper>

            {/* Tuvalet listesi */}
            {toilets.length > 0 ? (
              <Box component="section">
                <ToiletList toilets={toilets} />
              </Box>
            ) : (
              <Paper sx={{ p: 3, borderRadius: '16px' }} component="section">
                <Alert severity="info" sx={{ borderRadius: '10px' }}>
                  {t('businessDetail.noToilets')}
                </Alert>
              </Paper>
            )}
          </Grid>

          {/* Sağ kolon — Booking */}
          <Grid item xs={12} md={5} component="aside">
            <Box sx={{
              position: { xs: 'static', md: 'sticky' },
              top: { md: 24 },
            }}>
              {toilets.length > 0 ? (
                <BookingPanel business={business} toilets={toilets} />
              ) : (
                <Paper sx={{ p: 3, borderRadius: '16px' }}>
                  <Alert severity="warning" sx={{ borderRadius: '10px' }}>
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
