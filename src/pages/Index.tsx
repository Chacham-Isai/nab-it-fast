import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import TechnologySection from "@/components/sections/TechnologySection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import TractionSection from "@/components/sections/TractionSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import ComparisonSection from "@/components/sections/ComparisonSection";
import PricingSection from "@/components/sections/PricingSection";
import FinalCTASection from "@/components/sections/FinalCTASection";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BackToTop />
      <main>
        <HeroSection />
        <div className="gradient-divider" />
        <ProblemSection />
        <div className="gradient-divider" />
        <HowItWorksSection />
        <div className="gradient-divider" />
        <TechnologySection />
        <div className="gradient-divider" />
        <CategoriesSection />
        <div className="gradient-divider" />
        <TractionSection />
        <div className="gradient-divider" />
        <TestimonialsSection />
        <div className="gradient-divider" />
        <ComparisonSection />
        <div className="gradient-divider" />
        <PricingSection />
        <div className="gradient-divider" />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;