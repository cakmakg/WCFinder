import React from "react";
import { Box, Container, Grid, Typography, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import MapIcon from "@mui/icons-material/Map";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PaymentIcon from "@mui/icons-material/Payment";
import StarIcon from "@mui/icons-material/Star";
import QrCodeIcon from "@mui/icons-material/QrCode";
import LockIcon from "@mui/icons-material/Lock";

const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <MapIcon sx={{ fontSize: 40, color: "#0891b2" }} />,
      title: t("startPage.features.interactiveMap.title"),
      description: t("startPage.features.interactiveMap.description"),
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 40, color: "#0891b2" }} />,
      title: t("startPage.features.easyBooking.title"),
      description: t("startPage.features.easyBooking.description"),
    },
    {
      icon: <PaymentIcon sx={{ fontSize: 40, color: "#0891b2" }} />,
      title: t("startPage.features.securePayment.title"),
      description: t("startPage.features.securePayment.description"),
    },
    {
      icon: <StarIcon sx={{ fontSize: 40, color: "#0891b2" }} />,
      title: t("startPage.features.reviews.title"),
      description: t("startPage.features.reviews.description"),
    },
    {
      icon: <QrCodeIcon sx={{ fontSize: 40, color: "#0891b2" }} />,
      title: t("startPage.features.qrCode.title"),
      description: t("startPage.features.qrCode.description"),
    },
    {
      icon: <LockIcon sx={{ fontSize: 40, color: "#0891b2" }} />,
      title: t("startPage.features.safeClean.title"),
      description: t("startPage.features.safeClean.description"),
    },
  ];

  return (
    <Box 
      id="features" 
      sx={{ 
        py: { xs: 6, md: 10 }, 
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ✅ ASYMMETRIC: Decorative element */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "-200px",
          width: "500px",
          height: "500px",
          background: "linear-gradient(135deg, rgba(8,145,178,0.06) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* ✅ ASYMMETRIC: Title positioned to the right */}
        <Box sx={{ 
          textAlign: { xs: "center", md: "right" }, 
          mb: 6,
          maxWidth: { md: "700px" },
          ml: { md: "auto" },
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#1e293b",
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            {t("startPage.features.title")}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.7,
            }}
          >
            {t("startPage.features.subtitle")}
          </Typography>
        </Box>

        {/* ✅ ASYMMETRIC: Staggered grid layout */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={4} 
              key={index}
              sx={{
                // ✅ ASYMMETRIC: Alternate card alignment
                display: "flex",
                justifyContent: index % 3 === 0 ? "flex-start" : index % 3 === 1 ? "center" : "flex-end",
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    width: "100%",
                    maxWidth: { md: index % 3 === 1 ? "95%" : "100%" }, // ✅ ASYMMETRIC: Center cards slightly smaller
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    borderLeft: index % 2 === 0 ? "4px solid #0891b2" : "none",
                    borderRight: index % 2 === 1 ? "4px solid #14b8a6" : "none",
                    "&:hover": {
                      transform: "translateY(-4px) rotate(0.5deg)", // ✅ ASYMMETRIC: Slight rotation on hover
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "#1e293b",
                        mb: 1,
                        fontSize: "1.1rem",
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        lineHeight: 1.6,
                        fontSize: "0.9rem",
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;

