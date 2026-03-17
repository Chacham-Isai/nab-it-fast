import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Address {
  id: string;
  label: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  is_default: boolean;
}

interface ShippingAddressesProps {
  addresses: Address[];
  onUpdate: () => void;
}

const ShippingAddresses = ({ addresses, onUpdate }: ShippingAddressesProps) => {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "Home", full_name: "", address_line1: "", address_line2: "", city: "", state: "", zip: "" });

  const handleAdd = async () => {
    if (!user || !form.full_name || !form.address_line1 || !form.city || !form.state || !form.zip) {
      toast({ title: "Missing fields", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSaving(true);
    await supabase.from("shipping_addresses").insert({ ...form, user_id: user.id, is_default: addresses.length === 0 });
    setForm({ label: "Home", full_name: "", address_line1: "", address_line2: "", city: "", state: "", zip: "" });
    setAdding(false);
    setSaving(false);
    onUpdate();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("shipping_addresses").delete().eq("id", id);
    onUpdate();
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    await supabase.from("shipping_addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("shipping_addresses").update({ is_default: true }).eq("id", id);
    onUpdate();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Shipping Addresses</h3>
        <Button size="sm" variant="ghost" onClick={() => setAdding(!adding)} className="text-xs gap-1">
          <Plus className="w-3 h-3" /> Add
        </Button>
      </div>

      {adding && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl glass-card border border-border/50 p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Label (Home, Work...)" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} className="text-xs" />
            <Input placeholder="Full Name *" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} className="text-xs" />
          </div>
          <Input placeholder="Address Line 1 *" value={form.address_line1} onChange={e => setForm(f => ({ ...f, address_line1: e.target.value }))} className="text-xs" />
          <Input placeholder="Address Line 2" value={form.address_line2} onChange={e => setForm(f => ({ ...f, address_line2: e.target.value }))} className="text-xs" />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="City *" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="text-xs" />
            <Input placeholder="State *" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} className="text-xs" />
            <Input placeholder="ZIP *" value={form.zip} onChange={e => setForm(f => ({ ...f, zip: e.target.value }))} className="text-xs" />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={saving} className="flex-1 text-xs">
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save Address"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-xs">Cancel</Button>
          </div>
        </motion.div>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="text-center py-6 rounded-2xl glass-card border border-border/50">
          <MapPin className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No addresses saved yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {addresses.map(addr => (
            <div key={addr.id} className="flex items-start gap-3 p-3 rounded-2xl glass-card border border-border/50 group">
              <div className="w-8 h-8 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-foreground">{addr.label}</p>
                  {addr.is_default && <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">{addr.full_name}</p>
                <p className="text-[10px] text-muted-foreground/70">{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ""}</p>
                <p className="text-[10px] text-muted-foreground/70">{addr.city}, {addr.state} {addr.zip}</p>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {!addr.is_default && (
                  <button onClick={() => handleSetDefault(addr.id)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => handleDelete(addr.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShippingAddresses;
