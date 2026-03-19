import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Users, TrendingDown, Sparkles, Gift, Gavel, Play, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import WaitlistModal from "@/components/WaitlistModal";

import heroBgDark from "@/assets/hero/hero-bg-dark.jpg";
import crewDealShowcase from "@/assets/hero/crew-deal-showcase.png";
import aiCuratedFeed from "@/assets/hero/ai-curated-feed.png";
import dropsShowcase from "@/assets/hero/drops-showcase.png";
import nabbitIcon from "@/assets/nabbit-icon.png";

const features = [
  {
    tag: "CREW DEALS",
    icon: Users,
    title: "Buy together. Save bigger.",
    desc: "Join forces with other buyers. The more people in, the lower the price drops. Early birds get the best tier.",
    image: aiCuratedFeed,
    accent: "nab-cyan",
    stats: [
      { label: "Avg savings", value: "42%" },
      { label: "Active crews", value: "847" },
      { label: "Deals funded", value: "12.4K" },
    ],
    cta: "Explore Crew Deals",
    link: "/community",
  },
  {
    tag: "AI CURATED",
    icon: Sparkles,
    title: "Your AI deal feed. Scary accurate.",
    desc: "Every swipe, save, and purchase trains your personal engine. It learns your taste and surfaces deals you'd actually buy.",
    image: crewDealShowcase,
    accent: "nab-purple",
    stats: [
      { label: "Match accuracy", value: "97%" },
      { label: "Deals surfaced", value: "3.2M" },
      { label: "Avg response", value: "<800ms" },
    ],
    cta: "See Your Feed",
    link: "/feed",
  },
  {
    tag: "LIVE DROPS",
    icon: Gift,
    title: "Grab bags. Auctions. Breaks.",
    desc: "Mystery pulls, real-time bidding, and live pack rips. Every drop is a chance to score something legendary.",
    image: dropsShowcase,
    accent: "success",
    stats: [
      { label: "Live now", value: "23" },
      { label: "Grabbed today", value: "1.8K" },
      { label: "Biggest win", value: "$4,200" },
    ],
    cta: "Join a Drop",
    link: "/grab-bags",
  },
];

const liveActivity = [
  { user: "Jake R.", action: "joined Crew Deal", item: "Jordan 4 Retro", emoji: "👟", saved: "$89" },
  { user: "Maria K.", action: "pulled LEGENDARY", item: "PSA 10 Charizard", emoji: "🃏", saved: "$750" },
  { user: "Dev P.", action: "won auction", item: "PS5 Pro Bundle", emoji: "🎮", saved: "$210" },
  { user: "Lena S.", action: "joined Crew Deal", item: "Rolex Explorer II", emoji: "⌚", saved: "$2,100" },
  { user: "Chris M.", action: "auto-nabbed", item: "RTX 4090 FE", emoji: "💻", saved: "$340" },
];

