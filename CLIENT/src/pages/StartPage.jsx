import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import AuthModal from "../components/AuthModal";
import StartPageHeader from "../components/startPage/StartPageHeader";
import StartPageHero from "../components/startPage/StartPageHero";
import HowItWorksSection from "../components/startPage/HowItWorksSection";
import AboutUsSection from "../components/startPage/AboutUsSection";
import FeaturesSection from "../components/startPage/FeaturesSection";
import ReviewsSection from "../components/startPage/ReviewsSection";
import StartPageFooter from "../components/startPage/StartPageFooter";

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

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
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
