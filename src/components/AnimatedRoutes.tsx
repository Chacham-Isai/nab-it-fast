import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import NotFound from "@/pages/NotFound";
import Onboarding from "@/pages/Onboarding";
import Feed from "@/pages/Feed";
import DreamBuy from "@/pages/DreamBuy";
import Community from "@/pages/Community";
import Profile from "@/pages/Profile";
import Notifications from "@/pages/Notifications";
import Giving from "@/pages/Giving";
import Play from "@/pages/Play";
import Breaks from "@/pages/Breaks";
import GrabBags from "@/pages/GrabBags";
import Auctions from "@/pages/Auctions";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><Onboarding /></PageTransition>} />
        <Route path="/feed" element={<PageTransition><Feed /></PageTransition>} />
        <Route path="/dream-buys" element={<PageTransition><DreamBuy /></PageTransition>} />
        <Route path="/community" element={<PageTransition><Community /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><Notifications /></PageTransition>} />
        <Route path="/giving" element={<PageTransition><Giving /></PageTransition>} />
        <Route path="/play" element={<PageTransition><Play /></PageTransition>} />
        <Route path="/breaks" element={<PageTransition><Breaks /></PageTransition>} />
        <Route path="/grab-bags" element={<PageTransition><GrabBags /></PageTransition>} />
        <Route path="/auctions" element={<PageTransition><Auctions /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
