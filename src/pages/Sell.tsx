import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, DollarSign, BarChart3, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type ListingType = "auction" | "buy_now" | "break" | "grab_bag";

interface CreateListingForm {
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

const Sell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"listings" | "orders" | "stats" | "create">("listings");
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateListingForm>({
    title: "", description: "", category: "Cards", condition: "New",
    starting_price: "", buy_now_price: "", listing_type: "auction", ends_in_hours: "24",
  });

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    // Load or create seller profile
    const { data: sp } = await supabase
      .from('seller_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!sp) {
      await supabase.from('seller_profiles').insert({ id: user.id, shop_name: user.user_metadata?.display_name || 'My Shop' });
      const { data: newSp } = await supabase.from('seller_profiles').select('*').eq('id', user.id).single();
      setSellerProfile(newSp);
    } else {
      setSellerProfile(sp);
    }

    // Load listings
    const { data: ls } = await supabase
      .from('listings')
      .select('*, auctions(*)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    setListings(ls || []);

    // Load orders
    const { data: os } = await supabase
      .from('orders')
      .select('*, listings(title)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(os || []);

    setLoading(false);
  };

  const createListing = async () => {
    if (!user || !form.title || !form.starting_price) return;
    setCreating(true);

    const endsAt = new Date(Date.now() + parseInt(form.ends_in_hours) * 3600000).toISOString();

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
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setCreating(false);
      return;
    }

    // Create auction record if auction type
    if (form.listing_type === 'auction' && listing) {
      await supabase.from('auctions').insert({
        listing_id: listing.id,
        current_price: parseFloat(form.starting_price),
        bid_increment: parseFloat(form.starting_price) < 100 ? 1 : parseFloat(form.starting_price) < 1000 ? 5 : 25,
        starts_at: new Date().toISOString(),
        ends_at: endsAt,
        status: 'live',
      });
    }

    toast({ title: "Listed! 🎉", description: "Your item is now live." });
    setCreating(false);
    setTab("listings");
    setForm({ title: "", description: "", category: "Cards", condition: "New", starting_price: "", buy_now_price: "", listing_type: "auction", ends_in_hours: "24" });
    loadData();
  };

  const statusColors: Record<string, string> = {
    draft: "bg-secondary text-secondary-foreground",
    active: "bg-success/10 text-success",
    sold: "bg-primary/10 text-primary",
    ended: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };

  const orderStatusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    paid: "bg-success/10 text-success",
    shipped: "bg-nab-blue/10 text-nab-blue",
    delivered: "bg-primary/10 text-primary",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-foreground text-lg">Seller Dashboard</h1>
            <p className="text-[10px] text-muted-foreground">{sellerProfile?.shop_name || "My Shop"}</p>
          </div>
          <Button size="sm" className="rounded-xl shimmer-btn gap-1" onClick={() => setTab("create")}>
            <Plus className="w-4 h-4" /> List Item
          </Button>
        </div>
        <div className="flex gap-2 mt-3 max-w-lg mx-auto">
          {(["listings", "orders", "stats"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Stats */}
            {tab === "stats" && (
              <motion.div key="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Total Sales", value: sellerProfile?.total_sales || 0, icon: Package },
                    { label: "Revenue", value: `$${(sellerProfile?.total_revenue || 0).toLocaleString()}`, icon: DollarSign },
                    { label: "Rating", value: sellerProfile?.rating ? `${sellerProfile.rating}⭐` : "N/A", icon: BarChart3 },
                    { label: "Active Listings", value: listings.filter(l => l.status === 'active').length, icon: Clock },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 rounded-2xl bg-card border border-border text-center">
                      <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Listings */}
            {tab === "listings" && (
              <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {listings.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No listings yet</p>
                    <Button className="rounded-xl shimmer-btn" onClick={() => setTab("create")}>Create Your First Listing</Button>
                  </div>
                ) : listings.map((listing, i) => (
                  <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[listing.status] || ''}`}>{listing.status}</span>
                          <span className="text-[10px] text-muted-foreground">{listing.listing_type}</span>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm">{listing.title}</h3>
                        <p className="text-xs text-muted-foreground">{listing.category} · {listing.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">${listing.starting_price}</p>
                        {listing.auctions?.[0] && (
                          <p className="text-xs text-primary">{listing.auctions[0].bid_count} bids</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Orders */}
            {tab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No orders yet</p>
                  </div>
                ) : orders.map((order, i) => (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl bg-card border border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${orderStatusColors[order.status] || ''}`}>{order.status}</span>
                        <h3 className="font-semibold text-foreground text-sm mt-1">{order.listings?.title || 'Unknown'}</h3>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">${order.amount}</p>
                        <p className="text-[10px] text-muted-foreground">Fee: ${order.platform_fee}</p>
                      </div>
                    </div>
                    {order.status === 'paid' && (
                      <Button size="sm" className="mt-3 rounded-xl w-full text-xs" onClick={async () => {
                        await supabase.from('orders').update({ status: 'shipped' }).eq('id', order.id);
                        loadData();
                        toast({ title: "Marked as shipped ✈️" });
                      }}>
                        Mark as Shipped
                      </Button>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Create Listing */}
            {tab === "create" && (
              <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h2 className="font-heading font-bold text-foreground text-lg">New Listing</h2>

                <div className="space-y-3">
                  <Input placeholder="Item title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-secondary/50 border-border h-12 rounded-xl" />
                  <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-secondary/50 border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />

                  <div className="grid grid-cols-2 gap-3">
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-secondary/50 border border-border rounded-xl h-12 px-3 text-sm text-foreground">
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} className="bg-secondary/50 border border-border rounded-xl h-12 px-3 text-sm text-foreground">
                      {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Listing type */}
                  <div className="flex flex-wrap gap-2">
                    {(["auction", "buy_now", "break", "grab_bag"] as ListingType[]).map(t => (
                      <button key={t} onClick={() => setForm({ ...form, listing_type: t })} className={`px-3 py-1.5 rounded-full text-xs font-medium ${form.listing_type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                        {t.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">{form.listing_type === 'auction' ? 'Starting Price *' : 'Price *'}</label>
                      <Input type="number" placeholder="0.00" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} className="bg-secondary/50 border-border h-12 rounded-xl" />
                    </div>
                    {form.listing_type === 'auction' && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Buy Now Price</label>
                        <Input type="number" placeholder="Optional" value={form.buy_now_price} onChange={(e) => setForm({ ...form, buy_now_price: e.target.value })} className="bg-secondary/50 border-border h-12 rounded-xl" />
                      </div>
                    )}
                  </div>

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
                </div>

                <Button className="w-full h-12 rounded-xl shimmer-btn font-semibold" onClick={createListing} disabled={creating || !form.title || !form.starting_price}>
                  {creating ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Creating...</> : "List Item"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Sell;
