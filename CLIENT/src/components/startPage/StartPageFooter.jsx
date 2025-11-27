import React from "react";
import { Box, Container, Grid, Typography, Button, IconButton } from "@mui/material";
import { useTranslation } from "react-i18next";
import WcIcon from "@mui/icons-material/Wc";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";

const StartPageFooter = () => {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        backgroundColor: "#1e293b",
        color: "white",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  background: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: 1,
                }}
              >
                <WcIcon sx={{ color: "white", fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                WCFinder
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: "#cbd5e1",
                fontSize: "0.85rem",
                lineHeight: 1.6,
              }}
            >
              {t("startPage.footer.description")}
            </Typography>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "white",
                fontSize: "1rem",
              }}
            >
              {t("startPage.footer.quickLinks")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Typography
                component="a"
                href="#uber-uns"
                sx={{
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#0891b2" },
                }}
              >
                {t("startPage.footer.uberUns")}
              </Typography>
              <Typography
                component="a"
                href="#"
                sx={{
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#0891b2" },
                }}
              >
                {t("startPage.footer.partnerWerden")}
              </Typography>
              <Typography
                component="a"
                href="#wie-funktioniert-das"
                sx={{
                  color: "#cbd5e1",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  "&:hover": { color: "#0891b2" },
                }}
              >
                {t("startPage.footer.wieFunktioniertDas")}
              </Typography>
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "white",
                fontSize: "1rem",
              }}
            >
              {t("startPage.footer.followUs")}
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <IconButton
                sx={{
                  color: "#cbd5e1",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: "#0891b2",
                    color: "white",
                  },
                }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: "#cbd5e1",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: "#0891b2",
                    color: "white",
                  },
                }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: "#cbd5e1",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: "#0891b2",
                    color: "white",
                  },
                }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                sx={{
                  color: "#cbd5e1",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  "&:hover": {
                    backgroundColor: "#0891b2",
                    color: "white",
                  },
                }}
              >
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* App Download */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "white",
                fontSize: "1rem",
              }}
            >
              {t("startPage.footer.downloadApp")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<AppleIcon />}
                sx={{
                  borderColor: "#475569",
                  color: "white",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  "&:hover": {
                    borderColor: "#0891b2",
                    backgroundColor: "rgba(8,145,178,0.1)",
                  },
                }}
              >
                {t("startPage.footer.appStore")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<AndroidIcon />}
                sx={{
                  borderColor: "#475569",
                  color: "white",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  "&:hover": {
                    borderColor: "#0891b2",
                    backgroundColor: "rgba(8,145,178,0.1)",
                  },
                }}
              >
                {t("startPage.footer.googlePlay")}
              </Button>
            </Box>
          </Grid>
        </Grid>

        {/* Bottom Copyright */}
        <Box
          sx={{
            mt: 4,
            pt: 3,
            borderTop: "1px solid #334155",
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#94a3b8",
              fontSize: "0.875rem",
            }}
          >
            {t("startPage.footer.copyright")}
          </Typography>
          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            <Typography
              component="a"
              href="#"
              sx={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { color: "#0891b2" },
              }}
            >
              {t("startPage.footer.privacy")}
            </Typography>
            <Typography
              component="a"
              href="#"
              sx={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { color: "#0891b2" },
              }}
            >
              {t("startPage.footer.terms")}
            </Typography>
            <Typography
              component="a"
              href="#"
              sx={{
                color: "#94a3b8",
                textDecoration: "none",
                fontSize: "0.875rem",
                "&:hover": { color: "#0891b2" },
              }}
            >
              {t("startPage.footer.imprint")}
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StartPageFooter;

