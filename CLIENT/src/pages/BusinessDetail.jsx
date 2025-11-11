// pages/BusinessDetail.jsx
import React, { useEffect, useState } from 'react';
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
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { BookingPanel } from '../components/business/BookingPanel';
import { ToiletList } from '../components/business/ToiletList';
import useAxios from '../hook/useAxios';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const BusinessDetail = () => {
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
        const toiletsResponse = await axiosWithToken.get(`/toilet`);
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
        setError(err.response?.data?.message || 'İşletme bilgileri yüklenemedi');
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
          {error || 'İşletme bulunamadı'}
        </Alert>
        <IconButton onClick={() => navigate('/')}>
          <ArrowBackIcon />
          <Typography sx={{ ml: 1 }}>Ana Sayfaya Dön</Typography>
        </IconButton>
      </Container>
    );
  }

  const position = business.location?.coordinates 
    ? [business.location.coordinates[1], business.location.coordinates[0]]
    : [50.7374, 7.0982];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <IconButton onClick={() => navigate('/')} sx={{ mb: 2 }}>
            <ArrowBackIcon />
          </IconButton>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
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
                    label={business.approvalStatus === 'approved' ? 'Verifiziert' : 'Ausstehend'} 
                    size="small" 
                    color={business.approvalStatus === 'approved' ? 'success' : 'warning'}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                      {business.openingHours || 'Heute, 00:30 — 23:30'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <WcIcon fontSize="small" />
                    <Typography variant="body2">
                      {toilets.length} {toilets.length === 1 ? 'Toilette' : 'Toiletten'}
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
        <Grid container spacing={3}>
          {/* Left Column - Details */}
          <Grid item xs={12} md={7}>
            {/* Map */}
            <Paper sx={{ mb: 3, overflow: 'hidden', borderRadius: 2 }}>
              <MapContainer 
                center={position} 
                zoom={15} 
                style={{ height: isMobile ? '250px' : '300px', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={position} />
              </MapContainer>
            </Paper>

            {/* Standort Info */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Standort
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Nach der Buchung wird die Adresse veröffentlicht
              </Typography>
            </Paper>

            {/* Available Toilets */}
            {toilets.length > 0 ? (
              <ToiletList toilets={toilets} />
            ) : (
              <Paper sx={{ p: 3 }}>
                <Alert severity="info">
                  Keine Toiletten verfügbar für dieses Geschäft
                </Alert>
              </Paper>
            )}
          </Grid>

          {/* Right Column - Booking Panel */}
          <Grid item xs={12} md={5}>
            <Box sx={{ 
              position: { xs: 'static', md: 'sticky' }, // Mobile'da sticky kaldır
              top: { md: 24 } 
            }}>
              {toilets.length > 0 ? (
                <BookingPanel business={business} toilets={toilets} />
              ) : (
                <Paper sx={{ p: 3 }}>
                  <Alert severity="warning">
                    Reservierung derzeit nicht möglich - keine Toiletten verfügbar
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