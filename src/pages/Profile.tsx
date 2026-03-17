import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, ShoppingBag, Star, Zap, Heart, Bell, DollarSign, Moon, Shield, Trash2, LogOut, ChevronRight, Loader2, Package, BarChart3, Gift, Brain, MapPin, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import usePageMeta from "@/hooks/usePageMeta";
import NabbitLogo from "@/components/NabbitLogo";
import { computeBadges } from "@/lib/xp";
import ProfileHero from "@/components/profile/ProfileHero";
import AITasteDNA from "@/components/profile/AITasteDNA";
import BadgesGrid from "@/components/profile/BadgesGrid";
import ShippingAddresses from "@/components/profile/ShippingAddresses";
import ActivityTimeline from "@/components/profile/ActivityTimeline";
import { guessItemImage } from "@/lib/images";

const Profile = () => {
  usePageMeta({ title: "Profile — nabbit.ai", description: "View your nabbit profile, saved items, and settings.", path: "/profile" });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<"overview" | "saved" | "history" | "settings">("overview");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [tasteTags, setTasteTags] = useState<string[]>([]);
  const [avatarEmoji, setAvatarEmoji] = useState("🐇");
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [dreamCount, setDreamCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [totalXp, setTotalXp] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [aiTasteSummary, setAiTasteSummary] = useState<any>({});
  const [aiEnabled, setAiEnabled] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [dealCount, setDealCount] = useState(0);
  const [crewCount, setCrewCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [memberSince, setMemberSince] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const [profileRes, savedRes, dreamRes, ordersRes, addressRes, interactionsRes, dealsRes, crewsRes, referralsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("saved_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("dream_buys").select("id").eq("user_id", user.id),
      supabase.from("orders").select("*, listings(title, category)").eq("buyer_id", user.id).order("created_at", { ascending: false }),
      supabase.from("shipping_addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
      supabase.from("buyer_interactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30),
      supabase.from("group_deal_participants").select("id").eq("user_id", user.id),
      supabase.from("tribe_memberships").select("id").eq("user_id", user.id),
      supabase.from("referrals").select("id").eq("referrer_id", user.id).eq("status", "completed"),
    ]);

    if (profileRes.data) {
      const p = profileRes.data;
      setDisplayName(p.display_name || user.user_metadata?.display_name || "nabbit User");
      setBio((p as any).bio || "");
      setTasteTags(p.taste_tags || []);
      setAvatarEmoji(p.avatar_emoji || "🐇");
      setTotalXp(p.total_xp || 0);
      setStreakDays(p.streak_days || 0);
      setAiTasteSummary((p as any).ai_taste_summary || {});
      setAiEnabled((p as any).ai_learning_enabled !== false);
      setMemberSince(p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "");
    }

    const orders = ordersRes.data || [];
    setSavedItems(savedRes.data || []);
    setSavedCount(savedRes.data?.length || 0);
    setDreamCount(dreamRes.data?.length || 0);
    setOrderHistory(orders);
    setAddresses(addressRes.data || []);
    setInteractions(interactionsRes.data || []);
    setDealCount(dealsRes.data?.length || 0);
    setCrewCount(crewsRes.data?.length || 0);
    setReferralCount(referralsRes.data?.length || 0);
    setTotalSpent(orders.reduce((sum: number, o: any) => sum + (o.amount || 0), 0));
    setLoading(false);
  };

  const handleSave = async () => {
    setEditing(false);
    if (!user) return;
    await supabase.from("profiles").update({ display_name: displayName, bio } as any).eq("id", user.id);
  };

  const handleSignOut = async () => { await signOut(); navigate("/login"); };

  const handleDeleteSaved = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    setSavedItems(prev => prev.filter(i => i.id !== id));
    setSavedCount(prev => prev - 1);
  };

  const badges = computeBadges({
    orders: orderHistory.length, saved: savedCount, dreams: dreamCount,
    deals: dealCount, crews: crewCount, referrals: referralCount,
    streakDays, totalXp, totalSpent,
  });

  const settingsGroups = [
    { label: "Preferences", items: [{ icon: Bell, label: "Notifications", value: "On" }, { icon: DollarSign, label: "Currency", value: "USD" }, { icon: Moon, label: "Theme", value: "System" }] },
    { label: "Insights", items: [{ icon: BarChart3, label: "Analytics Dashboard", value: "", action: () => navigate("/analytics") }, { icon: Gift, label: "Invite Friends (500 XP)", value: "", action: () => navigate("/referrals") }] },
    { label: "Account", items: [{ icon: Star, label: "Subscription", value: "Free" }, { icon: Shield, label: "Privacy & Data", value: "" }] },
    { label: "Danger Zone", items: [{ icon: Trash2, label: "Delete Account", value: "", danger: true }, { icon: LogOut, label: "Sign Out", value: "", danger: true, action: handleSignOut }] },
  ];

  const tabs = [
    { key: "overview" as const, label: "Overview", icon: Brain },
    { key: "saved" as const, label: "Saved", icon: Star },
    { key: "history" as const, label: "Orders", icon: Package },
    { key: "settings" as const, label: "Settings", icon: Shield },
  ];

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
        <Loader2 className="w-7 h-7 text-primary" />
      </motion.div>
      <span className="text-xs text-muted-foreground font-medium">Loading profile...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <NabbitLogo size="sm" />
          <h1 className="font-heading font-black text-foreground text-base tracking-tight flex-1">PROFILE</h1>
          <button onClick={() => setEditing(!editing)} className="p-2 rounded-xl hover:bg-secondary/50 transition-colors">
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        <ProfileHero
          avatarEmoji={avatarEmoji} displayName={displayName} email={user?.email}
          bio={bio} totalXp={totalXp} streakDays={streakDays}
          personalityTag={aiTasteSummary.personality_tag || "Early Access Member"}
          memberSince={memberSince} editing={editing}
          onNameChange={setDisplayName} onBioChange={setBio} onSave={handleSave}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ShoppingBag, label: "Orders", value: String(orderHistory.length), color: "text-primary", bg: "from-primary/10 to-accent/10", border: "border-primary/20" },
            { icon: Star, label: "Saved", value: String(savedCount), color: "text-nab-cyan", bg: "from-nab-cyan/10 to-primary/10", border: "border-nab-cyan/20" },
            { icon: Zap, label: "Dream Buys", value: String(dreamCount), color: "text-nab-blue", bg: "from-nab-blue/10 to-primary/10", border: "border-nab-blue/20" },
            { icon: Heart, label: "Gave Back", value: "$0", color: "text-nab-purple", bg: "from-nab-purple/10 to-accent/10", border: "border-nab-purple/20" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
              className={`relative overflow-hidden p-3 rounded-2xl glass-card border ${s.border} text-center`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-30`} />
              <div className="relative z-10">
                <s.icon className={`w-4 h-4 mx-auto ${s.color} mb-1.5`} />
                <p className="text-lg font-heading font-black text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-full text-[11px] font-black capitalize transition-all uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 ${
                tab === t.key
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]"
                  : "bg-secondary/30 text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground"
              }`}>
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <AITasteDNA tasteSummary={aiTasteSummary} aiEnabled={aiEnabled}
              onRefresh={(s) => setAiTasteSummary({ ...s, updated_at: new Date().toISOString() })} />
            <BadgesGrid badges={badges} />
            <ShippingAddresses addresses={addresses} onUpdate={fetchProfile} />
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recent Activity</h3>
              <ActivityTimeline interactions={interactions} />
            </div>
          </motion.div>
        )}

        {tab === "saved" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
            {savedItems.length > 0 ? savedItems.map((item: any, i: number) => (
              <motion.div key={item.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-3.5 p-3 rounded-2xl glass-card border border-border/50 group overflow-hidden">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border/50">
                  <img src={guessItemImage(item.item_name)} alt={item.item_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{item.item_name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.category}</p>
                </div>
                <span className="font-heading font-black text-foreground text-sm">${item.price?.toLocaleString() || "—"}</span>
                <button onClick={() => handleDeleteSaved(item.id)}
                  className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </motion.div>
                <p className="text-foreground font-heading font-bold">No saved items yet</p>
                <p className="text-xs text-muted-foreground mt-1">Nab some drops from the feed!</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "history" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
            {orderHistory.length > 0 ? orderHistory.map((order: any, i: number) => (
              <motion.div key={order.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card border border-border/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/10 to-emerald-500/10 border border-success/20 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{order.listings?.title || "Item"}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-muted-foreground font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                    <span className="text-[10px] text-muted-foreground/40">·</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      order.status === "completed" ? "text-success bg-success/10" :
                      order.status === "shipped" ? "text-nab-blue bg-nab-blue/10" :
                      "text-muted-foreground bg-secondary/50"
                    }`}>{order.status}</span>
                  </div>
                </div>
                <span className="font-heading font-black text-foreground text-sm">${order.amount}</span>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nab-blue/10 to-primary/10 border border-nab-blue/20 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-nab-blue" />
                </motion.div>
                <p className="text-foreground font-heading font-bold">No purchases yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your nabs will show up here</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {tab === "settings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {settingsGroups.map((group) => (
              <div key={group.label}>
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 px-1">{group.label}</h3>
                <div className="rounded-2xl glass-card border border-border/50 overflow-hidden divide-y divide-border/30">
                  {group.items.map((item) => (
                    <button key={item.label} onClick={(item as any).action || undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/20 ${
                        (item as any).danger ? "text-destructive" : "text-foreground"
                      }`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        (item as any).danger ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/50 border border-border/50"
                      }`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {item.value && <span className="text-[10px] text-muted-foreground font-medium bg-secondary/30 px-2 py-0.5 rounded-full">{item.value}</span>}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Profile;
