import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Radio, Gavel, Target, ArrowRight, Users, Clock, Flame, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import nabbitIcon from "@/assets/nabbit-icon.png";

const modes = [
  {
    icon: Gift,
    title: "Grab Bags",
    tagline: "Mystery drops. Every pull hits different.",
    desc: "Standard to Legendary tiers. AI curates each bag to your taste profile. Unbox live with the community.",
    tag: "🔥 MOST POPULAR",
    accent: "nab-cyan",
    gradient: "from-nab-cyan/20 via-nab-cyan/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_50px_-5px_hsl(var(--nab-cyan)/0.35)]",
    link: "/grab-bags",
    live: { users: 847, label: "opening now" },
    preview: {
      items: ["👟 Jordan 4", "🎮 PS5", "⌚ Rolex"],
      rarity: "LEGENDARY",
    },
  },
  {
    icon: Radio,
    title: "Live Breaks",
    tagline: "Real-time pack rips. Lock your slot.",
    desc: "Watch hosts break products live. Claim your team or slot. What you pull is what you keep.",
    tag: "⚡ LIVE NOW",
    accent: "success",
    gradient: "from-success/20 via-success/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_50px_-5px_hsl(var(--success)/0.35)]",
    link: "/breaks",
    live: { users: 1243, label: "watching" },
    preview: {
      items: ["Slot 1: OPEN", "Slot 2: LOCKED", "Slot 3: OPEN"],
      rarity: "LIVE",
    },
  },
  {
    icon: Gavel,
    title: "Nab Auctions",
    tagline: "Bid. Snipe. Win.",
    desc: "AI-timed auctions on curated drops. Set snipe bids and let the Nabbit Engine execute at the last second.",
    tag: "🎯 COMPETITIVE",
    accent: "nab-purple",
    gradient: "from-nab-purple/20 via-nab-purple/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_50px_-5px_hsl(var(--nab-purple)/0.35)]",
    link: "/auctions",
    live: { users: 312, label: "bidding" },
    preview: {
      items: ["$127 → $89", "$499 → $372", "$14.5K → $12.4K"],
      rarity: "ENDING SOON",
    },
  },
  {
    icon: Target,
    title: "Dream Buys",
    tagline: "Name your price. We hunt 24/7.",
    desc: "Set your dream price on any product. The Engine scans 200+ retailers nonstop and auto-buys the instant it hits.",
    tag: "🤖 AI-POWERED",
    accent: "nab-blue",
    gradient: "from-nab-blue/20 via-nab-blue/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_50px_-5px_hsl(var(--nab-blue)/0.35)]",
    link: "/dream-buys",
    live: { users: 5891, label: "hunts active" },
    preview: {
      items: ["🎯 AirPods Max $349", "🎯 RTX 4090 $1,199", "🎯 Dyson V15 $399"],
      rarity: "HUNTING",
    },
  },
];

const GameModesSection = () => {
  const navigate = useNavigate();
  const [hoveredMode, setHoveredMode] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="game-modes">
      <div className="text-center mb-16 relative">
        <motion.img
          src={nabbitIcon}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 opacity-[0.06] pointer-events-none"
          animate={{ rotate: [0, 4, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="section-label mb-4">WAYS TO NAB</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          Shopping is boring.{" "}
          <span className="gradient-text">This isn't shopping.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four powerful ways to score deals — each one powered by the Nabbit Engine and tuned to your vibe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {modes.map((mode, i) => (
          <motion.div
            key={mode.title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ y: -6, scale: 1.01 }}
            onHoverStart={() => setHoveredMode(i)}
            onHoverEnd={() => setHoveredMode(null)}
            className={`glass-card gradient-border p-7 group cursor-pointer relative overflow-hidden transition-shadow duration-500 ${mode.borderGlow}`}
            onClick={() => navigate(mode.link)}
          >
            {/* Animated gradient bg */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mode.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Pulsing corner orb */}
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0, 0.12, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              className={`absolute -top-16 -right-16 w-32 h-32 rounded-full bg-${mode.accent} blur-[50px] pointer-events-none`}
            />

            <div className="relative z-10">
              {/* Top row: icon + tag + live count */}
              <div className="flex items-start justify-between mb-5">
                <div className="relative">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-${mode.accent}/[0.1] border border-${mode.accent}/30 flex items-center justify-center group-hover:bg-${mode.accent}/[0.2] group-hover:border-${mode.accent}/50 transition-all duration-300`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <mode.icon className={`w-6 h-6 text-${mode.accent}`} />
                  </motion.div>
                  {/* Ping ring */}
                  <motion.div
                    className={`absolute inset-0 rounded-2xl border-2 border-${mode.accent}/40 opacity-0 group-hover:opacity-100`}
                    animate={hoveredMode === i ? { scale: [1, 1.5], opacity: [0.5, 0] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full border bg-${mode.accent}/[0.1] text-${mode.accent} border-${mode.accent}/30`}>
                    {mode.tag}
                  </span>
                  <motion.span
                    key={`live-${i}-${mode.live.users}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium"
                  >
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${mode.accent} opacity-75`} />
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-${mode.accent}`} />
                    </span>
                    {mode.live.users.toLocaleString()} {mode.live.label}
                  </motion.span>
                </div>
              </div>

              <h3 className="font-heading text-2xl font-black text-foreground mb-1">{mode.title}</h3>
              <p className={`text-sm font-bold text-${mode.accent} mb-3`}>{mode.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{mode.desc}</p>

              {/* Interactive preview strip */}
              <div className={`px-4 py-3 rounded-2xl bg-${mode.accent}/[0.05] border border-${mode.accent}/20 group-hover:border-${mode.accent}/40 transition-all duration-300 mb-5`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black tracking-widest text-${mode.accent} uppercase`}>
                    {mode.preview.rarity}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">LIVE PREVIEW</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`preview-${i}-${previewIndex}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.25 }}
                    className="text-xs font-semibold text-foreground"
                  >
                    {mode.preview.items[previewIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* CTA row */}
              <div className={`flex items-center justify-between`}>
                <div className={`flex items-center gap-1.5 text-sm font-black text-${mode.accent} group-hover:gap-3 transition-all`}>
                  Enter <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className={`w-6 h-6 rounded-full bg-${mode.accent}/20 border-2 border-card flex items-center justify-center text-[8px]`}
                    >
                      {["🔥", "⚡", "💎"][j]}
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                    +{mode.live.users > 100 ? Math.floor(mode.live.users / 100) + "K" : mode.live.users}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom urgency bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 glass-card gradient-border p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-nab-cyan font-bold">
            <Users className="w-4 h-4" />
            <span>8,293 active nabbers</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-success font-bold">
            <Trophy className="w-4 h-4" />
            <span>$47K nabbed today</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-nab-purple font-bold">
            <Clock className="w-4 h-4" />
            <span>Next drop in 4m 22s</span>
          </div>
        </div>
        <Button
          className="rounded-full px-8 font-black gap-2 shimmer-btn"
          onClick={() => navigate("/signup")}
        >
          Join Now <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </SectionWrapper>
  );
};

export default GameModesSection;
