import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, ShoppingBag, Star, Zap, Heart, Bell, DollarSign, Moon, Shield, Trash2, LogOut, ChevronRight, Loader2, Package, BarChart3, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import usePageMeta from "@/hooks/usePageMeta";
import NabbitLogo from "@/components/NabbitLogo";
import { guessItemImage, getCategoryImage } from "@/lib/images";

const Profile = () => {
  usePageMeta({ title: "Profile — nabbit.ai", description: "View your nabbit profile, saved items, and settings.", path: "/profile" });
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<"saved" | "history" | "settings">("saved");
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || "nabbit User");
  const [tasteTags, setTasteTags] = useState<string[]>([]);
  const [avatarEmoji, setAvatarEmoji] = useState("🐇");
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [dreamCount, setDreamCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) fetchProfile(); }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    const [profileRes, savedRes, dreamRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("saved_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("dream_buys").select("id").eq("user_id", user.id),
      supabase.from("orders").select("*, listings(title, category)").eq("buyer_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (profileRes.data) {
      setDisplayName(profileRes.data.display_name || user.user_metadata?.display_name || "nabbit User");
      setTasteTags(profileRes.data.taste_tags || []);
      setAvatarEmoji(profileRes.data.avatar_emoji || "🐇");
    }
    setSavedItems(savedRes.data || []);
    setSavedCount(savedRes.data?.length || 0);
    setDreamCount(dreamRes.data?.length || 0);
    setOrderHistory(ordersRes.data || []);
    setLoading(false);
  };

  const handleNameSave = async () => { setEditing(false); if (!user) return; await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id); };
  const handleSignOut = async () => { await signOut(); navigate("/login"); };
  const handleDeleteSaved = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    setSavedItems(prev => prev.filter(i => i.id !== id));
    setSavedCount(prev => prev - 1);
  };

  const settingsGroups = [
    { label: "Preferences", items: [{ icon: Bell, label: "Notifications", value: "On" }, { icon: DollarSign, label: "Currency", value: "USD" }, { icon: Moon, label: "Theme", value: "System" }] },
    { label: "Insights", items: [{ icon: BarChart3, label: "Analytics Dashboard", value: "", action: () => navigate("/analytics") }] },
    { label: "Account", items: [{ icon: Star, label: "Subscription", value: "Free" }, { icon: Shield, label: "Privacy & Data", value: "" }] },
    { label: "Danger Zone", items: [{ icon: Trash2, label: "Delete Account", value: "", danger: true }, { icon: LogOut, label: "Sign Out", value: "", danger: true, action: handleSignOut }] },
  ];

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
        <Loader2 className="w-7 h-7 text-primary" />
      </motion.div>
      <span className="text-xs text-muted-foreground font-medium">Loading profile...</span>
    </div>
  );

  const displayTags = tasteTags.length > 0 ? tasteTags : ["Sneakers", "Cards", "Tech", "Watches", "Streetwear"];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ===== HEADER ===== */}
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <NabbitLogo size="sm" />
          <h1 className="font-heading font-black text-foreground text-base tracking-tight flex-1">PROFILE</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <Edit2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-6 space-y-6">
        {/* ===== AVATAR & IDENTITY ===== */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <motion.div
              animate={{ boxShadow: ["0 0 20px hsl(var(--primary)/0.2)", "0 0 40px hsl(var(--primary)/0.35)", "0 0 20px hsl(var(--primary)/0.2)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/30 flex items-center justify-center text-4xl"
            >
              {avatarEmoji}
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -bottom-0.5 right-1 w-5 h-5 rounded-full bg-success border-[3px] border-background"
            />
          </div>

          {editing ? (
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              onBlur={handleNameSave}
              className="text-center max-w-[220px] bg-secondary/30 border-border/50 rounded-xl font-heading font-bold"
              autoFocus
            />
          ) : (
            <h2 className="font-heading font-black text-foreground text-xl">{displayName}</h2>
          )}

          {user?.email && <span className="text-xs text-muted-foreground/70">{user.email}</span>}

          <motion.span
            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-xs font-black uppercase tracking-widest bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--primary)), hsl(var(--nab-blue)), hsl(var(--nab-cyan)))",
              backgroundSize: "200% 100%",
            }}
          >
            Early Access Member
          </motion.span>

          {/* Taste Tags */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {displayTags.slice(0, 6).map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary text-[11px] font-bold">
                {t}
              </span>
            ))}
          </div>
          <button
            onClick={() => navigate("/onboarding")}
            className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors font-medium"
          >
            Edit Taste
          </button>
        </motion.div>

        {/* ===== STATS GRID ===== */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ShoppingBag, label: "Orders", value: String(orderHistory.length), color: "text-primary", bg: "from-primary/10 to-accent/10", border: "border-primary/20" },
            { icon: Star, label: "Saved", value: String(savedCount), color: "text-nab-cyan", bg: "from-nab-cyan/10 to-primary/10", border: "border-nab-cyan/20" },
            { icon: Zap, label: "Dream Buys", value: String(dreamCount), color: "text-nab-blue", bg: "from-nab-blue/10 to-primary/10", border: "border-nab-blue/20" },
            { icon: Heart, label: "Gave Back", value: "$0", color: "text-nab-purple", bg: "from-nab-purple/10 to-accent/10", border: "border-nab-purple/20" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className={`relative overflow-hidden p-3 rounded-2xl glass-card border ${s.border} text-center`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${s.bg} opacity-30`} />
              <div className="relative z-10">
                <s.icon className={`w-4 h-4 mx-auto ${s.color} mb-1.5`} />
                <p className="text-lg font-heading font-black text-foreground">{s.value}</p>
                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ===== TABS ===== */}
        <div className="flex gap-2">
          {(["saved", "history", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-xs font-black capitalize transition-all uppercase tracking-wider ${
                tab === t
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]"
                  : "bg-secondary/30 text-muted-foreground border border-border/50 hover:border-primary/30 hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ===== TAB CONTENT ===== */}
        {tab === "saved" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2.5">
            {savedItems.length > 0 ? savedItems.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-3.5 p-3 rounded-2xl glass-card border border-border/50 group overflow-hidden"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border/50">
                  <img
                    src={guessItemImage(item.item_name)}
                    alt={item.item_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{item.item_name}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{item.category}</p>
                </div>
                <span className="font-heading font-black text-foreground text-sm">${item.price?.toLocaleString() || "—"}</span>
                <button
                  onClick={() => handleDeleteSaved(item.id)}
                  className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
                >
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
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card border border-border/50"
              >
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
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <span className="font-heading font-black text-foreground text-sm">${order.amount}</span>
              </motion.div>
            )) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nab-blue/10 to-primary/10 border border-nab-blue/20 flex items-center justify-center mx-auto mb-4"
                >
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
                    <button
                      key={item.label}
                      onClick={(item as any).action || undefined}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/20 ${
                        (item as any).danger ? "text-destructive" : "text-foreground"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        (item as any).danger
                          ? "bg-destructive/10 border border-destructive/20"
                          : "bg-secondary/50 border border-border/50"
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
