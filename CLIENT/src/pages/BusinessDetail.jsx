// pages/BusinessDetail.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from 'framer-motion';
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
import { COLORS, RADII, SHADOWS, PAGE_HEADER_BG, DOT_GRID, TYPOGRAPHY } from '../theme/designTokens';

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
  const reduce = useReducedMotion();

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

        if (import.meta.env.DEV) {
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
        minHeight: '100vh', gap: 2, bgcolor: COLORS.backgroundLight,
      }}>
        <CircularProgress size={48} thickness={3} sx={{ color: COLORS.primary }} />
        <Typography sx={{ color: COLORS.textLight, fontSize: '0.9rem', fontWeight: 500 }}>
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  // ── Error ──
  if (error || !business) {
    return (
      <Box sx={{ bgcolor: COLORS.backgroundLight, minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 2, borderRadius: RADII.input }}>
            {error || t('businessDetail.businessNotFound')}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/home')}
            sx={{
              color: COLORS.primary, textTransform: 'none', fontWeight: 600,
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
    { name: 'Startseite', url: baseUrl },
    { name: 'Unternehmen', url: `${baseUrl}/home` },
    { name: business.businessName, url: businessUrl },
  ]) : null;

  const seoTitle = business ? generateTitle(business) : 'Geschäftsdetails | WCFinder';
  const seoDescription = business ? generateDescription(business) : 'Toiletten an diesem Standort finden und buchen.';
  const seoKeywords = business ? generateKeywords(business) : 'toilette, wc, buchung';

  return (
    <Box component="main" sx={{ minHeight: '100vh', bgcolor: COLORS.backgroundLight }}>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        url={`/business/${id}`}
        type="website"
        structuredData={businessSchema ? [businessSchema, breadcrumbSchema].filter(Boolean) : null}
        canonical={businessUrl}
      />

      {/* ── Heller Seitenkopf ── */}
      <Box
        component="header"
        sx={{
          background: PAGE_HEADER_BG,
          pt: { xs: 3.5, sm: 4.5 },
          pb: { xs: 3, sm: 4 },
          px: 0,
          position: 'relative',
          overflow: 'hidden',
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {/* Dezentes Punktraster als Textur */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            ...DOT_GRID,
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.7), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Zurück-Button */}
            <Button
              startIcon={<ArrowBackIcon sx={{ fontSize: '1rem !important' }} />}
              onClick={() => navigate('/home')}
              size="small"
              sx={{
                mb: 2.5,
                color: COLORS.primary,
                backgroundColor: 'rgba(8,145,178,0.08)',
                borderRadius: '20px',
                px: 2,
                py: 0.5,
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'none',
                border: '1px solid rgba(8,145,178,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(8,145,178,0.14)',
                  color: COLORS.primaryDark,
                },
              }}
            >
              Zurück
            </Button>

            {/* Badges */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                icon={<BusinessIcon sx={{ fontSize: '0.8rem !important' }} />}
                label={business.businessType}
                size="small"
                sx={{
                  backgroundColor: COLORS.accentBoxBg,
                  color: COLORS.primaryDark,
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  border: '1px solid rgba(8,145,178,0.25)',
                  '& .MuiChip-icon': { color: COLORS.primary },
                }}
              />
              <Chip
                label={business.approvalStatus === 'approved' ? t('businessDetail.verified') : t('businessDetail.pending')}
                size="small"
                sx={{
                  backgroundColor: business.approvalStatus === 'approved' ? '#dcfce7' : '#fef3c7',
                  color: business.approvalStatus === 'approved' ? '#16a34a' : '#d97706',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  border: `1px solid ${business.approvalStatus === 'approved' ? 'rgba(22,163,74,0.25)' : 'rgba(217,119,6,0.25)'}`,
                }}
              />
            </Box>

            {/* Name des Unternehmens */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Typography
                variant="h1"
                component="h1"
                sx={{
                  ...TYPOGRAPHY.pageTitle,
                  fontSize: { xs: '1.6rem', sm: '2.1rem' },
                  lineHeight: 1.2,
                }}
              >
                {business.businessName}
              </Typography>
              {business.approvalStatus === 'approved' && (
                <VerifiedIcon sx={{ color: COLORS.primary, fontSize: '1.4rem', flexShrink: 0 }} />
              )}
            </Box>

            {/* Info-Zeile */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1.5, sm: 2.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <AccessTimeIcon sx={{ fontSize: '0.9rem', color: COLORS.textLight }} />
                <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, fontWeight: 500 }}>
                  {business.openingHours || t('businessDetail.today')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <WcIcon sx={{ fontSize: '0.9rem', color: COLORS.textLight }} />
                <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, fontWeight: 500 }}>
                  {toilets.length} {toilets.length === 1 ? t('businessDetail.toilet') : t('businessDetail.toilets')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <LocationOnIcon sx={{ fontSize: '0.9rem', color: COLORS.textLight }} />
                <Typography sx={{ fontSize: '0.82rem', color: COLORS.textSecondary, fontWeight: 500 }}>
                  {business.address?.street}, {business.address?.postalCode} {business.address?.city}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* ── Hauptinhalt ── */}
      <Container maxWidth="lg" sx={{ py: { xs: 2.5, sm: 3.5 } }}>
        <Box
          component="article"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 7fr) minmax(0, 5fr)' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >

          {/* Linke Spalte */}
          <Box component="section" sx={{ minWidth: 0 }}>

            {/* Karte */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                sx={{
                  mb: 2.5,
                  overflow: 'hidden',
                  borderRadius: RADII.panel,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: SHADOWS.subtle,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: SHADOWS.hover,
                  },
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
            </motion.div>

            {/* Toilettenliste */}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: 0.08 }}
            >
              {toilets.length > 0 ? (
                <Box component="section">
                  <ToiletList toilets={toilets} />
                </Box>
              ) : (
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: RADII.panel,
                    border: `1px solid ${COLORS.border}`,
                    boxShadow: SHADOWS.subtle,
                  }}
                  component="section"
                >
                  <Alert severity="info" sx={{ borderRadius: '10px' }}>
                    {t('businessDetail.noToilets')}
                  </Alert>
                </Paper>
              )}
            </motion.div>
          </Box>

          {/* Rechte Spalte — Buchung */}
          <Box component="aside" sx={{ minWidth: 0 }}>
            <Box sx={{
              position: { xs: 'static', md: 'sticky' },
              top: { md: 24 },
            }}>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: 0.16 }}
              >
                {toilets.length > 0 ? (
                  <BookingPanel business={business} toilets={toilets} />
                ) : (
                  <Paper
                    sx={{
                      p: 3,
                      borderRadius: RADII.panel,
                      border: `1px solid ${COLORS.border}`,
                      boxShadow: SHADOWS.subtle,
                    }}
                  >
                    <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                      {t('businessDetail.reservationNotPossible')}
                    </Alert>
                  </Paper>
                )}
              </motion.div>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default BusinessDetail;
