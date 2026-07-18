import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion, useReducedMotion } from "framer-motion";
import SearchIcon from "@mui/icons-material/Search";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import { COLORS, RADII, SHADOWS } from "./constants";

const howItWorksSteps = [
  {
    step: 1,
    icon: SearchIcon,
    title: "Suchen",
    description: "Gib deinen Standort ein oder nutze GPS – die Karte zeigt alle WC-Anlagen in deiner Nähe.",
    schemaName: "Standort suchen",
    schemaText:
      "Geben Sie Ihren aktuellen Standort oder eine Stadt in die WCFinder-Suchfunktion ein. Alternativ können Sie GPS nutzen, um öffentliche Toiletten in Ihrer Nähe zu finden.",
  },
  {
    step: 2,
    icon: EventAvailableIcon,
    title: "Buchen",
    description: "Wähle Datum, Uhrzeit und Personenanzahl – deine Toilette wird sofort reserviert.",
    schemaName: "Toilette buchen",
    schemaText:
      "Wählen Sie auf der interaktiven Karte eine passende WC-Anlage aus. Wählen Sie Datum, Uhrzeit und Personenanzahl und klicken Sie auf Jetzt buchen.",
  },
  {
    step: 3,
    icon: CreditCardIcon,
    title: "Bezahlen",
    description: "Bezahle sicher mit Stripe oder PayPal – SSL-verschlüsselt und DSGVO-konform.",
    schemaName: "Sicher bezahlen",
    schemaText:
      "Bezahlen Sie sicher mit Kreditkarte über Stripe oder PayPal. Alle Transaktionen sind SSL-verschlüsselt und DSGVO-konform.",
  },
  {
    step: 4,
    icon: QrCode2Icon,
    title: "Nutzen",
    description: "Zeig deinen QR-Code am Eingang vor und geh direkt rein – ohne Wartezeit.",
    schemaName: "Toilette nutzen",
    schemaText:
      "Zeigen Sie Ihren QR-Code aus der Bestätigungs-E-Mail vor und nutzen Sie Ihre reservierte Toilette ohne Wartezeit. Hinterlassen Sie danach eine Bewertung.",
  },
];

const HowItWorksSection = ({ onBookNow }) => {
  const reduce = useReducedMotion();

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
      }}
    >
      {/* Hidden HowTo meta for schema.org */}
      <meta itemProp="name" content="Wie buche ich eine Toilette mit WCFinder?" />
      <meta
        itemProp="description"
        content="So finden und buchen Sie in weniger als 2 Minuten eine saubere öffentliche Toilette in Ihrer Nähe mit WCFinder."
      />
      <meta itemProp="totalTime" content="PT5M" />

      <Container maxWidth="lg">
        {/* Heading */}
        <Box sx={{ mb: { xs: 5, md: 8 }, maxWidth: "620px" }}>
          <Typography
            component="h2"
            id="how-it-works-heading"
            variant="h3"
            sx={{
              fontWeight: 800,
              color: COLORS.textPrimary,
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              letterSpacing: "-0.02em",
            }}
          >
            Wie funktioniert das?
          </Typography>
          <Typography
            sx={{
              color: COLORS.textSecondary,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
              lineHeight: 1.7,
            }}
          >
            Von der Suche bis zur Tür in weniger als 2 Minuten – in vier einfachen Schritten.
          </Typography>
        </Box>

        {/* Steps — semantic <ol> for HowTo */}
        <Box
          component="ol"
          sx={{
            listStyle: "none",
            p: 0,
            m: 0,
            position: "relative",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(4, 1fr)" },
            gap: { xs: 0, md: 4 },
          }}
        >
          {/* Verbindungslinie (Desktop), zeichnet sich beim Scrollen */}
          <Box
            aria-hidden="true"
            sx={{
              display: { xs: "none", md: "block" },
              position: "absolute",
              top: 27,
              left: "12%",
              right: "12%",
              height: 2,
              backgroundColor: "#e2e8f0",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{
                height: "100%",
                backgroundColor: COLORS.primary,
                transformOrigin: "left",
              }}
            />
          </Box>

          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === howItWorksSteps.length - 1;
            return (
              <Box
                component="li"
                key={step.step}
                itemScope
                itemType="https://schema.org/HowToStep"
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: { xs: "row", md: "column" },
                  gap: { xs: 2.5, md: 0 },
                  pb: { xs: isLast ? 0 : 4, md: 0 },
                }}
              >
                <meta itemProp="name" content={step.schemaName} />
                <meta itemProp="text" content={step.schemaText} />
                <meta itemProp="position" content={String(step.step)} />

                {/* Vertikale Linie (Mobil) */}
                {!isLast && (
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: { xs: "block", md: "none" },
                      position: "absolute",
                      top: 56,
                      bottom: 8,
                      left: 27,
                      width: 2,
                      backgroundColor: "#e2e8f0",
                    }}
                  />
                )}

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.12 }}
                  style={{ display: "flex", flexShrink: 0 }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      backgroundColor: COLORS.accentBoxBg,
                      border: `2px solid ${COLORS.primary}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      zIndex: 1,
                      mb: { md: 2.5 },
                    }}
                  >
                    <Icon sx={{ fontSize: 26, color: COLORS.primary }} />
                    <Box
                      sx={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        backgroundColor: COLORS.primary,
                        color: "white",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {step.step}
                    </Box>
                  </Box>
                </motion.div>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.12 + 0.1 }}
                >
                  <Typography
                    component="h3"
                    sx={{
                      fontWeight: 700,
                      color: COLORS.textPrimary,
                      fontSize: "1.1rem",
                      mb: 0.75,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: COLORS.textSecondary,
                      fontSize: "0.9rem",
                      lineHeight: 1.6,
                      maxWidth: { md: "26ch" },
                    }}
                  >
                    {step.description}
                  </Typography>
                </motion.div>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ textAlign: { xs: "center", md: "left" }, mt: { xs: 5, md: 7 } }}>
          <Button
            variant="contained"
            size="large"
            onClick={onBookNow}
            sx={{
              background: COLORS.primaryGradient,
              color: "white",
              px: 5,
              py: 1.5,
              fontSize: "1rem",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: RADII.button,
              boxShadow: SHADOWS.subtle,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                background: COLORS.primaryGradientHover,
                transform: "translateY(-1px)",
                boxShadow: SHADOWS.hover,
              },
              "&:active": { transform: "translateY(0) scale(0.98)" },
            }}
          >
            Jetzt buchen
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
