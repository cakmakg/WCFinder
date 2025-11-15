// pages/StartPage.jsx - COMPACT VERSION
import React, { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Typography,
  useTheme,
  useMediaQuery,
  Container,
  TextField,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Grid,
  Rating,
  AppBar,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import MapIcon from "@mui/icons-material/Map";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentIcon from "@mui/icons-material/Payment";
import StarIcon from "@mui/icons-material/Star";
import QrCodeIcon from "@mui/icons-material/QrCode";
import LockIcon from "@mui/icons-material/Lock";
import ClearIcon from "@mui/icons-material/Clear";
import WcIcon from "@mui/icons-material/Wc";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";
import AuthModal from "../components/AuthModal";

const StartPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [searchLocation, setSearchLocation] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (location.state?.openLoginModal) {
      setAuthModalOpen(true);
    }
  }, [location.state]);

  const handleSearch = async () => {
    if (searchLocation.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        navigate(`/home?search=${encodeURIComponent(searchLocation.trim())}`);
      }, 500);
    } else {
      navigate('/home');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchLocation("");
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            const city = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.municipality ||
                        "Unknown location";
            
            setSearchLocation(city);
            setIsSearching(false);
            
            setTimeout(() => {
              navigate(`/home?search=${encodeURIComponent(city)}`);
            }, 300);
          } catch (error) {
            console.error("Error getting location name:", error);
            setSearchLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setIsSearching(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert(t('startPage.locationError'));
          setIsSearching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert(t('startPage.locationNotSupported'));
    }
  };

  const reviews = [
    {
      name: "Michael K.",
      time: "vor einem Tag",
      rating: 5,
      text: "Sehr saubere Einrichtung. Absolut empfehlenswert!",
    },
    {
      name: "Sara K.",
      time: "vor einem Tag",
      rating: 5,
      text: "Einfacher Ablauf und sichere Umgebung.",
    },
    {
      name: "Bhranswan N.",
      time: "vor 2 Tagen",
      rating: 5,
      text: "Freundlicher Service. Sehr zu empfehlen!",
    },
    {
      name: "Byron S.",
      time: "vor 2 Tagen",
      rating: 5,
      text: "Perfekt zugänglich und sehr sauber.",
    },
  ];

  const features = [
    {
      icon: <MapIcon sx={{ fontSize: 40, color: '#0891b2' }} />,
      title: t('startPage.features.interactiveMap.title'),
      description: t('startPage.features.interactiveMap.description'),
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 40, color: '#0891b2' }} />,
      title: t('startPage.features.easyBooking.title'),
      description: t('startPage.features.easyBooking.description'),
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: '#0891b2' }} />,
      title: t('startPage.features.securePayment.title'),
      description: t('startPage.features.securePayment.description'),
    },
    {
      icon: <StarIcon sx={{ fontSize: 40, color: '#0891b2' }} />,
      title: t('startPage.features.reviews.title'),
      description: t('startPage.features.reviews.description'),
    },
    {
      icon: <QrCodeIcon sx={{ fontSize: 40, color: '#0891b2' }} />,
      title: t('startPage.features.qrCode.title'),
      description: t('startPage.features.qrCode.description'),
    },
    {
      icon: <LockIcon sx={{ fontSize: 40, color: '#0891b2' }} />,
      title: t('startPage.features.safeClean.title'),
      description: t('startPage.features.safeClean.description'),
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Compact Header */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexGrow: 1,
              cursor: "pointer",
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WcIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#0891b2",
                display: { xs: "none", sm: "block" },
              }}
            >
              WCFinder
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#0891b2" },
                }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('startPage.featuresNav')}
              </Typography>
              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#0891b2" },
                }}
                onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {t('startPage.reviews')}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setAuthModalOpen(true)}
                sx={{
                  borderColor: "#0891b2",
                  color: "#0891b2",
                  fontWeight: 600,
                  borderWidth: 1.5,
                  borderRadius: 2,
                  px: 2.5,
                  py: 0.75,
                  fontSize: '0.875rem',
                  "&:hover": {
                    backgroundColor: "#0891b2",
                    color: "white",
                    borderWidth: 1.5,
                  },
                }}
              >
                {t('startPage.loginButton')}
              </Button>
            </Box>
          )}

          {isMobile && (
            <Button
              variant="outlined"
              onClick={() => setAuthModalOpen(true)}
              size="small"
              sx={{
                borderColor: "#0891b2",
                color: "#0891b2",
                fontWeight: 600,
                borderWidth: 1.5,
                borderRadius: 2,
                fontSize: '0.8rem',
                "&:hover": {
                  backgroundColor: "#0891b2",
                  color: "white",
                  borderWidth: 1.5,
                },
              }}
            >
              {t('startPage.loginButtonMobile')}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        redirectAfterLogin={location.state?.from || '/home'}
        businessName={location.state?.businessName}
      />

      {/* Compact Hero Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        sx={{
          position: "relative",
          height: { xs: "auto", md: 500 },
          mt: { xs: 7, sm: 8 },
          background: "linear-gradient(135deg, rgba(8,145,178,0.9) 0%, rgba(6,182,212,0.7) 100%)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          py: { xs: 3, md: 0 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <Container maxWidth="lg">
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    mb: 1.5,
                    lineHeight: 1.2,
                  }}
                >
                  {t('startPage.title')}
                  <br />
                  {t('startPage.subtitle')}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "white",
                    mb: 2,
                    opacity: 0.95,
                  }}
                >
                  {t('startPage.description')}
                </Typography>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Card
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {t('startPage.searchTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('startPage.searchSubtitle')}
                    </Typography>

                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder={t('startPage.searchPlaceholder')}
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSearching}
                      size="small"
                      sx={{ mb: 1.5 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {isSearching ? (
                              <CircularProgress size={18} />
                            ) : (
                              <SearchIcon sx={{ color: "#999", fontSize: '1.2rem' }} />
                            )}
                          </InputAdornment>
                        ),
                        endAdornment: searchLocation && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleClearSearch}
                              sx={{ "&:hover": { backgroundColor: "#f3f4f6" } }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleGetLocation}
                              disabled={isSearching}
                              sx={{
                                backgroundColor: "#f3f4f6",
                                "&:hover": { backgroundColor: "#e5e7eb" },
                              }}
                            >
                              <MyLocationIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 2,
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#e2e8f0',
                          }
                        }
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate('/home')}
                      disabled={isSearching}
                      sx={{
                        background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                        py: 1.25,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                        "&:hover": {
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 20px rgba(8,145,178,0.3)",
                        },
                        "&:disabled": {
                          background: "#cbd5e1",
                        }
                      }}
                    >
                      {isSearching ? (
                        <CircularProgress size={20} sx={{ color: "white" }} />
                      ) : (
                        t('startPage.searchButton')
                      )}
                    </Button>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block", 
                        mt: 1.5, 
                        textAlign: "center",
                        color: "text.secondary",
                        fontSize: '0.75rem'
                      }}
                    >
                      {t('startPage.searchHint')}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Compact Reviews */}
      <Box sx={{ py: 5, backgroundColor: "white" }} id="reviews">
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 0.5, fontWeight: 600 }}>
                <strong style={{ color: "#0891b2" }}>327.000+</strong> {t('startPage.trustTitle').replace('327.000+ ', '')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('startPage.trustSubtitle')}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              {reviews.map((review, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: "100%",
                      backgroundColor: "#f9fafb",
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {review.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {review.time}
                          </Typography>
                        </Box>
                        <Rating value={review.rating} readOnly size="small" sx={{ fontSize: '1rem' }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {review.text}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Compact Features */}
      <Box
        sx={{
          py: 5,
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        }}
        id="features"
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {t('startPage.whyTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('startPage.whySubtitle')}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: 2,
                    borderRadius: 2,
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 1.5 }}>
                    <Box sx={{ mb: 1.5 }}>{feature.icon}</Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Compact Footer CTA */}
      <Box
        sx={{
          py: 4,
          backgroundColor: "white",
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
            {t('startPage.readyTitle')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5 }}>
            {t('startPage.readySubtitle')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/home')}
            sx={{
              background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
              px: 5,
              py: 1.25,
              fontSize: "1rem",
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px rgba(8,145,178,0.3)",
              },
            }}
          >
            {t('startPage.readyButton')}
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: "#1e293b",
          color: "white",
          pt: 5,
          pb: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Links Section */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "white",
                  fontSize: '1rem'
                }}
              >
                {t('startPage.footer.kontakt')}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  component="a"
                  href="mailto:info@wcfinder.com"
                  sx={{
                    color: "#cbd5e1",
                    textDecoration: "none",
                    fontSize: '0.875rem',
                    "&:hover": { color: "#0891b2" },
                  }}
                >
                  info@wcfinder.com
                </Typography>
                <Typography
                  sx={{
                    color: "#cbd5e1",
                    fontSize: '0.875rem',
                  }}
                >
                  +49 (0) 123 456 789
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "white",
                  fontSize: '1rem'
                }}
              >
                {t('startPage.footer.uberUns')}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: "#cbd5e1",
                    textDecoration: "none",
                    fontSize: '0.875rem',
                    "&:hover": { color: "#0891b2" },
                  }}
                >
                  {t('startPage.footer.uberUns')}
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: "#cbd5e1",
                    textDecoration: "none",
                    fontSize: '0.875rem',
                    "&:hover": { color: "#0891b2" },
                  }}
                >
                  {t('startPage.footer.partnerWerden')}
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: "#cbd5e1",
                    textDecoration: "none",
                    fontSize: '0.875rem',
                    "&:hover": { color: "#0891b2" },
                  }}
                >
                  {t('startPage.footer.wieFunktioniertDas')}
                </Typography>
              </Box>
            </Grid>

            {/* Social Media & App Store */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "white",
                  fontSize: '1rem'
                }}
              >
                {t('startPage.footer.followUs')}
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
                <IconButton
                  component="a"
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#cbd5e1",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      backgroundColor: "#0891b2",
                      color: "white",
                    },
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#cbd5e1",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      backgroundColor: "#0891b2",
                      color: "white",
                    },
                  }}
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#cbd5e1",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      backgroundColor: "#0891b2",
                      color: "white",
                    },
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  component="a"
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#cbd5e1",
                    backgroundColor: "rgba(255,255,255,0.1)",
                    "&:hover": {
                      backgroundColor: "#0891b2",
                      color: "white",
                    },
                  }}
                >
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* App Store Links */}
            <Grid item xs={12} sm={6} md={3}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: "white",
                  fontSize: '1rem'
                }}
              >
                {t('startPage.footer.downloadApp')}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Button
                  component="a"
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<AppleIcon />}
                  sx={{
                    borderColor: "#475569",
                    color: "white",
                    textTransform: 'none',
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: "#0891b2",
                      backgroundColor: "rgba(8,145,178,0.1)",
                    },
                  }}
                >
                  {t('startPage.footer.appStore')}
                </Button>
                <Button
                  component="a"
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<AndroidIcon />}
                  sx={{
                    borderColor: "#475569",
                    color: "white",
                    textTransform: 'none',
                    justifyContent: "flex-start",
                    "&:hover": {
                      borderColor: "#0891b2",
                      backgroundColor: "rgba(8,145,178,0.1)",
                    },
                  }}
                >
                  {t('startPage.footer.googlePlay')}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Section */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid #334155",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#94a3b8",
                fontSize: '0.875rem',
              }}
            >
              {t('startPage.footer.copyright')}
            </Typography>
            <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <Typography
                component="a"
                href="#"
                sx={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: '0.875rem',
                  "&:hover": { color: "#0891b2" },
                }}
              >
                {t('startPage.footer.privacy')}
              </Typography>
              <Typography
                component="a"
                href="#"
                sx={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: '0.875rem',
                  "&:hover": { color: "#0891b2" },
                }}
              >
                {t('startPage.footer.terms')}
              </Typography>
              <Typography
                component="a"
                href="#"
                sx={{
                  color: "#94a3b8",
                  textDecoration: "none",
                  fontSize: '0.875rem',
                  "&:hover": { color: "#0891b2" },
                }}
              >
                {t('startPage.footer.imprint')}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default StartPage;