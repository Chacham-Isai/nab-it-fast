import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
  shape: "circle" | "rect" | "star";
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#A78BFA",
  "#F472B6",
  "#34D399",
];

const generatePieces = (count: number): ConfettiPiece[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.5 + Math.random() * 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 720 - 360,
    shape: (["circle", "rect", "star"] as const)[Math.floor(Math.random() * 3)],
  }));

interface ConfettiCelebrationProps {
  show: boolean;
  xpAmount?: number;
  dealTitle?: string;
  onComplete?: () => void;
}

const ConfettiCelebration = ({ show, xpAmount = 200, dealTitle, onComplete }: ConfettiCelebrationProps) => {
  const [pieces] = useState(() => generatePieces(50));

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-[100] pointer-events-none"
        >
          {/* Confetti particles */}
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                x: `${piece.x}vw`,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: "110vh",
                rotate: piece.rotation,
                opacity: [1, 1, 0.8, 0],
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="absolute"
              style={{ width: piece.size, height: piece.size }}
            >
              {piece.shape === "circle" && (
                <div className="w-full h-full rounded-full" style={{ backgroundColor: piece.color }} />
              )}
              {piece.shape === "rect" && (
                <div className="w-full h-full rounded-sm" style={{ backgroundColor: piece.color, transform: "rotate(45deg)" }} />
              )}
              {piece.shape === "star" && (
                <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: piece.color }}>✦</div>
              )}
            </motion.div>
          ))}

          {/* XP Popup overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
              className="bg-card/95 backdrop-blur-xl border border-primary/30 rounded-3xl p-8 text-center shadow-[0_0_60px_-15px_hsl(var(--primary)/0.4)] max-w-xs mx-4"
            >
              {/* Glow ring */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.2, 1], opacity: [0, 0.6, 0.3] }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: "radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
                }}
              />

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="relative"
              >
                <motion.span
                  className="text-6xl block mb-3"
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  🎉
                </motion.span>

                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="font-heading font-black text-2xl text-foreground mb-1"
                >
                  DEAL FUNDED!
                </motion.h2>

                {dealTitle && (
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.85 }}
                    className="text-sm text-muted-foreground mb-4"
                  >
                    {dealTitle}
                  </motion.p>
                )}

                {/* XP Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1 }}
                  className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-2xl px-5 py-3"
                >
                  <motion.span
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.5, delay: 1.3, repeat: 2, repeatDelay: 0.3 }}
                    className="text-2xl"
                  >
                    ⚡
                  </motion.span>
                  <div className="text-left">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                      className="text-xs text-muted-foreground font-medium"
                    >
                      Bonus XP earned
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.3 }}
                      className="text-xl font-black text-primary"
                    >
                      +{xpAmount} XP
                    </motion.p>
                  </div>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-xs text-muted-foreground mt-4"
                >
                  Tap anywhere to dismiss
                </motion.p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiCelebration;
