import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Flame, Trophy, TrendingDown, Shield, Star, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import heroBgDark from "@/assets/hero/hero-bg-dark.jpg";
import heroShowcase from "@/assets/hero/hero-products-showcase.jpg";
import productJordans from "@/assets/hero/product-jordans.png";
import productRolex from "@/assets/hero/product-rolex.png";
import productCards from "@/assets/hero/product-cards.png";
import productPS5 from "@/assets/hero/product-ps5.png";
import nabbitIcon from "@/assets/nabbit-icon.png";

const dealItems = [
  { name: "Air Jordan 4 Retro", retailPrice: 210, nabPrice: 121, image: productJordans, rarity: "EPIC", category: "Sneakers" },
  { name: "Rolex Submariner", retailPrice: 14500, nabPrice: 12400, image: productRolex, rarity: "LEGENDARY", category: "Watches" },
  { name: "Pokémon Booster Box", retailPrice: 144, nabPrice: 89, image: productCards, rarity: "RARE", category: "Cards" },
  { name: "PS5 Slim Bundle", retailPrice: 499, nabPrice: 372, image: productPS5, rarity: "EPIC", category: "Electronics" },
];

const rarityConfig: Record<string, { color: string; glow: string; border: string }> = {
  COMMON: { color: "text-muted-foreground", glow: "", border: "border-border" },
  RARE: { color: "text-nab-cyan", glow: "drop-shadow-[0_0_30px_hsl(var(--nab-cyan)/0.4)]", border: "border-nab-cyan/40" },
  EPIC: { color: "text-nab-purple", glow: "drop-shadow-[0_0_30px_hsl(var(--nab-purple)/0.4)]", border: "border-nab-purple/40" },
  LEGENDARY: { color: "text-[hsl(40_90%_55%)]", glow: "drop-shadow-[0_0_40px_hsl(40_90%_55%/0.5)]", border: "border-[hsl(40_90%_55%)]/40" },
};

const recentNabs = [
  { user: "Jake R.", item: "PS5 Slim Bundle", saved: "$127", avatar: "🔥" },
  { user: "Maria K.", item: "Air Jordan 4 Retro", saved: "$89", avatar: "⚡" },
  { user: "Dev P.", item: "Dyson Airwrap", saved: "$165", avatar: "🎯" },
  { user: "Lena S.", item: "Rolex Explorer II", saved: "$2,100", avatar: "💎" },
  { user: "Chris M.", item: "RTX 4090 FE", saved: "$340", avatar: "🎲" },
];

