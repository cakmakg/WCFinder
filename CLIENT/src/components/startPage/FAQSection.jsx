import React, { useState } from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const faqs = [
  {
    question: "Wie buche ich eine Toilette mit WCFinder?",
    answer:
      "Geben Sie Ihren Standort in die Suchfunktion ein, wählen Sie eine verfügbare WC-Anlage auf der interaktiven Karte aus und buchen Sie online mit Datum, Uhrzeit und Personenanzahl. Die Buchung dauert weniger als 2 Minuten – Sie erhalten sofort eine Bestätigung per E-Mail mit QR-Code.",
  },
  {
    question: "Was kostet eine Toilettenbuchung bei WCFinder?",
    answer:
      "Toilettenbuchungen bei WCFinder beginnen ab €1,60 pro Nutzung. Der genaue Preis hängt von der gewählten WC-Anlage und dem Standort ab. Alle Preise werden transparent vor der Buchung angezeigt – keine versteckten Kosten.",
  },
  {
    question: "Wo kann ich öffentliche Toiletten in Deutschland finden?",
    answer:
      "WCFinder zeigt Ihnen alle verfügbaren WC-Anlagen auf einer interaktiven Karte in über 50 deutschen Städten – darunter Berlin, Hamburg, München, Köln und Frankfurt. Einfach Standort eingeben oder GPS aktivieren, und WCFinder findet die nächste saubere Toilette.",
  },
  {
    question: "Welche Zahlungsmethoden akzeptiert WCFinder?",
    answer:
      "WCFinder akzeptiert Kreditkarte (Visa, Mastercard) über Stripe, PayPal und SEPA-Lastschrift. Alle Transaktionen sind SSL-verschlüsselt, DSGVO-konform und sicher verarbeitet.",
  },
  {
    question: "Sind die WCFinder-Toiletten barrierefrei?",
    answer:
      "Viele unserer Partner bieten barrierefreie Toiletten an. In der App und auf der Website können Sie gezielt nach barrierefreien WC-Anlagen filtern. Alle Standorte werden mit detaillierten Ausstattungsmerkmalen beschrieben.",
  },
  {
    question: "Wie werde ich WCFinder-Partner?",
    answer:
      "Als Café, Restaurant, Hotel oder Geschäft können Sie Ihre WC-Anlage über WCFinder anbieten und zusätzliche Einnahmen erzielen. Klicken Sie auf 'Partner werden', füllen Sie das Formular aus und unser Team meldet sich innerhalb von 24 Stunden bei Ihnen. Die Registrierung ist kostenlos.",
  },
  {
    question: "Kann ich WCFinder auf dem Smartphone nutzen?",
    answer:
      "Ja! WCFinder ist als kostenlose App für iOS und Android verfügbar. Die App unterstützt GPS-Suche, Buchung und Bezahlung unterwegs. Außerdem ist WCFinder vollständig responsive und mobil im Browser nutzbar.",
  },
  {
    question: "Wie erhalte ich meine Buchungsbestätigung?",
    answer:
      "Nach erfolgreicher Buchung und Zahlung erhalten Sie sofort eine Bestätigungs-E-Mail mit allen Reservierungsdetails und einem QR-Code. Den QR-Code zeigen Sie beim Einlass zur WC-Anlage vor.",
  },
  {
    question: "Kann ich eine WCFinder-Buchung stornieren?",
    answer:
      "Buchungen können bis zur festgelegten Stornierungsfrist vor der Nutzung storniert werden. Die genauen Bedingungen werden bei der Buchung angezeigt. Bei Fragen steht unser Kundenservice jederzeit zur Verfügung.",
  },
];

const FAQSection = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (_event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      component="section"
      id="faq"
      aria-labelledby="faq-heading"
      className="speakable-faq"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blur blob */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-120px",
          right: "-120px",
          width: "400px",
          height: "400px",
          background:
            "linear-gradient(135deg, rgba(8,145,178,0.07) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="flex-start">
          {/* Left — Sticky heading */}
          <Grid item xs={12} md={4}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 32 } }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "rgba(8,145,178,0.08)",
                  borderRadius: "20px",
                  px: 2,
                  py: 0.75,
                  mb: 2,
                }}
              >
                <HelpOutlineIcon sx={{ color: "#0891b2", fontSize: 16 }} />
                <Typography
                  variant="caption"
                  sx={{ color: "#0891b2", fontWeight: 700, letterSpacing: 0.5 }}
                >
                  HÄUFIGE FRAGEN
                </Typography>
              </Box>

              <Typography
                component="h2"
                id="faq-heading"
                variant="h3"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  mb: 2,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                  lineHeight: 1.2,
                }}
              >
                Alles, was Sie über WCFinder wissen möchten
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "#64748b",
                  lineHeight: 1.7,
                  fontSize: "0.95rem",
                  mb: 3,
                }}
              >
                Finden Sie Antworten auf die häufigsten Fragen zur Buchung
                öffentlicher Toiletten, Preisen, Zahlungen und unserer
                Partner-Plattform.
              </Typography>

              <Box
                sx={{
                  backgroundColor: "#f0f9ff",
                  borderRadius: "14px",
                  borderLeft: "3px solid #0891b2",
                  p: 2.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#0891b2", fontWeight: 600, mb: 0.5 }}
                >
                  Weitere Fragen?
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  Unser Support-Team hilft Ihnen gerne weiter.
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right — Accordion list */}
          <Grid item xs={12} md={8}>
            <Box
              component="dl"
              itemScope
              itemType="https://schema.org/FAQPage"
              sx={{ m: 0 }}
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                  itemScope
                  itemProp="mainEntity"
                  itemType="https://schema.org/Question"
                >
                  <Accordion
                    expanded={expanded === `panel-${index}`}
                    onChange={handleChange(`panel-${index}`)}
                    elevation={0}
                    sx={{
                      mb: 1.5,
                      borderRadius: "12px !important",
                      border: "1px solid",
                      borderColor:
                        expanded === `panel-${index}`
                          ? "#0891b2"
                          : "#e2e8f0",
                      "&:before": { display: "none" },
                      transition: "border-color 0.2s",
                      overflow: "hidden",
                    }}
                  >
                    <AccordionSummary
                      expandIcon={
                        <ExpandMoreIcon
                          sx={{
                            color:
                              expanded === `panel-${index}`
                                ? "#0891b2"
                                : "#94a3b8",
                            transition: "color 0.2s",
                          }}
                        />
                      }
                      sx={{
                        px: 3,
                        py: 1.5,
                        backgroundColor:
                          expanded === `panel-${index}`
                            ? "rgba(8,145,178,0.04)"
                            : "transparent",
                        "& .MuiAccordionSummary-content": { my: 0 },
                      }}
                    >
                      <Typography
                        component="dt"
                        itemProp="name"
                        sx={{
                          fontWeight: 600,
                          color: "#0f172a",
                          fontSize: { xs: "0.9rem", md: "0.95rem" },
                          lineHeight: 1.5,
                        }}
                      >
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{ px: 3, pb: 2.5, pt: 0 }}
                      itemScope
                      itemProp="acceptedAnswer"
                      itemType="https://schema.org/Answer"
                    >
                      <Typography
                        component="dd"
                        itemProp="text"
                        sx={{
                          color: "#64748b",
                          lineHeight: 1.75,
                          fontSize: "0.9rem",
                          m: 0,
                        }}
                      >
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default FAQSection;
