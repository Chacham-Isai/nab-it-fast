import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import isometricHero from "@/assets/isometric-hero.png";

const recentNabs = [
  { user: "🔥 Jake R.", item: "PS5 Slim Bundle", saved: "$127", time: "just now" },
  { user: "⚡ Maria K.", item: "Air Jordan 4 Retro", saved: "$89", time: "12s ago" },
  { user: "🎯 Dev P.", item: "Dyson Airwrap", saved: "$165", time: "34s ago" },
  { user: "💎 Lena S.", item: "Rolex Explorer II", saved: "$2,100", time: "1m ago" },
  { user: "🎲 Chris M.", item: "RTX 4090 FE", saved: "$340", time: "2m ago" },
  { user: "🏆 Ava T.", item: "Chanel Le Boy", saved: "$890", time: "3m ago" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [nabIndex, setNabIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setNabIndex((prev) => (prev + 1) % recentNabs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentNab = recentNabs[nabIndex];

  return (
    <section className="relative min-h-[calc(100svh-4.5rem)] lg:min-h-screen flex items-center pt-16 lg:pt-20 pb-8 lg:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background — cyan/purple gradient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.12, 0.22, 0.12], rotate: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-40 w-[800px] h-[800px] rounded-full blur-[200px]"
          style={{ background: "hsl(var(--nab-cyan))" }}
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[180px]"
          style={{ background: "hsl(var(--nab-purple))" }}
        />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute inset-0" style={{ background: `var(--radial-overlay)` }} />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left — Copy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-5 lg:space-y-6"
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nab-cyan/40 bg-nab-cyan/[0.08] backdrop-blur-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nab-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-nab-cyan" />
            </span>
            <span className="text-sm font-bold text-nab-cyan tracking-wide uppercase">Live Deals Dropping Now</span>
          </motion.div>

          <h1 className="font-heading font-black text-foreground leading-[0.95]" style={{ fontSize: "clamp(2.4rem, 6vw, 4.8rem)" }}>
            Stop Chasing.<br />
            <span className="gradient-text">Start Nabbing.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
            The <strong className="text-foreground">Nabbit Engine</strong> scans millions of listings, learns your taste, and drops personalized deals you can{" "}
            <strong className="text-foreground">bid, spin, grab,</strong> or <strong className="text-foreground">auto-buy</strong> — before anyone else.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nab-cyan/[0.1] border border-nab-cyan/30 text-nab-cyan">
              <Flame className="w-3.5 h-3.5" /> AI Deal Engine
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/[0.1] border border-success/30 text-success">
              <Zap className="w-3.5 h-3.5" /> Sub-3s Auto-Nab
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nab-purple/[0.1] border border-nab-purple/30 text-nab-purple">
              <Trophy className="w-3.5 h-3.5" /> Gamified Shopping
            </span>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              size="lg"
              className="rounded-full px-10 font-black text-base gap-2 shimmer-btn text-lg"
              onClick={() => navigate("/signup")}
            >
              Start Nabbing <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 font-bold text-base border-border hover:bg-secondary group"
              onClick={() => document.getElementById("how-it-drops")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Button>
          </div>

          {/* Live nab ticker */}
          <div className="pt-2 hidden xl:block">
            <AnimatePresence mode="wait">
              <motion.div
                key={nabIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-success/[0.08] border border-success/20 text-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <span className="text-muted-foreground">
                  {currentNab.user} nabbed <strong className="text-foreground">{currentNab.item}</strong> — saved{" "}
                  <strong className="text-success">{currentNab.saved}</strong>
                </span>
                <span className="text-xs text-muted-foreground/50">{currentNab.time}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right — Isometric hero illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 60 }}
          className="relative mt-2 lg:mt-0 flex justify-center lg:justify-end"
        >
          <div className="relative">
            <div className="absolute inset-0 scale-110 blur-[80px] rounded-full pointer-events-none" style={{ background: "hsl(var(--nab-cyan) / 0.1)" }} />
            <motion.img
              src={isometricHero}
              alt="nabbit.ai — AI-powered deal hunting"
              className="w-[320px] sm:w-[400px] lg:w-[460px] relative z-10 drop-shadow-2xl"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Floating urgency tags */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 sm:-left-12 top-12 px-4 py-2 rounded-full border border-nab-cyan/40 bg-card/95 backdrop-blur-sm text-sm font-bold shadow-xl"
            >
              <Flame className="w-3.5 h-3.5 inline mr-1 text-nab-cyan" /> 3 left at this price
            </motion.div>

            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 sm:-right-10 bottom-20 px-4 py-2 rounded-full border border-success/40 bg-card/95 backdrop-blur-sm text-sm font-bold shadow-xl"
            >
              <Trophy className="w-3.5 h-3.5 inline mr-1 text-success" /> You saved $2,847
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
