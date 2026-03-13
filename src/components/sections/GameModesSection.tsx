import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Gift, Radio, Gavel, Target, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const modes = [
  {
    icon: Gift,
    title: "Grab Bags",
    tagline: "Mystery drops. Every pull hits different.",
    desc: "Standard to Legendary tiers. AI curates each bag to your taste profile. Unbox live with the community.",
    tag: "🔥 MOST POPULAR",
    tagColor: "bg-primary/[0.1] text-primary border-primary/30",
    link: "/grab-bags",
  },
  {
    icon: Radio,
    title: "Live Breaks",
    tagline: "Real-time pack rips. Lock your slot.",
    desc: "Watch hosts break products live. Claim your team or slot. What you pull is what you keep. Pure adrenaline.",
    tag: "⚡ LIVE NOW",
    tagColor: "bg-success/[0.1] text-success border-success/30",
    link: "/breaks",
  },
  {
    icon: Gavel,
    title: "Nab Auctions",
    tagline: "Bid. Snipe. Win.",
    desc: "AI-timed auctions on curated drops. Set snipe bids and let the Nabbit Engine execute at the last second.",
    tag: "🎯 COMPETITIVE",
    tagColor: "bg-[hsl(280,100%,70%)]/[0.1] text-[hsl(280,100%,70%)] border-[hsl(280,100%,70%)]/30",
    link: "/auctions",
  },
  {
    icon: Target,
    title: "Dream Buys",
    tagline: "Name your price. We hunt 24/7.",
    desc: "Set your dream price on any product. The Engine scans 200+ retailers nonstop and auto-buys the instant it hits.",
    tag: "🤖 AI-POWERED",
    tagColor: "bg-[hsl(200,100%,60%)]/[0.1] text-[hsl(200,100%,60%)] border-[hsl(200,100%,60%)]/30",
    link: "/dream-buys",
  },
];

const GameModesSection = () => {
  const navigate = useNavigate();

  return (
    <SectionWrapper id="game-modes">
      <div className="text-center mb-16">
        <p className="section-label mb-4">WAYS TO NAB</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          Shopping is boring.{" "}
          <span className="gradient-text">This isn't shopping.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four addictive ways to score deals — each one powered by the Nabbit Engine and tuned to your vibe.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode, i) => (
          <motion.div
            key={mode.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card gradient-border p-8 group cursor-pointer relative overflow-hidden"
            onClick={() => navigate(mode.link)}
          >
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/0 group-hover:bg-primary/[0.06] transition-all duration-700 blur-[60px]" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center group-hover:bg-primary/[0.15] group-hover:border-primary/40 transition-all">
                  <mode.icon className="w-6 h-6 text-primary" />
                </div>
                <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full border ${mode.tagColor}`}>
                  {mode.tag}
                </span>
              </div>

              <h3 className="font-heading text-2xl font-black text-foreground mb-1">{mode.title}</h3>
              <p className="text-sm font-semibold text-primary mb-3">{mode.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{mode.desc}</p>

              <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                Enter <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default GameModesSection;