import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Shield, Zap, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const rotatingPhrases = [
  "never stops hunting.",
  "finds your grails.",
  "saves while you sleep.",
  "nabs before you blink.",
];

const activityFeed = [
  { name: "Sarah K.", item: "Jordan 4 Retro", price: "$220", time: "2m ago" },
  { name: "Marcus T.", item: "Rolex Explorer II", price: "$6,800", time: "5m ago" },
  { name: "Emily R.", item: "Dyson V15", price: "$449", time: "8m ago" },
  { name: "James W.", item: "PS5 Pro Bundle", price: "$499", time: "12m ago" },
  { name: "Priya D.", item: "Chanel Le Boy", price: "$3,100", time: "15m ago" },
  { name: "Alex M.", item: "Air Max 1 Patta", price: "$165", time: "18m ago" },
];

const avatarGradients = [
  "from-primary to-[hsl(var(--coral-glow))]",
  "from-[#6366f1] to-[#8b5cf6]",
  "from-[#f59e0b] to-[#ef4444]",
  "from-[#10b981] to-[#06b6d4]",
  "from-[#ec4899] to-[#8b5cf6]",
];

const stats = [
  { display: "200+", label: "Retailers" },
  { display: "2.4M", label: "Live Listings" },
  { display: "12K+", label: "Hunters" },
  { display: "$4.2M", label: "Saved" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [activityIndex, setActivityIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivityIndex((prev) => (prev + 1) % activityFeed.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const currentActivity = activityFeed[activityIndex];

  return (
    <section className="relative min-h-screen flex items-center pt-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }} />
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
            Your AI that<br />
            <span className="gradient-text relative">
              <AnimatePresence mode="wait">
                <motion.span
                  key={phraseIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="inline-block"
                >
                  {rotatingPhrases[phraseIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            Set your target price. nabbit watches <strong className="text-foreground">200+ retailers 24/7</strong> and auto-buys the moment your price hits — while you sleep.
          </p>

          {/* Trust signals */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-success" /> Fraud-protected</div>
            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" /> Sub-3s execution</div>
            <div className="flex items-center gap-1.5"><TrendingDown className="w-3.5 h-3.5 text-primary" /> Avg. 23% saved</div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="rounded-full px-8 font-semibold text-base gap-2 shimmer-btn shadow-[0_0_30px_-5px_hsl(var(--coral)/0.4)]"
              onClick={() => navigate("/signup")}
            >
              Start Hunting Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 font-semibold text-base border-border hover:bg-secondary group"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
            </Button>
          </div>

          {/* Social proof with gradient avatars */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["SK", "MT", "ER", "JW", "PD"].map((initials, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br ${avatarGradients[i]} flex items-center justify-center text-xs font-bold text-white`}
                >
                  {initials}
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

          {/* Live activity ticker */}
          <div className="pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activityIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/[0.08] border border-success/20 text-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{currentActivity.name}</strong> just nabbed{" "}
                  <strong className="text-foreground">{currentActivity.item}</strong> for{" "}
                  <strong className="text-success">{currentActivity.price}</strong>
                </span>
                <span className="text-xs text-muted-foreground/60">{currentActivity.time}</span>
              </motion.div>
            </AnimatePresence>
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
            <div className="absolute inset-0 scale-110 blur-[60px] bg-primary/[0.08] rounded-full pointer-events-none" />
            
            <div className="w-[300px] sm:w-[340px] rounded-[36px] border border-border bg-card p-4 shadow-2xl relative noise-bg">
              <div className="w-24 h-6 bg-background rounded-full mx-auto mb-4" />

              <div className="space-y-3">
                {hunts.map((hunt, i) => (
                  <motion.div
                    key={hunt.name}
                    initial={{ opacity: 0, x: 30, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.25, duration: 0.6, type: "spring", stiffness: 100 }}
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
                        transition={{ delay: 0.8 + i * 0.25, duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${hunt.progressColor}`}
                      />
                    </div>
                    {/* Confetti burst on purchased card */}
                    {hunt.nabbed && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0.8] }}
                        transition={{ delay: 1.8, duration: 0.6 }}
                        className="flex justify-center gap-1 text-xs"
                      >
                        {["🎉", "✨", "🎯"].map((e, ei) => (
                          <motion.span
                            key={ei}
                            animate={{ y: [0, -8, 0] }}
                            transition={{ delay: 2 + ei * 0.1, duration: 0.5 }}
                          >
                            {e}
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
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