const useSavingsCounter = (target: number, duration = 2500) => {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
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
  const [dealIndex, setDealIndex] = useState(0);
  const [nabIndex, setNabIndex] = useState(0);
  const [isNabbed, setIsNabbed] = useState(false);
  const savingsDisplay = useSavingsCounter(4218490, 3000);

  useEffect(() => {
    const interval = setInterval(() => setNabIndex((i) => (i + 1) % recentNabs.length), 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsNabbed(false);
      setDealIndex((prev) => (prev + 1) % dealItems.length);
      setTimeout(() => setIsNabbed(true), 2000);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const deal = dealItems[dealIndex];
  const rarity = rarityConfig[deal.rarity];
  const savings = deal.retailPrice - deal.nabPrice;
  const discountPct = Math.round((savings / deal.retailPrice) * 100);

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img src={heroBgDark} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/70" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* Animated glow orbs */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -right-40 w-[700px] h-[700px] rounded-full blur-[200px] pointer-events-none"
        style={{ background: "hsl(var(--nab-cyan))" }}
      />
      <motion.div
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none"
        style={{ background: "hsl(var(--nab-purple))" }}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-0 grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center relative z-10">
        {/* Left — Copy + CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          {/* Live activity pill */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-3 px-4 py-2.5 rounded-full glass-card border border-nab-cyan/30"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
            </span>
            <span className="text-sm font-bold text-foreground">
              <span className="text-nab-cyan">2,847</span> people nabbing right now
            </span>
          </motion.div>

          {/* Headline */}
          <div>
            <h1 className="font-heading font-black text-foreground leading-[0.92] tracking-tight" style={{ fontSize: "clamp(2.8rem, 6.5vw, 5.5rem)" }}>
              Your AI{" "}
              <span className="gradient-text relative">
                Deal Hunter
                <motion.div
                  className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                  style={{ background: "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--nab-purple)))" }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                />
              </span>
              <br />
              <span className="text-muted-foreground" style={{ fontSize: "clamp(1.6rem, 3.5vw, 3rem)" }}>
                that never sleeps.
              </span>
            </h1>
          </div>

          {/* Sub-headline */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
            nabbit scans <strong className="text-foreground">millions of listings</strong>, learns your taste, and auto-nabs deals you'd miss — through{" "}
            <strong className="text-nab-cyan">auctions</strong>,{" "}
            <strong className="text-nab-purple">grab bags</strong>,{" "}
            <strong className="text-foreground">live breaks</strong>, and more.
          </p>

          {/* Trust metrics row */}
          <div className="flex flex-wrap gap-4 py-1">
            {[
              { icon: Zap, value: "Sub-3s", label: "Auto-checkout", color: "text-nab-cyan", bg: "bg-nab-cyan/10 border-nab-cyan/25" },
              { icon: Shield, value: "100%", label: "Buyer protected", color: "text-success", bg: "bg-success/10 border-success/25" },
              { icon: Star, value: "4.9★", label: "User rating", color: "text-nab-purple", bg: "bg-nab-purple/10 border-nab-purple/25" },
            ].map((m) => (
              <div key={m.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${m.bg}`}>
                <m.icon className={`w-4 h-4 ${m.color}`} />
                <div>
                  <span className={`text-xs font-black ${m.color}`}>{m.value}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">{m.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              size="lg"
              className="rounded-full px-10 font-black text-base gap-2.5 shimmer-btn h-14 shadow-[0_0_60px_-10px_hsl(var(--nab-cyan)/0.5)]"
              onClick={() => navigate("/signup")}
            >
              Start Nabbing Free <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 font-bold text-base h-14 border-border/50 bg-background/20 backdrop-blur-xl hover:bg-secondary/50 group gap-2"
              onClick={() => document.getElementById("how-it-drops")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Play className="w-4 h-4 text-primary fill-primary" /> Watch Demo
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">No credit card · Setup in 30 seconds · Cancel anytime</p>

          {/* Live nab ticker */}
          <div className="pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={nabIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-success/[0.06] border border-success/15 w-fit"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <span className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">{recentNabs[nabIndex].avatar} {recentNabs[nabIndex].user}</span> nabbed{" "}
                  <span className="font-bold text-foreground">{recentNabs[nabIndex].item}</span> — saved{" "}
                  <span className="font-black text-success">{recentNabs[nabIndex].saved}</span>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Right — Product Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, type: "spring", stiffness: 50 }}
          className="relative flex justify-center"
        >
          {/* Large showcase card */}
          <div className="w-full max-w-[440px] relative">
            {/* Floating product showcase with parallax */}
            <div className="relative glass-card gradient-border rounded-3xl overflow-hidden">
              {/* Showcase image background */}
              <div className="relative h-52 sm:h-64 overflow-hidden">
                <img src={heroShowcase} alt="Premium deals" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] via-[hsl(var(--card)/0.5)] to-transparent" />
                
                {/* Savings counter overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="px-3 py-1.5 rounded-xl bg-background/60 backdrop-blur-2xl border border-border/30"
                  >
                    <span className="text-[10px] text-muted-foreground block">Total saved by nabbers</span>
                    <span className="text-sm font-heading font-black gradient-text">${savingsDisplay.toLocaleString()}</span>
                  </motion.div>
                  <motion.img
                    src={nabbitIcon}
                    alt="nabbit"
                    className="w-10 h-10 drop-shadow-[0_0_20px_hsl(var(--nab-cyan)/0.5)]"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </div>

              {/* Active deal card */}
              <div className="p-5 space-y-4">
                {/* Category + Rarity */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{deal.category}</span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`r-${dealIndex}`}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${rarity.border} ${rarity.color} bg-background/50`}
                    >
                      {deal.rarity === "LEGENDARY" ? "🏆 " : deal.rarity === "EPIC" ? "⚡ " : ""}{deal.rarity}
                    </motion.span>
                  </AnimatePresence>
                </div>

                {/* Product image + name */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`p-${dealIndex}`}
                    initial={{ opacity: 0, x: 80, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -80, filter: "blur(10px)" }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    className="flex items-center gap-4"
                  >
                    <motion.img
                      src={deal.image}
                      alt={deal.name}
                      className={`w-24 h-24 object-contain ${rarity.glow}`}
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div>
                      <h3 className="font-heading font-black text-foreground text-lg leading-tight">{deal.name}</h3>
                      <div className="flex items-baseline gap-2 mt-1.5">
                        <span className="text-2xl font-heading font-black gradient-text">${deal.nabPrice.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground line-through">${deal.retailPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Savings flash */}
                <AnimatePresence mode="wait">
                  {isNabbed ? (
                    <motion.div
                      key="nabbed"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full py-3 rounded-2xl bg-success/10 border border-success/30 text-center relative overflow-hidden"
                    >
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="font-heading font-black text-success text-sm tracking-wide relative z-10"
                      >
                        ✓ NABBED — You saved ${savings.toLocaleString()} ({discountPct}% off)
                      </motion.span>
                      {/* Flash effect */}
                      <motion.div
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-success/20"
                      />
                      {/* Confetti */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 1, x: 0, y: 0 }}
                          animate={{ opacity: 0, x: (i % 2 === 0 ? 1 : -1) * (20 + Math.random() * 50), y: -(15 + Math.random() * 40) }}
                          transition={{ duration: 0.8, delay: i * 0.04 }}
                          className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full pointer-events-none"
                          style={{ background: i % 3 === 0 ? "hsl(var(--nab-cyan))" : i % 3 === 1 ? "hsl(var(--nab-purple))" : "hsl(var(--success))" }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="scanning"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full py-3 rounded-2xl bg-primary/5 border border-primary/20 text-center relative overflow-hidden"
                    >
                      <span className="text-sm font-bold text-primary relative z-10">Scanning for best price...</span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Bottom strip — next up */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-bold tracking-wider uppercase text-[10px]">Next: {dealItems[(dealIndex + 1) % dealItems.length].name}</span>
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-nab-cyan" />
                    <span className="font-bold text-nab-cyan">14,847 nabbed today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating mini product cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 lg:-right-10 w-16 h-16 rounded-2xl glass-card border border-border/30 flex items-center justify-center shadow-xl"
            >
              <img src={productJordans} alt="" className="w-12 h-12 object-contain" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-4 -left-4 lg:-left-8 w-14 h-14 rounded-2xl glass-card border border-border/30 flex items-center justify-center shadow-xl"
            >
              <img src={productRolex} alt="" className="w-10 h-10 object-contain" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -7, 0], x: [0, 3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute top-1/2 -right-4 lg:-right-12 w-12 h-12 rounded-xl glass-card border border-border/30 flex items-center justify-center shadow-lg"
            >
              <img src={productCards} alt="" className="w-8 h-8 object-contain" />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default HeroSection;
