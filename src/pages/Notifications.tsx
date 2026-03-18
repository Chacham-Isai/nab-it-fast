import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SwipeBackEdge from "@/components/SwipeBackEdge";
import { ArrowLeft, Zap, TrendingDown, Users, Heart, ShoppingBag, Loader2, Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import NabbitLogo from "@/components/NabbitLogo";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { toast } from "sonner";

interface NotifItem {
  id: string;
  type: string;
  title: string;
  body: string;
  emoji: string;
  time: string;
  read: boolean;
  urgent?: boolean;
  actionLabel?: string;
}

const mockNotifs: NotifItem[] = [
  { id: "m1", type: "dream_match", title: "Dream Buy Found!", body: "1952 Topps Mickey Mantle — PSA 4 listed at $4,200 (32% below market)", emoji: "🃏", time: "2m ago", read: false, urgent: true, actionLabel: "View Match" },
  { id: "m2", type: "price_drop", title: "Price Drop Alert", body: "Air Jordan 1 Chicago dropped from $380 to $289", emoji: "👟", time: "1h ago", read: false, actionLabel: "View" },
  { id: "m3", type: "group_deal", title: "Group Deal Almost Full!", body: "Nike Dunk Low Pack — 8/10 spots filled. Join now!", emoji: "👟", time: "2h ago", read: false, actionLabel: "Join" },
  { id: "m4", type: "crew", title: "New in Sneakerheads", body: "Alex K. nabbed Air Jordan 1 Chicago for $289", emoji: "🧑‍🎤", time: "3h ago", read: true },
  { id: "m5", type: "giving", title: "Crew Impact", body: "Your round-ups helped raise $1,240 for education this month!", emoji: "❤️", time: "5h ago", read: true },
  { id: "m6", type: "feed", title: "New Drops Ready", body: "15 new items matched to your taste profile", emoji: "📦", time: "8h ago", read: true },
];

const typeIcons: Record<string, { icon: typeof Zap; color: string }> = {
  dream_match: { icon: Zap, color: "text-primary" },
  price_drop: { icon: TrendingDown, color: "text-success" },
  group_deal: { icon: Users, color: "text-nab-blue" },
  crew: { icon: Users, color: "text-nab-purple" },
  giving: { icon: Heart, color: "text-accent" },
  feed: { icon: ShoppingBag, color: "text-muted-foreground" },
};

const filters = ["All", "Unread", "🎯 Dream Buys", "⚡ Group Deals", "📉 Price Drops"] as const;

const Notifications = () => {
  usePageMeta({ title: "Notifications — nabbit.ai", description: "Price drops, dream buy matches, and crew updates.", path: "/notifications" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications();

  const handlePushToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
      toast("Push notifications disabled");
    } else {
      const ok = await subscribe();
      if (ok) toast.success("Push notifications enabled! 🔔");
      else toast.error("Could not enable push notifications");
    }
  };

  useEffect(() => { if (user) fetchNotifications(); }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("notifications_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error || !data || data.length === 0) { setNotifs(mockNotifs); setIsDemo(true); }
    else {
      setNotifs(data.map((n: any) => ({ id: n.id, type: n.type, title: n.title, body: n.body || "", emoji: n.type === "dream_match" ? "🎯" : n.type === "price_drop" ? "📉" : n.type === "group_deal" ? "👥" : "📦", time: new Date(n.created_at).toLocaleDateString(), read: n.is_read, actionLabel: n.action_label })));
      setIsDemo(false);
    }
    setLoading(false);
  };

  const unreadCount = notifs.filter((n) => !n.read).length;
  const markAllRead = async () => { setNotifs(notifs.map((n) => ({ ...n, read: true }))); if (!isDemo && user) await supabase.from("notifications_log").update({ is_read: true }).eq("user_id", user.id); };
  const markRead = async (id: string) => { setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n))); if (!id.startsWith("m") && user) await supabase.from("notifications_log").update({ is_read: true }).eq("id", id); };

  const filtered = notifs.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    if (filter === "🎯 Dream Buys") return n.type === "dream_match";
    if (filter === "⚡ Group Deals") return n.type === "group_deal";
    if (filter === "📉 Price Drops") return n.type === "price_drop";
    return true;
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <NabbitLogo size="sm" />
          <h1 className="font-heading font-black text-foreground text-lg tracking-tight flex-1">NOTIFICATIONS</h1>
          {isSupported && (
            <Button variant="ghost" size="icon" onClick={handlePushToggle} title={isSubscribed ? "Disable push" : "Enable push"}>
              {isSubscribed ? <Bell className="w-4 h-4 text-primary" /> : <BellOff className="w-4 h-4 text-muted-foreground" />}
            </Button>
          )}
          {unreadCount > 0 && (
            <>
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-black">{unreadCount}</span>
              <Button variant="ghost" size="sm" className="text-xs text-primary font-bold" onClick={markAllRead}>Mark all read</Button>
            </>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 max-w-lg mx-auto">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filter === f ? "bg-gradient-to-r from-primary to-[hsl(var(--nab-cyan))] text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]" : "bg-secondary/60 text-secondary-foreground border border-border/50"}`}>{f}{f === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}</button>
          ))}
        </div>
      </div>

      {/* Notification list */}
      <div className="max-w-lg mx-auto px-4 space-y-2">
        {filtered.map((n, i) => {
          const typeInfo = typeIcons[n.type] || typeIcons.feed;
          const Icon = typeInfo.icon;
          return (
            <motion.button key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} onClick={() => markRead(n.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all glass-card ${!n.read ? "!border-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.08)]" : "gradient-border"}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center text-lg">{n.emoji}</div>
                {!n.read && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${typeInfo.color}`} />
                  <span className="font-heading font-bold text-foreground text-sm">{n.title}</span>
                  {n.urgent && <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Urgent</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  {n.actionLabel && <span className="text-[10px] text-primary font-bold">{n.actionLabel} →</span>}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
