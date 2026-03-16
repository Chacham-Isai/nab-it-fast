import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Brain, TrendingDown, PartyPopper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const steps = [
  {
    icon: Users,
    num: "01",
    title: "Join a Crew Deal.",
    desc: "Browse live deals or let AI recommend ones matched to your taste. Pick a tier — early birds get the deepest discounts.",
    accent: "nab-cyan",
    gradient: "from-nab-cyan/20 via-nab-cyan/5 to-transparent",
    demo: [
      { label: "👟 Jordan 4 Thunder — 18/25 joined", sublabel: "Early Bird tier: $121 (42% off)" },
      { label: "🃏 PSA 10 Charizard — 32/50 joined", sublabel: "Standard tier: $340 (24% off)" },
      { label: "⌚ Rolex Submariner — 8/10 joined", sublabel: "Founders tier: $11,200 (23% off)" },
    ],
  },
  {
    icon: Brain,
    num: "02",
    title: "AI curates your feed.",
    desc: "Every swipe, save, and purchase trains your personal engine. It learns what you actually want — not what an ad tells you to buy.",
    accent: "nab-purple",
    gradient: "from-nab-purple/20 via-nab-purple/5 to-transparent",
    demo: [
      { label: "🧠 Taste profile: 94% complete", sublabel: "Sneakerhead · Streetwear · Tech" },
      { label: "🎯 New match: 97% confidence", sublabel: "Jordan 4 'Bred Reimagined' — $89 off" },
      { label: "📊 Price alert triggered", sublabel: "PS5 Pro hit your target price" },
    ],
  },
  {
    icon: TrendingDown,
    num: "03",
    title: "Price drops as crew grows.",
    desc: "More people join → price drops for everyone. The tier ladder shows exactly where the price is heading. Transparent. No tricks.",
    accent: "success",
    gradient: "from-success/20 via-success/5 to-transparent",
    demo: [
      { label: "📉 Price just dropped: $145 → $121", sublabel: "Early Bird tier filled — moving to next" },
      { label: "🔥 3 more needed for next tier", sublabel: "Price will drop to $99 at 25 members" },
      { label: "⚡ Deal funded! Sourcing started", sublabel: "Supplier locked — shipping in 5 days" },
    ],
  },
  {
    icon: PartyPopper,
    num: "04",
    title: "Nabbed. Delivered. Won.",
    desc: "Deal gets funded, supplier is locked, product ships directly to you. Full buyer protection. Real sourcing pipeline you can track.",
    accent: "nab-blue",
    gradient: "from-nab-blue/20 via-nab-blue/5 to-transparent",
    demo: [
      { label: "✓ Deal funded — order placed", sublabel: "Sourcing: locked with verified supplier" },
      { label: "📦 Tracking: shipped → in transit", sublabel: "Arrives Thursday — buyer protected" },
      { label: "🎉 You saved $89 on this nab!", sublabel: "Total crew savings: $2,225" },
    ],
  },
];

const HowItDropsSection = () => {
  const navigate = useNavigate();
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDemoIndex((i) => (i + 1) % 3), 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="how-it-drops">
      <div className="text-center mb-16">
        <p className="section-label mb-4">HOW IT WORKS</p>
        <h2 className="font-heading font-black text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
          From crew to{" "}
          <span className="gradient-text">doorstep.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Join a crew, watch the price drop, get your product. Every step is transparent and tracked.
        </p>
      </div>

      {/* Progress connector line (desktop) */}
      <div className="hidden lg:block relative mb-8">
        <div className="absolute top-1/2 left-[12.5%] right-[12.5%] h-px bg-border" />
        <motion.div
          className="absolute top-1/2 left-[12.5%] h-px bg-gradient-to-r from-nab-cyan via-success to-nab-blue"
          initial={{ width: "0%" }}
          whileInView={{ width: "75%" }}
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
            className={`glass-card gradient-border p-6 group relative overflow-hidden cursor-pointer transition-shadow duration-500 hover:shadow-[0_0_40px_-5px_hsl(var(--${step.accent})/0.3)]`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.2, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
              className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-${step.accent} blur-[40px] pointer-events-none`}
            />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-sm font-black tracking-widest text-${step.accent}`}>{step.num}</span>
              </div>

              <div className="relative mb-5">
                <motion.div
                  className={`w-14 h-14 rounded-2xl bg-${step.accent}/[0.1] border border-${step.accent}/30 flex items-center justify-center group-hover:bg-${step.accent}/[0.2] group-hover:border-${step.accent}/50 transition-all duration-300`}
                >
                  <step.icon className={`w-6 h-6 text-${step.accent}`} />
                </motion.div>
              </div>

              <h3 className="font-heading text-xl font-black text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-10"
      >
        <Button
          size="lg"
          className="rounded-full px-10 font-black gap-2 shimmer-btn"
          onClick={() => navigate("/signup")}
        >
          Start Nabbing Free <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </SectionWrapper>
  );
};

export default HowItDropsSection;
