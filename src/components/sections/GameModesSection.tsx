import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Gift, Radio, Gavel, Target, ArrowRight, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

import grabBagsPhoto from "@/assets/modes/grab-bags-photo.jpg";
import liveBreaksPhoto from "@/assets/modes/live-breaks-photo.jpg";
import auctionsPhoto from "@/assets/modes/auctions-photo.jpg";
import dreamBuysPhoto from "@/assets/modes/dream-buys-photo.jpg";

const modes = [
  {
    icon: Gift,
    title: "Grab Bags",
    tagline: "Mystery drops. Every pull hits different.",
    desc: "Standard to Legendary tiers. AI curates each bag to your taste profile. Unbox live with the community.",
    tag: "🔥 MOST POPULAR",
    accent: "nab-cyan",
    link: "/grab-bags",
    image: grabBagsPhoto,
    live: { users: 847, label: "opening now" },
    stats: [
      { value: "5 tiers", label: "Rarity levels" },
      { value: "$50-$500", label: "Price range" },
      { value: "3.2x", label: "Avg value pull" },
    ],
  },
  {
    icon: Radio,
    title: "Live Breaks",
    tagline: "Real-time pack rips. Lock your slot.",
    desc: "Watch hosts break products live. Claim your team or slot. What you pull is what you keep.",
    tag: "⚡ LIVE NOW",
    accent: "success",
    link: "/breaks",
    image: liveBreaksPhoto,
    live: { users: 1243, label: "watching" },
    stats: [
      { value: "24/7", label: "Live streams" },
      { value: "12", label: "Active hosts" },
      { value: "$4.2K", label: "Biggest pull" },
    ],
  },
  {
    icon: Gavel,
    title: "Nab Auctions",
    tagline: "Bid. Snipe. Win.",
    desc: "AI-timed auctions on curated drops. Set snipe bids and let the Nabbit Engine execute at the last second.",
    tag: "🎯 COMPETITIVE",
    accent: "nab-purple",
    link: "/auctions",
    image: auctionsPhoto,
    live: { users: 312, label: "bidding" },
    stats: [
      { value: "<3s", label: "Snipe speed" },
      { value: "42%", label: "Avg savings" },
      { value: "99.2%", label: "Win rate" },
    ],
  },
  {
    icon: Target,
    title: "Dream Buys",
    tagline: "Name your price. We hunt 24/7.",
    desc: "Set your dream price on any product. The Engine scans 200+ retailers nonstop and auto-buys the instant it hits.",
    tag: "🤖 AI-POWERED",
    accent: "nab-blue",
    link: "/dream-buys",
    image: dreamBuysPhoto,
    live: { users: 5891, label: "hunts active" },
    stats: [
      { value: "200+", label: "Retailers" },
      { value: "12,847", label: "Active hunts" },
      { value: "$127", label: "Avg saved" },
    ],
  },
];

const GameModesSection = () => {
  const navigate = useNavigate();
  const [hoveredMode, setHoveredMode] = useState<number | null>(null);

  return (
    <SectionWrapper id="game-modes">
      <div className="text-center mb-16">
        <p className="section-label mb-4">WAYS TO NAB</p>
        <h2 className="font-heading font-black text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
          Four ways to{" "}
          <span className="gradient-text">score.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Beyond crew deals — grab bags, live breaks, auctions, and AI-powered hunts. Each mode is tuned to your vibe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode, i) => (
          <motion.div
            key={mode.title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ y: -8 }}
            onHoverStart={() => setHoveredMode(i)}
            onHoverEnd={() => setHoveredMode(null)}
            className={`glass-card gradient-border group cursor-pointer relative overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_50px_-5px_hsl(var(--${mode.accent})/0.35)]`}
            onClick={() => navigate(mode.link)}
          >
            {/* Photorealistic image header */}
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <motion.img
                src={mode.image}
                alt={mode.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] via-[hsl(var(--card)/0.4)] to-transparent" />

              {/* Top badges */}
              <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
                <span className={`text-[10px] font-black tracking-wider px-3 py-1.5 rounded-full border bg-background/60 backdrop-blur-xl text-${mode.accent} border-${mode.accent}/30`}>
                  {mode.tag}
                </span>
                <motion.span
                  className="flex items-center gap-1.5 text-[10px] font-medium bg-background/60 backdrop-blur-xl px-2.5 py-1.5 rounded-full border border-border/20"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${mode.accent} opacity-75`} />
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 bg-${mode.accent}`} />
                  </span>
                  <span className="text-muted-foreground">{mode.live.users.toLocaleString()} {mode.live.label}</span>
                </motion.span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-${mode.accent}/[0.1] border border-${mode.accent}/30 flex items-center justify-center group-hover:bg-${mode.accent}/[0.2] transition-all duration-300`}>
                  <mode.icon className={`w-5 h-5 text-${mode.accent}`} />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-black text-foreground">{mode.title}</h3>
                  <p className={`text-xs font-bold text-${mode.accent}`}>{mode.tagline}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{mode.desc}</p>

              {/* Stats row */}
              <div className="flex gap-3 mb-5">
                {mode.stats.map((s) => (
                  <div key={s.label} className={`flex-1 px-3 py-2.5 rounded-xl bg-${mode.accent}/[0.05] border border-${mode.accent}/15 text-center`}>
                    <span className={`text-sm font-heading font-black text-${mode.accent}`}>{s.value}</span>
                    <span className="block text-[9px] text-muted-foreground mt-0.5">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 text-sm font-black text-${mode.accent} group-hover:gap-3 transition-all`}>
                  Enter <ArrowRight className="w-4 h-4" />
                </div>
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className={`w-7 h-7 rounded-full bg-${mode.accent}/15 border-2 border-card flex items-center justify-center text-[9px]`}
                    >
                      {["🔥", "⚡", "💎"][j]}
                    </div>
                  ))}
                  <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] font-bold text-muted-foreground">
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
            <Gift className="w-4 h-4" />
            <span>23 drops live now</span>
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
