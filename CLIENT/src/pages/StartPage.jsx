import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AuthModal from "../components/Authmodal";
import StartPageHeader from "../components/startPage/StartPageHeader";
import StartPageHero from "../components/startPage/StartPageHero";
import HowItWorksSection from "../components/startPage/HowItWorksSection";
import AboutUsSection from "../components/startPage/AboutUsSection";
import FeaturesSection from "../components/startPage/FeaturesSection";
import ReviewsSection from "../components/startPage/ReviewsSection";
import StartPageFooter from "../components/startPage/StartPageFooter";
import PartnerRegistrationModal from "../components/startPage/PartnerRegistrationModal";
import SEOHead from "../components/SEO/SEOHead";
import { generateOrganizationSchema, generateWebSiteSchema } from "../utils/seoHelpers";

const StartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handlePartnerClick = useCallback(() => {
    // Production-safe state update
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

  // SEO için structured data
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

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
        title="WCFinder - Find Toilets Near You | Tuvalet Bulucu | WC Finder"
        description="Find clean, accessible toilets near you. WCFinder helps you locate public restrooms, WC facilities, and toiletten in your area. Book and reserve toilets easily. Tuvalet bulucu, WC finder, public toilet booking."
        keywords="toilet, wc, tuvalet, toiletten, public restroom, bathroom finder, wc finder, tuvalet bulucu, toilet near me, toilet booking, wc booking, public toilet, restroom finder, toilet reservation, tuvalet rezervasyonu"
        url="/"
        structuredData={[organizationSchema, websiteSchema].filter(Boolean)}
      />
      
      {/* ✅ ASYMMETRIC DESIGN: Decorative background elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: { xs: "200px", md: "400px" },
          height: { xs: "200px", md: "400px" },
          background: "linear-gradient(135deg, rgba(8,145,178,0.1) 0%, rgba(6,182,212,0.05) 100%)",
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
          background: "linear-gradient(135deg, rgba(20,184,166,0.1) 0%, rgba(8,145,178,0.05) 100%)",
          borderRadius: "50%",
          filter: "blur(60px)",
          zIndex: 0,
          transform: "translate(-30%, 30%)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <StartPageHeader onLoginClick={() => setAuthModalOpen(true)} />
        <StartPageHero isSearching={isSearching} setIsSearching={setIsSearching} />
        
        {/* ✅ ASYMMETRIC: Alternating section layouts */}
        <HowItWorksSection onBookNow={handleBookNow} />
        <AboutUsSection onBookNow={handleBookNow} onPartnerClick={handlePartnerClick} />
        <FeaturesSection />
        <ReviewsSection />
        <StartPageFooter onPartnerClick={handlePartnerClick} />
      </Box>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        redirectAfterLogin={location.state?.from || "/home"}
        businessName={location.state?.businessName}
      />
      
      {partnerModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, background: 'red', color: 'white', padding: '10px', zIndex: 10000 }}>
          Modal State: {partnerModalOpen ? 'OPEN' : 'CLOSED'}
        </div>
      )}
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
