import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ArrowRight, ThumbsUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionWrapper from "@/components/SectionWrapper";
import { useNavigate } from "react-router-dom";

const demoCards = [
  { emoji: "👟", name: "Air Jordan 4 'Bred Reimagined'", price: "$215", was: "$285", retailer: "StockX", tag: "🔥 Hot Drop" },
  { emoji: "⌚", name: "Casio G-Shock GA-2100", price: "$79", was: "$130", retailer: "Amazon", tag: "⚡ Flash Deal" },
  { emoji: "🎧", name: "Sony WH-1000XM5", price: "$278", was: "$399", retailer: "Best Buy", tag: "💎 Price Match" },
];

const DemoSection = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [completed, setCompleted] = useState(false);
  const [nabCount, setNabCount] = useState(0);

  const handleSwipe = (dir: "left" | "right") => {
    setDirection(dir);
    if (dir === "right") setNabCount((p) => p + 1);
    setTimeout(() => {
      if (currentIndex + 1 >= demoCards.length) {
        setCompleted(true);
      } else {
        setCurrentIndex((p) => p + 1);
      }
      setDirection(null);
    }, 300);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 80) handleSwipe("right");
    else if (info.offset.x < -80) handleSwipe("left");
  };

  const card = demoCards[currentIndex];

  return (
    <SectionWrapper id="demo">
      <div className="text-center mb-12">
        <p className="section-label mb-4">TRY IT NOW</p>
        <h2 className="font-heading font-bold text-foreground mb-4" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Swipe to <span className="gradient-text">nab deals.</span>
        </h2>
        <p className="text-muted-foreground text-lg">Drag right to nab, left to pass. No account needed.</p>
      </div>

      <div className="flex justify-center">
        <div className="w-[320px] h-[400px] relative">
          <AnimatePresence mode="wait">
            {!completed ? (
              <motion.div
                key={currentIndex}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  x: direction === "right" ? 300 : direction === "left" ? -300 : 0,
                  rotate: direction === "right" ? 15 : direction === "left" ? -15 : 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 glass-card gradient-border p-6 cursor-grab active:cursor-grabbing flex flex-col justify-between select-none"
              >
                {/* Overlay labels */}
                <motion.div
                  className="absolute inset-0 rounded-3xl border-4 border-success/50 flex items-center justify-center pointer-events-none z-10"
                  style={{ opacity: direction === "right" ? 1 : 0 }}
                >
                  <span className="text-4xl font-heading font-black text-success rotate-[-15deg]">NAB IT</span>
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-3xl border-4 border-destructive/50 flex items-center justify-center pointer-events-none z-10"
                  style={{ opacity: direction === "left" ? 1 : 0 }}
                >
                  <span className="text-4xl font-heading font-black text-destructive rotate-[15deg]">PASS</span>
                </motion.div>

                <div>
                  <span className="text-xs font-semibold text-primary bg-primary/[0.08] border border-primary/20 px-3 py-1 rounded-full">
                    {card.tag}
                  </span>
                </div>

                <div className="text-center space-y-3">
                  <span className="text-6xl">{card.emoji}</span>
                  <h3 className="font-heading text-xl font-bold text-foreground">{card.name}</h3>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold text-success">{card.price}</span>
                    <span className="text-sm text-muted-foreground line-through">{card.was}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{card.retailer}</p>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <button
                    onClick={() => handleSwipe("left")}
                    className="w-14 h-14 rounded-full border-2 border-border bg-secondary flex items-center justify-center hover:border-destructive/50 transition-colors"
                  >
                    <X className="w-6 h-6 text-muted-foreground" />
                  </button>
                  <span className="text-xs text-muted-foreground">{currentIndex + 1} / {demoCards.length}</span>
                  <button
                    onClick={() => handleSwipe("right")}
                    className="w-14 h-14 rounded-full border-2 border-border bg-secondary flex items-center justify-center hover:border-success/50 transition-colors"
                  >
                    <ThumbsUp className="w-6 h-6 text-muted-foreground" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 glass-card gradient-border p-8 flex flex-col items-center justify-center text-center space-y-6"
              >
                <span className="text-5xl">🎯</span>
                <h3 className="font-heading text-2xl font-bold text-foreground">
                  You nabbed {nabCount} deal{nabCount !== 1 ? "s" : ""}!
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your real feed has <strong className="text-foreground">thousands more</strong> deals waiting.
                </p>
                <Button
                  className="rounded-full px-8 font-semibold gap-2 shimmer-btn shadow-[0_0_30px_-5px_hsl(var(--coral)/0.4)]"
                  onClick={() => navigate("/signup")}
                >
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default DemoSection;
