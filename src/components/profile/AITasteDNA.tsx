import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, RefreshCw, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface TasteSummary {
  top_categories?: { name: string; score: number; trend: string }[];
  price_sensitivity?: number;
  avg_price_range?: { min: number; max: number };
  buying_patterns?: string[];
  brand_affinities?: string[];
  deal_preference?: string;
  engagement_level?: string;
  recommended_categories?: string[];
  personality_tag?: string;
  updated_at?: string;
}

interface AITasteDNAProps {
  tasteSummary: TasteSummary;
  aiEnabled: boolean;
  onRefresh: (summary: TasteSummary) => void;
}

const trendIcon = (t: string) => {
  if (t === "rising") return <TrendingUp className="w-3 h-3 text-success" />;
  if (t === "declining") return <TrendingDown className="w-3 h-3 text-destructive" />;
  return <Minus className="w-3 h-3 text-muted-foreground" />;
};

const AITasteDNA = ({ tasteSummary, aiEnabled, onRefresh }: AITasteDNAProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");

      const resp = await supabase.functions.invoke("ai-learn", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (resp.error) throw resp.error;
      onRefresh(resp.data.taste_summary);
      toast({ title: "🧠 AI Updated!", description: "Your taste profile has been refreshed." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to refresh AI", variant: "destructive" });
    } finally {
      setRefreshing(false);
    }
  };

  const cats = tasteSummary.top_categories || [];
  const hasData = cats.length > 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl glass-card border border-primary/20 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-heading font-black text-foreground">AI Taste DNA</h3>
            <p className="text-[10px] text-muted-foreground">What nabbit knows about you</p>
          </div>
        </div>
        {aiEnabled && (
          <Button size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing} className="text-xs gap-1">
            {refreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Refresh
          </Button>
        )}
      </div>

      {!hasData ? (
        <div className="text-center py-6">
          <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground font-medium">Your AI brain is still learning</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Browse, save, and buy to teach it your taste</p>
          {aiEnabled && (
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing} className="mt-3 text-xs">
              {refreshing ? "Analyzing..." : "Analyze Now"}
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Category Bars */}
          <div className="space-y-2">
            {cats.slice(0, 5).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-foreground w-20 truncate">{cat.name}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary/50 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cat.score}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{cat.score}%</span>
                {trendIcon(cat.trend)}
              </div>
            ))}
          </div>

          {/* Insights Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-secondary/20 border border-border/30">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Price Range</p>
              <p className="text-sm font-heading font-black text-foreground">${tasteSummary.avg_price_range?.min ?? 0} – ${tasteSummary.avg_price_range?.max ?? 0}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary/20 border border-border/30">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Buy Style</p>
              <p className="text-sm font-heading font-black text-foreground capitalize">{tasteSummary.deal_preference?.replace(/_/g, " ") || "—"}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary/20 border border-border/30">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Engagement</p>
              <p className="text-sm font-heading font-black text-foreground capitalize">{tasteSummary.engagement_level?.replace(/_/g, " ") || "—"}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-secondary/20 border border-border/30">
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold">Price Sense</p>
              <p className="text-sm font-heading font-black text-foreground">{tasteSummary.price_sensitivity ?? 0}/100</p>
            </div>
          </div>

          {/* Brand Affinities */}
          {tasteSummary.brand_affinities && tasteSummary.brand_affinities.length > 0 && (
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">Top Brands</p>
              <div className="flex flex-wrap gap-1.5">
                {tasteSummary.brand_affinities.map(b => (
                  <span key={b} className="px-2.5 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold">{b}</span>
                ))}
              </div>
            </div>
          )}

          {/* Buying Patterns */}
          {tasteSummary.buying_patterns && tasteSummary.buying_patterns.length > 0 && (
            <div>
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-bold mb-1.5">AI Insights</p>
              <div className="space-y-1">
                {tasteSummary.buying_patterns.map((p, i) => (
                  <p key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                    <span className="text-primary">•</span> {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {tasteSummary.updated_at && (
            <p className="text-[9px] text-muted-foreground/40 text-right">
              Last updated {new Date(tasteSummary.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AITasteDNA;
