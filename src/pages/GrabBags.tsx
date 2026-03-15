import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Zap, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";

interface GrabBag {
  id: number;
  tier: string;
  name: string;
  desc: string;
  price: number;
  items: string;
  guarantee: string;
  emoji: string;
  sold: number;
  odds: { common: number; rare: number; ultra: number; legendary: number };
  reveals: string[];
}

const bags: GrabBag[] = [
  { id: 1, tier: "Standard", name: "The Card Hunter", desc: "3–5 cards from top sets", price: 29, items: "3–5 cards", guarantee: "1 card $20+ guaranteed", emoji: "🃏", sold: 1240, odds: { common: 60, rare: 25, ultra: 12, legendary: 3 }, reveals: ["🃏", "⭐", "🏆", "💎"] },
  { id: 2, tier: "Premium", name: "The Sneaker Stash", desc: "1 pair + accessories", price: 79, items: "1 pair + extras", guarantee: "$100+ guaranteed", emoji: "👟", sold: 860, odds: { common: 50, rare: 30, ultra: 15, legendary: 5 }, reveals: ["👟", "🧢", "🏆", "💎"] },
  { id: 3, tier: "Ultra", name: "The Grail Box", desc: "5–8 premium items", price: 199, items: "5–8 items", guarantee: "$300+ guaranteed", emoji: "📦", sold: 420, odds: { common: 40, rare: 30, ultra: 20, legendary: 10 }, reveals: ["📦", "⌚", "🏆", "💎"] },
  { id: 4, tier: "Legendary", name: "The Watch Vault", desc: "1–2 authenticated watches", price: 349, items: "1–2 watches", guarantee: "$500+ guaranteed", emoji: "⌚", sold: 180, odds: { common: 30, rare: 30, ultra: 25, legendary: 15 }, reveals: ["⌚", "💎", "🏆", "👑"] },
];

const rarityLabels = [
  { key: "common", label: "Hit", color: "bg-secondary text-secondary-foreground" },
  { key: "rare", label: "Rare Hit", color: "bg-blue-500/20 text-blue-500" },
  { key: "ultra", label: "Ultra Hit", color: "bg-primary/20 text-primary" },
  { key: "legendary", label: "🏆 LEGENDARY", color: "bg-amber-500/20 text-amber-600" },
];

const tierBorders: Record<string, string> = {
  Standard: "border-border",
  Premium: "border-blue-500/30",
  Ultra: "border-primary/30",
  Legendary: "border-amber-500/30",
};

type RevealPhase = "idle" | "shake" | "reveal" | "result";

const GrabBags = () => {
  const navigate = useNavigate();
  const [quantities, setQuantities] = useState<Record<number, number>>({ 1: 1, 2: 1, 3: 1, 4: 1 });
  const [revealPhase, setRevealPhase] = useState<RevealPhase>("idle");
  const [revealBag, setRevealBag] = useState<GrabBag | null>(null);
  const [revealRarity, setRevealRarity] = useState("");
  const [revealEmoji, setRevealEmoji] = useState("");
  const [filter, setFilter] = useState("All");

  const setQty = (id: number, delta: number) => {
    setQuantities((q) => ({ ...q, [id]: Math.max(1, Math.min(10, (q[id] || 1) + delta)) }));
  };

  const rollRarity = (odds: GrabBag["odds"]): string => {
    const roll = Math.random() * 100;
    if (roll < odds.legendary) return "legendary";
    if (roll < odds.legendary + odds.ultra) return "ultra";
    if (roll < odds.legendary + odds.ultra + odds.rare) return "rare";
    return "common";
  };

  const openBag = (bag: GrabBag) => {
    setRevealBag(bag);
    setRevealPhase("shake");
    setTimeout(() => {
      const rarity = rollRarity(bag.odds);
      const emojiIdx = rarity === "legendary" ? 3 : rarity === "ultra" ? 2 : rarity === "rare" ? 1 : 0;
      setRevealRarity(rarity);
      setRevealEmoji(bag.reveals[emojiIdx]);
      setRevealPhase("reveal");
      setTimeout(() => setRevealPhase("result"), 1200);
    }, 2000);
  };

  const resultHeadlines: Record<string, string> = {
    legendary: "🏆 JACKPOT!",
    ultra: "🔥 Ultra Hit!",
    rare: "Nice pull!",
    common: "You got a hit!",
  };

  const filters = ["All", "Cards", "Sneakers", "Mixed", "Watches"];

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
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4">
        {bags.map((bag, i) => {
          const qty = quantities[bag.id] || 1;
          return (
            <motion.div key={bag.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={`rounded-2xl bg-card border ${tierBorders[bag.tier]} p-4 space-y-4`}>
              <div className="flex items-start gap-3">
                <motion.span className="text-4xl" animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>{bag.emoji}</motion.span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{bag.tier}</span>
                    <span className="text-xs font-bold text-foreground">${bag.price}</span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground">{bag.name}</h3>
                  <p className="text-xs text-muted-foreground">{bag.desc}</p>
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

              <p className="text-xs text-muted-foreground">{bag.items} · {bag.sold.toLocaleString()} sold</p>

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
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default GrabBags;
