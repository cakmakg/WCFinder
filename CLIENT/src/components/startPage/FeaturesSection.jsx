import React from "react";
import { Box, Container, Typography } from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MapIcon from "@mui/icons-material/Map";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentIcon from "@mui/icons-material/Payment";
import StarIcon from "@mui/icons-material/Star";
import QrCodeIcon from "@mui/icons-material/QrCode";
import LockIcon from "@mui/icons-material/Lock";
import { COLORS, RADII, SHADOWS } from "./constants";

// Getönte Kacheln lockern das Raster auf (Accent-Box-Muster der Design-Sprache)
const TINTED_TILES = new Set([0, 4]);

const FeaturesSection = () => {
  const { t } = useTranslation();
  const reduce = useReducedMotion();

  const features = [
    {
      icon: MapIcon,
      title: t("startPage.features.interactiveMap.title"),
      description: t("startPage.features.interactiveMap.description"),
    },
    {
      icon: CalendarTodayIcon,
      title: t("startPage.features.easyBooking.title"),
      description: t("startPage.features.easyBooking.description"),
    },
    {
      icon: PaymentIcon,
      title: t("startPage.features.securePayment.title"),
      description: t("startPage.features.securePayment.description"),
    },
    {
      icon: StarIcon,
      title: t("startPage.features.reviews.title"),
      description: t("startPage.features.reviews.description"),
    },
    {
      icon: QrCodeIcon,
      title: t("startPage.features.qrCode.title"),
      description: t("startPage.features.qrCode.description"),
    },
    {
      icon: LockIcon,
      title: t("startPage.features.safeClean.title"),
      description: t("startPage.features.safeClean.description"),
    },
  ];

  return (
    <Box
      component="section"
      id="features"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "white",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: { xs: 5, md: 7 }, maxWidth: "620px" }}>
          <Typography
            component="h2"
            variant="h3"
            sx={{
              fontWeight: 800,
              color: COLORS.textPrimary,
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Warum WCFinder?
          </Typography>
          <Typography
            sx={{
              color: COLORS.textSecondary,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.7,
            }}
          >
            Alles, was du für eine saubere und stressfreie Toilettennutzung brauchst.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const tinted = TINTED_TILES.has(index);
            return (
              <motion.div
                key={feature.title}
                style={{ height: "100%" }}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
              >
                <Box
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: RADII.card,
                    backgroundColor: tinted ? COLORS.accentBoxBg : "white",
                    border: "1px solid #e2e8f0",
                    borderLeft: tinted ? `3px solid ${COLORS.primary}` : "1px solid #e2e8f0",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: SHADOWS.hover,
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 34, color: COLORS.primary, mb: 1.5 }} />
                  <Typography
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      mb: 0.75,
                      fontSize: "1.05rem",
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: COLORS.textSecondary,
                      lineHeight: 1.6,
                      fontSize: "0.9rem",
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Box>
              </motion.div>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturesSection;
