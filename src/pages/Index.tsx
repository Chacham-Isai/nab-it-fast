import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import LiveFeedSection from "@/components/sections/LiveFeedSection";
import HowItDropsSection from "@/components/sections/HowItDropsSection";
import GameModesSection from "@/components/sections/GameModesSection";
import NabbitEngineSection from "@/components/sections/NabbitEngineSection";
import CategoriesSection from "@/components/sections/CategoriesSection";
import SocialProofSection from "@/components/sections/SocialProofSection";
import FinalCTASection from "@/components/sections/FinalCTASection";
import BackToTop from "@/components/BackToTop";
import usePageMeta from "@/hooks/usePageMeta";

const Index = () => {
  usePageMeta({
    title: "nabbit.ai — AI Deals You Grab, Spin, Bid & Auto-Buy",
    description: "The Nabbit Engine finds personalized deals and lets you grab bags, bid auctions, join live breaks, or auto-nab at your price. Gamified AI-powered shopping.",
    path: "/",
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <BackToTop />
      <main>
        <HeroSection />
        <div className="gradient-divider" />
        <LiveFeedSection />
        <div className="gradient-divider" />
        <HowItDropsSection />
        <div className="gradient-divider" />
        <GameModesSection />
        <div className="gradient-divider" />
        <NabbitEngineSection />
        <div className="gradient-divider" />
        <CategoriesSection />
        <div className="gradient-divider" />
        <SocialProofSection />
        <div className="gradient-divider" />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;