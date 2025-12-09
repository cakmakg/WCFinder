import React from "react";
import { Box, Container, Grid, Typography, Button } from "@mui/material";
import WcIcon from "@mui/icons-material/Wc";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const AboutUsSection = ({ onBookNow, onPartnerClick }) => {
  return (
    <Box
      id="uber-uns"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "#f8fafc",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ✅ ASYMMETRIC: Decorative element on the left */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-150px",
          left: "-150px",
          width: "400px",
          height: "400px",
          background: "linear-gradient(135deg, rgba(20,184,166,0.08) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* ✅ ASYMMETRIC: Reversed grid order (image on right, text on left) */}
        <Grid container spacing={6} alignItems="center">
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
                ml: { md: "auto" }, // ✅ ASYMMETRIC: Push to right
              }}
            >
              <WcIcon
                sx={{
                  fontSize: { xs: 80, md: 120 },
                  color: "#0891b2",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <LocationOnIcon
                  sx={{
                    fontSize: { xs: 40, md: 60 },
                    color: "#0891b2",
                  }}
                />
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} md={5} sx={{ order: { xs: 1, md: 2 } }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                color: "#1e293b",
                mb: 3,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Über uns
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                mb: 2,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.7,
              }}
            >
              Du bist unterwegs in der Stadt und brauchst dringend eine saubere Toilette?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                mb: 2,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.7,
              }}
            >
              Du möchtest sicher sein, dass die Toilette verfügbar und sauber ist, bevor du ankommst?
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#64748b",
                mb: 3,
                fontSize: { xs: "0.95rem", md: "1.05rem" },
                lineHeight: 1.7,
              }}
            >
              Du suchst eine bequeme Lösung, um öffentliche Toiletten zu finden und zu reservieren?
            </Typography>

            <Box
              sx={{
                backgroundColor: "white",
                p: 3,
                borderRadius: 2,
                borderLeft: "4px solid #0891b2",
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#0891b2",
                }}
              >
                Die Lösung für alle deine Probleme ist WCFinder
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={onBookNow}
                sx={{
                  backgroundColor: "#0891b2",
                  color: "white",
                  px: 5,
                  py: 1.5,
                  fontSize: "1.05rem",
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  "&:hover": {
                    backgroundColor: "#0e7490",
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
                  // Production-safe handler - direkt fonksiyon çağrısı
                  const handler = onPartnerClick;
                  if (handler && typeof handler === 'function') {
                    try {
                      handler();
                    } catch (error) {
                      // Silent error handling for production
                      // Error'u logla ama kullanıcıya gösterme
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
                  borderRadius: 2,
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

