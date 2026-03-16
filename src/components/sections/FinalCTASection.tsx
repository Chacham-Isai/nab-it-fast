import SectionWrapper from "@/components/SectionWrapper";
import { ArrowRight, Flame, Star, Shield, Users, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import nabbitIcon from "@/assets/nabbit-icon.png";

const liveNabs = [
  "🧑‍🎤 Alex K. just nabbed a PSA 10 Charizard — saved $127",
  "👩‍💼 Sarah M. auto-nabbed Jordan 4s at $89 — saved $186",
  "🧔 Mike D. won a Rolex Daytona at auction — saved $3,400",
  "👩‍🎨 Luna R. pulled a Legendary from Grab Bag!",
  "🧑‍💻 Dev P. set Dream Buy → nabbed in 1.2 seconds",
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
      <div className="relative rounded-3xl p-10 md:p-16 lg:p-20 text-center overflow-hidden glass-card gradient-border">
        {/* Animated background orbs */}
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.06, 0.15, 0.06] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary blur-[150px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.1, 0.04], x: [0, 50, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-nab-cyan blur-[120px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.04, 0.08, 0.04], x: [0, -40, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-0 right-0 w-[350px] h-[350px] rounded-full bg-nab-purple blur-[100px] pointer-events-none"
        />

        {/* Grid dots */}
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Gradient sweep */}
        <motion.div
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/4 bg-gradient-to-r from-transparent via-primary/[0.04] to-transparent pointer-events-none"
        />

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            {/* Animated logo */}
            <motion.img
              src={nabbitLogo}
              alt="nabbit"
              className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_25px_hsl(var(--nab-cyan)/0.4)]"
              animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Live nab ticker */}
            <div className="h-8 mb-6 overflow-hidden max-w-md mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={nabIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-center gap-2"
                >
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                  <span className="text-xs text-foreground/80 font-semibold truncate">{liveNabs[nabIndex]}</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Urgency badge */}
            <motion.div
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/[0.1] mb-8 text-sm font-black"
            >
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-primary">3,291 deals nabbed today — yours is next</span>
            </motion.div>

            {/* Headline */}
            <h2
              className="font-heading font-black text-foreground mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Stop scrolling.<br />
              <span className="gradient-text">Start nabbing.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              The Nabbit Engine is live. Deals are personalized. Your next great nab is waiting — and it's actually a steal.
            </p>

            {/* Trust row */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nab-cyan/10 border border-nab-cyan/20">
                <Zap className="w-3.5 h-3.5 text-nab-cyan" />
                <span className="text-[11px] font-bold text-nab-cyan">Sub-3s checkout</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                <Shield className="w-3.5 h-3.5 text-success" />
                <span className="text-[11px] font-bold text-success">Buyer protected</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nab-purple/10 border border-nab-purple/20">
                <Star className="w-3.5 h-3.5 text-nab-purple" />
                <span className="text-[11px] font-bold text-nab-purple">4.9/5 rating</span>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-10 font-black text-lg gap-2 shimmer-btn shadow-[0_0_50px_-5px_hsl(var(--nab-cyan)/0.4)]"
                onClick={() => navigate("/signup")}
              >
                Start Nabbing Free <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">No credit card · Setup in 30 seconds · Cancel anytime</p>

            {/* Social proof stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-10 flex flex-wrap items-center justify-center gap-8"
            >
              {[
                { icon: Users, val: "24.5K+", label: "Active nabbers" },
                { icon: TrendingUp, val: "$4.2M+", label: "Total saved" },
                { icon: Flame, val: "12,847", label: "Hunts running" },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-primary" />
                  <div className="text-left">
                    <p className="font-heading text-sm font-black gradient-text">{s.val}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FinalCTASection;
