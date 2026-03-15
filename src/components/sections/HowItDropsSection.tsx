import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Search, Brain, Zap, PartyPopper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const steps = [
  {
    icon: Search,
    num: "01",
    title: "You spot it.",
    desc: "Drop a link, snap a photo, or just tell us what you want. The Nabbit Engine does the rest.",
    accent: "nab-cyan",
    gradient: "from-nab-cyan/20 via-nab-cyan/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--nab-cyan)/0.3)]",
    demo: { label: "🔗 nike.com/jordan-4", sublabel: "Link detected → scanning..." },
  },
  {
    icon: Brain,
    num: "02",
    title: "AI learns you.",
    desc: "Every swipe, bid, and nab trains your personal deal feed. It gets scarily accurate, fast.",
    accent: "nab-purple",
    gradient: "from-nab-purple/20 via-nab-purple/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--nab-purple)/0.3)]",
    demo: { label: "🧠 Taste profile: 94%", sublabel: "Sneakerhead · Streetwear · Tech" },
  },
  {
    icon: Zap,
    num: "03",
    title: "Deals drop. You decide.",
    desc: "Bid on auctions. Spin grab bags. Set auto-nab triggers. Your rules, your wins.",
    accent: "nab-blue",
    gradient: "from-nab-blue/20 via-nab-blue/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--nab-blue)/0.3)]",
    demo: { label: "🎰 3 ways to win", sublabel: "Auction · Grab Bag · Auto-Nab" },
  },
  {
    icon: PartyPopper,
    num: "04",
    title: "Nabbed. Done.",
    desc: "Sub-3 second auto-checkout. Protected. Authenticated. Delivered. You just won.",
    accent: "success",
    gradient: "from-success/20 via-success/5 to-transparent",
    borderGlow: "group-hover:shadow-[0_0_40px_-5px_hsl(var(--success)/0.3)]",
    demo: { label: "✓ NABBED in 1.2s", sublabel: "Saved $127 · Shipping to you" },
  },
];

const HowItDropsSection = () => {
  const navigate = useNavigate();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <SectionWrapper id="how-it-drops">
      <div className="text-center mb-16">
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
        <div className="flex justify-between px-[12.5%]">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15, type: "spring" }}
              className={`w-3 h-3 rounded-full border-2 relative z-10 transition-colors duration-300 ${
                hoveredStep !== null && hoveredStep >= i
                  ? `bg-${step.accent} border-${step.accent}`
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
              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.15, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-${step.accent} blur-[40px] pointer-events-none`}
            />

            <div className="relative z-10">
              {/* Step number with accent color */}
              <motion.span
                className={`text-sm font-black tracking-widest text-${step.accent}`}
                animate={hoveredStep === i ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {step.num}
              </motion.span>

              {/* Icon with animated ring */}
              <div className="relative mt-5 mb-5">
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-${step.accent}/[0.1] border border-${step.accent}/30 flex items-center justify-center group-hover:bg-${step.accent}/[0.2] group-hover:border-${step.accent}/50 transition-all duration-300`}
                  whileHover={{ rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <step.icon className={`w-6 h-6 text-${step.accent}`} />
                </motion.div>
                {/* Ping ring on hover */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl border-2 border-${step.accent}/40 opacity-0 group-hover:opacity-100`}
                  animate={hoveredStep === i ? { scale: [1, 1.4], opacity: [0.5, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>

              <h3 className="font-heading text-xl font-black text-foreground mb-2 group-hover:text-foreground transition-colors">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>

              {/* Interactive demo preview chip */}
              <motion.div
                initial={{ opacity: 0.6, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                className={`px-3 py-2.5 rounded-xl bg-${step.accent}/[0.06] border border-${step.accent}/20 group-hover:border-${step.accent}/40 transition-all duration-300`}
              >
                <p className="text-xs font-bold text-foreground truncate">{step.demo.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{step.demo.sublabel}</p>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-14"
      >
        <Button
          size="lg"
          className="rounded-full px-10 font-black text-base gap-2 shimmer-btn"
          onClick={() => navigate("/signup")}
        >
          Start Your First Nab <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-xs text-muted-foreground mt-4">Free to start · No credit card · 30-second setup</p>
      </motion.div>
    </SectionWrapper>
  );
};

export default HowItDropsSection;
