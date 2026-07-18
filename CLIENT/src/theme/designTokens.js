// Gemeinsame Design-Tokens der WCFinder-Designsprache.
// Quelle der Wahrheit für Farben, Radien und Schatten in CLIENT.
export const COLORS = {
  primary: "#0891b2",
  primaryDark: "#0e7490",
  primaryGradient: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
  primaryGradientHover: "linear-gradient(135deg, #0e7490 0%, #155e75 100%)",
  textPrimary: "#1e293b",
  textHeading: "#0f172a",
  textSecondary: "#64748b",
  textLight: "#94a3b8",
  border: "#e2e8f0",
  backgroundLight: "#f8fafc",
  backgroundWhite: "white",
  backgroundDark: "#1e293b",
  accentBoxBg: "#f0f9ff",
  success: "#10b981",
  warning: "#f59e0b",
};

export const RADII = {
  button: "12px",
  input: "12px",
  card: "14px",
  panel: "16px",
};

export const SHADOWS = {
  subtle: "0 2px 12px rgba(0,0,0,0.06)",
  hover: "0 8px 24px rgba(0,0,0,0.12)",
  brand: "0 4px 14px rgba(8,145,178,0.3)",
  brandHover: "0 8px 24px rgba(8,145,178,0.4)",
  panel: "0 12px 40px rgba(8,145,178,0.12)",
};

// Heller Seitenkopf-Hintergrund mit dezentem Punktraster (wie StartPage-Hero)
export const PAGE_HEADER_BG = "linear-gradient(180deg, #f0f9ff 0%, #ffffff 85%)";
export const DOT_GRID = {
  backgroundImage: "radial-gradient(rgba(8,145,178,0.10) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
};

export const SPACING = {
  sectionPadding: { xs: 6, md: 10 },
};

export const TYPOGRAPHY = {
  pageTitle: {
    fontWeight: 800,
    color: COLORS.textHeading,
    letterSpacing: "-0.02em",
  },
  h3: {
    fontWeight: "bold",
    fontSize: { xs: "1.75rem", md: "2.5rem" },
  },
  body: {
    fontSize: { xs: "0.95rem", md: "1.05rem" },
    lineHeight: 1.7,
  },
};
