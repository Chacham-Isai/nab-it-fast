import { useState, useCallback, useRef, ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const PullToRefresh = ({ onRefresh, children }: PullToRefreshProps) => {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const threshold = 80;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Only start pull if scrolled to top
    if (scrollRef.current && scrollRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!pulling || refreshing) return;
      const delta = Math.max(0, e.touches[0].clientY - startY.current);
      // Dampen the pull
      setPullDistance(Math.min(delta * 0.4, 120));
    },
    [pulling, refreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold * 0.5);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    setPullDistance(0);
    setPulling(false);
  }, [pulling, pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull indicator */}
      <motion.div
        animate={{ height: refreshing ? 48 : pullDistance, opacity: pullDistance > 10 || refreshing ? 1 : 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="flex items-center justify-center overflow-hidden"
      >
        {refreshing ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <motion.div
            animate={{ rotate: pullDistance >= threshold ? 180 : 0, scale: Math.min(1, pullDistance / threshold) }}
            className="text-primary text-xs font-bold"
          >
            {pullDistance >= threshold ? "Release to refresh" : "Pull to refresh"}
          </motion.div>
        )}
      </motion.div>
      {children}
    </div>
  );
};

export default PullToRefresh;
