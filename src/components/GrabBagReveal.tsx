import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

type RevealPhase = "idle" | "shake" | "burst" | "result";

const rarityConfig = {
  common: { label: "Hit", color: "bg-secondary text-secondary-foreground", glow: "hsl(var(--muted))" },
  rare: { label: "Rare Hit", color: "bg-nab-blue/20 text-nab-blue", glow: "hsl(var(--nab-blue))" },
  ultra: { label: "Ultra Hit", color: "bg-primary/20 text-primary", glow: "hsl(var(--primary))" },
  legendary: { label: "🏆 LEGENDARY", color: "bg-[hsl(40_90%_55%)]/20 text-[hsl(40_90%_45%)]", glow: "hsl(40 90% 55%)" },
} as const;

const resultHeadlines: Record<string, string> = {
  legendary: "🏆 JACKPOT!",
  ultra: "🔥 Ultra Hit!",
  rare: "Nice pull!",
  common: "You got a hit!",
};

const categoryReveals: Record<string, string[]> = {
  Cards: ["🃏", "⭐", "🏆", "💎"],
  Sneakers: ["👟", "🧢", "🏆", "💎"],
  Watches: ["⌚", "💎", "🏆", "👑"],
  Electronics: ["🎮", "🥽", "🏆", "💎"],
  Collectibles: ["🧸", "⭐", "🏆", "💎"],
  Fashion: ["👜", "💎", "🏆", "👑"],
};
const defaultReveals = ["📦", "⭐", "🏆", "💎"];

const defaultOdds = { common: 55, rare: 28, ultra: 13, legendary: 4 };

function rollRarity(odds: typeof defaultOdds): keyof typeof rarityConfig {
  const roll = Math.random() * 100;
  if (roll < odds.legendary) return "legendary";
  if (roll < odds.legendary + odds.ultra) return "ultra";
  if (roll < odds.legendary + odds.ultra + odds.rare) return "rare";
  return "common";
}

interface GrabBagRevealProps {
  orderId: string;
  category: string;
  title: string;
  odds?: typeof defaultOdds;
  onRevealed: (orderId: string, rarity: string) => void;
}

const GrabBagReveal = ({ orderId, category, title, odds, onRevealed }: GrabBagRevealProps) => {
  const [phase, setPhase] = useState<RevealPhase>("idle");
  const [rarity, setRarity] = useState<keyof typeof rarityConfig>("common");
  const [emoji, setEmoji] = useState("");

  const startReveal = useCallback(() => {
    setPhase("shake");

    setTimeout(() => {
      const rolled = rollRarity(odds || defaultOdds);
      const reveals = categoryReveals[category] || defaultReveals;
      const emojiIdx = rolled === "legendary" ? 3 : rolled === "ultra" ? 2 : rolled === "rare" ? 1 : 0;
      setRarity(rolled);
      setEmoji(reveals[emojiIdx]);
      setPhase("burst");

      setTimeout(() => {
        setPhase("result");
        onRevealed(orderId, rolled);
      }, 1400);
    }, 2200);
  }, [orderId, category, odds, onRevealed]);

  const cfg = rarityConfig[rarity];

  // Full-screen overlay when active
  if (phase !== "idle") {
    return (
      <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center px-6">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[140px]"
            style={{ background: cfg.glow }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: phase === "burst" || phase === "result" ? 0.35 : 0.1, scale: phase === "burst" ? 1.5 : 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>

        <AnimatePresence mode="wait">
          {phase === "shake" && (
            <motion.div
              key="shake"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center relative z-10"
            >
              <motion.span
                className="text-8xl block drop-shadow-2xl"
                animate={{
                  y: [0, -14, 0, 14, 0, -8, 0, 8, 0],
                  rotate: [-6, 6, -8, 8, -4, 4, -2, 2, 0],
                  scale: [1, 1.05, 1, 1.05, 1, 1.03, 1, 1.02, 1],
                }}
                transition={{ repeat: Infinity, duration: 0.45 }}
              >
                📦
              </motion.span>
              <motion.p
                className="text-lg font-heading font-semibold text-foreground mt-8"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                Opening your bag...
              </motion.p>
              <p className="text-xs text-muted-foreground mt-2">{title}</p>
            </motion.div>
          )}

          {phase === "burst" && (
            <motion.div
              key="burst"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 12 }}
              className="text-center relative z-10"
            >
              {/* Particle ring */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                  style={{ background: cfg.glow }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{
                    x: Math.cos((i * Math.PI * 2) / 8) * 120,
                    y: Math.sin((i * Math.PI * 2) / 8) * 120,
                    opacity: 0,
                    scale: 0,
                  }}
                  transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                />
              ))}
              <motion.span
                className="text-9xl block drop-shadow-2xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {emoji}
              </motion.span>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: "spring" }}>
                <span className={`inline-block mt-6 px-5 py-2 rounded-full text-sm font-black ${cfg.color}`}>
                  {cfg.label}
                </span>
              </motion.div>
            </motion.div>
          )}

          {phase === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-5 relative z-10 max-w-sm"
            >
              <motion.span
                className="text-8xl block drop-shadow-2xl"
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                {emoji}
              </motion.span>
              <span className={`inline-block px-5 py-2 rounded-full text-lg font-black ${cfg.color}`}>
                {cfg.label}
              </span>
              <h2 className="text-3xl font-heading font-black text-foreground">
                {resultHeadlines[rarity]}
              </h2>
              <p className="text-sm text-muted-foreground">
                Your item ships in 2–3 business days 📦
              </p>
              <p className="text-xs text-muted-foreground/70">{title}</p>
              <Button
                variant="outline"
                className="rounded-xl w-full mt-2"
                onClick={() => setPhase("idle")}
              >
                Back to Orders
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Inline "Open Bag" button on the order card
  return (
    <Button
      onClick={startReveal}
      className="mt-3 w-full rounded-xl shimmer-btn text-xs gap-1.5 h-10"
    >
      <Sparkles className="w-3.5 h-3.5" /> Open Your Grab Bag
    </Button>
  );
};

export default GrabBagReveal;
