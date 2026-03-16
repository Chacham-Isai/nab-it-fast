import SectionWrapper from "@/components/SectionWrapper";
import { ArrowRight, Users, TrendingDown, Sparkles, Gift, Gavel, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import heroShowcase from "@/assets/hero/hero-products-showcase.jpg";

const liveNabs = [
  { user: "Alex K.", action: "joined Crew Deal", item: "RTX 4090 FE", saved: "$340" },
  { user: "Sarah M.", action: "pulled EPIC grab bag", item: "Jordan 4 Bred", saved: "$186" },
  { user: "Mike D.", action: "won auction", item: "Rolex Daytona", saved: "$3,400" },
  { user: "Luna R.", action: "joined Crew Deal", item: "PS5 Pro Bundle", saved: "$210" },
  { user: "Dev P.", action: "auto-nabbed", item: "Dyson Airwrap", saved: "$165" },
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
        <div className="absolute inset-0">
          <img src={heroShowcase} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
        </div>

        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.06, 0.15, 0.06] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none"
          style={{ background: "hsl(var(--nab-cyan))" }}
        />

        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '28px 28px',
        }} />

        <div className="relative z-10 p-8 sm:p-12 md:p-16 lg:p-20">
          {/* Live nab */}
          <div className="flex justify-center mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={nabIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full glass-card border border-success/20"
              >
                <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-success shrink-0" />
                <span className="text-sm text-foreground font-semibold">
                  {liveNabs[nabIndex].user} {liveNabs[nabIndex].action}{" "}
                  <strong>{liveNabs[nabIndex].item}</strong> — saved{" "}
                  <strong className="text-success">{liveNabs[nabIndex].saved}</strong>
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.img
            src={nabbitIcon}
            alt="nabbit"
            className="w-16 h-16 mx-auto mb-6 drop-shadow-[0_0_30px_hsl(var(--nab-cyan)/0.5)]"
            animate={{ scale: [1, 1.08, 1], rotate: [0, 3, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-heading font-black text-foreground mb-4" style={{ fontSize: "clamp(2.2rem, 5vw, 4.5rem)" }}>
              Stop hunting solo.
              <br />
              <span className="gradient-text">Join the crew.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Crew Deals. AI curation. Live drops. Everything you need to score deals that actually matter — all in one place.
            </p>
          </motion.div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              { icon: Users, label: "Crew Deals", color: "text-nab-cyan", bg: "bg-nab-cyan/10 border-nab-cyan/20" },
              { icon: Sparkles, label: "AI Curation", color: "text-nab-purple", bg: "bg-nab-purple/10 border-nab-purple/20" },
              { icon: Gift, label: "Grab Bags", color: "text-success", bg: "bg-success/10 border-success/20" },
              { icon: Gavel, label: "Auctions", color: "text-nab-blue", bg: "bg-nab-blue/10 border-nab-blue/20" },
              { icon: Shield, label: "Buyer Protected", color: "text-foreground", bg: "bg-muted/50 border-border/30" },
            ].map((t) => (
              <div key={t.label} className={`flex items-center gap-1.5 px-3 py-2 rounded-full border ${t.bg}`}>
                <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                <span className={`text-xs font-bold ${t.color}`}>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mb-10">
            {[
              { val: "24.5K+", label: "Active nabbers", color: "text-nab-cyan" },
              { val: "$4.2M+", label: "Saved via crews", color: "text-success" },
              { val: "847", label: "Crews active", color: "text-nab-purple" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-2xl font-black gradient-text">{s.val}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

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
