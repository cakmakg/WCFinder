import React from "react";
import { Box, Container, Grid, Typography, Button } from "@mui/material";
// eslint-disable-next-line no-unused-vars
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
    schemaName: "Standort suchen",
    schemaText:
      "Geben Sie Ihren aktuellen Standort oder eine Stadt in die WCFinder-Suchfunktion ein. Alternativ können Sie GPS nutzen, um öffentliche Toiletten in Ihrer Nähe zu finden.",
  },
  {
    step: 2,
    icon: <PhoneAndroidIcon sx={{ fontSize: 60, color: "#0891b2" }} />,
    title: "2. Buchen",
    description: "Buche deine Toilette online mit Datum, Uhrzeit und Personenanzahl.",
    schemaName: "Toilette buchen",
    schemaText:
      "Wählen Sie auf der interaktiven Karte eine passende WC-Anlage aus. Wählen Sie Datum, Uhrzeit und Personenanzahl und klicken Sie auf Jetzt buchen.",
  },
  {
    step: 3,
    icon: <LuggageIcon sx={{ fontSize: 60, color: "#0891b2" }} />,
    title: "3. Bezahlen",
    description: "Sichere Zahlung mit Stripe oder PayPal - schnell und einfach.",
    schemaName: "Sicher bezahlen",
    schemaText:
      "Bezahlen Sie sicher mit Kreditkarte über Stripe oder PayPal. Alle Transaktionen sind SSL-verschlüsselt und DSGVO-konform.",
  },
  {
    step: 4,
    icon: <AccessTimeIcon sx={{ fontSize: 60, color: "#0891b2" }} />,
    title: "4. Nutzen",
    description: "Nutze deine reservierte Toilette und hinterlasse eine Bewertung.",
    schemaName: "Toilette nutzen",
    schemaText:
      "Zeigen Sie Ihren QR-Code aus der Bestätigungs-E-Mail vor und nutzen Sie Ihre reservierte Toilette ohne Wartezeit. Hinterlassen Sie danach eine Bewertung.",
  },
];

const HowItWorksSection = ({ onBookNow }) => {
  return (
    <Box
      component="section"
      id="wie-funktioniert-das"
      aria-labelledby="how-it-works-heading"
      itemScope
      itemType="https://schema.org/HowTo"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Hidden HowTo meta for schema.org */}
      <meta itemProp="name" content="Wie buche ich eine Toilette mit WCFinder?" />
      <meta
        itemProp="description"
        content="So finden und buchen Sie in weniger als 2 Minuten eine saubere öffentliche Toilette in Ihrer Nähe mit WCFinder."
      />
      <meta itemProp="totalTime" content="PT5M" />

      {/* Decorative blob */}
      <Box
        sx={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "300px",
          height: "300px",
          background:
            "linear-gradient(135deg, rgba(8,145,178,0.08) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Heading */}
        <Box
          sx={{
            mb: 6,
            textAlign: { xs: "center", md: "left" },
            maxWidth: { md: "600px" },
          }}
        >
          <Typography
            component="h2"
            id="how-it-works-heading"
            variant="h3"
            sx={{
              fontWeight: 800,
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
            Mit WCFinder findest du schnell und einfach saubere Toiletten in
            deiner Nähe. Buche online, bezahle sicher und nutze deine
            reservierte Toilette ohne Wartezeit.
          </Typography>
        </Box>

        {/* Steps — semantic <ol> for HowTo */}
        <Grid
          container
          component="ol"
          spacing={4}
          sx={{ mb: 4, listStyle: "none", pl: 0 }}
        >
          {howItWorksSteps.map((step, index) => (
            <Grid
              item
              component="li"
              xs={12}
              sm={6}
              md={3}
              key={step.step}
              itemScope
              itemType="https://schema.org/HowToStep"
              sx={{ display: "flex" }}
            >
              <meta itemProp="name" content={step.schemaName} />
              <meta itemProp="text" content={step.schemaText} />
              <meta itemProp="position" content={String(step.step)} />

              <motion.div
                style={{ width: "100%" }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Box
                  sx={{
                    textAlign: {
                      xs: "center",
                      md: index % 2 === 0 ? "left" : "right",
                    },
                    p: 3,
                    position: "relative",
                  }}
                >
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
                        background:
                          "linear-gradient(135deg, rgba(8,145,178,0.05) 0%, transparent 100%)",
                        zIndex: -1,
                      },
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    component="h3"
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
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
              background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
              color: "white",
              px: 6,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: "12px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #0e7490 0%, #155e75 100%)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              },
            }}
          >
            JETZT BUCHEN
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