const useSavingsCounter = (target: number, duration = 3000) => {
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
  const { user } = useAuth();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const totalSaved = useSavingsCounter(4218490, 3000);

  const handleCTA = () => {
    if (user) navigate("/feed");
    else setWaitlistOpen(true);
  };

  useEffect(() => {
    const interval = setInterval(() => setActivityIndex((i) => (i + 1) % liveActivity.length), 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature((i) => (i + 1) % features.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const feat = features[activeFeature];

  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img src={heroBgDark} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-background/75" />
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
        style={{ background: `hsl(var(--${feat.accent}))` }}
      />
      <motion.div
        animate={{ scale: [1.3, 1, 1.3], opacity: [0.05, 0.12, 0.05] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none"
        style={{ background: "hsl(var(--nab-purple))" }}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 lg:py-0 relative z-10">
        {/* Top bar: live activity + savings */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
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
            <AnimatePresence mode="wait">
              <motion.span
                key={activityIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-muted-foreground"
              >
                <span className="font-bold text-foreground">{liveActivity[activityIndex].emoji} {liveActivity[activityIndex].user}</span>{" "}
                {liveActivity[activityIndex].action}{" "}
                <span className="font-bold text-foreground">{liveActivity[activityIndex].item}</span>{" "}
                — saved <span className="font-black text-success">{liveActivity[activityIndex].saved}</span>
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-success/20"
          >
            <TrendingDown className="w-4 h-4 text-success" />
            <span className="text-sm font-heading font-black gradient-text">${totalSaved.toLocaleString()}</span>
            <span className="text-xs text-muted-foreground">saved by nabbers</span>
          </motion.div>
        </div>

        {/* Main hero grid */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center">
          {/* Left — Copy */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-heading font-black text-foreground leading-[0.92] tracking-tight" style={{ fontSize: "clamp(2.6rem, 6vw, 5rem)" }}>
                The smarter way
                <br />
                to{" "}
                <span className="gradient-text relative">
                  score deals.
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--nab-purple)))" }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed mt-5">
                Crew deals that drop prices as more people join. An AI feed tuned to your taste. Live drops you can't get anywhere else.{" "}
                <strong className="text-foreground">This is how you were meant to shop.</strong>
              </p>
            </div>

            {/* Feature selector tabs */}
            <div className="flex gap-2">
              {features.map((f, i) => (
                <button
                  key={f.tag}
                  onClick={() => setActiveFeature(i)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-300 border ${
                    activeFeature === i
                      ? `bg-${f.accent}/15 border-${f.accent}/40 text-${f.accent} shadow-[0_0_20px_-5px_hsl(var(--${f.accent})/0.3)]`
                      : "border-border/30 text-muted-foreground hover:text-foreground hover:border-border/60"
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.tag}
                </button>
              ))}
            </div>

            {/* Active feature description */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <feat.icon className={`w-5 h-5 text-${feat.accent}`} />
                  <h2 className="font-heading font-black text-xl text-foreground">{feat.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>

                {/* Stats row */}
                <div className="flex gap-3">
                  {feat.stats.map((s) => (
                    <div key={s.label} className={`px-3 py-2 rounded-xl bg-${feat.accent}/[0.06] border border-${feat.accent}/20`}>
                      <span className={`text-sm font-heading font-black text-${feat.accent}`}>{s.value}</span>
                      <span className="text-[10px] text-muted-foreground ml-1.5">{s.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                size="lg"
                className="rounded-full px-10 font-black text-base gap-2.5 shimmer-btn h-14 shadow-[0_0_60px_-10px_hsl(var(--nab-cyan)/0.5)]"
                onClick={handleCTA}
              >
                {user ? "Go to Feed" : "Start Nabbing Free"} <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 font-bold text-base h-14 border-border/50 bg-background/20 backdrop-blur-xl hover:bg-secondary/50 group gap-2"
                onClick={() => navigate(feat.link)}
              >
                {feat.cta} <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">No credit card · Setup in 30 seconds · Cancel anytime</p>
          </motion.div>

          {/* Right — Feature showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, type: "spring", stiffness: 50 }}
            className="relative flex justify-center"
          >
            <div className="w-full max-w-[480px] relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  className="glass-card gradient-border rounded-3xl overflow-hidden"
                >
                  <img
                    src={feat.image}
                    alt={feat.tag}
                    className="w-full h-auto object-cover"
                  />
                  {/* Overlay with feature tag */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-xl bg-background/70 backdrop-blur-2xl border border-${feat.accent}/30`}>
                      <span className={`text-[10px] font-black tracking-widest text-${feat.accent}`}>{feat.tag}</span>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <motion.img
                      src={nabbitIcon}
                      alt="nabbit"
                      className="w-10 h-10 drop-shadow-[0_0_20px_hsl(var(--nab-cyan)/0.5)]"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Floating stat cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 lg:-right-8 px-3 py-2 rounded-2xl glass-card border border-nab-cyan/30 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-nab-cyan" />
                  <div>
                    <span className="text-xs font-black text-nab-cyan">847</span>
                    <span className="text-[9px] text-muted-foreground ml-1">in crews</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-3 -left-3 lg:-left-6 px-3 py-2 rounded-2xl glass-card border border-success/30 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-success" />
                  <div>
                    <span className="text-xs font-black text-success">-42%</span>
                    <span className="text-[9px] text-muted-foreground ml-1">avg crew saving</span>
                  </div>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, -7, 0], x: [0, 3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute top-1/2 -right-3 lg:-right-10 px-3 py-2 rounded-xl glass-card border border-nab-purple/30 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-nab-purple" />
                  <span className="text-[10px] font-black text-nab-purple">97% match</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} source="hero" />
    </section>
  );
};

export default HeroSection;
