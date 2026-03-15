import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2, Star, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import ReviewForm from "@/components/reviews/ReviewForm";
import usePageMeta from "@/hooks/usePageMeta";

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-[hsl(40_90%_55%)]", label: "Pending Payment" },
  paid: { icon: Package, color: "text-success", label: "Paid — Awaiting Shipment" },
  shipped: { icon: Truck, color: "text-nab-blue", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-primary", label: "Delivered" },
};

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Stripe success redirect
    if (searchParams.get("success") === "true") {
      toast({ title: "🎉 Payment successful!", description: "Your order has been placed." });
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    const [{ data: orderData }, { data: reviewData }] = await Promise.all([
      supabase
        .from('orders')
        .select('*, listings(title, category, images, listing_type)')
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg">My Orders</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1">Items you purchase will appear here</p>
            <Button className="mt-4 rounded-xl" onClick={() => navigate("/browse")}>Browse Items</Button>
          </div>
        ) : orders.map((order, i) => {
          const cfg = statusConfig[order.status] || statusConfig.pending;
          const Icon = cfg.icon;
          const listing = order.listings;
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                  {listing?.images?.[0] ? (
                    <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">{listing?.listing_type === 'auction' ? '🔨' : '🛍️'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                    <span className="text-[10px] font-medium text-muted-foreground">{cfg.label}</span>
                  </div>
                  <h3 className="font-semibold text-foreground text-sm truncate">{listing?.title || 'Item'}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-foreground">${order.amount}</p>
              </div>

              {/* Tracking info */}
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <ExternalLink className="w-3 h-3" /> Track Package {order.tracking_number && `(${order.tracking_number})`}
                </a>
              )}

              {/* Confirm delivery */}
              {order.status === 'shipped' && (
                <Button variant="outline" size="sm" className="mt-3 rounded-xl w-full text-xs gap-1" onClick={() => confirmDelivery(order.id)}>
                  <CheckCircle className="w-3.5 h-3.5" /> Confirm Delivery
                </Button>
              )}

              {/* Review form for delivered orders */}
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

              {/* View listing */}
              {listing && (
                <button onClick={() => navigate(`/listing/${order.listing_id}`)} className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  View listing →
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Orders;
