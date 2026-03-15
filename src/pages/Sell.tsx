import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, DollarSign, BarChart3, Clock, CheckCircle, Loader2, Trash2, Eye, XCircle, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import CreateListingForm from "@/components/sell/CreateListingForm";
import usePageMeta from "@/hooks/usePageMeta";

const Sell = () => {
  usePageMeta({ title: "Sell — nabbit.ai", description: "List items, manage auctions, and track your seller dashboard.", path: "/sell" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [tab, setTab] = useState<"listings" | "orders" | "stats" | "create">("listings");
  const [listings, setListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

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

    const { data: ls } = await supabase
      .from('listings')
      .select('*, auctions(*)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    setListings(ls || []);

    const { data: os } = await supabase
      .from('orders')
      .select('*, listings(title)')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });
    setOrders(os || []);

    setLoading(false);
  };

  const cancelListing = async (id: string) => {
    await supabase.from('listings').update({ status: 'cancelled' }).eq('id', id);
    toast({ title: "Listing cancelled" });
    loadData();
  };

  const deleteListing = async (id: string, status: string) => {
    if (status !== 'draft' && status !== 'cancelled') {
      toast({ title: "Can only delete draft/cancelled listings", variant: "destructive" });
      return;
    }
    await supabase.from('listings').delete().eq('id', id);
    toast({ title: "Listing deleted" });
    loadData();
  };

  const markShipped = async (orderId: string, trackingNumber?: string) => {
    const updates: Record<string, unknown> = { status: 'shipped' };
    if (trackingNumber) {
      updates.tracking_number = trackingNumber;
      updates.tracking_url = trackingNumber.length > 15
        ? `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`
        : `https://www.google.com/search?q=${trackingNumber}+tracking`;
    }
    await supabase.from('orders').update(updates).eq('id', orderId);
    toast({ title: "Marked as shipped ✈️" });
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
    pending: "bg-[hsl(40_90%_55%)]/10 text-[hsl(40_90%_55%)]",
    paid: "bg-success/10 text-success",
    shipped: "bg-nab-blue/10 text-nab-blue",
    delivered: "bg-primary/10 text-primary",
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
              {t} {t === "orders" && orders.filter(o => o.status === 'paid').length > 0 ? `(${orders.filter(o => o.status === 'paid').length})` : ""}
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

                {/* Stripe Connect */}
                {!sellerProfile?.stripe_onboarding_complete && (
                  <div className="p-4 rounded-2xl bg-card border border-primary/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-foreground text-sm">Set Up Payouts</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">Connect your bank account to receive payouts when your items sell.</p>
                    <Button
                      className="w-full rounded-xl shimmer-btn text-xs gap-1"
                      onClick={async () => {
                        try {
                          const { data, error } = await supabase.functions.invoke("create-connect-account");
                          if (error) throw error;
                          if (data?.error) throw new Error(data.error);
                          if (data?.url) window.open(data.url, "_blank");
                        } catch (err: any) {
                          toast({ title: "Setup failed", description: err.message, variant: "destructive" });
                        }
                      }}
                    >
                      <DollarSign className="w-3.5 h-3.5" /> Connect Stripe
                    </Button>
                  </div>
                )}
                {sellerProfile?.stripe_onboarding_complete && (
                  <div className="p-3 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-xs font-medium text-success">Payouts connected</span>
                  </div>
                )}
              </motion.div>
            )}

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
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                        {listing.images?.[0] ? (
                          <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">{listing.listing_type === 'auction' ? '🔨' : '🛍️'}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[listing.status] || ''}`}>{listing.status}</span>
                          <span className="text-[10px] text-muted-foreground">{listing.listing_type.replace('_', ' ')}</span>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm truncate">{listing.title}</h3>
                        <p className="text-xs text-muted-foreground">{listing.category} · {listing.condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">${listing.starting_price}</p>
                        {listing.auctions?.[0] && (
                          <p className="text-xs text-primary">{listing.auctions[0].bid_count} bids</p>
                        )}
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs gap-1 h-8" onClick={() => navigate(`/listing/${listing.id}`)}>
                        <Eye className="w-3 h-3" /> View
                      </Button>
                      {listing.status === 'active' && (
                        <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 h-8 text-destructive hover:text-destructive" onClick={() => cancelListing(listing.id)}>
                          <XCircle className="w-3 h-3" /> Cancel
                        </Button>
                      )}
                      {(listing.status === 'draft' || listing.status === 'cancelled') && (
                        <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 h-8 text-destructive hover:text-destructive" onClick={() => deleteListing(listing.id, listing.status)}>
                          <Trash2 className="w-3 h-3" /> Delete
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

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
                      <div className="mt-3 space-y-2">
                        <Input
                          placeholder="Tracking number (optional)"
                          value={trackingInputs[order.id] || ""}
                          onChange={(e) => setTrackingInputs(p => ({ ...p, [order.id]: e.target.value }))}
                          className="h-9 rounded-xl bg-secondary/50 border-border text-xs"
                        />
                        <Button size="sm" className="rounded-xl w-full text-xs gap-1" onClick={() => markShipped(order.id, trackingInputs[order.id])}>
                          <Truck className="w-3.5 h-3.5" /> Mark as Shipped
                        </Button>
                      </div>
                    )}
                    {order.status === 'shipped' && order.tracking_number && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tracking: <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{order.tracking_number}</a>
                      </p>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {tab === "create" && user && (
              <CreateListingForm user={user} onComplete={() => { setTab("listings"); loadData(); }} />
            )}
          </AnimatePresence>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Sell;
