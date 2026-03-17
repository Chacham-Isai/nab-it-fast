import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, ShoppingBag, TrendingUp, BarChart3, Package, AlertCircle } from "lucide-react";
import NabbitLogo from "@/components/NabbitLogo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  usePageMeta({ title: "Admin Dashboard — nabbit.ai", description: "Platform management dashboard.", path: "/admin" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, listings: 0, orders: 0, revenue: 0, activeDeals: 0, waitlist: 0 });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) checkAdminAndLoad();
  }, [user]);

  const checkAdminAndLoad = async () => {
    if (!user) return;
    // Check admin role
    const { data: role } = await supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!role) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    setIsAdmin(true);

    // Load stats in parallel
    const [profilesRes, listingsRes, ordersRes, dealsRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("listings").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("amount"),
      supabase.from("group_deals").select("id", { count: "exact", head: true }).eq("status", "active"),
    ]);

    const totalRevenue = (ordersRes.data || []).reduce((s: number, o: any) => s + (o.amount || 0), 0);

    setStats({
      users: profilesRes.count || 0,
      listings: listingsRes.count || 0,
      orders: ordersRes.data?.length || 0,
      revenue: totalRevenue,
      activeDeals: dealsRes.count || 0,
      waitlist: 0,
    });

    // Recent data
    const [usersRes, lstRes, ordRes] = await Promise.all([
      supabase.from("profiles").select("id, display_name, avatar_emoji, created_at, total_xp").order("created_at", { ascending: false }).limit(10),
      supabase.from("listings").select("id, title, category, starting_price, status, created_at").order("created_at", { ascending: false }).limit(10),
      supabase.from("orders").select("id, amount, status, created_at, buyer_id, listing_id").order("created_at", { ascending: false }).limit(10),
    ]);

    setRecentUsers(usersRes.data || []);
    setRecentListings(lstRes.data || []);
    setRecentOrders(ordRes.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 px-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h1 className="text-xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground text-center text-sm">You don't have admin privileges.</p>
        <Button onClick={() => navigate("/")} variant="outline">Go Home</Button>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Users", value: stats.users, color: "text-primary" },
    { icon: ShoppingBag, label: "Listings", value: stats.listings, color: "text-accent" },
    { icon: Package, label: "Orders", value: stats.orders, color: "text-success" },
    { icon: TrendingUp, label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, color: "text-primary" },
    { icon: BarChart3, label: "Active Deals", value: stats.activeDeals, color: "text-accent" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <NabbitLogo />
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Admin Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statCards.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30"><tr>
                    <th className="text-left p-3 text-muted-foreground font-medium">User</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">XP</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Joined</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {recentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-secondary/10">
                        <td className="p-3 flex items-center gap-2">
                          <span className="text-lg">{u.avatar_emoji || "🐇"}</span>
                          <span className="font-medium text-foreground">{u.display_name || "Anonymous"}</span>
                        </td>
                        <td className="p-3 text-primary font-semibold">{u.total_xp?.toLocaleString()}</td>
                        <td className="p-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="listings">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30"><tr>
                    <th className="text-left p-3 text-muted-foreground font-medium">Title</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Price</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {recentListings.map((l) => (
                      <tr key={l.id} className="hover:bg-secondary/10 cursor-pointer" onClick={() => navigate(`/listing/${l.id}`)}>
                        <td className="p-3 font-medium text-foreground truncate max-w-[200px]">{l.title}</td>
                        <td className="p-3 text-muted-foreground capitalize">{l.category}</td>
                        <td className="p-3 text-foreground">${l.starting_price}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-secondary text-muted-foreground'}`}>{l.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/30"><tr>
                    <th className="text-left p-3 text-muted-foreground font-medium">Order ID</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-secondary/10">
                        <td className="p-3 font-mono text-xs text-foreground">{o.id.slice(0, 8)}…</td>
                        <td className="p-3 text-foreground font-semibold">${o.amount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            o.status === 'paid' ? 'bg-green-500/10 text-green-600' :
                            o.status === 'shipped' ? 'bg-blue-500/10 text-blue-600' :
                            'bg-secondary text-muted-foreground'
                          }`}>{o.status}</span>
                        </td>
                        <td className="p-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
