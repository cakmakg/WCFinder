import React, { useState, useEffect } from "react";
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
import SEOHead from "../components/SEO/SEOHead";
import { generateOrganizationSchema, generateWebSiteSchema } from "../utils/seoHelpers";

const StartPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
      }}
    >
      <SEOHead
        title="WCFinder - Find Toilets Near You | Tuvalet Bulucu | WC Finder"
        description="Find clean, accessible toilets near you. WCFinder helps you locate public restrooms, WC facilities, and toiletten in your area. Book and reserve toilets easily. Tuvalet bulucu, WC finder, public toilet booking."
        keywords="toilet, wc, tuvalet, toiletten, public restroom, bathroom finder, wc finder, tuvalet bulucu, toilet near me, toilet booking, wc booking, public toilet, restroom finder, toilet reservation, tuvalet rezervasyonu"
        url="/"
        structuredData={[organizationSchema, websiteSchema].filter(Boolean)}
      />
      <StartPageHeader onLoginClick={() => setAuthModalOpen(true)} />
      <StartPageHero isSearching={isSearching} setIsSearching={setIsSearching} />
      <HowItWorksSection onBookNow={handleBookNow} />
      <AboutUsSection onBookNow={handleBookNow} />
      <FeaturesSection />
      <ReviewsSection />
      <StartPageFooter />

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        redirectAfterLogin={location.state?.from || "/home"}
        businessName={location.state?.businessName}
      />
    </Box>
  );
};

export default StartPage;
