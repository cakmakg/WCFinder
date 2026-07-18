import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ClearIcon from "@mui/icons-material/Clear";
import FlowDemo from "./FlowDemo";
import { COLORS, RADII, SHADOWS } from "./constants";

const StartPageHero = ({ isSearching, setIsSearching }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [searchLocation, setSearchLocation] = useState("");

  const handleKeyDown = (e) => {
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
          } catch {
            setSearchLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            setIsSearching(false);
          }
        },
        () => {
          toast.error(t("startPage.locationError"));
          setIsSearching(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      toast.error(t("startPage.locationNotSupported"));
    }
  };

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: { md: "100dvh" },
        display: "flex",
        alignItems: "center",
        pt: { xs: 12, md: 14 },
        pb: { xs: 6, md: 10 },
        overflow: "hidden",
        background: "linear-gradient(180deg, #f0f9ff 0%, #ffffff 85%)",
      }}
    >
      {/* Dezentes Punktraster als Textur */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(8,145,178,0.10) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.7), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 11fr) minmax(0, 10fr)" },
            gap: { xs: 5, md: 8 },
            alignItems: "center",
          }}
        >
          {/* Linke Spalte: Botschaft + Suche */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Typography
              component="h1"
              sx={{
                fontWeight: 800,
                color: COLORS.textPrimary,
                fontSize: { xs: "2.1rem", sm: "2.6rem", md: "3.1rem" },
                lineHeight: 1.12,
                letterSpacing: "-0.02em",
                mb: 2,
                textWrap: "balance",
              }}
            >
              Finde{" "}
              <Box component="span" sx={{ color: COLORS.primary }}>
                saubere Toiletten
              </Box>{" "}
              in deiner Nähe
            </Typography>

            <Typography
              sx={{
                color: COLORS.textSecondary,
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.6,
                mb: 4,
                maxWidth: "42ch",
              }}
            >
              Online buchen, sicher bezahlen und mit QR-Code nutzen – ab 1,60 € pro Tag.
            </Typography>

            {/* Suchkarte */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: RADII.panel,
                border: "1px solid #e2e8f0",
                boxShadow: SHADOWS.subtle,
                p: { xs: 2, sm: 2.5 },
                maxWidth: 480,
              }}
            >
              <Box sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={t("startPage.searchPlaceholder")}
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSearching}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isSearching ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SearchIcon sx={{ color: COLORS.textSecondary }} />
                        )}
                      </InputAdornment>
                    ),
                    endAdornment: searchLocation ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="Eingabe löschen"
                          onClick={handleClearSearch}
                          disabled={isSearching}
                          sx={{ color: COLORS.textSecondary }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          aria-label="Meinen Standort verwenden"
                          onClick={handleGetLocation}
                          disabled={isSearching}
                          sx={{ color: COLORS.textSecondary }}
                        >
                          <MyLocationIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: RADII.input,
                      backgroundColor: "#f8fafc",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#e2e8f0",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: COLORS.primary,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={isSearching}
                  sx={{
                    background: COLORS.primaryGradient,
                    color: "white",
                    px: 3,
                    py: 1.5,
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    borderRadius: RADII.button,
                    textTransform: "none",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: "0 4px 14px rgba(8,145,178,0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      background: COLORS.primaryGradientHover,
                      transform: "translateY(-1px)",
                      boxShadow: "0 8px 24px rgba(8,145,178,0.4)",
                    },
                    "&:active": { transform: "translateY(0) scale(0.98)" },
                    "&:disabled": { backgroundColor: "#cbd5e1", color: "white" },
                  }}
                >
                  {isSearching ? t("startPage.searching", "Suche…") : t("startPage.searchButton")}
                </Button>
              </Box>
              <Typography
                sx={{ mt: 1.5, fontSize: "0.78rem", color: COLORS.textLight }}
              >
                {t("startPage.searchHint")}
              </Typography>
            </Box>
          </motion.div>

          {/* Rechte Spalte: interaktive Ablauf-Demo */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <FlowDemo />
          </motion.div>
        </Box>
      </Container>
    </Box>
  );
};

export default StartPageHero;
