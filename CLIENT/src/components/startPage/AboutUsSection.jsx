import React from "react";
import { Box, Container, Grid, Typography, Button, Chip } from "@mui/material";
import WcIcon from "@mui/icons-material/Wc";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";
import AccessibleIcon from "@mui/icons-material/Accessible";
import SecurityIcon from "@mui/icons-material/Security";

const AboutUsSection = ({ onBookNow, onPartnerClick }) => {
  return (
    <Box
      component="section"
      id="uber-uns"
      aria-labelledby="about-heading"
      className="speakable-about"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "#f8fafc",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blob */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-150px",
          left: "-150px",
          width: "400px",
          height: "400px",
          background:
            "linear-gradient(135deg, rgba(8,145,178,0.08) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Visual */}
          <Grid item xs={12} md={7} sx={{ order: { xs: 2, md: 1 } }}>
            <Box
              sx={{
                width: { xs: 200, md: 280 },
                height: { xs: 200, md: 280 },
                borderRadius: "50%",
                backgroundColor: "rgba(8,145,178,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: { xs: "auto", md: 0 },
                position: "relative",
                ml: { md: "auto" },
              }}
            >
              <WcIcon sx={{ fontSize: { xs: 80, md: 120 }, color: "#0891b2" }} />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <LocationOnIcon
                  sx={{ fontSize: { xs: 40, md: 60 }, color: "#0891b2" }}
                />
              </Box>
            </Box>
          </Grid>

          {/* Content */}
          <Grid item xs={12} md={5} sx={{ order: { xs: 1, md: 2 } }}>
            <Typography
              component="h2"
              id="about-heading"
              variant="h3"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                mb: 2.5,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Über uns
            </Typography>

            {/* Entity-rich description — AI/GEO readable */}
            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                mb: 2,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.75,
              }}
            >
              <strong style={{ color: "#0f172a" }}>WCFinder</strong> ist
              Deutschlands führende Online-Buchungsplattform für saubere,
              barrierefreie öffentliche Toiletten. Wir verbinden Nutzer mit
              geprüften WC-Anlagen in Cafés, Restaurants, Hotels und Geschäften
              in über 50 deutschen Städten.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                mb: 3,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.75,
              }}
            >
              Ob in Berlin, Hamburg, München oder Köln – mit WCFinder finden und
              reservieren Sie in weniger als 2 Minuten eine saubere Toilette in
              Ihrer Nähe. Buchen und bezahlen Sie sicher online, ohne Wartezeit
              vor Ort.
            </Typography>

            {/* Trust badges */}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: 16 }} />}
                label="Seit 2024 in Deutschland"
                size="small"
                sx={{
                  backgroundColor: "rgba(8,145,178,0.08)",
                  color: "#0891b2",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { color: "#0891b2" },
                }}
              />
              <Chip
                icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                label="DSGVO-konform"
                size="small"
                sx={{
                  backgroundColor: "rgba(8,145,178,0.08)",
                  color: "#0891b2",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { color: "#0891b2" },
                }}
              />
              <Chip
                icon={<AccessibleIcon sx={{ fontSize: 16 }} />}
                label="Barrierefreie Optionen"
                size="small"
                sx={{
                  backgroundColor: "rgba(8,145,178,0.08)",
                  color: "#0891b2",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  "& .MuiChip-icon": { color: "#0891b2" },
                }}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: "#f0f9ff",
                p: 3,
                borderRadius: "14px",
                borderLeft: "3px solid #0891b2",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#0891b2", lineHeight: 1.4 }}
              >
                Die Lösung für saubere öffentliche Toiletten in Deutschland.
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={onBookNow}
                sx={{
                  background:
                    "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                  color: "white",
                  px: 5,
                  py: 1.5,
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #0e7490 0%, #155e75 100%)",
                  },
                }}
              >
                JETZT BUCHEN
              </Button>
              <Button
                variant="outlined"
                size="large"
                type="button"
                onClick={(e) => {
                  if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  const handler = onPartnerClick;
                  if (handler && typeof handler === "function") {
                    try {
                      handler();
                    } catch {
                      // silent
                    }
                  }
                }}
                sx={{
                  borderColor: "#0891b2",
                  color: "#0891b2",
                  px: 5,
                  py: 1.5,
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "12px",
                  "&:hover": {
                    backgroundColor: "#0891b2",
                    color: "white",
                    borderColor: "#0891b2",
                  },
                }}
              >
                Unser Partner werden
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AboutUsSection;
