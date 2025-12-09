import React from "react";
import { Box, Container, Grid, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LuggageIcon from "@mui/icons-material/Luggage";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const howItWorksSteps = [
  {
    step: 1,
    icon: <SearchIcon sx={{ fontSize: 60, color: "#0891b2" }} />,
    title: "1. Suchen",
    description: "Finde eine saubere Toilette in deiner Nähe auf der Karte.",
  },
  {
    step: 2,
    icon: <PhoneAndroidIcon sx={{ fontSize: 60, color: "#0891b2" }} />,
    title: "2. Buchen",
    description: "Buche deine Toilette online mit Datum, Uhrzeit und Personenanzahl.",
  },
  {
    step: 3,
    icon: <LuggageIcon sx={{ fontSize: 60, color: "#0891b2" }} />,
    title: "3. Bezahlen",
    description: "Sichere Zahlung mit Stripe oder PayPal - schnell und einfach.",
  },
  {
    step: 4,
    icon: <AccessTimeIcon sx={{ fontSize: 60, color: "#0891b2" }} />,
    title: "4. Nutzen",
    description: "Nutze deine reservierte Toilette und hinterlasse eine Bewertung.",
  },
];

const HowItWorksSection = ({ onBookNow }) => {
  return (
    <Box
      id="wie-funktioniert-das"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ✅ ASYMMETRIC: Decorative element on the right */}
      <Box
        sx={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "300px",
          height: "300px",
          background: "linear-gradient(135deg, rgba(8,145,178,0.08) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* ✅ ASYMMETRIC: Title positioned to the left */}
        <Box sx={{ mb: 6, textAlign: { xs: "center", md: "left" }, maxWidth: { md: "600px" } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#0891b2",
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            Wie funktioniert das?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.7,
            }}
          >
            Mit WCFinder findest du schnell und einfach saubere Toiletten in deiner Nähe. 
            Buche online, bezahle sicher und nutze deine reservierte Toilette ohne Wartezeit.
          </Typography>
        </Box>

        {/* ✅ ASYMMETRIC: Grid with offset items */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {howItWorksSteps.map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {/* ✅ ASYMMETRIC: Alternate alignment for visual interest */}
                <Box 
                  sx={{ 
                    textAlign: { xs: "center", md: index % 2 === 0 ? "left" : "right" }, 
                    p: 3,
                    position: "relative",
                  }}
                >
                  {/* ✅ ASYMMETRIC: Offset icon position */}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      backgroundColor: "rgba(8,145,178,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: { xs: "auto", md: index % 2 === 0 ? 0 : "auto" },
                      ml: { md: index % 2 === 0 ? 0 : "auto" },
                      mr: { md: index % 2 === 0 ? "auto" : 0 },
                      mb: 2,
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: index % 2 === 0 ? "-10px" : "auto",
                        bottom: index % 2 === 0 ? "auto" : "-10px",
                        left: index % 2 === 0 ? "-10px" : "auto",
                        right: index % 2 === 0 ? "auto" : "-10px",
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(8,145,178,0.05) 0%, transparent 100%)",
                        zIndex: -1,
                      }
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "#1e293b",
                      mb: 1,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                    }}
                  >
                    {step.description}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={onBookNow}
            sx={{
              backgroundColor: "#0891b2",
              color: "white",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              boxShadow: "0 4px 14px rgba(8,145,178,0.3)",
              "&:hover": {
                backgroundColor: "#0e7490",
                boxShadow: "0 6px 20px rgba(8,145,178,0.4)",
              },
            }}
          >
            JETZT BUCHEN
          </Button>
        </Box>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: "#1e293b",
            }}
          >
            Schritt für Schritt
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;

