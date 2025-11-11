import React, { useState, useEffect } from "react";
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
import AuthModal from "../components/AuthModal";
import { Logo } from "../components/layout/Logo";

const StartPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const [searchLocation, setSearchLocation] = useState("");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // BusinessCard'dan yönlendirme ile gelindi mi kontrol et
  useEffect(() => {
    if (location.state?.openLoginModal) {
      setAuthModalOpen(true);
    }
  }, [location.state]);

  // Handle search and navigate to Dashboard
  const handleSearch = async () => {
    if (searchLocation.trim()) {
      setIsSearching(true);
      
      // Simulate search delay
      setTimeout(() => {
        setIsSearching(false);
        // Navigate to Home (Dashboard) with search query
        navigate(`/home?search=${encodeURIComponent(searchLocation.trim())}`);
      }, 500);
    } else {
      // If empty, just navigate to Home
      navigate('/home');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Clear search and reset
  const handleClearSearch = () => {
    setSearchLocation("");
  };

  // Get user's current location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use reverse geocoding to get city name from coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
            );
            const data = await response.json();
            
            // Extract city name
            const city = data.address.city || 
                        data.address.town || 
                        data.address.village || 
                        data.address.municipality ||
                        "Unknown location";
            
            setSearchLocation(city);
            setIsSearching(false);
            
            // Automatically navigate to Home with the location
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
          alert("Standort konnte nicht ermittelt werden. Bitte Standort manuell eingeben.");
          setIsSearching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      alert("Geolocation wird von deinem Browser nicht unterstützt.");
    }
  };

  const reviews = [
    {
      name: "Michael K.",
      time: "vor einem Tag",
      rating: 5,
      text: "Bequemer Ort, um meine Tasche für ein paar Stunden aufzubewahren. Der Besitzer war sehr freundlich und hilfsbereit.",
    },
    {
      name: "Sara K. J. K.",
      time: "vor einem Tag",
      rating: 5,
      text: "Der gesamte Ablauf war sehr einfach. Saubere und sichere Einrichtung. Würde auf jeden Fall wieder nutzen!",
    },
    {
      name: "Bhranswan N. L.",
      time: "vor 2 Tagen",
      rating: 5,
      text: "Ein Mitarbeiter des Ladens ist sehr freundlich und zuverlässig. Die Toilette war sehr sauber. Sehr empfehlenswert!",
    },
    {
      name: "Byron S.",
      time: "vor 2 Tagen",
      rating: 5,
      text: "Nette und einfache Gegend. Toilette war perfekt zugänglich und in ausgezeichnetem Zustand. Sehr zu empfehlen.",
    },
  ];

  const features = [
    {
      icon: <MapIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: "Interaktive Karte",
      description: "Finde Toiletten in Echtzeit auf unserer benutzerfreundlichen Karte",
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: "Einfache Reservierung",
      description: "Buche im Voraus und spare Zeit - keine Wartezeiten mehr",
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: "Sichere Zahlung",
      description: "Stripe und PayPal Integration für sichere Transaktionen",
    },
    {
      icon: <StarIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: "Bewertungen",
      description: "Lies echte Bewertungen von anderen Nutzern",
    },
    {
      icon: <QrCodeIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: "QR-Code Zugang",
      description: "Schneller und kontaktloser Zugang mit QR-Code",
    },
    {
      icon: <LockIcon sx={{ fontSize: 48, color: theme.palette.primary.main }} />,
      title: "Sicher & Sauber",
      description: "Alle Toiletten werden regelmäßig gereinigt und überprüft",
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
      {/* Header */}
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar>
          <Logo onClick={() => navigate('/')} />

          {!isMobile && (
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              <Typography
                sx={{
                  color: "#333",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#0891b2" },
                }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Features
              </Typography>
              <Typography
                sx={{
                  color: "#333",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#0891b2" },
                }}
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              >
                So funktioniert's
              </Typography>
              <Typography
                sx={{
                  color: "#333",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#0891b2" },
                }}
                onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Bewertungen
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setAuthModalOpen(true)}
                sx={{
                  borderColor: "#0891b2",
                  color: "#0891b2",
                  fontWeight: 600,
                  borderWidth: 2,
                  borderRadius: 2,
                  px: 3,
                  "&:hover": {
                    backgroundColor: "#0891b2",
                    color: "white",
                    borderWidth: 2,
                  },
                }}
              >
                Einloggen
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
                borderWidth: 2,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: "#0891b2",
                  color: "white",
                  borderWidth: 2,
                },
              }}
            >
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        redirectAfterLogin={location.state?.from || '/home'}
        businessName={location.state?.businessName}
      />

      {/* Hero Section */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          position: "relative",
          height: { xs: "auto", sm: 500, md: 600 }, // Tablet için orta boy
          minHeight: { xs: 400, sm: 500 }, // Mobile'da minimum yükseklik
          mt: 8,
          background: "linear-gradient(135deg, rgba(8,145,178,0.9) 0%, rgba(6,182,212,0.7) 100%)",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          py: { xs: 4, sm: 6, md: 0 },
        }}
      >
        {/* Background Pattern */}
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
          <Grid container spacing={4} alignItems="center">
            {/* Hero Text */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Typography
                  variant={isMobile ? "h3" : "h2"}
                  sx={{
                    fontWeight: "bold",
                    color: "white",
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  Finde saubere Toiletten
                  <br />
                  in deiner Nähe
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "white",
                    mb: 3,
                    opacity: 0.95,
                  }}
                >
                  Schnell, einfach und zuverlässig - Deine Toilette ist nur einen Klick
                  entfernt
                </Typography>
              </motion.div>
            </Grid>

            {/* Search Card - Similar to BusinessSearchBar */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                      Toilettensuche
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Buche ab € 1,60 pro Tag
                    </Typography>

                    {/* Search Input - BusinessSearchBar Style */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search by city or location..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isSearching}
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {isSearching ? (
                              <CircularProgress size={20} />
                            ) : (
                              <SearchIcon sx={{ color: "#999" }} />
                            )}
                          </InputAdornment>
                        ),
                        endAdornment: searchLocation && (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={handleClearSearch}
                              title="Clear search"
                              sx={{
                                mr: 1,
                                "&:hover": { backgroundColor: "#e5e7eb" },
                              }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={handleGetLocation}
                              title="Use my location"
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
                            borderColor: theme.palette.grey[300],
                          }
                        }
                      }}
                    />

                    {/* Search Button */}
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/home')}
                      disabled={isSearching}
                      sx={{
                        background:
                          "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: 600,
                        borderRadius: 2,
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: "0 10px 30px rgba(8,145,178,0.3)",
                        },
                        "&:disabled": {
                          background: "#d1d5db",
                        }
                      }}
                    >
                      {isSearching ? (
                        <CircularProgress size={24} sx={{ color: "white" }} />
                      ) : (
                        "Suche"
                      )}
                    </Button>

                    {/* Help Text */}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: "block", 
                        mt: 2, 
                        textAlign: "center",
                        color: "text.secondary" 
                      }}
                    >
                      Tipp: Versuche "Bonn", "Köln" oder nutze deinen Standort
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Section */}
      <Box sx={{ py: 8, backgroundColor: "white" }} id="reviews">
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                Uns wurde von <strong style={{ color: "#0891b2" }}>327.000+</strong>{" "}
                Personen mit einer Bewertung von{" "}
                <strong style={{ color: "#0891b2" }}>4.8</strong> vertraut
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Automatisch übersetzt
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {reviews.map((review, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        backgroundColor: "#f9fafb",
                        transition: "all 0.3s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        },
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {review.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {review.time}
                            </Typography>
                          </Box>
                          <Rating value={review.rating} readOnly size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {review.text}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Box
        sx={{
          py: 8,
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        }}
        id="features"
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant={isMobile ? "h3" : "h2"}
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Warum WCFinder?
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Die beste Lösung für deine Toilettenbedürfnisse
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        textAlign: "center",
                        p: 3,
                        transition: "transform 0.3s",
                        "&:hover": {
                          transform: "translateY(-5px)",
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Footer CTA */}
      <Box
        sx={{
          py: 6,
          backgroundColor: "white",
          textAlign: "center",
        }}
        id="how-it-works"
      >
        <Container maxWidth="md">
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            Bereit loszulegen?
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Finde jetzt die nächste saubere Toilette in deiner Nähe
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/')}
            sx={{
              background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 10px 30px rgba(8,145,178,0.3)",
              },
            }}
          >
            Jetzt starten
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default StartPage;