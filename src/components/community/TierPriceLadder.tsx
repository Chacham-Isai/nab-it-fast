import { motion } from "framer-motion";
import { Check, Lock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface PriceTier {
  tier_name: string;
  price: number;
  slots: number;
  slots_filled: number;
}

interface TierPriceLadderProps {
  tiers: PriceTier[];
  retailPrice: number;
  compact?: boolean;
}

const tierColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  "Early Bird": { bg: "bg-success/10", border: "border-success/30", text: "text-success", glow: "shadow-[0_0_12px_-3px_hsl(var(--success)/0.4)]" },
  "Standard": { bg: "bg-primary/10", border: "border-primary/30", text: "text-primary", glow: "shadow-[0_0_12px_-3px_hsl(var(--primary)/0.3)]" },
  "Late Entry": { bg: "bg-accent/10", border: "border-accent/30", text: "text-accent", glow: "" },
};

const TierPriceLadder = ({ tiers, retailPrice, compact = false }: TierPriceLadderProps) => {
  if (!tiers || tiers.length === 0) return null;

  // Find the currently active tier (first one not full)
  const activeTierIdx = tiers.findIndex(t => t.slots_filled < t.slots);

  return (
    <div className={cn("space-y-1.5", compact ? "" : "py-1")}>
      {!compact && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Price Tiers</span>
          <span className="text-[10px] text-muted-foreground">Retail: <span className="line-through">${retailPrice}</span></span>
        </div>
      )}
      <div className="flex gap-1.5">
        {tiers.map((tier, i) => {
          const isFull = tier.slots_filled >= tier.slots;
          const isActive = i === activeTierIdx;
          const colors = tierColors[tier.tier_name] || tierColors["Standard"];
          const discount = Math.round((1 - tier.price / retailPrice) * 100);
          const slotsLeft = tier.slots - tier.slots_filled;

          return (
            <motion.div
              key={tier.tier_name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex-1 rounded-xl border p-2 transition-all relative overflow-hidden",
                isActive && colors.glow,
                isFull ? "bg-secondary/30 border-border opacity-60" : `${colors.bg} ${colors.border}`,
              )}
            >
              {/* Active indicator shimmer */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div className="relative">
                <div className="flex items-center gap-1 mb-1">
                  {isFull ? (
                    <Check className="w-3 h-3 text-muted-foreground" />
                  ) : isActive ? (
                    <Zap className="w-3 h-3" style={{ color: `hsl(var(--${tier.tier_name === "Early Bird" ? "success" : "primary"}))` }} />
                  ) : (
                    <Lock className="w-3 h-3 text-muted-foreground/50" />
                  )}
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", isFull ? "text-muted-foreground line-through" : colors.text)}>
                    {tier.tier_name}
                  </span>
                </div>
                <div className={cn("font-heading font-black", compact ? "text-sm" : "text-lg", isFull ? "text-muted-foreground line-through" : "text-foreground")}>
                  ${tier.price}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className={cn("text-[9px] font-bold", isFull ? "text-muted-foreground" : colors.text)}>
                    -{discount}%
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {isFull ? "Full" : `${slotsLeft} left`}
                  </span>
                </div>
                {/* Mini progress for tier slots */}
                <div className="h-1 rounded-full bg-secondary/50 mt-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: isFull
                        ? "hsl(var(--muted-foreground) / 0.3)"
                        : `hsl(var(--${tier.tier_name === "Early Bird" ? "success" : tier.tier_name === "Standard" ? "primary" : "accent"}))`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(tier.slots_filled / tier.slots) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TierPriceLadder;
