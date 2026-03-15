import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const CreateDealForm = ({ open, onClose, onCreated }: CreateDealFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [tribeName, setTribeName] = useState("");
  const [dealPrice, setDealPrice] = useState("");
  const [retailPrice, setRetailPrice] = useState("");
  const [target, setTarget] = useState("10");
  const [hoursToEnd, setHoursToEnd] = useState("24");

  const handleSubmit = async () => {
    if (!user || !title || !dealPrice || !retailPrice) {
      toast({ title: "Fill in required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    const dp = parseFloat(dealPrice);
    const rp = parseFloat(retailPrice);
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + parseInt(hoursToEnd));

    const { error } = await supabase.from("group_deals").insert({
      title,
      description: description || null,
      emoji: categoryEmojis[category] || "🎁",
      category,
      tribe_name: tribeName || null,
      deal_price: dp,
      retail_price: rp,
      discount_pct: Math.round((1 - dp / rp) * 100),
      target_participants: parseInt(target),
      ends_at: endsAt.toISOString(),
      created_by: user.id,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Failed to create deal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deal created! 🚀", description: "Share it with your tribe." });
      setTitle(""); setDescription(""); setDealPrice(""); setRetailPrice("");
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
              <h3 className="font-heading font-bold text-foreground text-lg">Create Group Deal</h3>
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
                <label className="text-xs font-medium text-muted-foreground">Tribe (optional)</label>
                <Input value={tribeName} onChange={(e) => setTribeName(e.target.value)} placeholder="e.g. Sneakerheads" className="mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Group Price *</label>
                  <Input type="number" value={dealPrice} onChange={(e) => setDealPrice(e.target.value)} placeholder="180" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Retail Price *</label>
                  <Input type="number" value={retailPrice} onChange={(e) => setRetailPrice(e.target.value)} placeholder="330" className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Target Participants</label>
                  <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="10" className="mt-1" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Duration (hours)</label>
                  <Input type="number" value={hoursToEnd} onChange={(e) => setHoursToEnd(e.target.value)} placeholder="24" className="mt-1" />
                </div>
              </div>
            </div>

            <Button className="w-full rounded-xl h-11" onClick={handleSubmit} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "🚀 Launch Group Deal"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateDealForm;
