import { useState, useRef } from "react";
import { Camera, X, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

type ListingType = "auction" | "buy_now" | "break" | "grab_bag";

interface BreakSlot {
  slot_label: string;
  slot_emoji: string;
  price: string;
}

interface GrabBagTier {
  name: string;
  emoji: string;
  odds: string;
  description: string;
}

interface CreateListingFormData {
  title: string;
  description: string;
  category: string;
  condition: string;
  starting_price: string;
  buy_now_price: string;
  listing_type: ListingType;
  ends_in_hours: string;
}

const categories = ["Cards", "Sneakers", "Watches", "Electronics", "Collectibles", "Fashion", "Other"];
const conditions = ["New", "Like New", "Very Good", "Good", "Acceptable"];

const defaultBreakSlots: BreakSlot[] = [
  { slot_label: "Team 1", slot_emoji: "🏈", price: "10" },
  { slot_label: "Team 2", slot_emoji: "🏀", price: "10" },
];

const defaultGrabBagTiers: GrabBagTier[] = [
  { name: "Common", emoji: "⭐", odds: "60", description: "Base cards and items" },
  { name: "Rare", emoji: "💎", odds: "30", description: "Premium pulls" },
  { name: "Legendary", emoji: "🔥", odds: "10", description: "Ultra-rare hits" },
];

interface Props {
  user: User;
  onComplete: () => void;
}

export default function CreateListingForm({ user, onComplete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [creating, setCreating] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [breakSlots, setBreakSlots] = useState<BreakSlot[]>(defaultBreakSlots);
  const [grabBagTiers, setGrabBagTiers] = useState<GrabBagTier[]>(defaultGrabBagTiers);
  const [grabBagGuarantee, setGrabBagGuarantee] = useState("Every bag guaranteed at least 1 hit!");
  const [form, setForm] = useState<CreateListingFormData>({
    title: "", description: "", category: "Cards", condition: "New",
    starting_price: "", buy_now_price: "", listing_type: "auction", ends_in_hours: "24",
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 5) {
      toast({ title: "Max 5 images", variant: "destructive" });
      return;
    }
    setImageFiles(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    const urls: string[] = [];
    for (const file of imageFiles) {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('listing-images').upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path);
        urls.push(urlData.publicUrl);
      }
    }
    return urls;
  };

  const addBreakSlot = () => {
    setBreakSlots(prev => [...prev, { slot_label: `Team ${prev.length + 1}`, slot_emoji: "🎴", price: "10" }]);
  };

  const updateBreakSlot = (idx: number, field: keyof BreakSlot, value: string) => {
    setBreakSlots(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const removeBreakSlot = (idx: number) => {
    if (breakSlots.length <= 2) return;
    setBreakSlots(prev => prev.filter((_, i) => i !== idx));
  };

  const addGrabBagTier = () => {
    setGrabBagTiers(prev => [...prev, { name: "New Tier", emoji: "🎁", odds: "0", description: "" }]);
  };

  const updateGrabBagTier = (idx: number, field: keyof GrabBagTier, value: string) => {
    setGrabBagTiers(prev => prev.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  };

  const removeGrabBagTier = (idx: number) => {
    if (grabBagTiers.length <= 2) return;
    setGrabBagTiers(prev => prev.filter((_, i) => i !== idx));
  };

  const totalOdds = grabBagTiers.reduce((s, t) => s + (parseFloat(t.odds) || 0), 0);

  const createListing = async () => {
    if (!form.title || !form.starting_price) return;

    if (form.listing_type === "break" && breakSlots.length < 2) {
      toast({ title: "Add at least 2 break slots", variant: "destructive" });
      return;
    }
    if (form.listing_type === "grab_bag" && Math.abs(totalOdds - 100) > 0.01) {
      toast({ title: "Tier odds must total 100%", variant: "destructive" });
      return;
    }

    setCreating(true);
    const imageUrls = await uploadImages();
    const endsAt = new Date(Date.now() + parseInt(form.ends_in_hours) * 3600000).toISOString();

    const metadata: Record<string, unknown> = {};
    if (form.listing_type === "grab_bag") {
      metadata.tiers = grabBagTiers.map(t => ({
        name: t.name, emoji: t.emoji,
        odds: parseFloat(t.odds), description: t.description,
      }));
      metadata.guarantee = grabBagGuarantee;
    }

    const { data: listing, error } = await supabase.from('listings').insert({
      seller_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category,
      condition: form.condition,
      starting_price: parseFloat(form.starting_price),
      buy_now_price: form.buy_now_price ? parseFloat(form.buy_now_price) : null,
      listing_type: form.listing_type,
      status: 'active',
      ends_at: endsAt,
      images: imageUrls,
      metadata: form.listing_type === "grab_bag" ? metadata : {},
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setCreating(false);
      return;
    }

    if (!listing) { setCreating(false); return; }

    // Create auction record for auction type
    if (form.listing_type === 'auction') {
      await supabase.from('auctions').insert({
        listing_id: listing.id,
        current_price: parseFloat(form.starting_price),
        bid_increment: parseFloat(form.starting_price) < 100 ? 1 : parseFloat(form.starting_price) < 1000 ? 5 : 25,
        starts_at: new Date().toISOString(),
        ends_at: endsAt,
        status: 'live',
      });
    }

    // Create break slots
    if (form.listing_type === 'break') {
      const slotInserts = breakSlots.map(s => ({
        listing_id: listing.id,
        slot_label: s.slot_label,
        slot_emoji: s.slot_emoji,
        price: parseFloat(s.price) || 0,
        taken: false,
      }));
      const { error: slotErr } = await supabase.from('break_slots').insert(slotInserts);
      if (slotErr) {
        toast({ title: "Slots error", description: slotErr.message, variant: "destructive" });
      }
    }

    toast({ title: "Listed! 🎉", description: "Your item is now live." });
    setCreating(false);
    onComplete();
  };

  const inputClass = "bg-secondary/50 border-border h-12 rounded-xl";

  return (
    <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
      <h2 className="font-heading font-bold text-foreground text-lg">New Listing</h2>

      <div className="space-y-3">
        {/* Image upload */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Photos (up to 5)</label>
          <div className="flex gap-2 flex-wrap">
            {imagePreviews.map((src, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button onClick={() => removeImage(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {imagePreviews.length < 5 && (
              <button onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Camera className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">Add</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
        </div>

        <Input placeholder="Item title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />

        <div className="grid grid-cols-2 gap-3">
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-secondary/50 border border-border rounded-xl h-12 px-3 text-sm text-foreground">
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="bg-secondary/50 border border-border rounded-xl h-12 px-3 text-sm text-foreground">
            {conditions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Listing type selector */}
        <div className="flex flex-wrap gap-2">
          {(["auction", "buy_now", "break", "grab_bag"] as ListingType[]).map(t => (
            <button key={t} onClick={() => setForm({ ...form, listing_type: t })} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${form.listing_type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t === "buy_now" ? "Buy Now" : t === "grab_bag" ? "Grab Bag" : t === "break" ? "Break" : "Auction"}
            </button>
          ))}
        </div>

        {/* Price fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              {form.listing_type === 'auction' ? 'Starting Price *' : form.listing_type === 'grab_bag' ? 'Bag Price *' : 'Price *'}
            </label>
            <Input type="number" placeholder="0.00" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} className={inputClass} />
          </div>
          {form.listing_type === 'auction' && (
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Buy Now Price</label>
              <Input type="number" placeholder="Optional" value={form.buy_now_price} onChange={(e) => setForm({ ...form, buy_now_price: e.target.value })} className={inputClass} />
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Duration (hours)</label>
          <div className="flex gap-2">
            {["1", "6", "12", "24", "48", "72"].map(h => (
              <button key={h} onClick={() => setForm({ ...form, ends_in_hours: h })} className={`flex-1 py-2 rounded-xl text-xs font-medium ${form.ends_in_hours === h ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                {h}h
              </button>
            ))}
          </div>
        </div>

        {/* === BREAK SLOTS CONFIG === */}
        {form.listing_type === "break" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Break Slots</h3>
              <span className="text-[10px] text-muted-foreground">{breakSlots.length} slots</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Configure team/player slots buyers can claim.</p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {breakSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={slot.slot_emoji}
                    onChange={(e) => updateBreakSlot(i, "slot_emoji", e.target.value)}
                    className="w-12 h-10 rounded-lg bg-secondary/50 border-border text-center text-sm p-0"
                    maxLength={2}
                  />
                  <Input
                    value={slot.slot_label}
                    onChange={(e) => updateBreakSlot(i, "slot_label", e.target.value)}
                    className="flex-1 h-10 rounded-lg bg-secondary/50 border-border text-sm"
                    placeholder="Slot name"
                  />
                  <div className="relative w-20">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={slot.price}
                      onChange={(e) => updateBreakSlot(i, "price", e.target.value)}
                      className="h-10 rounded-lg bg-secondary/50 border-border text-sm pl-5"
                    />
                  </div>
                  <button
                    onClick={() => removeBreakSlot(i)}
                    disabled={breakSlots.length <= 2}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1" onClick={addBreakSlot}>
              <Plus className="w-3.5 h-3.5" /> Add Slot
            </Button>
          </motion.div>
        )}

        {/* === GRAB BAG TIERS CONFIG === */}
        {form.listing_type === "grab_bag" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3 p-4 rounded-2xl bg-card border border-border">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Grab Bag Tiers</h3>
              <span className={`text-[10px] font-bold ${Math.abs(totalOdds - 100) < 0.01 ? "text-success" : "text-destructive"}`}>
                {totalOdds}% / 100%
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">Define rarity tiers and their odds. Must total 100%.</p>

            <div className="space-y-2">
              {grabBagTiers.map((tier, i) => (
                <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={tier.emoji}
                      onChange={(e) => updateGrabBagTier(i, "emoji", e.target.value)}
                      className="w-12 h-9 rounded-lg bg-secondary/50 border-border text-center text-sm p-0"
                      maxLength={2}
                    />
                    <Input
                      value={tier.name}
                      onChange={(e) => updateGrabBagTier(i, "name", e.target.value)}
                      className="flex-1 h-9 rounded-lg bg-secondary/50 border-border text-sm"
                      placeholder="Tier name"
                    />
                    <div className="relative w-20">
                      <Input
                        type="number"
                        value={tier.odds}
                        onChange={(e) => updateGrabBagTier(i, "odds", e.target.value)}
                        className="h-9 rounded-lg bg-secondary/50 border-border text-sm pr-5"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                    <button
                      onClick={() => removeGrabBagTier(i)}
                      disabled={grabBagTiers.length <= 2}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <Input
                    value={tier.description}
                    onChange={(e) => updateGrabBagTier(i, "description", e.target.value)}
                    className="h-8 rounded-lg bg-secondary/50 border-border text-xs"
                    placeholder="What's in this tier?"
                  />
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" className="w-full rounded-xl text-xs gap-1" onClick={addGrabBagTier}>
              <Plus className="w-3.5 h-3.5" /> Add Tier
            </Button>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Guarantee message</label>
              <Input
                value={grabBagGuarantee}
                onChange={(e) => setGrabBagGuarantee(e.target.value)}
                className="h-10 rounded-xl bg-secondary/50 border-border text-sm"
                placeholder="e.g. Every bag guaranteed at least 1 hit!"
              />
            </div>
          </motion.div>
        )}
      </div>

      <Button className="w-full h-12 rounded-xl shimmer-btn font-semibold" onClick={createListing} disabled={creating || !form.title || !form.starting_price}>
        {creating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "List Item"}
      </Button>
    </motion.div>
  );
}
