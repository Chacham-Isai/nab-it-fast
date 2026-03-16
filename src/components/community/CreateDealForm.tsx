import { useState } from "react";
import { X, Loader2, Plus, Minus, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface CreateDealFormProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const categoryEmojis: Record<string, string> = {
  Sneakers: "👟", Cards: "🃏", Electronics: "🎮", Watches: "⌚",
  Fashion: "🧥", Collectibles: "🏆", Other: "🎁",
};

interface TierInput {
  tier_name: string;
  price: string;
  slots: string;
}

const defaultTiers: TierInput[] = [
  { tier_name: "Early Bird", price: "", slots: "5" },
  { tier_name: "Standard", price: "", slots: "10" },
  { tier_name: "Late Entry", price: "", slots: "5" },
];

const CreateDealForm = ({ open, onClose, onCreated }: CreateDealFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [tribeName, setTribeName] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [tiers, setTiers] = useState<TierInput[]>(defaultTiers);
  const [hoursToEnd, setHoursToEnd] = useState("24");
  const [giveawayEnabled, setGiveawayEnabled] = useState(false);
  const [giveawayPrize, setGiveawayPrize] = useState("1 FREE order");

  const updateTier = (idx: number, field: keyof TierInput, value: string) => {
    setTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const totalSlots = tiers.reduce((s, t) => s + (parseInt(t.slots) || 0), 0);

  const handleSubmit = async () => {
    if (!user || !title || !retailPrice || !tiers[0].price) {
      toast({ title: "Fill in required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const rp = parseFloat(retailPrice);
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + parseInt(hoursToEnd));

    const priceTiers = tiers.map(t => ({
      tier_name: t.tier_name,
      price: parseFloat(t.price) || 0,
      slots: parseInt(t.slots) || 0,
      slots_filled: 0,
    }));

    const lowestPrice = priceTiers[0]?.price || 0;
    const discountPct = Math.round((1 - lowestPrice / rp) * 100);

    const { error } = await supabase.from("group_deals").insert({
      title,
      description: description || null,
      emoji: categoryEmojis[category] || "🎁",
      category,
      tribe_name: tribeName || null,
      deal_price: lowestPrice,
      retail_price: rp,
      discount_pct: discountPct,
      target_participants: totalSlots,
      price_tiers: priceTiers,
      giveaway_enabled: giveawayEnabled,
      giveaway_prize: giveawayEnabled ? giveawayPrize : null,
      ends_at: endsAt.toISOString(),
      created_by: user.id,
    } as any);

    setLoading(false);

    if (error) {
      toast({ title: "Failed to create deal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deal created! 🚀", description: "Share it with your crew." });
      setTitle(""); setDescription(""); setRetailPrice("");
      setTiers(defaultTiers);
      setGiveawayEnabled(false);
      onCreated();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-foreground text-lg">Create Crew Deal</h3>
              <button onClick={onClose}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Title *</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Nike Dunk Low Bulk Buy" className="mt-1" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's the deal about?" className="mt-1" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Category</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.keys(categoryEmojis).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                        category === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {categoryEmojis[cat]} {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Crew (optional)</label>
                <Input value={tribeName} onChange={(e) => setTribeName(e.target.value)} placeholder="e.g. Sneakerheads" className="mt-1" />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">Retail Price *</label>
                <Input type="number" value={retailPrice} onChange={(e) => setRetailPrice(e.target.value)} placeholder="330" className="mt-1" />
              </div>

              {/* Tier Pricing Builder */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  Price Tiers *
                  <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Early = cheapest</span>
                </label>
                {tiers.map((tier, idx) => {
                  const discount = tier.price && retailPrice ? Math.round((1 - parseFloat(tier.price) / parseFloat(retailPrice)) * 100) : 0;
                  return (
                    <div key={tier.tier_name} className="flex items-center gap-2 p-2 rounded-xl bg-secondary/30 border border-border/50">
                      <div className="flex-1">
                        <span className="text-[10px] font-bold text-muted-foreground">{tier.tier_name}</span>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            value={tier.price}
                            onChange={(e) => updateTier(idx, "price", e.target.value)}
                            placeholder="Price"
                            className="h-8 text-xs"
                          />
                          <Input
                            type="number"
                            value={tier.slots}
                            onChange={(e) => updateTier(idx, "slots", e.target.value)}
                            placeholder="Slots"
                            className="h-8 text-xs w-20"
                          />
                        </div>
                      </div>
                      {discount > 0 && (
                        <span className="text-[10px] font-bold text-success shrink-0">-{discount}%</span>
                      )}
                    </div>
                  );
                })}
                <p className="text-[10px] text-muted-foreground text-center">Total: {totalSlots} participants</p>
              </div>

              {/* Giveaway Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-accent" />
                  <div>
                    <span className="text-xs font-bold text-foreground">Giveaway</span>
                    <p className="text-[9px] text-muted-foreground">Random winner when deal funds</p>
                  </div>
                </div>
                <Switch checked={giveawayEnabled} onCheckedChange={setGiveawayEnabled} />
              </div>
              {giveawayEnabled && (
                <Input
                  value={giveawayPrize}
                  onChange={(e) => setGiveawayPrize(e.target.value)}
                  placeholder="Prize (e.g. 1 FREE order)"
                  className="text-xs"
                />
              )}

              <div>
                <label className="text-xs font-medium text-muted-foreground">Duration (hours)</label>
                <Input type="number" value={hoursToEnd} onChange={(e) => setHoursToEnd(e.target.value)} placeholder="24" className="mt-1" />
              </div>
            </div>

            <Button className="w-full rounded-xl h-11 shimmer-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "🚀 Launch Crew Deal"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateDealForm;
