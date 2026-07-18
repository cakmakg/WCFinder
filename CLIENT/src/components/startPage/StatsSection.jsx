import React, { useEffect, useRef, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { motion, animate, useInView, useReducedMotion } from "framer-motion";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import BookOnlineIcon from "@mui/icons-material/BookOnline";
import StarIcon from "@mui/icons-material/Star";
import { COLORS } from "./constants";

const stats = [
  {
    icon: StorefrontIcon,
    to: 500,
    suffix: "+",
    label: "Partner-Standorte",
    sublabel: "in ganz Deutschland",
  },
  {
    icon: LocationCityIcon,
    to: 50,
    suffix: "+",
    label: "Städte",
    sublabel: "Berlin, Hamburg, München u.v.m.",
  },
  {
    icon: BookOnlineIcon,
    to: 10000,
    suffix: "+",
    label: "Buchungen",
    sublabel: "pro Monat",
  },
  {
    icon: StarIcon,
    to: 4.9,
    decimals: 1,
    suffix: " / 5",
    label: "Ø Bewertung",
    sublabel: "aus 2.847 Rezensionen",
  },
];

const CountUp = ({ to, decimals = 0, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => setValue(v),
    });
    return () => controls.stop();
  }, [inView, reduce, to]);

  const formatted = value.toLocaleString("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref}>
      {formatted}
      {suffix}
    </span>
  );
};

const StatsSection = () => {
  const reduce = useReducedMotion();

  return (
    <Box
      component="section"
      aria-label="WCFinder Statistiken"
      sx={{
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e2e8f0",
        borderBottom: "1px solid #e2e8f0",
        py: { xs: 5, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: { xs: 4, md: 0 },
          }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Box
                  sx={{
                    textAlign: "center",
                    px: 2,
                    borderLeft: {
                      md: index > 0 ? "1px solid #e2e8f0" : "none",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 26, color: COLORS.primary, mb: 1 }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: COLORS.textPrimary,
                      fontSize: { xs: "1.7rem", md: "2.2rem" },
                      lineHeight: 1.1,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    <CountUp to={stat.to} decimals={stat.decimals} suffix={stat.suffix} />
                  </Typography>
                  <Typography
                    sx={{
                      color: COLORS.textPrimary,
                      fontWeight: 600,
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      mt: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    sx={{
                      color: COLORS.textSecondary,
                      fontSize: { xs: "0.72rem", md: "0.78rem" },
                    }}
                  >
                    {stat.sublabel}
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

export default StatsSection;
