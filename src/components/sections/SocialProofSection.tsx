import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Star, CheckCircle, ArrowRight, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import nabbitLogo from "@/assets/nabbit-logo.png";

const recentNabs = [
  { emoji: "👟", item: "Jordan 4 Retro", user: "Jake R.", saved: "$89", method: "Auto-Nab", accent: "nab-cyan" },
  { emoji: "⌚", item: "Rolex Explorer II", user: "Lena S.", saved: "$2,100", method: "Dream Buy", accent: "nab-purple" },
  { emoji: "🎮", item: "PS5 Slim Bundle", user: "Dev P.", saved: "$127", method: "Grab Bag", accent: "success" },
  { emoji: "👜", item: "Chanel Le Boy", user: "Maria K.", saved: "$890", method: "Auction", accent: "nab-blue" },
  { emoji: "💻", item: "MacBook Pro M4", user: "Chris M.", saved: "$340", method: "Auto-Nab", accent: "nab-cyan" },
  { emoji: "💄", item: "Dyson Airwrap", user: "Ava T.", saved: "$165", method: "Live Break", accent: "nab-purple" },
  { emoji: "📱", item: "iPad Pro M4", user: "Sarah L.", saved: "$170", method: "Dream Buy", accent: "success" },
  { emoji: "🎧", item: "Bose QC Ultra", user: "Tom K.", saved: "$110", method: "Grab Bag", accent: "nab-blue" },
];

const testimonials = [
  {
    quote: "I nabbed a PS5 Pro for $340 under retail while literally sleeping. This thing is insane.",
    name: "Marcus T.",
    handle: "@marcusnabs",
    verified: true,
    savings: "$340",
    accent: "nab-cyan",
  },
  {
    quote: "The grab bags are unreal. Pulled a $800 pair of Yeezys from a $50 bag. I'm addicted.",
    name: "Priya D.",
    handle: "@priyadeals",
    verified: true,
    savings: "$750",
    accent: "nab-purple",
  },
  {
    quote: "Nabbit replaced my entire deal-hunting routine. I just set prices and forget it. 10/10.",
    name: "James W.",
    handle: "@jwatches",
    verified: true,
    savings: "$2,100",
    accent: "success",
  },
  {
    quote: "Sniped a Rolex at auction for $2K under market. The AI timing is genuinely scary good.",
    name: "Elena R.",
    handle: "@elenafinds",
    verified: true,
    savings: "$2,000",
    accent: "nab-blue",
  },
];

const SocialProofSection = () => {
  const navigate = useNavigate();
  const [nabFeedIndex, setNabFeedIndex] = useState(0);
  const [hoveredTestimonial, setHoveredTestimonial] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setNabFeedIndex((prev) => (prev + 1) % recentNabs.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="social-proof">
      <div className="text-center mb-16 relative">
        <motion.img
          src={nabbitLogo}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 opacity-[0.06] pointer-events-none"
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="section-label mb-4">THE NAB FEED</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          People are nabbing{" "}
          <span className="gradient-text">right now.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Real saves from real nabbers. No cap.
        </p>
      </div>

      {/* Aggregate rating bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card gradient-border p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <span className="font-heading font-black text-2xl text-foreground">4.9</span>
          <span className="text-sm text-muted-foreground">/5 from 12,847 nabbers</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-nab-cyan">
            <Trophy className="w-3.5 h-3.5" /> $4.2M total saved
          </span>
          <span className="flex items-center gap-1.5 text-success">
            <Users className="w-3.5 h-3.5" /> 50K+ active nabbers
          </span>
        </div>
      </motion.div>

      {/* Live nab feed — scrolling ticker */}
      <div className="relative mb-10 overflow-hidden rounded-2xl glass-card p-1">
        <div className="flex items-center gap-2 px-4 py-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-[10px] font-black tracking-widest text-success uppercase shrink-0">LIVE FEED</span>
          <div className="flex-1 overflow-hidden ml-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={nabFeedIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3"
              >
                <span className="text-lg">{recentNabs[nabFeedIndex].emoji}</span>
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{recentNabs[nabFeedIndex].user}</strong> nabbed{" "}
                  <strong className="text-foreground">{recentNabs[nabFeedIndex].item}</strong> via{" "}
                  <span className={`text-${recentNabs[nabFeedIndex].accent} font-bold`}>{recentNabs[nabFeedIndex].method}</span>
                </span>
                <span className="text-sm font-black text-success ml-auto shrink-0">-{recentNabs[nabFeedIndex].saved}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Recent nabs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
        {recentNabs.slice(0, 4).map((nab, i) => (
          <motion.div
            key={nab.item}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4, type: "spring" }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`glass-card p-5 group cursor-pointer relative overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_30px_-5px_hsl(var(--${nab.accent})/0.25)]`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b from-${nab.accent}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-2xl bg-${nab.accent}/[0.1] border border-${nab.accent}/30 flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform`}>
                {nab.emoji}
              </div>
              <p className="font-heading font-black text-foreground text-sm truncate">{nab.item}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{nab.user}</p>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-[10px] font-bold text-${nab.accent} bg-${nab.accent}/10 px-2 py-0.5 rounded-full`}>{nab.method}</span>
                <span className="text-sm font-black text-success">-{nab.saved}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
            whileHover={{ y: -6, scale: 1.02 }}
            onHoverStart={() => setHoveredTestimonial(i)}
            onHoverEnd={() => setHoveredTestimonial(null)}
            className={`glass-card gradient-border p-6 group relative overflow-hidden cursor-pointer transition-shadow duration-500 hover:shadow-[0_0_40px_-5px_hsl(var(--${t.accent})/0.3)]`}
          >
            <div className={`absolute inset-0 bg-gradient-to-b from-${t.accent}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Pulsing orb */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-${t.accent} blur-[40px] pointer-events-none`}
            />

            <div className="relative z-10">
              {/* Stars */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, si) => (
                  <Star key={si} className="w-3.5 h-3.5 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>

              {/* Savings badge */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 border border-success/20 text-[10px] font-black text-success mb-4`}>
                <Zap className="w-3 h-3" /> Saved {t.savings}
              </div>

              <div className="flex items-center gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-heading font-bold text-foreground text-sm">{t.name}</p>
                    {t.verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{t.handle}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <Button
          size="lg"
          className="rounded-full px-10 font-black text-base gap-2 shimmer-btn"
          onClick={() => navigate("/signup")}
        >
          Join 50K+ Nabbers <ArrowRight className="w-5 h-5" />
        </Button>
        <p className="text-xs text-muted-foreground mt-4">Free to start · No credit card required</p>
      </motion.div>
    </SectionWrapper>
  );
};

export default SocialProofSection;
