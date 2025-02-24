import React from "react";
import Navbar from "./shared/Navbar";
import HeroSection from "./HeroSection";
import Features from "./Features";
import Footer from "./shared/Footer";

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <Features />
      <Footer />
    </div>
  );
};

export default Home;
