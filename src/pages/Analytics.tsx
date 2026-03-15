import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, Users, Zap, BarChart3, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
  FunnelChart, Funnel, LabelList,
} from "recharts";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(165, 70%, 46%)",
  "hsl(45, 93%, 58%)",
  "hsl(280, 65%, 60%)",
];

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
}

const Analytics = () => {
  usePageMeta({ title: "Analytics — nabbit.ai", description: "Track your engagement and platform metrics.", path: "/analytics" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [swipeData, setSwipeData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [crewGrowth, setCrewGrowth] = useState<any[]>([]);
  const [dealConversion, setDealConversion] = useState<any[]>([]);
  const [funnelData, setFunnelData] = useState<any[]>([]);

  useEffect(() => {
    if (user) loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    setLoading(true);

    const [
      { data: events },
      { data: crews },
      { data: deals },
      { data: memberships },
      { data: orders },
    ] = await Promise.all([
      supabase.from("analytics_events" as any).select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(500),
      supabase.from("crews" as any).select("name, member_count, created_at").eq("is_active", true).order("member_count", { ascending: false }).limit(10),
      supabase.from("group_deals").select("id, title, status, current_participants, target_participants").in("status", ["active", "funded", "completed"]),
      supabase.from("tribe_memberships").select("tribe_name, joined_at").eq("user_id", user!.id),
      supabase.from("orders").select("id, status").eq("buyer_id", user!.id),
    ]);

    const evts = (events as any[]) || [];

    // --- Stats cards ---
    const swipeRights = evts.filter(e => e.event_name === "swipe_right").length;
    const swipeLefts = evts.filter(e => e.event_name === "swipe_left").length;
    const totalSwipes = swipeRights + swipeLefts;
    const nabRate = totalSwipes > 0 ? Math.round((swipeRights / totalSwipes) * 100) : 0;
    const bookmarks = evts.filter(e => e.event_name === "bookmark").length;
    const dealsJoined = evts.filter(e => e.event_name === "group_deal_joined").length;
    const crewsJoined = (memberships as any[])?.length || 0;

    setStats([
      { label: "Total Swipes", value: totalSwipes, icon: <Zap className="w-5 h-5 text-primary" />, change: `${nabRate}% nab rate` },
      { label: "Bookmarks", value: bookmarks, icon: <BarChart3 className="w-5 h-5 text-primary" /> },
      { label: "Deals Joined", value: dealsJoined, icon: <Users className="w-5 h-5 text-primary" /> },
      { label: "Crews", value: crewsJoined, icon: <TrendingUp className="w-5 h-5 text-primary" /> },
    ]);

    // --- Swipe activity by day (last 7 days) ---
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split("T")[0];
    });
    const swipeByDay = last7.map(day => {
      const dayEvents = evts.filter(e => e.created_at?.startsWith(day));
      return {
        day: new Date(day).toLocaleDateString("en", { weekday: "short" }),
        nabbed: dayEvents.filter(e => e.event_name === "swipe_right").length,
        passed: dayEvents.filter(e => e.event_name === "swipe_left").length,
      };
    });
    setSwipeData(swipeByDay);

    // --- Category breakdown from swipe_right events ---
    const catMap: Record<string, number> = {};
    evts.filter(e => e.event_name === "swipe_right").forEach(e => {
      const cat = (e.event_data as any)?.category || "Other";
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const catArr = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    setCategoryData(catArr.length > 0 ? catArr : [{ name: "No data yet", value: 1 }]);

    // --- Crew growth (top crews by member count) ---
    const crewArr = ((crews as any[]) || []).map(c => ({
      name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
      members: c.member_count,
    }));
    setCrewGrowth(crewArr.length > 0 ? crewArr : [{ name: "No crews yet", members: 0 }]);

    // --- Deal conversion ---
    const allDeals = (deals as any[]) || [];
    const active = allDeals.filter(d => d.status === "active").length;
    const funded = allDeals.filter(d => d.status === "funded").length;
    const completed = allDeals.filter(d => d.status === "completed").length;
    setDealConversion([
      { name: "Active", value: active || 0 },
      { name: "Funded", value: funded || 0 },
      { name: "Completed", value: completed || 0 },
    ]);

    // --- Conversion funnel ---
    const listingsViewed = evts.filter(e => e.event_name === "listing_viewed").length;
    const bidsPlaced = evts.filter(e => e.event_name === "bid_placed").length;
    const ordersCompleted = ((orders as any[]) || []).filter(o => ["completed", "delivered", "shipped"].includes(o.status)).length;
    const totalOrders = ((orders as any[]) || []).length;

    setFunnelData([
      { name: "Viewed", value: listingsViewed || 0, fill: CHART_COLORS[0] },
      { name: "Bid", value: bidsPlaced || 0, fill: CHART_COLORS[1] },
      { name: "Ordered", value: totalOrders || 0, fill: CHART_COLORS[3] },
      { name: "Completed", value: ordersCompleted || 0, fill: CHART_COLORS[4] },
    ]);

    setLoading(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs font-medium text-foreground">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-xs text-muted-foreground">
            {p.name}: <span className="font-bold text-foreground">{p.value}</span>
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-heading font-bold text-foreground text-lg">Analytics</h1>
            <p className="text-xs text-muted-foreground">Your engagement metrics</p>
          </div>
          <Button variant="ghost" size="icon" onClick={loadAnalytics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <Card key={i} className="p-4 bg-card border-border">
                <div className="flex items-center gap-2 mb-1">
                  {s.icon}
                  <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
                </div>
                <p className="text-2xl font-heading font-bold text-foreground">{s.value}</p>
                {s.change && <p className="text-xs text-primary font-medium mt-0.5">{s.change}</p>}
              </Card>
            ))}
          </div>

          {/* Swipe Activity */}
          <Card className="p-4 bg-card border-border">
            <h3 className="font-heading font-bold text-foreground text-sm mb-4">Swipe Activity (7 Days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={swipeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="nabbed" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} name="Nabbed" />
                <Area type="monotone" dataKey="passed" stackId="1" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.15} name="Passed" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Category Breakdown + Deal Conversion side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Card className="p-4 bg-card border-border">
              <h3 className="font-heading font-bold text-foreground text-sm mb-4">Top Categories Nabbed</h3>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4 bg-card border-border">
              <h3 className="font-heading font-bold text-foreground text-sm mb-4">Deal Funnel</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dealConversion} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Deals">
                    {dealConversion.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Crew Growth */}
          <Card className="p-4 bg-card border-border">
            <h3 className="font-heading font-bold text-foreground text-sm mb-4">Top Crews by Members</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={crewGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="members" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} name="Members" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Analytics;
