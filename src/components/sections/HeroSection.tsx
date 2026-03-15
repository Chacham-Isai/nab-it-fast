import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Flame, Trophy, Swords, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── mock deal data for slot reel ── */
const dealItems = [
  { name: "Air Jordan 4 Retro", retailPrice: 210, nabPrice: 121, emoji: "👟", rarity: "EPIC" },
  { name: "PS5 Slim Bundle", retailPrice: 499, nabPrice: 372, emoji: "🎮", rarity: "RARE" },
  { name: "Dyson Airwrap", retailPrice: 599, nabPrice: 434, emoji: "💇", rarity: "COMMON" },
  { name: "Rolex Explorer II", retailPrice: 14500, nabPrice: 12400, emoji: "⌚", rarity: "LEGENDARY" },
  { name: "RTX 4090 FE", retailPrice: 1599, nabPrice: 1259, emoji: "🖥️", rarity: "EPIC" },
  { name: "Chanel Le Boy", retailPrice: 5800, nabPrice: 4910, emoji: "👜", rarity: "LEGENDARY" },
  { name: "iPad Pro M4", retailPrice: 1099, nabPrice: 929, emoji: "📱", rarity: "RARE" },
  { name: "Bose QC Ultra", retailPrice: 429, nabPrice: 319, emoji: "🎧", rarity: "COMMON" },
];

const rarityColors: Record<string, string> = {
  COMMON: "text-muted-foreground border-border",
  RARE: "text-nab-cyan border-nab-cyan/50",
  EPIC: "text-nab-purple border-nab-purple/50",
  LEGENDARY: "text-[hsl(40_90%_55%)] border-[hsl(40_90%_55%)]/50",
};

const rarityGlow: Record<string, string> = {
  COMMON: "",
  RARE: "shadow-[0_0_20px_hsl(var(--nab-cyan)/0.15)]",
  EPIC: "shadow-[0_0_20px_hsl(var(--nab-purple)/0.15)]",
  LEGENDARY: "shadow-[0_0_30px_hsl(40_90%_55%/0.25)]",
};

const recentNabs = [
  { user: "🔥 Jake R.", item: "PS5 Slim Bundle", saved: "$127", time: "just now" },
  { user: "⚡ Maria K.", item: "Air Jordan 4 Retro", saved: "$89", time: "12s ago" },
  { user: "🎯 Dev P.", item: "Dyson Airwrap", saved: "$165", time: "34s ago" },
  { user: "💎 Lena S.", item: "Rolex Explorer II", saved: "$2,100", time: "1m ago" },
  { user: "🎲 Chris M.", item: "RTX 4090 FE", saved: "$340", time: "2m ago" },
  { user: "🏆 Ava T.", item: "Chanel Le Boy", saved: "$890", time: "3m ago" },
];

/* ── animated savings counter ── */
const useSavingsCounter = (target: number, duration = 2000) => {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);
  return value;
};

