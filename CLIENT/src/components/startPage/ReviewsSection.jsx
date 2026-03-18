import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
} from "@mui/material";
// eslint-disable-next-line no-unused-vars
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
      component="section"
      id="reviews"
      aria-labelledby="reviews-heading"
      className="speakable-reviews"
      sx={{
        py: { xs: 6, md: 10 },
        backgroundColor: "#f8fafc",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative blob */}
      <Box
        sx={{
          position: "absolute",
          top: "-100px",
          left: "-100px",
          width: "300px",
          height: "300px",
          background:
            "linear-gradient(135deg, rgba(8,145,178,0.08) 0%, transparent 100%)",
          borderRadius: "50%",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Heading with AggregateRating microdata */}
        <Box
          sx={{
            textAlign: { xs: "center", md: "left" },
            mb: 6,
            maxWidth: { md: "500px" },
          }}
          itemScope
          itemType="https://schema.org/AggregateRating"
        >
          <meta itemProp="ratingValue" content="4.9" />
          <meta itemProp="reviewCount" content="2847" />
          <meta itemProp="bestRating" content="5" />
          <meta itemProp="itemReviewed" content="WCFinder" />

          <Typography
            component="h2"
            id="reviews-heading"
            variant="h3"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              mb: 2,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            {t("startPage.reviews.title")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-start" },
              gap: 1,
            }}
          >
            <Rating value={5} readOnly precision={0.5} />
            <Typography
              variant="body1"
              sx={{ color: "#64748b", fontWeight: 600 }}
            >
              4,9 • 2.847 {t("startPage.reviews.reviewsCount")}
            </Typography>
          </Box>
        </Box>

        {/* Review cards */}
        <Grid container spacing={3}>
          {reviews.map((review, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={3}
              key={review.name}
              sx={{ mt: { md: index % 2 === 1 ? 4 : 0 } }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  itemScope
                  itemType="https://schema.org/Review"
                  sx={{
                    height: "100%",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    borderRadius: "14px",
                    borderTop: index % 2 === 0 ? "3px solid #0891b2" : "none",
                    borderBottom:
                      index % 2 === 1 ? "3px solid #0891b2" : "none",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-4px) scale(1.02)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <meta itemProp="reviewRating" content={String(review.rating)} />
                  <meta itemProp="reviewBody" content={review.text} />

                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      itemScope
                      itemProp="author"
                      itemType="https://schema.org/Person"
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
                          itemProp="name"
                          sx={{
                            fontWeight: "bold",
                            color: "#0f172a",
                            fontSize: "0.9rem",
                          }}
                        >
                          {review.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#94a3b8", fontSize: "0.75rem" }}
                        >
                          {review.time}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating
                      value={review.rating}
                      readOnly
                      size="small"
                      sx={{ mb: 1.5 }}
                    />
                    <Typography
                      variant="body2"
                      itemProp="reviewBody"
                      sx={{ color: "#64748b", lineHeight: 1.6, fontSize: "0.85rem" }}
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
