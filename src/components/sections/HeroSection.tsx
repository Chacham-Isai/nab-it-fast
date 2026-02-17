import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Shield, Zap, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const hunts = [
  {
    name: "Jordan 4 Retro",
    market: "$285",
    target: "$220",
    progress: 65,
    status: "Scanning",
    statusColor: "text-primary",
    progressColor: "bg-primary",
  },
  {
    name: "Rolex Datejust 36",
    market: "$8,200",
    target: "$6,800",
    progress: 42,
    status: "Scanning",
    statusColor: "text-primary",
    progressColor: "bg-primary",
  },
  {
    name: "Chanel Classic Flap",
    market: "$3,200",
    target: "$2,450",
    progress: 100,
    status: "Purchased",
    statusColor: "text-success",
    progressColor: "bg-success",
    nabbed: true,
  },
];

const AnimatedCounter = ({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <>{prefix}{count.toLocaleString()}{suffix}</>;
};

const stats = [
  { value: 2400000, prefix: "", suffix: "+", display: "2.4M+", label: "Items tracked" },
  { value: 18700000, prefix: "$", suffix: "", display: "$18.7M", label: "Saved for users" },
  { value: 3, prefix: "<", suffix: "s", display: "<3s", label: "Average nab speed" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.07, 0.12, 0.07] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-0 w-[700px] h-[700px] rounded-full bg-primary blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary blur-[130px]" 
        />
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
        {/* Radial gradient overlay */}
        <div className="absolute inset-0" style={{ background: `var(--radial-overlay)` }} />
      </div>

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/[0.08] backdrop-blur-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            <span className="text-sm font-medium text-primary">AI-Powered Shopping Agent</span>
            <span className="text-xs text-muted-foreground ml-1">— Now in Beta</span>
          </motion.div>

          <h1 className="font-heading font-extrabold text-foreground" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.05 }}>
            Stop paying<br />
            <span className="gradient-text">full price.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            You name the price. We nab it. Nabbit monitors millions of listings across <strong className="text-foreground">200+ retailers</strong> — 24/7 — and auto-purchases the second your item hits your price.
          </p>

          {/* Trust signals */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-success" /> Fraud-protected</div>
            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Sub-3s execution</div>
            <div className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-primary" /> Avg. 23% saved</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="rounded-full px-8 font-semibold text-base gap-2 shimmer-btn shadow-[0_0_30px_-5px_hsl(var(--coral)/0.4)]">
              Start Nabbing Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold text-base border-border hover:bg-secondary group">
              See How It Works <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-primary text-sm">&#9733;</span>
                ))}
                <span className="text-xs text-muted-foreground ml-1">4.9/5</span>
              </div>
              <p className="text-xs text-muted-foreground">Trusted by <strong className="text-foreground">12,000+</strong> smart shoppers</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">{s.display}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                {i < stats.length - 1 && <div className="w-px h-10 bg-border" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative">
            {/* Glow behind phone */}
            <div className="absolute inset-0 scale-110 blur-[60px] bg-primary/[0.08] rounded-full pointer-events-none" />
            
            {/* Phone frame */}
            <div className="w-[300px] sm:w-[340px] rounded-[36px] border border-border bg-card p-4 shadow-2xl relative noise-bg">
              {/* Notch */}
              <div className="w-24 h-6 bg-background rounded-full mx-auto mb-4" />

              {/* Hunt cards */}
              <div className="space-y-3">
                {hunts.map((hunt, i) => (
                  <motion.div
                    key={hunt.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15, duration: 0.5 }}
                    className={`rounded-2xl border p-3 space-y-2 ${
                      hunt.nabbed ? "border-success/30 bg-success/[0.05]" : "border-border bg-secondary"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground">{hunt.nabbed ? "Nabbed!" : "Hunting:"}</p>
                        <p className="text-sm font-semibold text-foreground">{hunt.name}</p>
                      </div>
                      <span className={`text-xs font-semibold ${hunt.statusColor}`}>{hunt.status}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{hunt.nabbed ? "Retail" : "Market"} {hunt.market}</span>
                      <span>{hunt.nabbed ? "Paid" : "Your price"} {hunt.target}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${hunt.progress}%` }}
                        transition={{ delay: 0.8 + i * 0.15, duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${hunt.progressColor}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 sm:-left-12 top-16 px-4 py-2 rounded-full border border-primary/30 bg-card/90 backdrop-blur-sm text-sm font-medium shadow-lg shadow-primary/10"
            >
              <span className="text-primary"><Zap className="w-3.5 h-3.5 inline mr-1" /></span> Price dropped! Auto-nabbing...
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 sm:-right-12 bottom-24 px-4 py-2 rounded-full border border-success/30 bg-card/90 backdrop-blur-sm text-sm font-medium shadow-lg shadow-success/10"
            >
              <span className="text-success"><TrendingDown className="w-3.5 h-3.5 inline mr-1" /> You saved $750</span>
            </motion.div>

            {/* Pulse ring behind phone */}
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-primary/20 pointer-events-none"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;