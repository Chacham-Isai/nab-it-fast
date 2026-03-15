import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Plus, X, Search, CheckCircle, ChevronRight, Loader2, Target, Clock, Sparkles, TrendingDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import usePageMeta from "@/hooks/usePageMeta";

const categoryEmojis: Record<string, string> = {
  Cards: "🃏", Sneakers: "👟", Watches: "⌚", Electronics: "🥽",
  Collectibles: "🏆", Fashion: "👜", Vinyl: "🎵", Gaming: "🎮",
};

const guessEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("jordan") || lower.includes("nike") || lower.includes("dunk") || lower.includes("sneaker") || lower.includes("yeezy")) return "👟";
  if (lower.includes("rolex") || lower.includes("watch") || lower.includes("omega") || lower.includes("casio")) return "⌚";
  if (lower.includes("topps") || lower.includes("prizm") || lower.includes("psa") || lower.includes("card") || lower.includes("pokemon") || lower.includes("charizard")) return "🃏";
  if (lower.includes("iphone") || lower.includes("macbook") || lower.includes("ps5") || lower.includes("xbox") || lower.includes("gpu") || lower.includes("vr")) return "🥽";
  if (lower.includes("vinyl") || lower.includes("record")) return "🎵";
  if (lower.includes("bag") || lower.includes("louis") || lower.includes("gucci") || lower.includes("supreme")) return "👜";
  return "🎯";
};

interface DreamItem {
  id: string;
  item_name: string;
  status: string;
  target_price: number | null;
  match_price: number | null;
  match_url: string | null;
  created_at: string;
}

const DreamBuy = () => {
  usePageMeta({ title: "Dream Buys — nabbit.ai", description: "Track your dream purchases. Nabbit hunts them down for you.", path: "/dream-buys" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dreams, setDreams] = useState<DreamItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (user) fetchDreams(); }, [user]);

  const fetchDreams = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("dream_buys")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setDreams(data || []);
    setLoading(false);
  };

  const addDream = async () => {
    if (!newName.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("dream_buys").insert({
      user_id: user.id,
      item_name: newName.trim(),
      target_price: newPrice ? parseFloat(newPrice) : null,
      status: "hunting",
    });
    if (!error) {
      toast({ title: "🎯 Hunt started!", description: `We're tracking "${newName.trim()}" for you.` });
      setNewName("");
      setNewPrice("");
      setAdding(false);
      fetchDreams();
    }
    setSubmitting(false);
  };

  const removeDream = async (id: string) => {
    await supabase.from("dream_buys").delete().eq("id", id);
    setDreams(prev => prev.filter(d => d.id !== id));
    toast({ title: "Hunt removed" });
  };

  const activeHunts = dreams.filter(d => d.status === "hunting").length;
  const matchesFound = dreams.filter(d => d.status === "found").length;
  const avgDays = dreams.length > 0
    ? (dreams.reduce((sum, d) => sum + Math.max(1, Math.floor((Date.now() - new Date(d.created_at).getTime()) / 86400000)), 0) / dreams.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Dream Buys</h1>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3" /> AI Hunting
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Hero banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-5 glass-card gradient-border"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-20" style={{ background: "hsl(var(--nab-cyan))" }} />
          <div className="relative z-10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm mb-1">Navigator hunts 24/7</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drop your dream items and set a target price. We'll alert you the moment we find a match below market value.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Add Dream Buy */}
        <AnimatePresence mode="wait">
          {!adding ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setAdding(true)}
              className="w-full p-4 rounded-2xl border border-dashed border-border hover:border-primary/40 transition-all flex items-center justify-center gap-2.5 text-muted-foreground hover:text-primary group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <span className="font-medium text-sm">Add a Dream Buy</span>
            </motion.button>
          ) : (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl bg-card border border-primary/20 space-y-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wider">New Hunt</span>
              </div>
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newName.trim() && addDream()}
                placeholder="What are you looking for?"
                className="bg-secondary/50 border-border h-11 rounded-xl text-sm"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Target price (optional)"
                  className="bg-secondary/50 border-border h-11 rounded-xl text-sm pl-7"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addDream} disabled={!newName.trim() || submitting} className="flex-1 rounded-xl h-10 shimmer-btn text-xs font-bold gap-1">
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Target className="w-3.5 h-3.5" />}
                  Start Hunting
                </Button>
                <Button variant="ghost" className="rounded-xl h-10 text-xs" onClick={() => { setAdding(false); setNewName(""); setNewPrice(""); }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Active Hunts", value: activeHunts, icon: <Search className="w-3.5 h-3.5 text-primary" /> },
            { label: "Avg Find Time", value: `${avgDays}d`, icon: <Clock className="w-3.5 h-3.5 text-nab-blue" /> },
            { label: "Matches Found", value: matchesFound, icon: <CheckCircle className="w-3.5 h-3.5 text-success" /> },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-card border border-border text-center space-y-1"
            >
              <div className="flex items-center justify-center gap-1.5">
                {stat.icon}
                <p className="text-lg font-heading font-bold text-foreground">{stat.value}</p>
              </div>
              <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Dream list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : dreams.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <p className="text-foreground font-heading font-bold">No hunts yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
              Add your first dream buy and let Navigator find the best deal for you.
            </p>
            <Button className="mt-5 rounded-xl shimmer-btn gap-1 text-xs" onClick={() => setAdding(true)}>
              <Plus className="w-3.5 h-3.5" /> Add Your First Hunt
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {dreams.map((dream, i) => {
              const emoji = guessEmoji(dream.item_name);
              const isFound = dream.status === "found";
              const daysSince = Math.max(1, Math.floor((Date.now() - new Date(dream.created_at).getTime()) / 86400000));
              const savings = dream.target_price && dream.match_price
                ? Math.round(((dream.target_price - dream.match_price) / dream.target_price) * 100)
                : null;

              return (
                <motion.div
                  key={dream.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`rounded-2xl bg-card border overflow-hidden transition-all ${
                    isFound
                      ? "border-success/30 shadow-[0_0_24px_-6px_hsl(var(--success)/0.15)]"
                      : "border-border"
                  }`}
                >
                  {/* Gradient top accent for found items */}
                  {isFound && (
                    <div className="h-0.5 bg-gradient-to-r from-success via-primary to-nab-cyan" />
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Emoji avatar */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                        isFound ? "bg-success/10" : "bg-secondary"
                      }`}>
                        {emoji}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground text-sm leading-tight">{dream.item_name}</h3>
                          <button
                            onClick={() => removeDream(dream.id)}
                            className="shrink-0 p-1 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            data-compact
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {isFound ? (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" /> Match Found
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                              <Search className="w-3 h-3 animate-pulse" /> Hunting
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/60">·</span>
                          <span className="text-[10px] text-muted-foreground/60">{daysSince}d ago</span>
                          {dream.target_price && (
                            <>
                              <span className="text-[10px] text-muted-foreground/60">·</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <TrendingDown className="w-3 h-3" /> Target: ${dream.target_price.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match details */}
                    {isFound && dream.match_price && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 p-3 rounded-xl bg-success/5 border border-success/10 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs text-muted-foreground">Found at</p>
                          <p className="text-base font-bold text-foreground">${dream.match_price.toLocaleString()}</p>
                          {savings && savings > 0 && (
                            <p className="text-[10px] font-bold text-success">{savings}% below target</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="rounded-xl shimmer-btn text-xs gap-1 h-9"
                          onClick={() => {
                            if (dream.match_url) window.open(dream.match_url, "_blank");
                            else navigate("/browse");
                          }}
                        >
                          Nab It <ChevronRight className="w-3 h-3" />
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default DreamBuy;
