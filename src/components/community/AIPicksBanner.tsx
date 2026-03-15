import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AIDeal {
  title: string;
  description: string;
  emoji: string;
  category: string;
  tribe_name: string;
  deal_price: number;
  retail_price: number;
  discount_pct: number;
  target_participants: number;
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
        className="p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-heading font-bold text-foreground text-sm">AI Picks for You</h4>
              <p className="text-[10px] text-muted-foreground">Personalized deals based on your crews & taste</p>
            </div>
          </div>
          <Button size="sm" className="rounded-xl text-xs" onClick={fetchRecommendations} disabled={loading}>
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
        {deals.map((deal, i) => (
          <motion.div
            key={deal.title + i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-card border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
            onClick={() => onCreateDeal?.(deal)}
          >
            <span className="text-2xl">{deal.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{deal.title}</p>
              <p className="text-[10px] text-muted-foreground">{deal.tribe_name} · {deal.target_participants} needed</p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold text-foreground">${deal.deal_price}</span>
              <p className="text-[10px] text-success font-bold">-{deal.discount_pct}%</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AIPicksBanner;
