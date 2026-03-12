import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, TrendingDown, Users, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

interface Notification {
  id: number;
  type: "dream_match" | "price_drop" | "group_deal" | "tribe" | "giving" | "feed";
  title: string;
  body: string;
  emoji: string;
  time: string;
  read: boolean;
  urgent?: boolean;
  actionLabel?: string;
}

const initialNotifs: Notification[] = [
  { id: 1, type: "dream_match", title: "Dream Buy Found!", body: "1952 Topps Mickey Mantle — PSA 4 listed at $4,200 (32% below market)", emoji: "🃏", time: "2m ago", read: false, urgent: true, actionLabel: "View Match" },
  { id: 2, type: "price_drop", title: "Price Drop Alert", body: "Air Jordan 1 Chicago dropped from $380 to $289", emoji: "👟", time: "1h ago", read: false, actionLabel: "View" },
  { id: 3, type: "group_deal", title: "Group Deal Almost Full!", body: "Nike Dunk Low Pack — 8/10 spots filled. Join now!", emoji: "👟", time: "2h ago", read: false, actionLabel: "Join" },
  { id: 4, type: "tribe", title: "New in Sneakerheads", body: "Alex K. nabbed Air Jordan 1 Chicago for $289", emoji: "🧑‍🎤", time: "3h ago", read: true },
  { id: 5, type: "giving", title: "Community Impact", body: "Your round-ups helped raise $1,240 for education this month!", emoji: "❤️", time: "5h ago", read: true },
  { id: 6, type: "feed", title: "New Drops Ready", body: "15 new items matched to your taste profile", emoji: "📦", time: "8h ago", read: true },
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
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState<string>("All");

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifs(notifs.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifs(notifs.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const filtered = notifs.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    if (filter === "🎯 Dream Buys") return n.type === "dream_match";
    if (filter === "⚡ Group Deals") return n.type === "group_deal";
    if (filter === "📉 Price Drops") return n.type === "price_drop";
    return true;
  });

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

      {/* Filters */}
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
          const { icon: Icon, color } = typeIcons[n.type];
          return (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${!n.read ? "bg-primary/5 border border-primary/20" : "bg-card border border-border"}`}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">{n.emoji}</div>
                {!n.read && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3 h-3 ${color}`} />
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
