import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-amber-500", label: "Pending" },
  paid: { icon: Package, color: "text-green-500", label: "Paid" },
  shipped: { icon: Truck, color: "text-blue-500", label: "Shipped" },
  delivered: { icon: CheckCircle, color: "text-primary", label: "Delivered" },
};

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, listings(title, category)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    loadOrders();
  }, [user]);

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
          </div>
        ) : orders.map((order, i) => {
          const cfg = statusConfig[order.status] || statusConfig.pending;
          const Icon = cfg.icon;
          return (
            <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${cfg.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{order.listings?.title || 'Item'}</h3>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} · {cfg.label}</p>
                </div>
                <p className="font-bold text-foreground">${order.amount}</p>
              </div>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-xs text-primary hover:underline">
                  Track Package →
                </a>
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
