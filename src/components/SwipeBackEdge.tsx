import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { hapticLight, hapticMedium } from "@/lib/haptics";

interface SwipeBackEdgeProps {
  children: React.ReactNode;
  edgeWidth?: number;
  threshold?: number;
}

const SwipeBackEdge = ({ children, edgeWidth = 24, threshold = 100 }: SwipeBackEdgeProps) => {
  const navigate = useNavigate();
  const startX = useRef(0);
  const startY = useRef(0);
  const started = useRef(false);
  const thresholdFired = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [active, setActive] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    if (x <= edgeWidth) {
      started.current = true;
      thresholdFired.current = false;
      startX.current = x;
      startY.current = e.touches[0].clientY;
      setActive(true);
    }
  }, [edgeWidth]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!started.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const dy = Math.abs(e.touches[0].clientY - startY.current);
    // Cancel if vertical scroll is dominant
    if (dy > Math.abs(dx) * 1.5 && dx < 30) {
      started.current = false;
      setDragX(0);
      setActive(false);
      return;
    }
    if (dx > 0) {
      if (dx >= threshold && !thresholdFired.current) {
        thresholdFired.current = true;
        hapticLight();
      }
      setDragX(dx);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!started.current) return;
    if (dragX >= threshold) {
      navigate(-1);
    }
    started.current = false;
    setDragX(0);
    setActive(false);
  }, [dragX, threshold, navigate]);

  const progress = Math.min(dragX / threshold, 1);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      {/* Edge indicator */}
      {active && (
        <motion.div
          className="fixed left-0 top-1/2 -translate-y-1/2 z-[100] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: progress, x: Math.min(dragX * 0.4, 48) }}
          transition={{ type: "tween", duration: 0 }}
        >
          <div
            className="w-10 h-10 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-lg"
            style={{ transform: `scale(${0.6 + progress * 0.4})` }}
          >
            <ChevronLeft className="w-5 h-5 text-primary-foreground" />
          </div>
        </motion.div>
      )}

      {/* Page overlay */}
      {active && dragX > 10 && (
        <div
          className="fixed inset-0 z-[99] pointer-events-none"
          style={{ background: `rgba(0,0,0,${progress * 0.15})` }}
        />
      )}

      {children}
    </div>
  );
};

export default SwipeBackEdge;
