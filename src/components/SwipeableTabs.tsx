import { ReactNode, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSwipeGesture } from "@/hooks/useSwipeGesture";

interface SwipeableTabsProps {
  tabs: { key: string; label: string; badge?: number }[];
  activeTab: string;
  onTabChange: (key: string) => void;
  children: ReactNode;
}

const SwipeableTabs = ({ tabs, activeTab, onTabChange, children }: SwipeableTabsProps) => {
  const activeIndex = tabs.findIndex((t) => t.key === activeTab);

  const goNext = useCallback(() => {
    if (activeIndex < tabs.length - 1) onTabChange(tabs[activeIndex + 1].key);
  }, [activeIndex, tabs, onTabChange]);

  const goPrev = useCallback(() => {
    if (activeIndex > 0) onTabChange(tabs[activeIndex - 1].key);
  }, [activeIndex, tabs, onTabChange]);

  const { swipeHandlers } = useSwipeGesture(
    { onSwipeLeft: goNext, onSwipeRight: goPrev },
    { threshold: 40, preventScroll: false }
  );

  const direction = useMemo(() => {
    return activeIndex;
  }, [activeIndex]);

  return (
    <div>
      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all whitespace-nowrap min-h-[36px] ${
              activeTab === tab.key
                ? "text-primary-foreground shadow-lg"
                : "bg-secondary/60 text-secondary-foreground border border-border/50"
            }`}
            style={
              activeTab === tab.key
                ? {
                    background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)))",
                    boxShadow: "0 2px 12px hsl(var(--nab-cyan) / 0.3)",
                  }
                : {}
            }
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="ml-1.5 text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5 font-black">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Swipeable content */}
      <div {...swipeHandlers} className="touch-pan-y min-h-[200px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SwipeableTabs;
