import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import QRCode from "react-qr-code";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LockIcon from "@mui/icons-material/Lock";
import StarIcon from "@mui/icons-material/Star";
import { COLORS, RADII, SHADOWS } from "./constants";

const STEP_DURATION_MS = 4500;

const STEPS = [
  { key: "suchen", nr: 1, label: "Suchen" },
  { key: "buchen", nr: 2, label: "Buchen" },
  { key: "bezahlen", nr: 3, label: "Bezahlen" },
  { key: "nutzen", nr: 4, label: "Nutzen" },
];

const spring = { type: "spring", stiffness: 260, damping: 22 };

/* ---------- Schritt 1: Karte mit Pins ---------- */

const MAP_PINS = [
  { top: "22%", left: "18%" },
  { top: "58%", left: "30%" },
  { top: "34%", left: "56%", active: true },
  { top: "68%", left: "70%" },
  { top: "16%", left: "76%" },
];

const SearchVignette = ({ reduce }) => (
  <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
    {/* Suchfeld-Miniatur */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: RADII.input,
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: COLORS.textSecondary }} />
      <Typography sx={{ fontSize: "0.85rem", color: COLORS.textPrimary, fontWeight: 500 }}>
        Bonn
      </Typography>
      <Typography sx={{ ml: "auto", fontSize: "0.72rem", color: COLORS.primary, fontWeight: 600 }}>
        3 Treffer
      </Typography>
    </Box>

    {/* Karte */}
    <Box
      sx={{
        position: "relative",
        flexGrow: 1,
        borderRadius: RADII.card,
        overflow: "hidden",
        backgroundColor: "#f0f9ff",
        backgroundImage:
          "linear-gradient(rgba(8,145,178,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(8,145,178,0.07) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
        border: "1px solid #e0f2fe",
      }}
    >
      {MAP_PINS.map((pin, i) => (
        <motion.div
          key={i}
          initial={reduce ? false : { scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring, delay: reduce ? 0 : 0.25 + i * 0.12 }}
          style={{ position: "absolute", top: pin.top, left: pin.left }}
        >
          {pin.active && !reduce && (
            <motion.span
              animate={{ scale: [1, 2.2], opacity: [0.45, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: -6,
                borderRadius: "50%",
                backgroundColor: "rgba(8,145,178,0.35)",
              }}
            />
          )}
          <LocationOnIcon
            sx={{
              fontSize: pin.active ? 34 : 24,
              color: pin.active ? COLORS.primary : "#7dd3fc",
              filter: pin.active ? "drop-shadow(0 2px 4px rgba(8,145,178,0.4))" : "none",
              position: "relative",
            }}
          />
        </motion.div>
      ))}

      {/* Treffer-Karte */}
      <motion.div
        initial={reduce ? false : { y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay: reduce ? 0 : 0.9 }}
        style={{ position: "absolute", left: 10, right: 10, bottom: 10 }}
      >
        <Box
          sx={{
            backgroundColor: "white",
            borderRadius: RADII.input,
            boxShadow: SHADOWS.subtle,
            px: 1.5,
            py: 1.25,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: COLORS.textPrimary }}>
              Stadtgalerie WC
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <StarIcon sx={{ fontSize: 13, color: "#f59e0b" }} />
              <Typography sx={{ fontSize: "0.72rem", color: COLORS.textSecondary }}>
                4,9 · 320 m entfernt
              </Typography>
            </Box>
          </Box>
          <Typography
            sx={{ ml: "auto", fontSize: "0.8rem", fontWeight: 700, color: COLORS.primary }}
          >
            ab 1,60 €
          </Typography>
        </Box>
      </motion.div>
    </Box>
  </Box>
);

/* ---------- Schritt 2: Buchung ---------- */

const BOOKING_ROWS = [
  { icon: EventIcon, label: "Datum", value: "Heute, 17. Juli" },
  { icon: AccessTimeIcon, label: "Uhrzeit", value: "14:30 Uhr" },
  { icon: GroupIcon, label: "Personen", value: "2" },
];

