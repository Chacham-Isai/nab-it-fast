import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, TrendingDown, Users, Heart, ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  { id: "m4", type: "tribe", title: "New in Sneakerheads", body: "Alex K. nabbed Air Jordan 1 Chicago for $289", emoji: "🧑‍🎤", time: "3h ago", read: true },
  { id: "m5", type: "giving", title: "Community Impact", body: "Your round-ups helped raise $1,240 for education this month!", emoji: "❤️", time: "5h ago", read: true },
  { id: "m6", type: "feed", title: "New Drops Ready", body: "15 new items matched to your taste profile", emoji: "📦", time: "8h ago", read: true },
];

const typeIcons: Record<string, { icon: typeof Zap; color: string }> = {
  dream_match: { icon: Zap, color: "text-primary" },
  price_drop: { icon: TrendingDown, color: "text-success" },
  group_deal: { icon: Users, color: "text-blue-500" },
  tribe: { icon: Users, color: "text-purple-500" },
  giving: { icon: Heart, color: "text-pink-500" },
  feed: { icon: ShoppingBag, color: "text-muted-foreground" },
};

const filters = ["All", "Unread", "🎯 Dream Buys", "⚡ Group Deals", "📉 Price Drops"] as const;

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [filter, setFilter] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications_log")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      setNotifs(mockNotifs);
      setIsDemo(true);
    } else {
      setNotifs(data.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body || "",
        emoji: n.type === "dream_match" ? "🎯" : n.type === "price_drop" ? "📉" : n.type === "group_deal" ? "👥" : "📦",
        time: new Date(n.created_at).toLocaleDateString(),
        read: n.is_read,
        actionLabel: n.action_label,
      })));
      setIsDemo(false);
    }
    setLoading(false);
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = async () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
    if (!isDemo && user) {
      await supabase.from("notifications_log").update({ is_read: true }).eq("user_id", user.id);
    }
  };

  const markRead = async (id: string) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (!id.startsWith("m") && user) {
      await supabase.from("notifications_log").update({ is_read: true }).eq("id", id);
    }
  };

  const filtered = notifs.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    if (filter === "🎯 Dream Buys") return n.type === "dream_match";
    if (filter === "⚡ Group Deals") return n.type === "group_deal";
    if (filter === "📉 Price Drops") return n.type === "price_drop";
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Notifications</h1>
          {unreadCount > 0 && (
            <>
              <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-bold">{unreadCount}</span>
              <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={markAllRead}>Mark all read</Button>
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 max-w-lg mx-auto">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {f}{f === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-2">
        {filtered.map((n) => {
          const typeInfo = typeIcons[n.type] || typeIcons.feed;
          const Icon = typeInfo.icon;
          return (
            <button key={n.id} onClick={() => markRead(n.id)} className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${!n.read ? "bg-primary/5 border border-primary/20" : "bg-card border border-border"}`}>
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">{n.emoji}</div>
                {!n.read && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${typeInfo.color}`} />
                  <span className="font-semibold text-foreground text-sm">{n.title}</span>
                  {n.urgent && <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold">Urgent</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  {n.actionLabel && <span className="text-[10px] text-primary font-semibold">{n.actionLabel} →</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Notifications;
