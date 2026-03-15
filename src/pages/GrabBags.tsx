import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import usePageMeta from "@/hooks/usePageMeta";
import { awardXP } from "@/lib/xp";

const rarityLabels = [
  { key: "common", label: "Hit", color: "bg-secondary text-secondary-foreground" },
  { key: "rare", label: "Rare Hit", color: "bg-nab-blue/20 text-nab-blue" },
  { key: "ultra", label: "Ultra Hit", color: "bg-primary/20 text-primary" },
  { key: "legendary", label: "🏆 LEGENDARY", color: "bg-[hsl(40_90%_55%)]/20 text-[hsl(40_90%_45%)]" },
];

const tierBorders: Record<string, string> = {
  Standard: "border-border",
  Premium: "border-nab-blue/30",
  Ultra: "border-primary/30",
  Legendary: "border-[hsl(40_90%_55%)]/30",
};

const getCategoryEmoji = (cat: string) => {
  const map: Record<string, string> = { Cards: "🃏", Sneakers: "👟", Watches: "⌚", Electronics: "🥽", Collectibles: "🏆", Fashion: "🧥" };
  return map[cat] || "📦";
};

const defaultReveals: Record<string, string[]> = {
  Cards: ["🃏", "⭐", "🏆", "💎"],
  Sneakers: ["👟", "🧢", "🏆", "💎"],
  Watches: ["⌚", "💎", "🏆", "👑"],
  default: ["📦", "⭐", "🏆", "💎"],
};

type RevealPhase = "idle" | "shake" | "reveal" | "result";

interface GrabBagItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  emoji: string;
  tier: string;
  guarantee: string;
  items_desc: string;
  sold: number;
  odds: { common: number; rare: number; ultra: number; legendary: number };
  reveals: string[];
}

