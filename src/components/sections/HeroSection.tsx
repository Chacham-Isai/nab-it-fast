import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Flame, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const recentNabs = [
  { user: "🔥 Jake R.", item: "PS5 Slim Bundle", saved: "$127", time: "just now" },
  { user: "⚡ Maria K.", item: "Air Jordan 4 Retro", saved: "$89", time: "12s ago" },
  { user: "🎯 Dev P.", item: "Dyson Airwrap", saved: "$165", time: "34s ago" },
  { user: "💎 Lena S.", item: "Rolex Explorer II", saved: "$2,100", time: "1m ago" },
  { user: "🎲 Chris M.", item: "RTX 4090 FE", saved: "$340", time: "2m ago" },
  { user: "🏆 Ava T.", item: "Chanel Le Boy", saved: "$890", time: "3m ago" },
];

const heroWords = [
  "GRAB IT.",
  "NAB IT.",
  "SPIN IT.",
  "WIN IT.",
];

const floatingDeals = [
  { emoji: "👟", name: "Jordan 4 Retro", was: "$285", now: "$196", pct: "-31%" },
  { emoji: "🎮", name: "PS5 Pro Bundle", was: "$699", now: "$499", pct: "-29%" },
  { emoji: "💄", name: "Dyson Airwrap", was: "$599", now: "$434", pct: "-28%" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [wordIndex, setWordIndex] = useState(0);
  const [nabIndex, setNabIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNabIndex((prev) => (prev + 1) % recentNabs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentNab = recentNabs[nabIndex];

  return (
    <section className="relative min-h-screen flex items-center pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background chaos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.2, 0.1], rotate: [0, 15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-40 w-[800px] h-[800px] rounded-full bg-primary blur-[200px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-[hsl(280,100%,60%)] blur-[180px]"
        />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute inset-0" style={{ background: `var(--radial-overlay)` }} />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-10 lg:gap-16 items-center relative z-10">
        {/* Left — Copy */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-7"
        >
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/[0.1] backdrop-blur-sm"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
            </span>
            <span className="text-sm font-bold text-primary tracking-wide uppercase">Live Deals Dropping Now</span>
          </motion.div>

          <h1 className="font-heading font-black text-foreground leading-[0.95]" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)" }}>
            AI finds the deal.<br />
            You{" "}
            <span className="gradient-text relative inline-block min-w-[200px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIndex}
                  initial={{ opacity: 0, y: 30, rotateX: -40 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -30, rotateX: 40 }}
                  transition={{ duration: 0.35 }}
                  className="inline-block"
                >
                  {heroWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
            The <strong className="text-foreground">Nabbit Engine</strong> scans millions of listings, learns your taste, and drops personalized deals you can{" "}
            <strong className="text-foreground">bid, spin, grab,</strong> or <strong className="text-foreground">auto-buy</strong> — before anyone else.
          </p>

          {/* Dopamine trust pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/[0.1] border border-primary/30 text-primary">
              <Flame className="w-3.5 h-3.5" /> Impulse-Buy Engine
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/[0.1] border border-success/30 text-success">
              <Zap className="w-3.5 h-3.5" /> Sub-3s Auto-Nab
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(280,100%,70%)]/[0.1] border border-[hsl(280,100%,70%)]/30 text-[hsl(280,100%,70%)]">
              <Trophy className="w-3.5 h-3.5" /> Gamified Shopping
            </span>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button
              size="lg"
              className="rounded-full px-10 font-black text-base gap-2 shimmer-btn shadow-[0_0_40px_-5px_hsl(var(--coral)/0.5)] text-lg"
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
          <div className="pt-3">
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

        {/* Right — Deal cards cascade */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative">
            <div className="absolute inset-0 scale-110 blur-[80px] bg-primary/[0.1] rounded-full pointer-events-none" />

            <div className="space-y-4 w-[320px] sm:w-[360px]">
              {floatingDeals.map((deal, i) => (
                <motion.div
                  key={deal.name}
                  initial={{ opacity: 0, x: 40, rotateY: -15 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ delay: 0.4 + i * 0.2, duration: 0.6, type: "spring", stiffness: 80 }}
                  className="glass-card gradient-border p-5 group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {deal.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-heading font-bold text-foreground text-sm">{deal.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground line-through">{deal.was}</span>
                        <span className="text-sm font-black text-primary">{deal.now}</span>
                        <span className="text-[10px] font-bold text-success bg-success/[0.1] px-1.5 py-0.5 rounded-full">{deal.pct}</span>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
                    >
                      <Zap className="w-4 h-4 text-primary-foreground" />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating urgency tags */}
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 sm:-left-16 top-8 px-4 py-2 rounded-full border border-primary/40 bg-card/95 backdrop-blur-sm text-sm font-bold shadow-xl shadow-primary/10"
            >
              <Flame className="w-3.5 h-3.5 inline mr-1 text-primary" /> 3 left at this price
            </motion.div>

            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-6 sm:-right-14 bottom-16 px-4 py-2 rounded-full border border-success/40 bg-card/95 backdrop-blur-sm text-sm font-bold shadow-xl shadow-success/10"
            >
              <Trophy className="w-3.5 h-3.5 inline mr-1 text-success" /> You saved $2,847 this month
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;