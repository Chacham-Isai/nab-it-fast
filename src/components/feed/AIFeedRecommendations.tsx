import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, Zap, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getCategoryImage } from "@/lib/images";
import { useNavigate } from "react-router-dom";

interface AIFeedItem {
  name: string;
  category: string;
  price: number;
  was: number;
  reason: string;
  match_score: number;
  tag: string;
  urgency: string;
}

const tagColors: Record<string, string> = {
  "DREAM MATCH": "bg-gradient-to-r from-primary to-accent text-primary-foreground",
  "AI PICK": "bg-primary/90 text-primary-foreground",
  "FOR YOU": "bg-nab-cyan/90 text-primary-foreground",
  "TRENDING": "bg-destructive text-destructive-foreground",
};

const AIFeedRecommendations = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<AIFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-feed");
      if (error) throw error;
      if (data?.error) {
        if (data.error.includes("Rate limited")) {
          toast({ title: "Slow down!", description: "AI picks are rate limited. Try again in a moment.", variant: "destructive" });
        } else {
          throw new Error(data.error);
        }
        return;
      }
      setItems(data.items || []);
      setLoaded(true);
    } catch (e: any) {
      console.error("AI feed recs error:", e);
      toast({ title: "Couldn't load AI picks", description: "Try again in a moment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl glass-card gradient-border p-4 mb-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-foreground text-sm">AI Picks For You</h4>
              <p className="text-[10px] text-muted-foreground">Personalized by your taste DNA & brands</p>
            </div>
          </div>
          <Button
            size="sm"
            className="rounded-xl text-xs shimmer-btn gap-1.5"
            onClick={fetchRecs}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {loading ? "Loading..." : "Show Picks"}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mb-2 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Picks For You</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="text-xs px-2 rounded-xl gap-1"
          onClick={fetchRecs}
          disabled={loading}
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Horizontal scroll of AI picks */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <AnimatePresence>
          {items.map((item, i) => {
            const pctOff = Math.round((1 - item.price / item.was) * 100);
            const catImage = getCategoryImage(item.category);

            return (
              <motion.button
                key={item.name + i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate("/browse")}
                className="flex-shrink-0 w-[200px] rounded-2xl glass-card gradient-border text-left group overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-[120px] overflow-hidden">
                  <img
                    src={catImage}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Tag */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${tagColors[item.tag] || "bg-primary text-primary-foreground"}`}>
                      {item.tag}
                    </span>
                  </div>

                  {/* Match score */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm">
                    <Zap className="w-2.5 h-2.5 text-primary" />
                    <span className="text-[9px] font-bold text-white">{item.match_score}%</span>
                  </div>

                  {/* Urgency */}
                  <div className="absolute bottom-2 right-2">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-white/90 bg-black/40 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                      <Flame className="w-2.5 h-2.5 text-destructive" />
                      {item.urgency}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3 space-y-1.5">
                  <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{item.name}</p>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-black text-foreground">${item.price.toLocaleString()}</span>
                    <span className="text-[10px] text-muted-foreground line-through">${item.was.toLocaleString()}</span>
                    <span className="text-[9px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded-full">-{pctOff}%</span>
                  </div>

                  {/* AI reason */}
                  <div className="flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                    <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">{item.reason}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AIFeedRecommendations;
