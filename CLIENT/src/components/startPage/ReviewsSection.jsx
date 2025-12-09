import React from "react";
import { Box, Container, Grid, Typography, Card, CardContent, Avatar, Rating } from "@mui/material";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const reviews = [
  {
    name: "Michael K.",
    time: "vor einem Tag",
    rating: 5,
    text: "Sehr saubere Einrichtung. Absolut empfehlenswert!",
  },
  {
    name: "Sara K.",
    time: "vor einem Tag",
    rating: 5,
    text: "Einfacher Ablauf und sichere Umgebung.",
  },
  {
    name: "Bhranswan N.",
    time: "vor 2 Tagen",
    rating: 5,
    text: "Freundlicher Service. Sehr zu empfehlen!",
  },
  {
    name: "Byron S.",
    time: "vor 2 Tagen",
    rating: 5,
    text: "Perfekt zugänglich und sehr sauber.",
  },
];

const ReviewsSection = () => {
  const { t } = useTranslation();

  return (
    <Box
      id="reviews"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "#f8fafc",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ✅ ASYMMETRIC: Decorative element */}
      <Box
        sx={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "300px",
          height: "300px",
          background: "linear-gradient(135deg, rgba(20,184,166,0.08) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* ✅ ASYMMETRIC: Title positioned to the left */}
        <Box sx={{ 
          textAlign: { xs: "center", md: "left" }, 
          mb: 6,
          maxWidth: { md: "500px" },
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: "bold",
              color: "#1e293b",
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            {t("startPage.reviews.title")}
          </Typography>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: { xs: "center", md: "flex-start" }, 
            gap: 1 
          }}>
            <Rating value={5} readOnly precision={0.5} />
            <Typography variant="body1" sx={{ color: "#64748b", fontWeight: 600 }}>
              5.0 • 2.847 {t("startPage.reviews.reviewsCount")}
            </Typography>
          </Box>
        </Box>

        {/* ✅ ASYMMETRIC: Staggered grid with offset */}
        <Grid container spacing={3}>
          {reviews.map((review, index) => (
            <Grid 
              item 
              xs={12} 
              sm={6} 
              md={3} 
              key={index}
              sx={{
                // ✅ ASYMMETRIC: Offset every other card
                mt: { md: index % 2 === 1 ? 4 : 0 },
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: "100%",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                    borderRadius: 3,
                    borderTop: index % 2 === 0 ? "3px solid #0891b2" : "none",
                    borderBottom: index % 2 === 1 ? "3px solid #14b8a6" : "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px) scale(1.02)", // ✅ ASYMMETRIC: Scale on hover
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: "#0891b2",
                          mr: 1.5,
                        }}
                      >
                        {review.name.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold", color: "#1e293b", fontSize: "0.9rem" }}
                        >
                          {review.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                          {review.time}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={review.rating} readOnly size="small" sx={{ mb: 1.5 }} />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#64748b",
                        lineHeight: 1.6,
                        fontSize: "0.85rem",
                      }}
                    >
                      {review.text}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ReviewsSection;

