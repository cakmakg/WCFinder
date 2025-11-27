import React, { useState } from "react";
import { Box, Container, Grid, Typography, TextField, Button, IconButton, InputAdornment, CircularProgress, useMediaQuery, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import SendIcon from "@mui/icons-material/Send";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ClearIcon from "@mui/icons-material/Clear";

const StartPageHero = ({ isSearching, setIsSearching }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [searchLocation, setSearchLocation] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClearSearch = () => {
    setSearchLocation("");
  };

  const handleSearch = () => {
    if (searchLocation.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
        navigate(`/home?search=${encodeURIComponent(searchLocation.trim())}`);
      }, 500);
    } else {
      navigate("/home");
    }
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
            const city =
              data.address.city ||
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
          alert(t("startPage.locationError"));
          setIsSearching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      alert(t("startPage.locationNotSupported"));
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      sx={{
        position: "relative",
        height: { xs: "auto", md: "100vh", lg: "100vh" },
        minHeight: { xs: "600px", md: "700px" },
        mt: { xs: 0, sm: 0 },
        overflow: "hidden",
        py: { xs: 3, md: 0 },
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background Image with Blur Effect */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "blur(4px)",
          transform: "scale(1.05)", // Slight scale to avoid blur edges
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(8,145,178,0.3) 0%, rgba(6,182,212,0.25) 100%)",
          },
        }}
      />

      <Container 
        maxWidth="lg" 
        sx={{ 
          position: "relative", 
          zIndex: 1, 
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid container spacing={0} alignItems="center" sx={{ height: "100%" }}>
          <Grid item xs={12} md={5} lg={4}>
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: 4,
                  p: { xs: 3, md: 4 },
                  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                  position: "relative",
                  zIndex: 2,
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography
                  variant={isMobile ? "h5" : "h4"}
                  sx={{
                    fontWeight: "bold",
                    color: "#1e293b",
                    mb: 1,
                    lineHeight: 1.3,
                    fontSize: { xs: "1.5rem", md: "2rem", lg: "2.25rem" },
                  }}
                >
                  {t("startPage.title")}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#64748b",
                    mb: 3,
                    fontSize: { xs: "0.875rem", md: "0.95rem" },
                  }}
                >
                  {t("startPage.subtitle") || "Buche ab € 1.60 pro Tag"}
                </Typography>

                {/* Arama Formu */}
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={t("startPage.searchPlaceholder") || "Standort suchen"}
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSearching}
                  size="medium"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isSearching ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SearchIcon sx={{ color: "#64748b" }} />
                        )}
                      </InputAdornment>
                    ),
                    endAdornment: searchLocation ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          disabled={isSearching}
                          sx={{
                            color: "#64748b",
                            "&:hover": { backgroundColor: "#f3f4f6" },
                          }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleGetLocation}
                          disabled={isSearching}
                          sx={{
                            color: "#64748b",
                            "&:hover": { backgroundColor: "#f3f4f6" },
                          }}
                        >
                          <MyLocationIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: "#f8fafc",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e2e8f0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#14b8a6",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#14b8a6",
                      },
                    },
                  }}
                />

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSearch}
                  disabled={isSearching}
                  startIcon={!isSearching && <SendIcon />}
                  sx={{
                    backgroundColor: "#14b8a6", // Teal color
                    color: "white",
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(20,184,166,0.3)",
                    "&:hover": {
                      backgroundColor: "#0d9488",
                      transform: "translateY(-2px)",
                      boxShadow: "0 8px 24px rgba(20,184,166,0.4)",
                    },
                    "&:disabled": {
                      backgroundColor: "#cbd5e1",
                      color: "white",
                    },
                  }}
                >
                  {isSearching ? (
                    <>
                      <CircularProgress size={20} sx={{ color: "white", mr: 1 }} />
                      {t("startPage.searching") || "Suche..."}
                    </>
                  ) : (
                    t("startPage.searchButton") || "Suche"
                  )}
                </Button>
              </Box>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StartPageHero;

