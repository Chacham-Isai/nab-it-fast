import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Flame, Clock, Users } from "lucide-react";

const liveDeals = [
  { emoji: "👟", name: "Nike Dunk Low Panda", price: "$79", was: "$130", buyers: 847, timeLeft: "2h 14m", hot: true },
  { emoji: "🎧", name: "AirPods Max", price: "$389", was: "$549", buyers: 1203, timeLeft: "45m", hot: true },
  { emoji: "🕹️", name: "Nintendo Switch OLED", price: "$269", was: "$349", buyers: 562, timeLeft: "5h 30m", hot: false },
  { emoji: "👜", name: "Lululemon Belt Bag", price: "$24", was: "$38", buyers: 2341, timeLeft: "18m", hot: true },
  { emoji: "🧴", name: "Drunk Elephant Set", price: "$42", was: "$98", buyers: 389, timeLeft: "1h 52m", hot: false },
  { emoji: "📱", name: "iPhone 16 Pro Case", price: "$12", was: "$45", buyers: 4120, timeLeft: "32m", hot: true },
];

const LiveFeedSection = () => {
  const [visibleDeals, setVisibleDeals] = useState(liveDeals.slice(0, 4));
  const [tick, setTick] = useState(0);

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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <SectionWrapper id="live-deals">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/40 bg-primary/[0.1] mb-6">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span className="text-sm font-bold text-primary uppercase tracking-wider">Live Right Now</span>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {visibleDeals.map((deal) => (
            <motion.div
              key={deal.name + tick}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35 }}
              className="glass-card gradient-border p-5 flex items-center gap-4 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                {deal.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-heading font-bold text-foreground text-sm truncate">{deal.name}</p>
                  {deal.hot && <Flame className="w-3.5 h-3.5 text-primary shrink-0" />}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground line-through">{deal.was}</span>
                  <span className="font-black text-primary text-sm">{deal.price}</span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {deal.timeLeft}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {deal.buyers.toLocaleString()} nabbing</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
};

export default LiveFeedSection;