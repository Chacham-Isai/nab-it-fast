import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Trophy, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Countdown from "@/components/Countdown";
import ConfettiCelebration from "@/components/community/ConfettiCelebration";
import { cn } from "@/lib/utils";

interface GroupDealCardProps {
  deal: {
    id: string;
    title: string;
    description?: string;
    emoji: string;
    category: string;
    tribe_name?: string;
    deal_price: number;
    retail_price: number;
    discount_pct: number;
    target_participants: number;
    current_participants: number;
    ends_at: string;
    status: string;
    reward_tier: string | null;
    created_at: string;
  };
  participantAvatars: string[];
  isJoined: boolean;
  onJoin: (dealId: string) => Promise<void>;
  onLeave: (dealId: string) => Promise<void>;
  onShare?: (dealId: string) => void;
}

const tierColors: Record<string, string> = {
  bronze: "text-amber-600",
  silver: "text-slate-400",
  gold: "text-yellow-400",
};

const tierEmoji: Record<string, string> = {
  bronze: "🥉",
  silver: "🥈",
  gold: "🥇",
};

const GroupDealCard = ({ deal, participantAvatars, isJoined, onJoin, onLeave, onShare }: GroupDealCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const prevStatusRef = useRef(deal.status);

  // Detect realtime status change to 'funded' while viewing
  useEffect(() => {
    if (prevStatusRef.current !== "funded" && deal.status === "funded" && isJoined) {
      setShowCelebration(true);
    }
    prevStatusRef.current = deal.status;
  }, [deal.status, isJoined]);

  const progress = Math.min((deal.current_participants / deal.target_participants) * 100, 100);
  const almostThere = progress > 80 && deal.status === "active";
  const isFunded = deal.status === "funded";
  const secondsLeft = Math.max(0, Math.floor((new Date(deal.ends_at).getTime() - Date.now()) / 1000));

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isJoined) {
        await onLeave(deal.id);
      } else {
        await onJoin(deal.id);
        if (deal.current_participants + 1 >= deal.target_participants) {
          setShowCelebration(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={cn(
        "p-4 rounded-2xl bg-card border border-border space-y-3 relative overflow-hidden transition-shadow",
        isFunded && "border-primary/50 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]",
        almostThere && "border-primary/30"
      )}
    >
      {/* Confetti overlay */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <span className="text-5xl">🎉</span>
              <p className="font-heading font-bold text-primary text-lg mt-2">DEAL FUNDED!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-start gap-3">
        <motion.span
          className="text-3xl"
          whileTap={{ scale: 1.3, rotate: 12 }}
        >
          {deal.emoji}
        </motion.span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {deal.tribe_name && (
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{deal.tribe_name}</span>
            )}
            {deal.reward_tier && (
              <span className={cn("text-xs font-bold flex items-center gap-0.5", tierColors[deal.reward_tier])}>
                {tierEmoji[deal.reward_tier]} {deal.reward_tier}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-foreground text-sm leading-tight">{deal.title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg font-bold text-foreground">${deal.deal_price}</span>
            <span className="text-sm text-muted-foreground line-through">${deal.retail_price}</span>
            <span className="text-xs font-bold text-success">-{deal.discount_pct}%</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3" />
            {deal.current_participants} of {deal.target_participants}
          </span>
          {almostThere && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary font-bold"
            >
              Almost there! 🔥
            </motion.span>
          )}
          {isFunded && (
            <span className="text-success font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Funded!
            </span>
          )}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Participant avatars */}
      {participantAvatars.length > 0 && (
        <div className="flex items-center gap-1">
          {participantAvatars.slice(0, 5).map((emoji, i) => (
            <span key={i} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">
              {emoji}
            </span>
          ))}
          {deal.current_participants > 5 && (
            <span className="text-[10px] text-muted-foreground ml-1">+{deal.current_participants - 5} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <Countdown seconds={secondsLeft} />
        </span>
        <div className="flex items-center gap-2">
          {onShare && (
            <Button size="sm" variant="ghost" className="rounded-xl text-xs px-2" onClick={() => onShare(deal.id)}>
              <Share2 className="w-3.5 h-3.5" />
            </Button>
          )}
          <motion.div whileTap={{ scale: 0.92 }}>
            <Button
              size="sm"
              variant={isJoined ? "secondary" : "default"}
              className="rounded-xl text-xs"
              onClick={handleToggle}
              disabled={loading || (isFunded && !isJoined)}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : isJoined ? "Joined ✓" : "Join Deal"}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default GroupDealCard;
