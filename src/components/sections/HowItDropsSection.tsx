import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Brain, TrendingDown, PartyPopper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import stepSpot from "@/assets/steps/step-spot.jpg";
import stepAI from "@/assets/steps/step-ai-learns.jpg";
import stepPrice from "@/assets/steps/step-price-drops.jpg";
import stepNabbed from "@/assets/steps/step-nabbed.jpg";

const steps = [
  {
    icon: Users,
    num: "01",
    title: "Join a Crew Deal.",
    desc: "Browse live deals or let AI recommend ones matched to your taste. Pick a tier — early birds get the deepest discounts.",
    accent: "nab-cyan",
    image: stepSpot,
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
    image: stepAI,
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
    image: stepPrice,
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
    image: stepNabbed,
    demo: [
      { label: "✓ Deal funded — order placed", sublabel: "Sourcing: locked with verified supplier" },
      { label: "📦 Tracking: shipped → in transit", sublabel: "Arrives Thursday — buyer protected" },
      { label: "🎉 You saved $89 on this nab!", sublabel: "Total crew savings: $2,225" },
    ],
  },
];

const HowItDropsSection = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDemoIndex((i) => (i + 1) % 3), 2800);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle steps
  useEffect(() => {
    const interval = setInterval(() => setActiveStep((i) => (i + 1) % steps.length), 6000);
    return () => clearInterval(interval);
  }, []);

  const step = steps[activeStep];

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

      {/* Step selector bar */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 mb-10">
        {steps.map((s, i) => (
          <button
            key={s.num}
            onClick={() => setActiveStep(i)}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-400 ${
              activeStep === i
                ? `glass-card border-${s.accent}/40 shadow-[0_0_30px_-5px_hsl(var(--${s.accent})/0.3)]`
                : "border-border/20 hover:border-border/40"
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${
              activeStep === i
                ? `bg-${s.accent}/20 border border-${s.accent}/40`
                : "bg-muted/30"
            }`}>
              <s.icon className={`w-4 h-4 ${activeStep === i ? `text-${s.accent}` : "text-muted-foreground"}`} />
            </div>
            <div className="hidden sm:block text-left">
              <span className={`text-[10px] font-black tracking-widest ${activeStep === i ? `text-${s.accent}` : "text-muted-foreground"}`}>
                STEP {s.num}
              </span>
              <p className={`text-xs font-bold ${activeStep === i ? "text-foreground" : "text-muted-foreground"}`}>
                {s.title.replace(".", "")}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto mb-10">
        <div className="h-1 rounded-full bg-border/30 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--${step.accent})))` }}
            initial={{ width: "0%" }}
            animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Active step — cinematic card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.97 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="grid lg:grid-cols-2 gap-8 items-center"
        >
          {/* Image side */}
          <div className={`relative rounded-3xl overflow-hidden glass-card gradient-border ${activeStep % 2 === 1 ? "lg:order-2" : ""}`}>
            <img
              src={step.image}
              alt={step.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--card))] via-transparent to-transparent" />
            
            {/* Step badge overlay */}
            <div className="absolute top-4 left-4">
              <div className={`px-3 py-1.5 rounded-xl bg-background/70 backdrop-blur-2xl border border-${step.accent}/30`}>
                <span className={`text-[10px] font-black tracking-widest text-${step.accent}`}>STEP {step.num}</span>
              </div>
            </div>

            {/* Live demo overlay at bottom */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className={`rounded-2xl bg-background/70 backdrop-blur-2xl border border-${step.accent}/20 overflow-hidden`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demoIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 py-3"
                  >
                    <p className="text-xs font-bold text-foreground">{step.demo[demoIndex].label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{step.demo[demoIndex].sublabel}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className={`space-y-5 ${activeStep % 2 === 1 ? "lg:order-1" : ""}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-${step.accent}/10 border border-${step.accent}/25`}>
              <step.icon className={`w-4 h-4 text-${step.accent}`} />
              <span className={`text-xs font-black text-${step.accent} tracking-wider`}>STEP {step.num} OF 04</span>
            </div>

            <h3 className="font-heading font-black text-foreground text-3xl sm:text-4xl leading-tight">
              {step.title}
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              {step.desc}
            </p>

            {/* Micro-stats */}
            <div className="flex gap-4 pt-2">
              {step.demo.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-2 h-2 rounded-full ${i <= demoIndex ? `bg-${step.accent}` : "bg-border"} transition-colors duration-300`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-14"
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
