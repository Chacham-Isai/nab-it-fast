import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-15 blur-[150px]" style={{ background: "hsl(var(--coral))" }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center relative z-10 max-w-md">
        <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }} className="mb-8">
          <span className="text-8xl block">🐇</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="font-heading font-black text-7xl md:text-8xl gradient-text mb-4">
          404
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-xl font-heading font-bold text-foreground mb-2">
          This deal doesn't exist
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-muted-foreground mb-8">
          The page <code className="text-primary bg-primary/10 px-2 py-0.5 rounded text-sm">{location.pathname}</code> couldn't be found. But there are plenty of deals that can.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button className="rounded-xl shimmer-btn gap-2 h-12 px-6">
              <Home className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <Button variant="outline" className="rounded-xl gap-2 h-12 px-6" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
