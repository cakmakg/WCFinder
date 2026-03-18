import React from "react";
import { Box, Container, Grid, Typography } from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import StarIcon from "@mui/icons-material/Star";

const stats = [
  {
    icon: StorefrontIcon,
    value: "500+",
    label: "Partner-Standorte",
    sublabel: "in ganz Deutschland",
    color: "#0891b2",
  },
  {
    icon: LocationCityIcon,
    value: "50+",
    label: "Städte",
    sublabel: "Berlin, Hamburg, München u.v.m.",
    color: "#0e7490",
  },
  {
    icon: BookOnlineIcon,
    value: "10.000+",
    label: "Buchungen",
    sublabel: "pro Monat",
    color: "#0891b2",
  },
  {
    icon: StarIcon,
    value: "4,9 / 5",
    label: "Ø Bewertung",
    sublabel: "aus 2.847 Rezensionen",
    color: "#f59e0b",
  },
];

const StatsSection = () => {
  return (
    <Box
      component="section"
      aria-label="WCFinder Statistiken"
      sx={{
        background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
        py: { xs: 5, md: 7 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-60px",
          left: "-60px",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={3} justifyContent="center">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Grid item xs={6} md={3} key={stat.label}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box
                    sx={{
                      textAlign: "center",
                      p: { xs: 2, md: 3 },
                      borderRadius: "16px",
                      backgroundColor: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      transition: "transform 0.2s, background-color 0.2s",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.18)",
                        transform: "translateY(-4px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        backgroundColor: "rgba(255,255,255,0.15)",
                        mb: 1.5,
                      }}
                    >
                      <Icon sx={{ color: "#fff", fontSize: 24 }} />
                    </Box>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        color: "#fff",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                        lineHeight: 1,
                        mb: 0.5,
                      }}
                    >
                      {stat.value}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "rgba(255,255,255,0.95)",
                        fontWeight: 700,
                        fontSize: { xs: "0.8rem", md: "0.9rem" },
                        mb: 0.25,
                      }}
                    >
                      {stat.label}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(255,255,255,0.65)",
                        fontSize: { xs: "0.7rem", md: "0.75rem" },
                      }}
                    >
                      {stat.sublabel}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};

export default StatsSection;
