import SectionWrapper from "@/components/SectionWrapper";
import { ArrowRight, Flame, Shield, Users, Zap, TrendingUp, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import heroShowcase from "@/assets/hero/hero-products-showcase.jpg";

const liveNabs = [
  { user: "Alex K.", emoji: "🧑‍🎤", item: "PSA 10 Charizard", saved: "$127" },
  { user: "Sarah M.", emoji: "👩‍💼", item: "Jordan 4 Bred", saved: "$186" },
  { user: "Mike D.", emoji: "🧔", item: "Rolex Daytona", saved: "$3,400" },
  { user: "Luna R.", emoji: "👩‍🎨", item: "Legendary Grab Bag", saved: "$89" },
  { user: "Dev P.", emoji: "🧑‍💻", item: "PS5 Pro Bundle", saved: "$210" },
];

const FinalCTASection = () => {
  const navigate = useNavigate();
  const [nabIndex, setNabIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setNabIndex((i) => (i + 1) % liveNabs.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper>
      <div className="relative rounded-3xl overflow-hidden">
        {/* Full-bleed showcase image bg */}
        <div className="absolute inset-0">
          <img src={heroShowcase} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>

        {/* Animated glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.06, 0.15, 0.06] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: "hsl(var(--primary))" }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04], x: [0, 50, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full blur-[120px] pointer-events-none"
          style={{ background: "hsl(var(--nab-cyan))" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full blur-[100px] pointer-events-none"
          style={{ background: "hsl(var(--nab-purple))" }}
        />

        {/* Grid dots */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }} />

        {/* Gradient sweep */}
        <motion.div
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none"
        />

        <div className="relative z-10 p-8 sm:p-12 md:p-16 lg:p-20">
          {/* Top live feed strip */}
          <div className="flex justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={nabIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card border border-success/20"
              >
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-success shrink-0" />
                <span className="text-sm text-foreground font-semibold">
                  {liveNabs[nabIndex].emoji} {liveNabs[nabIndex].user} nabbed{" "}
                  <strong>{liveNabs[nabIndex].item}</strong> — saved{" "}
                  <strong className="text-success">{liveNabs[nabIndex].saved}</strong>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Animated logo */}
          <motion.div className="flex justify-center mb-6">
            <motion.img
              src={nabbitIcon}
              alt="nabbit"
              className="w-16 h-16 drop-shadow-[0_0_30px_hsl(var(--nab-cyan)/0.5)]"
              animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Urgency badge */}
          <motion.div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/[0.08] text-sm font-black"
            >
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-primary">3,291 deals nabbed today — yours is next</span>
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-heading font-black text-foreground mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}>
              The best deals don't wait.
              <br />
              <span className="gradient-text">Neither should you.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join 24,500+ nabbers who let AI hunt the best prices while they sleep. Your next great nab is one click away.
            </p>
          </motion.div>

          {/* Social proof stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-10"
          >
            {[
              { icon: Users, val: "24.5K+", label: "Active nabbers", color: "text-nab-cyan" },
              { icon: TrendingUp, val: "$4.2M+", label: "Total saved", color: "text-success" },
              { icon: Sparkles, val: "12,847", label: "AI hunts running", color: "text-nab-purple" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 px-4 py-3 rounded-2xl glass-card border border-border/30">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-heading text-lg font-black gradient-text">{s.val}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              { icon: Zap, label: "Sub-3s auto-checkout", color: "text-nab-cyan", bg: "bg-nab-cyan/10 border-nab-cyan/20" },
              { icon: Shield, label: "Buyer protected", color: "text-success", bg: "bg-success/10 border-success/20" },
              { icon: Star, label: "4.9/5 user rating", color: "text-nab-purple", bg: "bg-nab-purple/10 border-nab-purple/20" },
            ].map((t) => (
              <div key={t.label} className={`flex items-center gap-1.5 px-3 py-2 rounded-full border ${t.bg}`}>
                <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                <span className={`text-xs font-bold ${t.color}`}>{t.label}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="rounded-full px-12 font-black text-lg gap-2.5 shimmer-btn h-14 shadow-[0_0_60px_-8px_hsl(var(--nab-cyan)/0.5)]"
              onClick={() => navigate("/signup")}
            >
              Start Nabbing Free <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-5 text-center">No credit card · Setup in 30 seconds · Cancel anytime</p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FinalCTASection;
