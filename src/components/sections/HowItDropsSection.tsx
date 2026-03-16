import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Brain, Zap, PartyPopper, ArrowRight, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import nabbitIcon from "@/assets/nabbit-icon.png";

const steps = [
  {
    icon: Search,
    num: "01",
    title: "You spot it.",
    desc: "Drop a link, snap a photo, or just tell us what you want. The Nabbit Engine does the rest.",
    accent: "nab-cyan",
    gradient: "from-nab-cyan/20 via-nab-cyan/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--nab-cyan)/0.3)]",
    demo: [
      { label: "🔗 nike.com/jordan-4-retro", sublabel: "Link detected → scanning..." },
      { label: "📸 Image uploaded → matched", sublabel: "Jordan 4 Thunder · 3 matches found" },
      { label: "🎤 \"Find me a PS5 Pro\"", sublabel: "Voice search → 12 results" },
    ],
  },
  {
    icon: Brain,
    num: "02",
    title: "AI learns you.",
    desc: "Every swipe, bid, and nab trains your personal deal feed. It gets scarily accurate, fast.",
    accent: "nab-purple",
    gradient: "from-nab-purple/20 via-nab-purple/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--nab-purple)/0.3)]",
    demo: [
      { label: "🧠 Taste profile: 94%", sublabel: "Sneakerhead · Streetwear · Tech" },
      { label: "📊 Learning from 847 signals", sublabel: "Brand affinity updating..." },
      { label: "🎯 Prediction confidence: 97%", sublabel: "You'll love this drop" },
    ],
  },
  {
    icon: Zap,
    num: "03",
    title: "Deals drop. You decide.",
    desc: "Bid on auctions. Spin grab bags. Set auto-nab triggers. Your rules, your wins.",
    accent: "nab-blue",
    gradient: "from-nab-blue/20 via-nab-blue/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--nab-blue)/0.3)]",
    demo: [
      { label: "🎰 Grab Bag → LEGENDARY pull!", sublabel: "You won a PSA 10 Charizard" },
      { label: "🔨 Auction ending in 14s", sublabel: "Your max bid: $420 · Leading" },
      { label: "⚡ Auto-Nab triggered!", sublabel: "Price hit $89 → buying now..." },
    ],
  },
  {
    icon: PartyPopper,
    num: "04",
    title: "Nabbed. Done.",
    desc: "Sub-3 second auto-checkout. Protected. Authenticated. Delivered. You just won.",
    accent: "success",
    gradient: "from-success/20 via-success/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--success)/0.3)]",
    demo: [
      { label: "✓ NABBED in 1.2s", sublabel: "Saved $127 · Shipping to you" },
      { label: "✓ NABBED in 0.8s", sublabel: "Saved $342 · Authenticated" },
      { label: "🎉 3 nabs today!", sublabel: "Total saved: $489" },
    ],
  },
];

const liveStats = [
  { label: "Active hunts", value: "12,847" },
  { label: "Nabbed today", value: "3,291" },
  { label: "Avg save", value: "$127" },
];

const HowItDropsSection = () => {
  const navigate = useNavigate();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDemoIndex((i) => (i + 1) % 3), 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="how-it-drops">
      <div className="text-center mb-16 relative">
        <motion.img
          src={nabbitIcon}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-8 w-20 h-20 opacity-[0.06] pointer-events-none"
          animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="section-label mb-4">HOW THE DROP WORKS</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          Four steps to{" "}
          <span className="gradient-text">your next win.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From discovery to doorstep — the entire loop is engineered to feel like winning.
        </p>
      </div>

      {/* Progress connector line (desktop) */}
      <div className="hidden lg:block relative mb-8">
        <div className="absolute top-1/2 left-[12.5%] right-[12.5%] h-px bg-border" />
        <motion.div
          className="absolute top-1/2 left-[12.5%] h-px bg-gradient-to-r from-nab-cyan via-nab-purple to-success"
          initial={{ width: "0%" }}
          whileInView={{ width: hoveredStep !== null ? `${(hoveredStep / 3) * 75}%` : "75%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="flex justify-between px-[12.5%]">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
              className={`w-4 h-4 rounded-full border-2 relative z-10 transition-all duration-300 ${
                hoveredStep !== null && hoveredStep >= i
                  ? `bg-${step.accent} border-${step.accent} shadow-[0_0_12px_hsl(var(--${step.accent})/0.5)]`
                  : "bg-background border-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onHoverStart={() => setHoveredStep(i)}
            onHoverEnd={() => setHoveredStep(null)}
            className={`glass-card gradient-border p-6 group relative overflow-hidden cursor-pointer transition-shadow duration-500 ${step.borderGlow}`}
          >
            {/* Animated gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-b ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Pulsing corner orb */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.2, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-${step.accent} blur-[40px] pointer-events-none`}
            />

            <div className="relative z-10">
              {/* Step number */}
              <div className="flex items-center justify-between mb-4">
                <motion.span
                  className={`text-sm font-black tracking-widest text-${step.accent}`}
                  animate={hoveredStep === i ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {step.num}
                </motion.span>
                {/* Live pulse dot */}
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`w-2 h-2 rounded-full bg-${step.accent}`}
                />
              </div>

              {/* Icon with animated ring */}
              <div className="relative mb-5">
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-${step.accent}/[0.1] border border-${step.accent}/30 flex items-center justify-center group-hover:bg-${step.accent}/[0.2] group-hover:border-${step.accent}/50 transition-all duration-300`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <step.icon className={`w-6 h-6 text-${step.accent}`} />
                </motion.div>
                <motion.div
                  className={`absolute inset-0 rounded-2xl border-2 border-${step.accent}/40 opacity-0 group-hover:opacity-100`}
                  animate={hoveredStep === i ? { scale: [1, 1.5], opacity: [0.5, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>

              <h3 className="font-heading text-xl font-black text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>

              {/* Cycling demo preview */}
              <div className={`h-[52px] rounded-xl bg-${step.accent}/[0.06] border border-${step.accent}/20 group-hover:border-${step.accent}/40 transition-all duration-300 overflow-hidden`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demoIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="px-3 py-2"
                  >
                    <p className="text-xs font-bold text-foreground truncate">{step.demo[demoIndex].label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{step.demo[demoIndex].sublabel}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Live stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-10 glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-6">
          {liveStats.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-heading text-lg font-black gradient-text">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <Activity className="w-3 h-3 text-success" />
            <span className="text-[11px] font-bold text-success">Engine Active</span>
          </div>
          <Button
            size="sm"
            className="rounded-full px-6 font-black text-xs gap-1.5 shimmer-btn"
            onClick={() => navigate("/signup")}
          >
            Start Nabbing <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default HowItDropsSection;