const HeroSection = () => {
  const navigate = useNavigate();
  const [nabIndex, setNabIndex] = useState(0);
  const [dealIndex, setDealIndex] = useState(0);
  const [isNabbed, setIsNabbed] = useState(false);
  const [totalNabs, setTotalNabs] = useState(14847);
  const savingsDisplay = useSavingsCounter(284719, 2500);

  useEffect(() => {
    const interval = setInterval(() => {
      setNabIndex((prev) => (prev + 1) % recentNabs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Deal slot reel cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setIsNabbed(false);
      setDealIndex((prev) => (prev + 1) % dealItems.length);
      // Flash "NABBED" after a delay
      setTimeout(() => {
        setIsNabbed(true);
        setTotalNabs((prev) => prev + 1);
      }, 1800);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentDeal = dealItems[dealIndex];
  const nextDeal = dealItems[(dealIndex + 1) % dealItems.length];
  const currentNab = recentNabs[nabIndex];
  const savings = currentDeal.retailPrice - currentDeal.nabPrice;

  return (
    <section className="relative min-h-[calc(100svh-4.5rem)] lg:min-h-screen flex items-center pt-16 lg:pt-20 pb-8 lg:pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
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
              <Swords className="w-3.5 h-3.5" /> Nab It
            </span>
          </div>

          <div className="flex flex-wrap gap-4 pt-1">
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
          <div className="pt-1">
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

        {/* Right — Deal Slot Machine */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, type: "spring", stiffness: 60 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-[380px] space-y-4">
            {/* Scoreboard strip */}
            <div className="flex items-center justify-between px-1 text-xs font-bold">
              <motion.div
                key={totalNabs}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 text-nab-cyan"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>{totalNabs.toLocaleString()} nabbed today</span>
              </motion.div>
              <div className="flex items-center gap-1.5 text-success">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>${savingsDisplay.toLocaleString()} saved</span>
              </div>
            </div>

            {/* Main deal card — slot reel */}
            <div className="relative glass-card gradient-border rounded-3xl overflow-hidden">
              {/* Rarity glow bg */}
              <motion.div
                key={`glow-${dealIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: currentDeal.rarity === "LEGENDARY"
                    ? "radial-gradient(ellipse at center, hsl(40 90% 55% / 0.08) 0%, transparent 70%)"
                    : currentDeal.rarity === "EPIC"
                    ? "radial-gradient(ellipse at center, hsl(var(--nab-purple) / 0.08) 0%, transparent 70%)"
                    : currentDeal.rarity === "RARE"
                    ? "radial-gradient(ellipse at center, hsl(var(--nab-cyan) / 0.08) 0%, transparent 70%)"
                    : "none",
                }}
              />

              <div className="relative p-6 space-y-4">
                {/* Rarity badge */}
                <div className="flex items-center justify-between">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`rarity-${dealIndex}`}
                      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${rarityColors[currentDeal.rarity]}`}
                    >
                      {currentDeal.rarity === "LEGENDARY" ? "🏆 " : ""}{currentDeal.rarity}
                    </motion.span>
                  </AnimatePresence>
                  <span className="text-xs text-muted-foreground font-mono">#{String(dealIndex + 1).padStart(3, "0")}</span>
                </div>

                {/* Item display with slot animation */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`deal-${dealIndex}`}
                    initial={{ opacity: 0, y: 60, filter: "blur(8px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -60, filter: "blur(8px)" }}
                    transition={{ type: "spring", stiffness: 150, damping: 20 }}
                    className="text-center py-4"
                  >
                    <motion.span
                      className="text-6xl block mb-3"
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      {currentDeal.emoji}
                    </motion.span>
                    <p className="font-heading font-black text-lg text-foreground">{currentDeal.name}</p>
                  </motion.div>
                </AnimatePresence>

                {/* Price comparison */}
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">Retail</p>
                    <p className="text-base text-muted-foreground line-through font-semibold">${currentDeal.retailPrice.toLocaleString()}</p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center"
                  >
                    <TrendingDown className="w-4 h-4 text-success" />
                  </motion.div>
                  <div className="text-center">
                    <p className="text-xs text-success mb-0.5 font-bold">Nab Price</p>
                    <p className="text-xl font-black text-foreground">${currentDeal.nabPrice.toLocaleString()}</p>
                  </div>
                </div>

                {/* Savings flash */}
                <AnimatePresence>
                  {isNabbed && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="relative"
                    >
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        className="w-full py-3 rounded-2xl bg-success/10 border border-success/30 text-center origin-center"
                      >
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.15 }}
                          className="font-heading font-black text-success text-base tracking-wide"
                        >
                          ✓ NABBED — You saved ${savings.toLocaleString()}!
                        </motion.span>
                      </motion.div>
                      {/* Confetti particles */}
                      {[...Array(6)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 1, x: 0, y: 0 }}
                          animate={{
                            opacity: 0,
                            x: (i % 2 === 0 ? 1 : -1) * (30 + Math.random() * 40),
                            y: -(20 + Math.random() * 30),
                          }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                          className="absolute top-2 left-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
                          style={{
                            background: i % 3 === 0
                              ? "hsl(var(--nab-cyan))"
                              : i % 3 === 1
                              ? "hsl(var(--nab-purple))"
                              : "hsl(var(--success))",
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next up preview */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span className="text-[10px] tracking-wider uppercase font-bold text-muted-foreground/60">Next drop:</span>
                  <motion.span
                    key={`next-${dealIndex}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-semibold"
                  >
                    {nextDeal.emoji} {nextDeal.name}
                  </motion.span>
                </div>
              </div>
            </div>

            {/* Live activity bar */}
            <div className="flex items-center justify-between px-2 text-[11px] font-medium text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
                <span>2,847 users nabbing right now</span>
              </div>
              <span className="text-nab-cyan font-bold">Faster than Whatnot ⚡</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
