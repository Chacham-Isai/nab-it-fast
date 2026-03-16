import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Clock, Share2, Trophy, Flame, ChevronDown, ChevronUp, Gift, Truck, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import TierPriceLadder from "./TierPriceLadder";
import Countdown from "@/components/Countdown";
import { cn } from "@/lib/utils";

interface PriceTier {
  tier_name: string;
  price: number;
  slots: number;
  slots_filled: number;
}

interface DealCardProps {
  deal: any;
  isJoined: boolean;
  avatars: string[];
  categoryImage: string;
  onJoin: () => void;
  onLeave: () => void;
  onShare: () => void;
}

const sourceStatusConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  sourcing: { icon: Package, label: "Sourcing best price...", color: "text-muted-foreground", bg: "bg-secondary" },
  quoted: { icon: Truck, label: "Suppliers quoted", color: "text-primary", bg: "bg-primary/10" },
  locked: { icon: CheckCircle2, label: "Price locked!", color: "text-success", bg: "bg-success/10" },
  ordered: { icon: CheckCircle2, label: "Order placed!", color: "text-success", bg: "bg-success/10" },
};

const DealCard = ({ deal, isJoined, avatars, categoryImage, onJoin, onLeave, onShare }: DealCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const progress = Math.min((deal.current_participants / deal.target_participants) * 100, 100);
  const almostThere = progress > 80 && deal.status === "active";
  const isFunded = deal.status === "funded";
  const secondsLeft = Math.max(0, Math.floor((new Date(deal.ends_at).getTime() - Date.now()) / 1000));
  const tiers: PriceTier[] = deal.price_tiers || [];
  const hasTiers = tiers.length > 0;
  const sourceStatus = sourceStatusConfig[deal.source_status || "sourcing"];

  // Get current tier price for display
  const activeTier = tiers.find(t => t.slots_filled < t.slots);
  const currentPrice = activeTier?.price || deal.deal_price;
  const currentDiscount = Math.round((1 - currentPrice / deal.retail_price) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className={cn(
        "rounded-2xl relative overflow-hidden group",
        isFunded && "shadow-[0_0_40px_-8px_hsl(var(--success)/0.4)]",
        almostThere && "shadow-[0_0_30px_-8px_hsl(var(--primary)/0.3)]",
      )}
    >
      {/* Product image */}
      <div className="relative h-28 overflow-hidden">
        <img src={categoryImage} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/20" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          {deal.tribe_name && (
            <span className="text-[10px] font-bold text-foreground bg-background/70 backdrop-blur-xl px-2.5 py-1 rounded-lg border border-border/30">
              {deal.emoji} {deal.tribe_name}
            </span>
          )}
          {deal.reward_tier && (
            <span className={cn("text-[10px] font-bold backdrop-blur-xl px-2.5 py-1 rounded-lg border",
              deal.reward_tier === "gold" ? "text-yellow-400 bg-yellow-400/20 border-yellow-400/30" :
              deal.reward_tier === "silver" ? "text-slate-300 bg-slate-400/20 border-slate-400/30" :
              "text-amber-500 bg-amber-600/20 border-amber-600/30"
            )}>
              {deal.reward_tier === "gold" ? "🥇" : deal.reward_tier === "silver" ? "🥈" : "🥉"} {deal.reward_tier}
            </span>
          )}
        </div>

        {/* Discount + giveaway */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {deal.giveaway_enabled && (
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] font-bold text-foreground bg-accent/80 backdrop-blur-xl px-2 py-1 rounded-lg flex items-center gap-1"
            >
              <Gift className="w-3 h-3" /> {deal.giveaway_prize || "Free order!"}
            </motion.span>
          )}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-lg bg-success/90 text-white backdrop-blur-xl"
          >
            -{currentDiscount}%
          </motion.span>
        </div>

        {/* Status bars */}
        {isFunded && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-primary to-accent" />}
        {almostThere && (
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
        )}
      </div>

      <div className="bg-card border border-t-0 border-border rounded-b-2xl p-4 space-y-3">
        {/* Title + Price */}
        <div>
          <h3 className="font-heading font-bold text-foreground text-sm leading-tight">{deal.title}</h3>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-2xl font-heading font-black gradient-text">${currentPrice}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.retail_price}</span>
            {hasTiers && activeTier && (
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {activeTier.tier_name}
              </span>
            )}
          </div>
        </div>

        {/* Tier Price Ladder */}
        {hasTiers && <TierPriceLadder tiers={tiers} retailPrice={deal.retail_price} compact />}

        {/* Source status pipeline */}
        {isFunded && sourceStatus && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-xl", sourceStatus.bg)}
          >
            <sourceStatus.icon className={cn("w-4 h-4", sourceStatus.color)} />
            <div className="flex-1">
              <span className={cn("text-xs font-bold", sourceStatus.color)}>{sourceStatus.label}</span>
              <div className="flex gap-1 mt-1">
                {["sourcing", "quoted", "locked", "ordered"].map((step, i) => {
                  const stepIdx = ["sourcing", "quoted", "locked", "ordered"].indexOf(deal.source_status || "sourcing");
                  return (
                    <div key={step} className={cn("h-1 flex-1 rounded-full", i <= stepIdx ? "bg-primary" : "bg-secondary")} />
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span className="font-bold text-foreground">{deal.current_participants}</span>
              <span className="text-muted-foreground">/ {deal.target_participants}</span>
            </span>
            {almostThere && (
              <motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-primary font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-destructive" /> Almost there!
              </motion.span>
            )}
            {isFunded && (
              <span className="text-success font-bold flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Funded! 🎉
              </span>
            )}
          </div>
          <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: isFunded
                  ? "linear-gradient(90deg, hsl(var(--success)), hsl(var(--primary)))"
                  : "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)), hsl(var(--nab-purple)))",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            {!isFunded && progress > 0 && (
              <motion.div
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-100%", "400%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            )}
          </div>
        </div>

        {/* Avatars + Timer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {avatars.slice(0, 5).map((emoji, j) => (
              <motion.span
                key={j}
                initial={{ scale: 0, x: -10 }}
                animate={{ scale: 1, x: 0 }}
                transition={{ delay: j * 0.05 }}
                className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-sm ring-2 ring-card -ml-1.5 first:ml-0"
              >
                {emoji}
              </motion.span>
            ))}
            {deal.current_participants > 5 && (
              <span className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary ring-2 ring-card -ml-1.5">
                +{deal.current_participants - 5}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 bg-secondary/60 px-2 py-1 rounded-lg">
            <Clock className="w-3 h-3" /><Countdown seconds={secondsLeft} />
          </span>
        </div>

        {/* Expand for details */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors py-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? "Less" : "How it works"}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden space-y-3"
            >
              {/* How it works 3-step */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { step: "1", label: "Join", desc: "Lock your price tier" },
                  { step: "2", label: "Aggregate", desc: "We combine all orders" },
                  { step: "3", label: "Negotiate", desc: "Best supplier price" },
                ].map((s, i) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl bg-secondary/30 border border-border/50 p-2.5 text-center"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
                      <span className="text-[10px] font-bold text-primary">{s.step}</span>
                    </div>
                    <p className="text-[10px] font-bold text-foreground">{s.label}</p>
                    <p className="text-[8px] text-muted-foreground mt-0.5">{s.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Tier breakdown (full, non-compact) */}
              {hasTiers && <TierPriceLadder tiers={tiers} retailPrice={deal.retail_price} />}

              {/* Giveaway odds */}
              {deal.giveaway_enabled && deal.current_participants > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/10 border border-accent/20">
                  <Gift className="w-4 h-4 text-accent" />
                  <div>
                    <span className="text-xs font-bold text-foreground">Giveaway: {deal.giveaway_prize || "1 FREE order"}</span>
                    <p className="text-[10px] text-muted-foreground">Your odds: 1 in {deal.current_participants}</p>
                  </div>
                </div>
              )}

              {/* Total savings */}
              {deal.total_savings > 0 && (
                <div className="text-center py-2">
                  <span className="text-[10px] text-muted-foreground">Crew has saved </span>
                  <span className="text-sm font-heading font-black gradient-text">${deal.total_savings.toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground"> together</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <motion.div whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              size="sm"
              variant={isJoined ? "secondary" : "default"}
              className={cn("rounded-xl text-xs h-9 w-full font-bold", !isJoined && "shimmer-btn")}
              onClick={() => isJoined ? onLeave() : onJoin()}
              disabled={isFunded && !isJoined}
            >
              {isJoined ? "✓ Joined" : hasTiers && activeTier ? `🚀 Join at $${activeTier.price}` : "🚀 Join Deal"}
            </Button>
          </motion.div>
          <Button size="sm" variant="outline" className="rounded-xl text-xs h-9 px-3" onClick={onShare}>
            <Share2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DealCard;
