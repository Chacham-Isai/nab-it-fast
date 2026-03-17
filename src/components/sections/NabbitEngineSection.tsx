import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, BarChart3, Bot, ShieldCheck, Activity, TrendingUp, Zap } from "lucide-react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import nabvisionImg from "@/assets/engine/nabvision-hero.jpg";
import pricegraphImg from "@/assets/engine/pricegraph-hero.jpg";
import nabbotImg from "@/assets/engine/nabbot-hero.jpg";
import trustshieldImg from "@/assets/engine/trustshield-hero.jpg";
import { useState, useEffect } from "react";

const layers = [
  {
    icon: Eye,
    title: "NabVision AI",
    subtitle: "See everything. Miss nothing.",
    desc: "Visual + semantic matching across 200+ retailers. Identifies the exact item regardless of how it's listed.",
    stat: "99.2% match accuracy",
    accent: "nab-cyan",
    image: nabvisionImg,
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
    image: pricegraphImg,
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
    image: nabbotImg,
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
    image: trustshieldImg,
    liveDemo: [
      "Authenticity verified ✓",
      "Buyer protection: ACTIVE",
      "Dispute resolved in 4h avg",
    ],
  },
];

const metrics = [
  { value: "50M+", label: "Training Images", icon: Eye },
  { value: "99.2%", label: "Match Accuracy", icon: Zap },
  { value: "<800ms", label: "ID Speed", icon: Activity },
  { value: "<3s", label: "Nab Speed", icon: Bot },
  { value: "$4.2M", label: "Saved for Users", icon: TrendingUp },
];

const NabbitEngineSection = () => {
  const [activeLayer, setActiveLayer] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setDemoIndex((i) => (i + 1) % 3), 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setActiveLayer((i) => (i + 1) % 4), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="nabbit-engine">
      <div className="text-center mb-16 relative">
        <motion.img
          src={nabbitIcon}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-8 w-20 h-20 opacity-[0.08] pointer-events-none"
          animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="section-label mb-4">PROPRIETARY TECHNOLOGY</p>
        <h2 className="font-heading font-black text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
          The <span className="gradient-text">Nabbit Engine.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four layers of proprietary AI that find, match, price, and purchase — completely autonomously.
        </p>
      </div>

      {/* Featured Layer Showcase */}
      <div className="mb-8">
        {/* Layer Selector Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {layers.map((layer, i) => (
            <button
              key={layer.title}
              onClick={() => setActiveLayer(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                activeLayer === i
                  ? "bg-primary/20 border border-primary/40 text-foreground shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
                  : "glass-card border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              <layer.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{layer.title}</span>
              <span className="sm:hidden">{layer.title.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Layer Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLayer}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="glass-card gradient-border overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Side */}
              <div className="relative h-64 md:h-auto md:min-h-[380px] overflow-hidden">
                <img
                  src={layers[activeLayer].image}
                  alt={layers[activeLayer].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 hidden md:block" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent md:hidden" />

                {/* Live status badge */}
                <motion.div
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-xl border border-primary/30"
                >
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-[11px] font-black text-success">ACTIVE</span>
                </motion.div>

                {/* Stat badge overlay */}
                <div className="absolute bottom-4 left-4 px-4 py-2 rounded-xl bg-background/80 backdrop-blur-xl border border-primary/30">
                  <p className="text-xs font-black gradient-text">{layers[activeLayer].stat}</p>
                </div>
              </div>

              {/* Content Side */}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                    {(() => { const Icon = layers[activeLayer].icon; return <Icon className="w-5 h-5 text-primary" />; })()}
                  </div>
                  <div>
                    <h3 className="font-heading text-2xl font-black text-foreground">{layers[activeLayer].title}</h3>
                    <p className="text-sm font-semibold text-primary">{layers[activeLayer].subtitle}</p>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">{layers[activeLayer].desc}</p>

                {/* Live Demo Terminal */}
                <div className="rounded-xl bg-background/50 border border-border/50 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono ml-2">live_feed.log</span>
                  </div>
                  <div className="p-4 space-y-2">
                    {layers[activeLayer].liveDemo.map((line, i) => (
                      <motion.div
                        key={`${activeLayer}-${i}`}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: demoIndex >= i ? 1 : 0.3, x: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.3 }}
                        className="flex items-center gap-2"
                      >
                        <Activity className={`w-3 h-3 shrink-0 ${demoIndex >= i ? "text-primary" : "text-muted-foreground/30"}`} />
                        <span className={`text-xs font-mono ${demoIndex >= i ? "text-foreground/80" : "text-muted-foreground/30"}`}>{line}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* All 4 Layers as Mini Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {layers.map((layer, i) => (
          <motion.button
            key={layer.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            onClick={() => setActiveLayer(i)}
            className={`glass-card p-4 text-left group relative overflow-hidden transition-all duration-300 ${
              activeLayer === i ? "gradient-border shadow-[0_0_30px_-8px_hsl(var(--primary)/0.2)]" : "border border-border/30 hover:border-primary/30"
            }`}
          >
            <div className="relative h-24 rounded-lg overflow-hidden mb-3">
              <img src={layer.image} alt={layer.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              <layer.icon className="absolute bottom-2 left-2 w-4 h-4 text-primary" />
            </div>
            <p className="font-heading text-sm font-black text-foreground mb-0.5">{layer.title}</p>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{layer.subtitle}</p>
          </motion.button>
        ))}
      </div>

      {/* Metrics Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card gradient-border p-6 relative overflow-hidden"
      >
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
              <m.icon className="w-4 h-4 text-primary mx-auto mb-1.5 opacity-60" />
              <p className="font-heading text-2xl font-black gradient-text">{m.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default NabbitEngineSection;
