import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SwipeBackEdge from "@/components/SwipeBackEdge";
import PullToRefresh from "@/components/PullToRefresh";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2, Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import ReviewForm from "@/components/reviews/ReviewForm";
import GrabBagReveal from "@/components/GrabBagReveal";
import usePageMeta from "@/hooks/usePageMeta";
import { awardXP } from "@/lib/xp";
import NabbitLogo from "@/components/NabbitLogo";
import OrdersSkeleton from "@/components/skeletons/OrdersSkeleton";

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-[hsl(40_90%_55%)]", label: "Pending Payment" },
  paid: { icon: Package, color: "text-success", label: "Paid — Awaiting Shipment" },
  shipped: { icon: Truck, color: "text-nab-blue", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-primary", label: "Delivered" },
};

const Orders = () => {
  usePageMeta({ title: "Orders — nabbit.ai", description: "Track your purchases and confirm deliveries.", path: "/orders" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set());
  const [revealedOrderIds, setRevealedOrderIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("nabbit_revealed_bags");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "🎉 Payment successful!", description: "Your order has been placed." });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    loadOrders();

    // Real-time order status updates
    const channel = supabase
      .channel('my-orders')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `buyer_id=eq.${user.id}` }, (payload) => {
        setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
        const status = (payload.new as any).status;
        if (status === 'shipped') toast({ title: "📦 Your order shipped!", description: "Check tracking details." });
        if (status === 'delivered') toast({ title: "✅ Order delivered!" });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const loadOrders = async () => {
    const [{ data: orderData }, { data: reviewData }] = await Promise.all([
      supabase
        .from('orders')
        .select('*, listings(title, category, images, listing_type, metadata)')
        .eq('buyer_id', user!.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('reviews')
        .select('order_id')
        .eq('reviewer_id', user!.id),
    ]);
    setOrders(orderData || []);
    setReviewedOrderIds(new Set((reviewData || []).map((r: any) => r.order_id)));
    setLoading(false);
  };

  const confirmDelivery = async (orderId: string) => {
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    toast({ title: "📦 Delivery confirmed!" });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o));
  };

  const handleBagRevealed = useCallback((orderId: string, rarity: string) => {
    setRevealedOrderIds(prev => {
      const next = new Set(prev);
      next.add(orderId);
      localStorage.setItem("nabbit_revealed_bags", JSON.stringify([...next]));
      return next;
    });
    if (user) awardXP(user.id, "open_grab_bag");
    const labels: Record<string, string> = {
      legendary: "🏆 LEGENDARY pull!",
      ultra: "🔥 Ultra Hit!",
      rare: "⭐ Rare Hit!",
      common: "📦 Nice hit!",
    };
    toast({ title: labels[rarity] || "Bag opened!", description: "Your item will ship soon." });
  }, [user]);

  const isGrabBag = (order: any) => order.listings?.listing_type === "grab_bag";
  const canReveal = (order: any) =>
    isGrabBag(order) && order.status === "paid" && !revealedOrderIds.has(order.id);

  return (
    <SwipeBackEdge>
    <PullToRefresh onRefresh={async () => { await loadOrders(); }}>
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <NabbitLogo size="sm" />
          <h1 className="font-heading font-black text-foreground text-lg tracking-tight flex-1">MY ORDERS</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <OrdersSkeleton />
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Package className="w-14 h-14 text-primary/40 mx-auto mb-4" />
            </motion.div>
            <p className="font-heading font-bold text-foreground mb-1">No orders yet</p>
            <p className="text-xs text-muted-foreground mb-4">Items you purchase will appear here</p>
            <Button className="rounded-full shimmer-btn font-bold" onClick={() => navigate("/browse")}>Browse Items</Button>
          </motion.div>
        ) : orders.map((order, i) => {
          const cfg = statusConfig[order.status] || statusConfig.pending;
          const Icon = cfg.icon;
          const listing = order.listings;
          const grabBagReady = canReveal(order);
          const grabBagOpened = isGrabBag(order) && revealedOrderIds.has(order.id);
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`glass-card gradient-border p-4 ${grabBagReady ? "!border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.15)]" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-secondary/50 flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                  {listing?.images?.[0] ? (
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{listing?.listing_type === 'grab_bag' ? '📦' : listing?.listing_type === 'auction' ? '🔨' : '🛍️'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{cfg.label}</span>
                  </div>
                  <h3 className="font-heading font-bold text-foreground text-sm truncate">{listing?.title || 'Item'}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="font-heading font-black text-foreground">${order.amount}</p>
              </div>

              {grabBagReady && (
                <GrabBagReveal
                  orderId={order.id}
                  category={listing?.category || "other"}
                  title={listing?.title || "Grab Bag"}
                  odds={(listing?.metadata as any)?.odds}
                  onRevealed={handleBagRevealed}
                />
              )}

              {grabBagOpened && (
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-base">✨</span> Bag opened — item ships in 2–3 days
                </p>
              )}

              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                  <ExternalLink className="w-3 h-3" /> Track Package {order.tracking_number && `(${order.tracking_number})`}
                </a>
              )}

              {order.status === 'shipped' && (
                <Button variant="outline" size="sm" className="mt-3 rounded-full w-full text-xs gap-1 border-border/50 hover:border-primary/40" onClick={() => confirmDelivery(order.id)}>
                  <CheckCircle className="w-3.5 h-3.5" /> Confirm Delivery
                </Button>
              )}

              {order.status === 'delivered' && !reviewedOrderIds.has(order.id) && (
                <ReviewForm
                  orderId={order.id}
                  sellerId={order.seller_id}
                  reviewerId={user!.id}
                  onSubmitted={loadOrders}
                />
              )}
              {order.status === 'delivered' && reviewedOrderIds.has(order.id) && (
                <p className="mt-3 text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" /> Review submitted
                </p>
              )}

              {listing && !grabBagReady && (
                <button onClick={() => navigate(`/listing/${order.listing_id}`)} className="mt-2 text-xs text-primary font-semibold hover:underline transition-colors">
                  View listing →
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
    </SwipeBackEdge>
  );
};

export default Orders;
