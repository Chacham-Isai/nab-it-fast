import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Flame, Clock, Users, ArrowRight, TrendingDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const liveDeals = [
  { emoji: "👟", name: "Nike Dunk Low Panda", price: 79, was: 130, buyers: 847, timeLeft: "2h 14m", hot: true, accent: "nab-cyan" },
  { emoji: "🎧", name: "AirPods Max", price: 389, was: 549, buyers: 1203, timeLeft: "45m", hot: true, accent: "nab-purple" },
  { emoji: "🕹️", name: "Nintendo Switch OLED", price: 269, was: 349, buyers: 562, timeLeft: "5h 30m", hot: false, accent: "nab-blue" },
  { emoji: "👜", name: "Lululemon Belt Bag", price: 24, was: 38, buyers: 2341, timeLeft: "18m", hot: true, accent: "success" },
  { emoji: "🧴", name: "Drunk Elephant Set", price: 42, was: 98, buyers: 389, timeLeft: "1h 52m", hot: false, accent: "nab-cyan" },
  { emoji: "📱", name: "iPhone 16 Pro Case", price: 12, was: 45, buyers: 4120, timeLeft: "32m", hot: true, accent: "nab-purple" },
  { emoji: "⌚", name: "Apple Watch Ultra 2", price: 649, was: 799, buyers: 731, timeLeft: "3h 10m", hot: true, accent: "nab-blue" },
  { emoji: "🎮", name: "PS5 DualSense Edge", price: 149, was: 199, buyers: 1890, timeLeft: "55m", hot: false, accent: "success" },
];

const LiveFeedSection = () => {
  const navigate = useNavigate();
  const [visibleDeals, setVisibleDeals] = useState(liveDeals.slice(0, 4));
  const [tick, setTick] = useState(0);
  const [hoveredDeal, setHoveredDeal] = useState<number | null>(null);
  const [totalSaved, setTotalSaved] = useState(47219);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => {
        const next = prev + 1;
        const start = next % liveDeals.length;
        const deals = [];
        for (let i = 0; i < 4; i++) {
          deals.push(liveDeals[(start + i) % liveDeals.length]);
        }
        setVisibleDeals(deals);
        return next;
      });
      setTotalSaved((prev) => prev + Math.floor(Math.random() * 50 + 10));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="live-deals">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nab-cyan/40 bg-nab-cyan/[0.08] mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nab-cyan opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-nab-cyan" />
          </span>
          <span className="text-sm font-bold text-nab-cyan uppercase tracking-wider">Live Right Now</span>
        </div>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          Deals your feed{" "}
          <span className="gradient-text">actually wants.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The Nabbit Engine curates drops based on your purchase history, swipes, and taste DNA. No algorithms selling you ads — just deals you'll actually buy.
        </p>
      </div>

      {/* Live stats strip */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm font-bold"
      >
        <div className="flex items-center gap-1.5 text-nab-cyan">
          <Users className="w-4 h-4" />
          <span>9,412 browsing</span>
        </div>
        <div className="flex items-center gap-1.5 text-success">
          <TrendingDown className="w-4 h-4" />
          <motion.span key={totalSaved}>${totalSaved.toLocaleString()} saved today</motion.span>
        </div>
        <div className="flex items-center gap-1.5 text-nab-purple">
          <Zap className="w-4 h-4" />
          <span>New deals every 30s</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {visibleDeals.map((deal, i) => {
            const pctOff = Math.round((1 - deal.price / deal.was) * 100);
            return (
              <motion.div
                key={deal.name + tick}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
                whileHover={{ y: -4, scale: 1.02 }}
                onHoverStart={() => setHoveredDeal(i)}
                onHoverEnd={() => setHoveredDeal(null)}
                className={`glass-card gradient-border p-5 group cursor-pointer relative overflow-hidden transition-shadow duration-500 group-hover:shadow-[0_0_40px_-5px_hsl(var(--${deal.accent})/0.3)]`}
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-r from-${deal.accent}/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10 flex items-center gap-4">
                  {/* Emoji icon with pulse */}
                  <div className="relative">
                    <motion.div
                      className={`w-14 h-14 rounded-2xl bg-${deal.accent}/[0.1] border border-${deal.accent}/30 flex items-center justify-center text-2xl shrink-0 group-hover:bg-${deal.accent}/[0.2] transition-all duration-300`}
                      whileHover={{ rotate: [0, -8, 8, 0] }}
                    >
                      {deal.emoji}
                    </motion.div>
                    {deal.hot && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive flex items-center justify-center"
                      >
                        <Flame className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-black text-foreground text-sm truncate">{deal.name}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted-foreground line-through">${deal.was}</span>
                      <span className={`font-black text-${deal.accent} text-base`}>${deal.price}</span>
                      <span className="text-[10px] font-black text-success bg-success/10 px-2 py-0.5 rounded-full">-{pctOff}%</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {deal.timeLeft}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                        </span>
                        {deal.buyers.toLocaleString()} nabbing
                      </span>
                    </div>
                  </div>

                  {/* Nab button on hover */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={hoveredDeal === i ? { opacity: 1, x: 0 } : { opacity: 0, x: 10 }}
                    className="shrink-0"
                  >
                    <div className={`px-4 py-2 rounded-full bg-${deal.accent} text-[11px] font-black text-background`}>
                      NAB IT
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-10"
      >
        <Button
          variant="outline"
          className="rounded-full px-8 font-bold gap-2 border-border hover:bg-secondary group"
          onClick={() => navigate("/signup")}
        >
          See All Live Deals <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
        </Button>
      </motion.div>
    </SectionWrapper>
  );
};

export default LiveFeedSection;
