import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Plus, X, Search, CheckCircle, ChevronRight, Loader2, Target, Clock, Sparkles, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import usePageMeta from "@/hooks/usePageMeta";
import nabbitLogo from "@/assets/nabbit-logo.png";

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
      {/* ===== HEADER ===== */}
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <img src={nabbitLogo} alt="" className="w-5 h-5" />
            <h1 className="font-heading font-black text-foreground text-base tracking-tight">DREAM BUYS</h1>
          </div>
          <motion.span
            animate={{ boxShadow: ["0 0 12px hsl(var(--primary)/0.3)", "0 0 20px hsl(var(--primary)/0.5)", "0 0 12px hsl(var(--primary)/0.3)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest"
          >
            <Zap className="w-3 h-3" /> AI Hunting
          </motion.span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* ===== HERO BANNER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl glass-card gradient-border"
        >
          {/* Animated glow orbs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[100px] opacity-30"
            style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)))" }}
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-[80px] opacity-20"
            style={{ background: "hsl(var(--nab-purple))" }}
          />

          <div className="relative z-10 p-5">
            <div className="flex items-start gap-3.5">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center shrink-0"
              >
                <Target className="w-6 h-6 text-primary" />
              </motion.div>
              <div className="space-y-1.5">
                <h2 className="font-heading font-black text-foreground text-base">
                  Navigator hunts <span className="gradient-text">24/7</span>
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Drop your dream items and set a target price. We'll alert you the moment we find a match below market value.
                </p>
              </div>
            </div>

            {/* Animated scan line */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
              className="mt-4 h-[2px] w-1/3 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--nab-cyan)), transparent)" }}
            />
          </div>
        </motion.div>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: "Active Hunts", value: activeHunts, icon: <Search className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
            { label: "Avg Find Time", value: `${avgDays}d`, icon: <Clock className="w-4 h-4" />, color: "text-nab-blue", bg: "bg-nab-blue/10", border: "border-nab-blue/20" },
            { label: "Matches Found", value: matchesFound, icon: <CheckCircle className="w-4 h-4" />, color: "text-success", bg: "bg-success/10", border: "border-success/20" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className={`relative overflow-hidden p-3.5 rounded-2xl glass-card border ${stat.border} text-center`}
            >
              <div className={`absolute inset-0 ${stat.bg} opacity-30`} />
              <div className="relative z-10 space-y-1.5">
                <div className={`flex items-center justify-center gap-1.5 ${stat.color}`}>
                  {stat.icon}
                  <p className="text-xl font-heading font-black">{stat.value}</p>
                </div>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== ADD DREAM BUY ===== */}
        <AnimatePresence mode="wait">
          {!adding ? (
            <motion.button
              key="add-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={() => setAdding(true)}
              className="w-full p-4 rounded-2xl glass-card border border-dashed border-primary/30 hover:border-primary/60 transition-all flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
            >
              <motion.div
                whileHover={{ rotate: 90, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 group-hover:border-primary/40 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-primary" />
              </motion.div>
              <div className="text-left">
                <span className="font-heading font-bold text-sm text-foreground block">Add a Dream Buy</span>
                <span className="text-[10px] text-muted-foreground">Tell us what you're hunting for</span>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 rounded-2xl glass-card gradient-border space-y-4"
            >
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 0.5 }}>
                  <Sparkles className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-xs font-black text-foreground uppercase tracking-widest">New Hunt</span>
              </div>
              <Input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newName.trim() && addDream()}
                placeholder="What are you looking for?"
                className="bg-secondary/30 border-border/50 h-12 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50"
              />
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm font-bold">$</span>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Target price (optional)"
                  className="bg-secondary/30 border-border/50 h-12 rounded-xl text-sm pl-8 font-medium placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="flex gap-2.5">
                <Button onClick={addDream} disabled={!newName.trim() || submitting} className="flex-1 rounded-xl h-11 shimmer-btn text-xs font-black gap-1.5 uppercase tracking-wider">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
                  Start Hunting
                </Button>
                <Button variant="ghost" className="rounded-xl h-11 text-xs font-bold text-muted-foreground hover:text-foreground" onClick={() => { setAdding(false); setNewName(""); setNewPrice(""); }}>
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== DREAM LIST ===== */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-7 h-7 text-primary" />
            </motion.div>
            <span className="text-xs text-muted-foreground font-medium">Scanning your hunts...</span>
          </div>
        ) : dreams.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-5"
            >
              <Target className="w-10 h-10 text-primary" />
            </motion.div>
            <p className="text-foreground font-heading font-black text-lg">No hunts yet</p>
            <p className="text-xs text-muted-foreground mt-2 max-w-[260px] mx-auto leading-relaxed">
              Add your first dream buy and let Navigator find the best deal for you.
            </p>
            <Button className="mt-6 rounded-xl shimmer-btn gap-1.5 text-xs font-black uppercase tracking-wider" onClick={() => setAdding(true)}>
              <Plus className="w-4 h-4" /> Add Your First Hunt
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Your Hunts</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground font-medium">{dreams.length} total</span>
            </div>

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
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, type: "spring", stiffness: 300, damping: 25 }}
                  className={`rounded-2xl glass-card overflow-hidden transition-all ${
                    isFound
                      ? "border border-success/30 shadow-[0_0_30px_-6px_hsl(var(--success)/0.2)]"
                      : "border border-border/50"
                  }`}
                >
                  {isFound && (
                    <motion.div
                      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="h-[2px]"
                      style={{
                        background: "linear-gradient(90deg, hsl(var(--success)), hsl(var(--primary)), hsl(var(--nab-cyan)), hsl(var(--success)))",
                        backgroundSize: "200% 100%",
                      }}
                    />
                  )}

                  <div className="p-4">
                    <div className="flex items-start gap-3.5">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                          isFound
                            ? "bg-gradient-to-br from-success/15 to-emerald-500/15 border border-success/20"
                            : "bg-gradient-to-br from-secondary/80 to-secondary/40 border border-border/50"
                        }`}
                      >
                        {emoji}
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-heading font-bold text-foreground text-sm leading-tight">{dream.item_name}</h3>
                          <button
                            onClick={() => removeDream(dream.id)}
                            className="shrink-0 p-1.5 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {isFound ? (
                            <motion.span
                              animate={{ boxShadow: ["0 0 8px hsl(var(--success)/0.3)", "0 0 16px hsl(var(--success)/0.5)", "0 0 8px hsl(var(--success)/0.3)"] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="flex items-center gap-1 text-[10px] font-black text-success bg-success/10 border border-success/20 px-2.5 py-1 rounded-full uppercase tracking-wider"
                            >
                              <CheckCircle className="w-3 h-3" /> Match Found
                            </motion.span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
                              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <Search className="w-3 h-3" />
                              </motion.div>
                              Hunting
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground/50 font-medium">{daysSince}d ago</span>
                          {dream.target_price && (
                            <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-0.5 bg-secondary/50 px-2 py-0.5 rounded-full">
                              <TrendingDown className="w-3 h-3" /> ${dream.target_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isFound && dream.match_price && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-4 p-3.5 rounded-xl bg-success/5 border border-success/15 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Found at</p>
                          <p className="text-lg font-heading font-black text-foreground">${dream.match_price.toLocaleString()}</p>
                          {savings && savings > 0 && (
                            <p className="text-[10px] font-black text-success">{savings}% below target 🎉</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="rounded-xl shimmer-btn text-xs font-black gap-1 h-10 px-5 uppercase tracking-wider"
                          onClick={() => {
                            if (dream.match_url) window.open(dream.match_url, "_blank");
                            else navigate("/browse");
                          }}
                        >
                          Nab It <ChevronRight className="w-3.5 h-3.5" />
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
