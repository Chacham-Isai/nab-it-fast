import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, TrendingUp, Users, ShoppingBag, Package, Eye, BarChart3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import NabbitLogo from "@/components/NabbitLogo";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import { format, subDays, startOfDay, parseISO } from "date-fns";

type DateRange = "7d" | "30d" | "90d" | "all";

const CHART_COLORS = [
  "hsl(190 100% 50%)",   // cyan / primary
  "hsl(267 100% 60%)",   // purple / accent
  "hsl(142 69% 45%)",    // green / success
  "hsl(216 100% 55%)",   // blue
  "hsl(40 90% 55%)",     // amber
  "hsl(0 84% 60%)",      // red
];

const SellerAnalytics = () => {
  usePageMeta({ title: "Seller Analytics — nabbit.ai", description: "Track your sales performance, revenue, and buyer insights.", path: "/seller-analytics" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [range, setRange] = useState<DateRange>("30d");
  const [orders, setOrders] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    const [spRes, ordRes, lsRes] = await Promise.all([
      supabase.from("seller_profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("orders").select("*, listings(title, category, listing_type)").eq("seller_id", user.id).order("created_at", { ascending: true }),
      supabase.from("listings").select("*").eq("seller_id", user.id),
    ]);
    setSellerProfile(spRes.data);
    setOrders(ordRes.data || []);
    setListings(lsRes.data || []);
    setLoading(false);
  };

  const cutoff = useMemo(() => {
    if (range === "all") return null;
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    return startOfDay(subDays(new Date(), days));
  }, [range]);

  const filteredOrders = useMemo(() => {
    if (!cutoff) return orders;
    return orders.filter((o) => new Date(o.created_at) >= cutoff);
  }, [orders, cutoff]);

  // ---------- KPI cards ----------
  const totalRevenue = filteredOrders.filter(o => ["paid", "shipped", "delivered"].includes(o.status)).reduce((s, o) => s + Number(o.amount), 0);
  const totalOrders = filteredOrders.filter(o => o.status !== "failed").length;
  const paidOrders = filteredOrders.filter(o => ["paid", "shipped", "delivered"].includes(o.status)).length;
  const conversionRate = totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(1) : "0";
  const avgOrderValue = paidOrders > 0 ? (totalRevenue / paidOrders).toFixed(2) : "0";

  // ---------- Revenue over time ----------
  const revenueTimeline = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders
      .filter((o) => ["paid", "shipped", "delivered"].includes(o.status))
      .forEach((o) => {
        const day = format(parseISO(o.created_at), "MMM dd");
        map.set(day, (map.get(day) || 0) + Number(o.amount));
      });
    return Array.from(map.entries()).map(([date, revenue]) => ({ date, revenue: +revenue.toFixed(2) }));
  }, [filteredOrders]);

  // ---------- Orders by status ----------
  const ordersByStatus = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => map.set(o.status, (map.get(o.status) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredOrders]);

  // ---------- Category breakdown ----------
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => {
      const cat = o.listings?.category || "other";
      map.set(cat, (map.get(cat) || 0) + Number(o.amount));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value: +value.toFixed(2) }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  // ---------- Listing type split ----------
  const listingTypeSplit = useMemo(() => {
    const map = new Map<string, number>();
    listings.forEach((l) => map.set(l.listing_type, (map.get(l.listing_type) || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name: name.replace("_", " "), value }));
  }, [listings]);

  // ---------- Conversion funnel ----------
  const funnel = useMemo(() => {
    const totalListings = listings.filter(l => l.status === "active" || l.status === "sold").length;
    const ordersCreated = filteredOrders.length;
    const paid = filteredOrders.filter(o => ["paid", "shipped", "delivered"].includes(o.status)).length;
    const delivered = filteredOrders.filter(o => o.status === "delivered").length;
    return [
      { stage: "Listed", count: totalListings },
      { stage: "Ordered", count: ordersCreated },
      { stage: "Paid", count: paid },
      { stage: "Delivered", count: delivered },
    ];
  }, [listings, filteredOrders]);

  const kpis = [
    { label: "Revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, accent: "text-success" },
    { label: "Orders", value: paidOrders, icon: ShoppingBag, accent: "text-primary" },
    { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, accent: "text-accent" },
    { label: "Avg Order", value: `$${avgOrderValue}`, icon: BarChart3, accent: "text-[hsl(var(--nab-blue))]" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <button onClick={() => navigate("/sell")}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <NabbitLogo size="sm" />
          <div className="flex-1">
            <h1 className="font-heading font-black text-foreground text-lg tracking-tight">SELLER ANALYTICS</h1>
            <p className="text-[10px] text-muted-foreground font-medium">{sellerProfile?.shop_name || "My Shop"}</p>
          </div>
        </div>
        {/* Range toggle */}
        <div className="flex gap-2 mt-3 max-w-3xl mx-auto">
          {(["7d", "30d", "90d", "all"] as DateRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                range === r
                  ? "bg-gradient-to-r from-primary to-[hsl(var(--nab-cyan))] text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                  : "bg-secondary/60 text-secondary-foreground border border-border/50"
              }`}
            >
              {r === "all" ? "All Time" : r}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card gradient-border">
                <CardContent className="p-4 text-center">
                  <div className="w-9 h-9 rounded-xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mx-auto mb-2">
                    <kpi.icon className={`w-4 h-4 ${kpi.accent}`} />
                  </div>
                  <p className="text-xl font-heading font-black text-foreground">{kpi.value}</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{kpi.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue timeline */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Revenue Over Time</CardTitle>
              <CardDescription className="text-xs">Daily sales revenue</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueTimeline.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No revenue data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenueTimeline}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(190 100% 50%)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(190 100% 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 50% / 0.1)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(240 20% 8%)", border: "1px solid hsl(240 10% 20%)", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "hsl(0 0% 100%)" }}
                      formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(190 100% 50%)" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Conversion Funnel */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Conversion Funnel</CardTitle>
              <CardDescription className="text-xs">From listing to delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 50% / 0.1)" />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} />
                  <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "hsl(240 5% 40%)" }} width={70} />
                  <Tooltip
                    contentStyle={{ background: "hsl(240 20% 8%)", border: "1px solid hsl(240 10% 20%)", borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: "hsl(0 0% 100%)" }}
                  />
                  <Bar dataKey="count" fill="hsl(267 100% 60%)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Category breakdown */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <Card className="glass-card gradient-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading font-bold">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {categoryBreakdown.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">No data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                        {categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} contentStyle={{ background: "hsl(240 20% 8%)", border: "1px solid hsl(240 10% 20%)", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Listing type split */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="glass-card gradient-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-heading font-bold">Listings by Type</CardTitle>
              </CardHeader>
              <CardContent>
                {listingTypeSplit.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">No listings yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={listingTypeSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} label={({ name, value }) => `${name}: ${value}`} fontSize={10}>
                        {listingTypeSplit.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(240 20% 8%)", border: "1px solid hsl(240 10% 20%)", borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Order status breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="glass-card gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Orders by Status</CardTitle>
            </CardHeader>
            <CardContent>
              {ordersByStatus.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No orders yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={ordersByStatus}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 10% 50% / 0.1)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(240 5% 40%)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(240 5% 40%)" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(240 20% 8%)", border: "1px solid hsl(240 10% 20%)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "hsl(0 0% 100%)" }} />
                    <Bar dataKey="value" fill="hsl(190 100% 50%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top items table */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card gradient-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-heading font-bold">Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.filter(o => ["paid", "shipped", "delivered"].includes(o.status)).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-10">No sales yet</p>
              ) : (
                <div className="space-y-2">
                  {(() => {
                    const itemMap = new Map<string, { title: string; count: number; revenue: number }>();
                    filteredOrders
                      .filter(o => ["paid", "shipped", "delivered"].includes(o.status))
                      .forEach(o => {
                        const title = o.listings?.title || "Unknown";
                        const existing = itemMap.get(o.listing_id) || { title, count: 0, revenue: 0 };
                        existing.count += 1;
                        existing.revenue += Number(o.amount);
                        itemMap.set(o.listing_id, existing);
                      });
                    return Array.from(itemMap.values())
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 5)
                      .map((item, i) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-muted-foreground w-5">{i + 1}</span>
                            <div>
                              <p className="text-sm font-heading font-bold text-foreground truncate max-w-[200px]">{item.title}</p>
                              <p className="text-[10px] text-muted-foreground">{item.count} sale{item.count > 1 ? "s" : ""}</p>
                            </div>
                          </div>
                          <p className="text-sm font-heading font-black text-success">${item.revenue.toFixed(2)}</p>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default SellerAnalytics;
