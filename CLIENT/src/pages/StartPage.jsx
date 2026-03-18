import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AuthModal from "../components/Authmodal";
import StartPageHeader from "../components/startPage/StartPageHeader";
import StartPageHero from "../components/startPage/StartPageHero";
import StatsSection from "../components/startPage/StatsSection";
import HowItWorksSection from "../components/startPage/HowItWorksSection";
import AboutUsSection from "../components/startPage/AboutUsSection";
import FeaturesSection from "../components/startPage/FeaturesSection";
import ReviewsSection from "../components/startPage/ReviewsSection";
import FAQSection from "../components/startPage/FAQSection";
import StartPageFooter from "../components/startPage/StartPageFooter";
import PartnerRegistrationModal from "../components/startPage/PartnerRegistrationModal";
import SEOHead from "../components/SEO/SEOHead";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateServiceSchema,
  generateFAQSchema,
  generateHowToSchema,
  generateAggregateRatingSchema,
  generateSpeakableSchema,
} from "../utils/seoHelpers";

const StartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handlePartnerClick = useCallback(() => {
    setPartnerModalOpen(true);
  }, []);

  useEffect(() => {
    if (location.state?.openLoginModal) {
      setAuthModalOpen(true);
    }
  }, [location.state]);

  const handleBookNow = () => {
    navigate("/home");
  };

  // GEO + Knowledge Graph — 7 structured data schemas
  const schemas = [
    generateOrganizationSchema(),    // KG anchor — entity definition
    generateWebSiteSchema(),         // SearchAction
    generateServiceSchema(),         // Hizmet tanımı + pricing
    generateFAQSchema(),             // Question intent targeting
    generateHowToSchema(),           // AI Overviews — Schritt-für-Schritt
    generateAggregateRatingSchema(), // Rating entity
    generateSpeakableSchema(),       // Voice / AI assistant
  ].filter(Boolean);

  return (
    <Box
      component="main"
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <SEOHead
        title="WCFinder – Öffentliche Toiletten finden & buchen | Saubere WC-Anlage in deiner Nähe"
        description="WCFinder ist Deutschlands Buchungsplattform für saubere, barrierefreie öffentliche Toiletten. Finde und buche WC-Anlagen in deiner Stadt ab €1,60. Über 500 Partner-Standorte in 50+ deutschen Städten."
        keywords="öffentliche toilette, toilette buchen, wc finder, wc buchen, saubere toilette deutschland, public toilet booking, toilette in der nähe, barrierefreie toilette, wc buchung, toilette reservieren, wcfinder"
        url="/"
        locale="de_DE"
        structuredData={schemas}
      />

      {/* Decorative background blobs */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: { xs: "200px", md: "400px" },
          height: { xs: "200px", md: "400px" },
          background:
            "linear-gradient(135deg, rgba(8,145,178,0.1) 0%, rgba(6,182,212,0.05) 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
          transform: "translate(30%, -30%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: { xs: "150px", md: "300px" },
          height: { xs: "150px", md: "300px" },
          background:
            "linear-gradient(135deg, rgba(8,145,178,0.1) 0%, rgba(14,116,144,0.05) 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
          transform: "translate(-30%, 30%)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <StartPageHeader
          onLoginClick={() => setAuthModalOpen(true)}
          onPartnerClick={handlePartnerClick}
        />
        <StartPageHero
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          onPartnerClick={handlePartnerClick}
        />

        {/* Data-rich stats — immediately after hero for authority signal */}
        <StatsSection />

        <HowItWorksSection onBookNow={handleBookNow} />
        <AboutUsSection onBookNow={handleBookNow} onPartnerClick={handlePartnerClick} />
        <FeaturesSection />
        <ReviewsSection />

        {/* FAQ — before footer for question intent targeting */}
        <FAQSection />

        <StartPageFooter onPartnerClick={handlePartnerClick} />
      </Box>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        redirectAfterLogin={location.state?.from || "/home"}
        businessName={location.state?.businessName}
      />

      <PartnerRegistrationModal
        open={partnerModalOpen}
        onClose={() => {
          setPartnerModalOpen(false);
        }}
      />
    </Box>
  );
};

export default StartPage;