const BookingVignette = ({ reduce }) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: 1.25,
    }}
  >
    <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: COLORS.textPrimary }}>
      Stadtgalerie WC
    </Typography>
    {BOOKING_ROWS.map((row, i) => {
      const Icon = row.icon;
      return (
        <motion.div
          key={row.label}
          initial={reduce ? false : { x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ ...spring, delay: reduce ? 0 : 0.2 + i * 0.15 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 1.5,
              py: 1.1,
              borderRadius: RADII.input,
              backgroundColor: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <Icon sx={{ fontSize: 18, color: COLORS.primary }} />
            <Typography sx={{ fontSize: "0.8rem", color: COLORS.textSecondary }}>
              {row.label}
            </Typography>
            <Typography
              sx={{ ml: "auto", fontSize: "0.82rem", fontWeight: 600, color: COLORS.textPrimary }}
            >
              {row.value}
            </Typography>
          </Box>
        </motion.div>
      );
    })}
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0 : 0.75, duration: 0.4 }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          pt: 1,
          borderTop: "1px dashed #e2e8f0",
        }}
      >
        <Typography sx={{ fontSize: "0.8rem", color: COLORS.textSecondary }}>Gesamt</Typography>
        <Typography sx={{ ml: "auto", fontSize: "1rem", fontWeight: 800, color: COLORS.primary }}>
          3,20 €
        </Typography>
      </Box>
    </motion.div>
  </Box>
);

/* ---------- Schritt 3: Zahlung ---------- */

const PaymentVignette = ({ reduce }) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
    }}
  >
    <Box sx={{ display: "flex", gap: 1 }}>
      {["Kreditkarte", "PayPal"].map((method, i) => (
        <motion.div
          key={method}
          initial={reduce ? false : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: reduce ? 0 : 0.15 + i * 0.12 }}
        >
          <Box
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "999px",
              border: `1px solid ${i === 0 ? COLORS.primary : "#e2e8f0"}`,
              backgroundColor: i === 0 ? COLORS.accentBoxBg : "white",
              fontSize: "0.8rem",
              fontWeight: 600,
              color: i === 0 ? COLORS.primary : COLORS.textSecondary,
            }}
          >
            {method}
          </Box>
        </motion.div>
      ))}
    </Box>

    <motion.div
      initial={reduce ? false : { scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ ...spring, delay: reduce ? 0 : 0.55 }}
    >
      <CheckCircleIcon sx={{ fontSize: 72, color: "#10b981" }} />
    </motion.div>

    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0 : 0.85, duration: 0.4 }}
      style={{ textAlign: "center" }}
    >
      <Typography sx={{ fontSize: "0.95rem", fontWeight: 700, color: COLORS.textPrimary }}>
        Zahlung bestätigt
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          mt: 0.5,
        }}
      >
        <LockIcon sx={{ fontSize: 13, color: COLORS.textSecondary }} />
        <Typography sx={{ fontSize: "0.72rem", color: COLORS.textSecondary }}>
          SSL-verschlüsselt über Stripe oder PayPal
        </Typography>
      </Box>
    </motion.div>
  </Box>
);

/* ---------- Schritt 4: QR-Code ---------- */

const QrVignette = ({ reduce }) => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 1.5,
    }}
  >
    <motion.div
      initial={reduce ? false : { y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ...spring, delay: reduce ? 0 : 0.15 }}
    >
      <Box
        sx={{
          p: 2,
          borderRadius: RADII.card,
          backgroundColor: "white",
          border: "1px solid #e2e8f0",
          boxShadow: SHADOWS.subtle,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <QRCode value="https://wcfinder.de/demo-buchung" size={104} aria-hidden="true" />
        <Typography sx={{ fontSize: "0.72rem", color: COLORS.textSecondary, letterSpacing: 1 }}>
          BUCHUNG · Nr. 4711
        </Typography>
      </Box>
    </motion.div>
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0 : 0.5, duration: 0.4 }}
    >
      <Typography
        sx={{ fontSize: "0.85rem", color: COLORS.textPrimary, fontWeight: 600, textAlign: "center" }}
      >
        QR-Code am Eingang vorzeigen – fertig.
      </Typography>
    </motion.div>
  </Box>
);