const GrabBags = () => {
  usePageMeta({ title: "Grab Bags — nabbit.ai", description: "Mystery grab bags with guaranteed value", path: "/grab-bags" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bags, setBags] = useState<GrabBagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("idle");
  const [revealBag, setRevealBag] = useState<GrabBagItem | null>(null);
  const [revealRarity, setRevealRarity] = useState("");
  const [revealEmoji, setRevealEmoji] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    loadBags();
  }, []);

  const loadBags = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("listing_type", "grab_bag")
      .eq("status", "active")
      .order("starting_price", { ascending: true })
      .limit(20);

    if (data) {
      const items: GrabBagItem[] = data.map((l: any) => {
        const meta = (l.metadata || {}) as any;
        return {
          id: l.id,
          title: l.title,
          description: l.description || "",
          category: l.category,
          price: l.starting_price,
          quantity: l.quantity,
          emoji: getCategoryEmoji(l.category),
          tier: meta.tier || "Standard",
          guarantee: meta.guarantee || `$${Math.round(l.starting_price * 1.5)}+ guaranteed`,
          items_desc: meta.items_desc || `${l.quantity} items`,
          sold: meta.sold || 0,
          odds: meta.odds || { common: 55, rare: 28, ultra: 13, legendary: 4 },
          reveals: defaultReveals[l.category] || defaultReveals.default,
        };
      });
      setBags(items);
      const initQty: Record<string, number> = {};
      items.forEach((b) => { initQty[b.id] = 1; });
      setQuantities(initQty);
    }
    setLoading(false);
  };

  const setQty = (id: string, delta: number) => {
    setQuantities((q) => ({ ...q, [id]: Math.max(1, Math.min(10, (q[id] || 1) + delta)) }));
  };

  const rollRarity = (odds: GrabBagItem["odds"]): string => {
    const roll = Math.random() * 100;
    if (roll < odds.legendary) return "legendary";
    if (roll < odds.legendary + odds.ultra) return "ultra";
    if (roll < odds.legendary + odds.ultra + odds.rare) return "rare";
    return "common";
  };

  const openBag = async (bag: GrabBagItem) => {
    if (!user) { navigate("/login"); return; }

    // Redirect to Stripe checkout for payment
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { listing_id: bag.id, type: "grab_bag", quantity: quantities[bag.id] || 1 },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
      return;
    }
  };

  const resultHeadlines: Record<string, string> = {
    legendary: "🏆 JACKPOT!",
    ultra: "🔥 Ultra Hit!",
    rare: "Nice pull!",
    common: "You got a hit!",
  };

  const filters = ["All", "Cards", "Sneakers", "Watches", "Electronics", "Collectibles"];

  // Reveal overlay
  if (revealPhase !== "idle" && revealBag) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        </div>
        <AnimatePresence mode="wait">
          {revealPhase === "shake" && (
            <motion.div key="shake" initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center relative z-10">
              <motion.span className="text-7xl block" animate={{ y: [0, -10, 0, 10, 0], rotate: [-5, 5, -5, 5, 0] }} transition={{ repeat: Infinity, duration: 0.3 }}>
                📦
              </motion.span>
              <p className="text-lg font-heading font-semibold text-foreground mt-6 animate-pulse">Opening your bag...</p>
            </motion.div>
          )}
          {revealPhase === "reveal" && (
            <motion.div key="reveal" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200 }} className="text-center relative z-10">
              <span className="text-8xl block">{revealEmoji}</span>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
                <span className={`inline-block mt-4 px-4 py-1.5 rounded-full text-sm font-bold ${rarityLabels.find((r) => r.key === revealRarity)?.color}`}>
                  {rarityLabels.find((r) => r.key === revealRarity)?.label}
                </span>
              </motion.div>
            </motion.div>
          )}
          {revealPhase === "result" && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 relative z-10">
              <span className="text-7xl block">{revealEmoji}</span>
              <span className={`inline-block px-4 py-1.5 rounded-full text-lg font-bold ${rarityLabels.find((r) => r.key === revealRarity)?.color}`}>
                {rarityLabels.find((r) => r.key === revealRarity)?.label}
              </span>
              <h2 className="text-3xl font-heading font-black text-foreground">{resultHeadlines[revealRarity]}</h2>
              <p className="text-sm text-muted-foreground">Ships in 2–3 business days 📦</p>
              <div className="flex flex-col gap-2 pt-4">
                <Button className="rounded-xl shimmer-btn h-12" onClick={() => openBag(revealBag)}>Open Another — ${revealBag.price}</Button>
                <Button variant="ghost" className="rounded-xl" onClick={() => { setRevealPhase("idle"); setRevealBag(null); }}>Back to Grab Bags</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const filteredBags = filter === "All" ? bags : bags.filter((b) => b.category === filter);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Grab Bags</h1>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </div>

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 max-w-lg mx-auto">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredBags.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-5xl block mb-4">📦</span>
            <p className="text-muted-foreground">No grab bags available</p>
            <p className="text-xs text-muted-foreground mt-1">Check back soon for new mystery drops</p>
          </div>
        ) : (
          filteredBags.map((bag, i) => {
            const qty = quantities[bag.id] || 1;
            return (
              <motion.div key={bag.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`rounded-2xl bg-card border ${tierBorders[bag.tier] || "border-border"} p-4 space-y-4`}>
                <div className="flex items-start gap-3">
                  <motion.span className="text-4xl" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>{bag.emoji}</motion.span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{bag.tier}</span>
                      <span className="text-xs font-bold text-foreground">${bag.price}</span>
                    </div>
                    <h3 className="font-heading font-bold text-foreground">{bag.title}</h3>
                    <p className="text-xs text-muted-foreground">{bag.description}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs font-semibold text-primary">{bag.guarantee}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {rarityLabels.map((r) => (
                    <span key={r.key} className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${r.color}`}>{r.label} {(bag.odds as any)[r.key]}%</span>
                  ))}
                </div>

                <p className="text-xs text-muted-foreground">{bag.items_desc} · {bag.sold > 0 ? `${bag.sold.toLocaleString()} sold` : `${bag.quantity} available`}</p>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-secondary rounded-full px-2">
                    <button onClick={() => setQty(bag.id, -1)} className="p-1.5 text-muted-foreground hover:text-foreground"><Minus className="w-4 h-4" /></button>
                    <span className="text-sm font-bold text-foreground w-6 text-center">{qty}</span>
                    <button onClick={() => setQty(bag.id, 1)} className="p-1.5 text-muted-foreground hover:text-foreground"><Plus className="w-4 h-4" /></button>
                  </div>
                  <Button className="flex-1 rounded-xl shimmer-btn" onClick={() => openBag(bag)}>
                    Open {qty > 1 ? `${qty}x` : ""} — ${(bag.price * qty).toLocaleString()}
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default GrabBags;
