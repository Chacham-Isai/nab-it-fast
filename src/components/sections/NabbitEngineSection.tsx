import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, BarChart3, Bot, ShieldCheck, Activity, TrendingUp } from "lucide-react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import { useState, useEffect } from "react";

const layers = [
  {
    icon: Eye,
    title: "NabVision AI",
    subtitle: "See everything. Miss nothing.",
    desc: "Visual + semantic matching across 200+ retailers. Identifies the exact item regardless of how it's listed.",
    stat: "99.2% match accuracy",
    accent: "nab-cyan",
    gradient: "from-nab-cyan/20 via-nab-cyan/5 to-transparent",
    liveDemo: [
      "Scanning nike.com → 3 matches",
      "Image match: Jordan 4 Thunder ✓",
      "Cross-referencing StockX, GOAT...",
    ],
  },
  {
    icon: BarChart3,
    title: "PriceGraph Engine",
    subtitle: "Predicts the perfect buy window.",
    desc: "5 years of pricing data + ML pattern recognition tells you exactly when a price will crater.",
    stat: "200+ retailers live",
    accent: "nab-purple",
    gradient: "from-nab-purple/20 via-nab-purple/5 to-transparent",
    liveDemo: [
      "Price drop predicted: 72h",
      "Historical low: $89 (3mo ago)",
      "Alert set → watching 24/7",
    ],
  },
  {
    icon: Bot,
    title: "NabBot Agent",
    subtitle: "Faster than any human checkout.",
    desc: "Autonomous purchase execution in under 3 seconds. Cart → checkout → confirmation before the listing updates.",
    stat: "<3s execution",
    accent: "success",
    gradient: "from-success/20 via-success/5 to-transparent",
    liveDemo: [
      "Price hit $89 → executing...",
      "Cart → Checkout → Done (1.2s)",
      "Confirmed: Order #NB-48291",
    ],
  },
  {
    icon: ShieldCheck,
    title: "TrustShield",
    subtitle: "Every nab is protected.",
    desc: "Full buyer guarantee, instant dispute resolution, authenticity verification, and real-time alerts.",
    stat: "0.02% fraud rate",
    accent: "nab-blue",
    gradient: "from-nab-blue/20 via-nab-blue/5 to-transparent",
    liveDemo: [
      "Authenticity verified ✓",
      "Buyer protection: ACTIVE",
      "Dispute resolved in 4h avg",
    ],
  },
];

const metrics = [
  { value: "50M+", label: "Training Images", accent: "nab-cyan" },
  { value: "99.2%", label: "Match Accuracy", accent: "nab-purple" },
  { value: "<800ms", label: "ID Speed", accent: "success" },
  { value: "<3s", label: "Nab Speed", accent: "nab-blue" },
  { value: "$4.2M", label: "Saved for Users", accent: "primary" },
];

const NabbitEngineSection = () => {
  const [hoveredLayer, setHoveredLayer] = useState<number | null>(null);
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDemoIndex((i) => (i + 1) % 3), 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="nabbit-engine">
      <div className="text-center mb-16 relative">
        <motion.img
          src={nabbitLogo}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-8 w-20 h-20 opacity-[0.08] pointer-events-none"
          animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="section-label mb-4">PROPRIETARY TECHNOLOGY</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          The{" "}
          <span className="gradient-text">Nabbit Engine.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four layers of proprietary AI that find, match, price, and purchase — completely autonomously.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.title}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ y: -6, scale: 1.01 }}
            onHoverStart={() => setHoveredLayer(i)}
            onHoverEnd={() => setHoveredLayer(null)}
            className={`glass-card gradient-border p-8 group relative overflow-hidden cursor-pointer transition-shadow duration-500 hover:shadow-[0_0_40px_-5px_hsl(var(--${layer.accent})/0.3)]`}
          >
            {/* Gradient background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${layer.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Pulsing orb */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.15, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.4 }}
              className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-${layer.accent} blur-[50px] pointer-events-none`}
            />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                {/* Icon with ring */}
                <div className="relative">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-${layer.accent}/[0.1] border border-${layer.accent}/30 flex items-center justify-center group-hover:bg-${layer.accent}/[0.2] group-hover:border-${layer.accent}/50 transition-all duration-300`}
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                  >
                    <layer.icon className={`w-6 h-6 text-${layer.accent}`} />
                  </motion.div>
                  <motion.div
                    className={`absolute inset-0 rounded-2xl border-2 border-${layer.accent}/40 opacity-0 group-hover:opacity-100`}
                    animate={hoveredLayer === i ? { scale: [1, 1.5], opacity: [0.5, 0] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>

                {/* Live status */}
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-${layer.accent}/10 border border-${layer.accent}/20`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full bg-${layer.accent}`} />
                  <span className={`text-[10px] font-bold text-${layer.accent}`}>ACTIVE</span>
                </motion.div>
              </div>

              <h3 className="font-heading text-xl font-black text-foreground mb-1">{layer.title}</h3>
              <p className={`text-sm font-semibold text-${layer.accent} mb-3`}>{layer.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{layer.desc}</p>

              {/* Stat badge */}
              <span className={`inline-block text-xs font-black text-${layer.accent} bg-${layer.accent}/[0.08] border border-${layer.accent}/20 px-3 py-1.5 rounded-full mb-4`}>
                {layer.stat}
              </span>

              {/* Cycling live demo */}
              <div className={`h-[36px] rounded-lg bg-${layer.accent}/[0.05] border border-${layer.accent}/15 overflow-hidden`}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={demoIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center gap-2 px-3 h-full"
                  >
                    <Activity className={`w-3 h-3 text-${layer.accent} shrink-0`} />
                    <p className="text-[11px] font-semibold text-foreground/80 truncate">{layer.liveDemo[demoIndex]}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Metrics strip with energy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card gradient-border p-6 relative overflow-hidden"
      >
        {/* Animated gradient sweep */}
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none"
        />

        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-xs font-black text-foreground uppercase tracking-wider">Engine Performance</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-success" />
            <span className="text-[10px] font-bold text-success">ALL SYSTEMS GO</span>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-default"
            >
              <p className={`font-heading text-2xl font-black gradient-text`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default NabbitEngineSection;