const VIGNETTES = {
  suchen: SearchVignette,
  buchen: BookingVignette,
  bezahlen: PaymentVignette,
  nutzen: QrVignette,
};

/**
 * Interaktive Produkt-Demo: zeigt den Buchungsablauf in 4 Schritten.
 * Läuft automatisch durch, pausiert bei Hover oder manueller Auswahl.
 */
const FlowDemo = () => {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Manuelle Auswahl stoppt den Autoplay dauerhaft — der Nutzer hat übernommen
  const [userControlled, setUserControlled] = useState(false);

  useEffect(() => {
    if (reduce || paused || userControlled) return undefined;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % STEPS.length);
    }, STEP_DURATION_MS);
    return () => clearInterval(timer);
  }, [reduce, paused, userControlled]);

  const handleSelect = useCallback((index) => {
    setActive(index);
    setUserControlled(true);
  }, []);

  const step = STEPS[active];
  const Vignette = VIGNETTES[step.key];
  const autoplay = !reduce && !paused && !userControlled;

  return (
    <Box
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      sx={{
        backgroundColor: "white",
        borderRadius: RADII.panel,
        border: "1px solid #e2e8f0",
        boxShadow: "0 12px 40px rgba(8,145,178,0.12)",
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Schritt-Auswahl */}
      <Box role="tablist" aria-label="So funktioniert WCFinder" sx={{ display: "flex", gap: 0.5 }}>
        {STEPS.map((s, i) => (
          <Box
            key={s.key}
            component="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`flow-demo-panel-${s.key}`}
            id={`flow-demo-tab-${s.key}`}
            onClick={() => handleSelect(i)}
            sx={{
              flex: 1,
              border: "none",
              background: "none",
              cursor: "pointer",
              p: 0.5,
              borderRadius: RADII.input,
              transition: "background-color 0.2s",
              "&:hover": { backgroundColor: "#f8fafc" },
              "&:focus-visible": { outline: `2px solid ${COLORS.primary}`, outlineOffset: 2 },
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  transition: "all 0.25s",
                  backgroundColor: i === active ? COLORS.primary : "#f1f5f9",
                  color: i === active ? "white" : COLORS.textSecondary,
                }}
              >
                {s.nr}
              </Box>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  fontWeight: i === active ? 700 : 500,
                  color: i === active ? COLORS.primary : COLORS.textSecondary,
                }}
              >
                {s.label}
              </Typography>
              {/* Fortschrittsbalken des aktiven Schritts */}
              <Box
                sx={{
                  width: "100%",
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: i === active ? "#e0f2fe" : "transparent",
                  overflow: "hidden",
                }}
              >
                {i === active && autoplay && (
                  <motion.div
                    key={`progress-${active}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: STEP_DURATION_MS / 1000, ease: "linear" }}
                    style={{
                      height: "100%",
                      backgroundColor: COLORS.primary,
                      transformOrigin: "left",
                    }}
                  />
                )}
                {i === active && !autoplay && (
                  <Box sx={{ height: "100%", backgroundColor: COLORS.primary }} />
                )}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Bühne */}
      <Box
        role="tabpanel"
        id={`flow-demo-panel-${step.key}`}
        aria-labelledby={`flow-demo-tab-${step.key}`}
        sx={{ height: { xs: 280, sm: 320 }, position: "relative" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step.key}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ height: "100%" }}
          >
            <Vignette reduce={reduce} />
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default FlowDemo;
