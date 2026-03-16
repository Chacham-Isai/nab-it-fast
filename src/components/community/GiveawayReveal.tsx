import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GiveawayRevealProps {
  show: boolean;
  winnerName: string;
  winnerEmoji: string;
  prize: string;
  dealTitle: string;
  onClose: () => void;
}

const GiveawayReveal = ({ show, winnerName, winnerEmoji, prize, dealTitle, onClose }: GiveawayRevealProps) => {
  const [phase, setPhase] = useState<"rolling" | "reveal">("rolling");

  useEffect(() => {
    if (show) {
      setPhase("rolling");
      const timer = setTimeout(() => setPhase("reveal"), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  const emojis = ["🎰", "🎲", "🎯", "⭐", "🔥", "💎", "🏆", "🎪"];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex items-center justify-center p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl overflow-hidden relative"
            style={{
              background: "linear-gradient(180deg, hsl(var(--nab-cyan) / 0.15), hsl(var(--card)), hsl(var(--nab-purple) / 0.1))",
              border: "2px solid hsl(var(--nab-cyan) / 0.3)",
              boxShadow: "0 0 80px -10px hsl(var(--nab-cyan) / 0.3), 0 0 40px -5px hsl(var(--nab-purple) / 0.2)",
            }}
          >
            {/* Close */}
            <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-secondary/80 flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>

            <div className="p-8 text-center">
              {phase === "rolling" ? (
                <motion.div className="space-y-4">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 rounded-3xl mx-auto flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan) / 0.2), hsl(var(--nab-purple) / 0.2))" }}
                  >
                    <motion.span
                      className="text-5xl"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    >
                      {emojis[Math.floor(Date.now() / 200) % emojis.length]}
                    </motion.span>
                  </motion.div>
                  <div>
                    <h3 className="font-heading font-black text-foreground text-xl">PICKING A WINNER...</h3>
                    <p className="text-sm text-muted-foreground mt-1">{dealTitle}</p>
                  </div>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        className="w-2 h-2 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="space-y-5"
                >
                  {/* Sparkle burst */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: Math.cos(i * Math.PI / 4) * 100,
                        y: Math.sin(i * Math.PI / 4) * 100,
                      }}
                      transition={{ duration: 1, delay: 0.1 }}
                      className="absolute left-1/2 top-1/2"
                    >
                      <Sparkles className="w-4 h-4 text-primary" />
                    </motion.div>
                  ))}

                  <Gift className="w-10 h-10 text-primary mx-auto" />

                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-28 h-28 rounded-3xl mx-auto flex items-center justify-center"
                    style={{
                      background: "linear-gradient(135deg, hsl(var(--nab-cyan) / 0.2), hsl(var(--nab-purple) / 0.2))",
                      boxShadow: "0 0 40px -5px hsl(var(--nab-cyan) / 0.4)",
                    }}
                  >
                    <span className="text-6xl">{winnerEmoji}</span>
                  </motion.div>

                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">🎉 Winner!</p>
                    <h3 className="font-heading font-black text-foreground text-2xl">{winnerName}</h3>
                    <p className="text-sm text-muted-foreground mt-2">Won <span className="font-bold text-foreground">{prize}</span></p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{dealTitle}</p>
                  </div>

                  <Button className="rounded-xl shimmer-btn w-full" onClick={onClose}>
                    🎉 Awesome!
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GiveawayReveal;
