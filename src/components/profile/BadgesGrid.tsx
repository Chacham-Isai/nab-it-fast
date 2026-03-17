import { motion } from "framer-motion";
import { Badge as BadgeType } from "@/lib/xp";

interface BadgesGridProps {
  badges: BadgeType[];
}

const BadgesGrid = ({ badges }: BadgesGridProps) => {
  const earned = badges.filter(b => b.earned);
  const locked = badges.filter(b => !b.earned);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Badges ({earned.length}/{badges.length})</h3>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className={`relative p-2.5 rounded-2xl text-center border transition-all ${
              badge.earned
                ? "glass-card border-primary/20 shadow-[0_0_12px_-4px_hsl(var(--primary)/0.2)]"
                : "bg-secondary/10 border-border/30 opacity-40 grayscale"
            }`}
          >
            <span className="text-2xl block mb-1">{badge.emoji}</span>
            <p className="text-[9px] font-bold text-foreground leading-tight">{badge.name}</p>
            {!badge.earned && (
              <div className="absolute inset-0 rounded-2xl flex items-center justify-center">
                <span className="text-lg">🔒</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BadgesGrid;
