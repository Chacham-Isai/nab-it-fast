import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";
import Index from "@/pages/Index";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
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
import Sell from "@/pages/Sell";
import Browse from "@/pages/Browse";
import Orders from "@/pages/Orders";
import ListingDetail from "@/pages/ListingDetail";
import CrewDetail from "@/pages/CrewDetail";
import Analytics from "@/pages/Analytics";
import Terms from "@/pages/Terms";
import Privacy from "@/pages/Privacy";
import DealDetail from "@/pages/DealDetail";
import Chat from "@/pages/Chat";
import Referrals from "@/pages/Referrals";
import Admin from "@/pages/Admin";
import useRealtimeNotifications from "@/hooks/useRealtimeNotifications";

const AnimatedRoutes = () => {
  const location = useLocation();
  useRealtimeNotifications();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/blog" element={<PageTransition><Blog /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />

        {/* Protected routes */}
        <Route path="/onboarding" element={<PageTransition><ProtectedRoute><Onboarding /></ProtectedRoute></PageTransition>} />
        <Route path="/feed" element={<PageTransition><ProtectedRoute><Feed /></ProtectedRoute></PageTransition>} />
        <Route path="/dream-buys" element={<PageTransition><ProtectedRoute><DreamBuy /></ProtectedRoute></PageTransition>} />
        <Route path="/community" element={<PageTransition><ProtectedRoute><Community /></ProtectedRoute></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
        <Route path="/notifications" element={<PageTransition><ProtectedRoute><Notifications /></ProtectedRoute></PageTransition>} />
        <Route path="/giving" element={<PageTransition><ProtectedRoute><Giving /></ProtectedRoute></PageTransition>} />
        <Route path="/play" element={<PageTransition><ProtectedRoute><Play /></ProtectedRoute></PageTransition>} />
        <Route path="/breaks" element={<PageTransition><ProtectedRoute><Breaks /></ProtectedRoute></PageTransition>} />
        <Route path="/grab-bags" element={<PageTransition><ProtectedRoute><GrabBags /></ProtectedRoute></PageTransition>} />
        <Route path="/auctions" element={<PageTransition><ProtectedRoute><Auctions /></ProtectedRoute></PageTransition>} />
        <Route path="/sell" element={<PageTransition><ProtectedRoute><Sell /></ProtectedRoute></PageTransition>} />
        <Route path="/browse" element={<PageTransition><Browse /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><ProtectedRoute><Orders /></ProtectedRoute></PageTransition>} />
        <Route path="/listing/:id" element={<PageTransition><ListingDetail /></PageTransition>} />
        <Route path="/crew/:name" element={<PageTransition><CrewDetail /></PageTransition>} />
        <Route path="/deal/:id" element={<PageTransition><ProtectedRoute><DealDetail /></ProtectedRoute></PageTransition>} />
        <Route path="/analytics" element={<PageTransition><ProtectedRoute><Analytics /></ProtectedRoute></PageTransition>} />
        <Route path="/chat/:roomId" element={<PageTransition><ProtectedRoute><Chat /></ProtectedRoute></PageTransition>} />
        <Route path="/referrals" element={<PageTransition><ProtectedRoute><Referrals /></ProtectedRoute></PageTransition>} />
        <Route path="/admin" element={<PageTransition><ProtectedRoute><Admin /></ProtectedRoute></PageTransition>} />

        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
