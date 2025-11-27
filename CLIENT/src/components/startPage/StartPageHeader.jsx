import React from "react";
import { AppBar, Toolbar, Box, Typography, Button, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import WcIcon from "@mui/icons-material/Wc";

const StartPageHeader = ({ onLoginClick }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexGrow: 1,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WcIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#0891b2",
              display: { xs: "none", sm: "block" },
            }}
          >
            WCFinder
          </Typography>
        </Box>

        {!isMobile && (
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": { color: "#0891b2" },
              }}
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t("startPage.featuresNav")}
            </Typography>
            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.9rem",
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": { color: "#0891b2" },
              }}
              onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
            >
              {t("startPage.reviews")}
            </Typography>
            <Button
              variant="outlined"
              onClick={onLoginClick}
              sx={{
                borderColor: "#0891b2",
                color: "#0891b2",
                fontWeight: 600,
                borderWidth: 1.5,
                borderRadius: 2,
                px: 2.5,
                py: 0.75,
                fontSize: "0.875rem",
                "&:hover": {
                  backgroundColor: "#0891b2",
                  color: "white",
                  borderWidth: 1.5,
                },
              }}
            >
              {t("startPage.loginButton")}
            </Button>
          </Box>
        )}

        {isMobile && (
          <Button
            variant="outlined"
            onClick={onLoginClick}
            size="small"
            sx={{
              borderColor: "#0891b2",
              color: "#0891b2",
              fontWeight: 600,
              borderWidth: 1.5,
              borderRadius: 2,
              fontSize: "0.8rem",
              "&:hover": {
                backgroundColor: "#0891b2",
                color: "white",
                borderWidth: 1.5,
              },
            }}
          >
            {t("startPage.loginButtonMobile")}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default StartPageHeader;

