import { ReactNode, useState, useRef } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { hapticLight, hapticMedium } from "@/lib/haptics";

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftLabel?: string;
  rightLabel?: string;
  threshold?: number;
}

const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = "Skip",
  rightLabel = "Save",
  threshold = 100,
}: SwipeableCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-8, 0, 8]);
  const leftOpacity = useTransform(x, [-threshold, -threshold / 2, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, threshold / 2, threshold], [0, 0.5, 1]);
  const [dismissed, setDismissed] = useState(false);
  const thresholdReached = useRef(false);

  // Fire haptic when crossing threshold during drag
  x.on("change", (latest) => {
    if (Math.abs(latest) >= threshold && !thresholdReached.current) {
      thresholdReached.current = true;
      hapticLight();
    } else if (Math.abs(latest) < threshold) {
      thresholdReached.current = false;
    }
  });

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeX = info.offset.x;
    if (Math.abs(swipeX) >= threshold) {
      setDismissed(true);
      hapticMedium();
      if (swipeX > 0) onSwipeRight?.();
      else onSwipeLeft?.();
    }
  };

  if (dismissed) return null;

  return (
    <div className="relative">
      {/* Left label (skip) */}
      <motion.div
        style={{ opacity: leftOpacity }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold pointer-events-none"
      >
        {leftLabel}
      </motion.div>

      {/* Right label (save) */}
      <motion.div
        style={{ opacity: rightOpacity }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 px-3 py-1.5 rounded-full bg-success text-primary-foreground text-xs font-bold pointer-events-none"
      >
        {rightLabel}
      </motion.div>

      <motion.div
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: "grabbing" }}
        className="touch-pan-y"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default SwipeableCard;
