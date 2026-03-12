import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

const Onboarding = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
    <h1 className="text-3xl font-heading font-bold text-foreground mb-4">Onboarding</h1>
    <p className="text-muted-foreground mb-6">7-step taste profile quiz — coming soon.</p>
    <Link to="/feed" className="text-primary hover:underline">Skip to Feed →</Link>
    <BottomNav />
  </div>
);

export default Onboarding;
