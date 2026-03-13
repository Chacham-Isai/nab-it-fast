import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import ProblemSection from "@/components/sections/ProblemSection";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import DemoSection from "@/components/sections/DemoSection";
import NavigatorSection from "@/components/sections/NavigatorSection";
import TechnologySection from "@/components/sections/TechnologySection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import TractionSection from "@/components/sections/TractionSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import RetailerMarquee from "@/components/sections/RetailerMarquee";
import PressBar from "@/components/sections/PressBar";
import ComparisonSection from "@/components/sections/ComparisonSection";
import PricingSection from "@/components/sections/PricingSection";
import FinalCTASection from "@/components/sections/FinalCTASection";
import BackToTop from "@/components/BackToTop";
import usePageMeta from "@/hooks/usePageMeta";
const Index = () => {
  usePageMeta({ title: "nabbit.ai — AI-Powered Price Hunting That Never Sleeps", description: "Stop overpaying. Nabbit's AI monitors 200+ retailers 24/7 and auto-purchases the instant your item hits your target price.", path: "/" });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BackToTop />
      <main>
        <HeroSection />
        <RetailerMarquee />
        <div className="gradient-divider" />
        <ProblemSection />
        <div className="gradient-divider" />
        <HowItWorksSection />
        <div className="gradient-divider" />
        <DemoSection />
        <div className="gradient-divider" />
        <NavigatorSection />
        <div className="gradient-divider" />
        <TechnologySection />
        <div className="gradient-divider" />
        <CategoriesSection />
        <div className="gradient-divider" />
        <TractionSection />
        <div className="gradient-divider" />
        <TestimonialsSection />
        <PressBar />
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
