import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Gift, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PriceTier {
  tier_name: string;
  price: number;
  slots: number;
  slots_filled: number;
}

interface AIDeal {
  title: string;
  description: string;
  emoji: string;
  category: string;
  tribe_name: string;
  retail_price: number;
  price_tiers: PriceTier[];
  giveaway_enabled: boolean;
  giveaway_prize?: string;
  target_participants: number;
  match_reason?: string;
}

interface AIPicksBannerProps {
  onCreateDeal?: (deal: AIDeal) => void;
}

const AIPicksBanner = ({ onCreateDeal }: AIPicksBannerProps) => {
  const [deals, setDeals] = useState<AIDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-deals");
      if (error) throw error;
      setDeals(data.deals || []);
      setLoaded(true);
    } catch (e: any) {
      console.error("AI recommendations error:", e);
      toast({ title: "Couldn't load AI picks", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl border mb-4 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(var(--nab-cyan) / 0.08), hsl(var(--nab-purple) / 0.06))",
          borderColor: "hsl(var(--nab-cyan) / 0.2)",
        }}
      >
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-primary/[0.05] to-transparent pointer-events-none"
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-purple)))" }}>
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-foreground text-sm">AI Picks for You</h4>
              <p className="text-[10px] text-muted-foreground">Tiered deals curated by AI based on your profile</p>
            </div>
          </div>
          <Button size="sm" className="rounded-xl text-xs shimmer-btn" onClick={fetchRecommendations} disabled={loading}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Show Picks"}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Picks for You</span>
        </div>
        <Button size="sm" variant="ghost" className="text-xs px-2" onClick={fetchRecommendations} disabled={loading}>
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <AnimatePresence>
        {deals.map((deal, i) => {
          const earlyBird = deal.price_tiers?.find(t => t.tier_name === "Early Bird");
          const lowestPrice = earlyBird?.price || deal.price_tiers?.[0]?.price;
          const discount = lowestPrice ? Math.round((1 - lowestPrice / deal.retail_price) * 100) : 0;
          const earlySlots = earlyBird?.slots || 0;

          return (
            <motion.div
              key={deal.title + i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border cursor-pointer hover:shadow-md transition-all group"
              style={{ borderColor: "hsl(var(--nab-cyan) / 0.15)" }}
              onClick={() => onCreateDeal?.(deal)}
            >
              <span className="text-2xl">{deal.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{deal.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{deal.tribe_name} · {deal.target_participants} needed</span>
                  {deal.giveaway_enabled && (
                    <span className="text-[9px] font-bold text-accent flex items-center gap-0.5">
                      <Gift className="w-2.5 h-2.5" /> Giveaway
                    </span>
                  )}
                </div>
                {earlySlots > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Zap className="w-2.5 h-2.5 text-success" />
                    <span className="text-[9px] font-bold text-success">{earlySlots} Early Bird spots!</span>
                  </div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-foreground">{lowestPrice ? `$${lowestPrice}` : "—"}</span>
                <p className="text-[10px] text-success font-bold">-{discount}%</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default AIPicksBanner;
