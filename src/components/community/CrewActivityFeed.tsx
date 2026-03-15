import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Trophy, Users, Gavel, Flame, Gift, Zap, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  type: "join" | "purchase" | "win" | "bid" | "deal_funded" | "streak" | "listing";
  avatar: string;
  name: string;
  action: string;
  detail: string;
  timestamp: number;
  xp?: number;
}

const typeConfig: Record<string, { icon: typeof ShoppingBag; gradient: string; glow: string }> = {
  join: { icon: Users, gradient: "from-primary/20 to-accent/20", glow: "shadow-primary/20" },
  purchase: { icon: ShoppingBag, gradient: "from-success/20 to-emerald-500/20", glow: "shadow-success/20" },
  win: { icon: Trophy, gradient: "from-yellow-400/20 to-amber-500/20", glow: "shadow-yellow-400/20" },
  bid: { icon: Gavel, gradient: "from-accent/20 to-purple-500/20", glow: "shadow-accent/20" },
  deal_funded: { icon: Flame, gradient: "from-destructive/20 to-orange-500/20", glow: "shadow-destructive/20" },
  streak: { icon: Zap, gradient: "from-primary/20 to-nab-blue/20", glow: "shadow-primary/20" },
  listing: { icon: Gift, gradient: "from-nab-blue/20 to-primary/20", glow: "shadow-nab-blue/20" },
};

const names = ["Alex K.", "Jordan M.", "Sam T.", "Riley P.", "Casey L.", "Morgan D.", "Avery S.", "Quinn B.", "Devon R.", "Taylor W.", "Blake F.", "Skylar N."];
const emojis = ["🐇", "🦊", "🐱", "🦁", "🐻", "🐼", "🦄", "🐸", "🦉", "🐺", "🦈", "🐙"];

const generateActivity = (id: number): ActivityItem => {
  const types: ActivityItem["type"][] = ["join", "purchase", "win", "bid", "deal_funded", "streak", "listing"];
  const type = types[Math.floor(Math.random() * types.length)];
  const nameIdx = Math.floor(Math.random() * names.length);
  const name = names[nameIdx];
  const avatar = emojis[nameIdx];

  const actionMap: Record<string, { action: string; details: string[] }> = {
    join: { action: "joined", details: ["Sneakerheads crew", "Watch Collectors", "Card Breakers", "Tech Hunters", "Luxury Finds"] },
    purchase: { action: "nabbed", details: ["Jordan 1 High OG for $289", "Topps Chrome Box for $185", "Rolex Submariner for $12.5K", "PS5 Bundle for $449", "LV Speedy 30 for $1,150"] },
    win: { action: "won auction", details: ["PSA 10 Charizard · $4,200", "Vintage Rolex · $8,900", "Sealed Prizm Case · $2,400", "Off-White AJ1 · $1,800"] },
    bid: { action: "placed a bid on", details: ["2024 Topps Chrome Hobby", "Air Jordan 4 Thunder", "Omega Speedmaster", "RTX 4090 FE"] },
    deal_funded: { action: "helped fund", details: ["Nike Dunk Pack (10/10! 🎉)", "Pokémon ETB Group Buy", "Watch Bundle Deal", "Sneaker Mystery Box"] },
    streak: { action: "hit a", details: ["7-day streak! 🔥", "14-day streak! 🔥🔥", "30-day streak! 🏆", "3-day streak! ⚡"] },
    listing: { action: "listed", details: ["Air Jordan 1 Chicago", "2024 Bowman Mega Box", "Tag Heuer Carrera", "MacBook Pro M4"] },
  };

  const config = actionMap[type];
  const detail = config.details[Math.floor(Math.random() * config.details.length)];
  const xpValues: Record<string, number> = { join: 25, purchase: 50, win: 100, bid: 10, deal_funded: 200, streak: 50, listing: 30 };

  return {
    id: `activity-${id}-${Date.now()}`,
    type,
    avatar,
    name,
    action: config.action,
    detail,
    timestamp: Date.now(),
    xp: xpValues[type],
  };
};

const CrewActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    Array.from({ length: 5 }, (_, i) => generateActivity(i))
  );
  const [realActivities, setRealActivities] = useState<ActivityItem[]>([]);

  // Listen for real-time events
  useEffect(() => {
    const channel = supabase
      .channel("crew-activity-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "group_deal_participants" }, async (payload) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_emoji")
          .eq("id", (payload.new as any).user_id)
          .single();
        if (profile) {
          const item: ActivityItem = {
            id: `real-join-${Date.now()}`,
            type: "join",
            avatar: profile.avatar_emoji || "🐇",
            name: profile.display_name || "A nabber",
            action: "joined a crew deal",
            detail: "Just now",
            timestamp: Date.now(),
            xp: 50,
          };
          setRealActivities((prev) => [item, ...prev].slice(0, 3));
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, async (payload) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_emoji")
          .eq("id", (payload.new as any).buyer_id)
          .single();
        if (profile) {
          const item: ActivityItem = {
            id: `real-purchase-${Date.now()}`,
            type: "purchase",
            avatar: profile.avatar_emoji || "🐇",
            name: profile.display_name || "A nabber",
            action: "nabbed",
            detail: `$${(payload.new as any).amount} purchase`,
            timestamp: Date.now(),
            xp: 50,
          };
          setRealActivities((prev) => [item, ...prev].slice(0, 3));
        }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids" }, async (payload) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_emoji")
          .eq("id", (payload.new as any).bidder_id)
          .single();
        if (profile) {
          const item: ActivityItem = {
            id: `real-bid-${Date.now()}`,
            type: "bid",
            avatar: profile.avatar_emoji || "🐇",
            name: profile.display_name || "A nabber",
            action: "placed a bid",
            detail: `$${(payload.new as any).amount}`,
            timestamp: Date.now(),
            xp: 10,
          };
          setRealActivities((prev) => [item, ...prev].slice(0, 3));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Cycle simulated activities
  useEffect(() => {
    let counter = 100;
    const interval = setInterval(() => {
      const newItem = generateActivity(counter++);
      setActivities((prev) => [newItem, ...prev.slice(0, 7)]);
    }, 4000 + Math.random() * 3000);

    return () => clearInterval(interval);
  }, []);

  const allActivities = [...realActivities, ...activities].slice(0, 8);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 border border-success/20">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-success"
            />
            <span className="text-[10px] font-black text-success uppercase tracking-wider">Live</span>
          </div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Crew Activity</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">{allActivities.length} events</span>
      </div>

      <div className="rounded-2xl glass-card overflow-hidden">
        <AnimatePresence initial={false}>
          {allActivities.map((item, i) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;
            const isReal = item.id.startsWith("real-");

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -40, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 40, height: 0 }}
                transition={{
                  opacity: { duration: 0.3 },
                  x: { type: "spring", stiffness: 300, damping: 25 },
                  height: { duration: 0.2 },
                }}
                className={`flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-b-0 ${isReal ? "bg-primary/5" : ""}`}
              >
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-lg shrink-0 shadow-lg ${config.glow}`}
                >
                  {item.avatar}
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs leading-snug">
                    <span className="font-bold text-foreground">{item.name}</span>
                    {" "}
                    <span className="text-muted-foreground">{item.action}</span>
                    {" "}
                    <span className="font-semibold text-foreground">{item.detail}</span>
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] text-muted-foreground">
                      {isReal ? "just now" : `${Math.floor(Math.random() * 30) + 1}s ago`}
                    </span>
                    {isReal && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded"
                      >
                        REAL-TIME
                      </motion.span>
                    )}
                  </div>
                </div>

                {/* XP Badge */}
                {item.xp && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.2 }}
                    className="flex items-center gap-0.5 px-2 py-1 rounded-lg bg-primary/10 shrink-0"
                  >
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold gradient-text">+{item.xp}</span>
                  </motion.div>
                )}

                {/* Type Icon */}
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0`}>
                  <Icon className="w-3.5 h-3.5 text-foreground/70" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Activity stats bar */}
      <div className="flex gap-2">
        {[
          { label: "Joins", count: allActivities.filter(a => a.type === "join").length, icon: Users },
          { label: "Nabs", count: allActivities.filter(a => a.type === "purchase").length, icon: ShoppingBag },
          { label: "Wins", count: allActivities.filter(a => a.type === "win").length, icon: Trophy },
          { label: "Bids", count: allActivities.filter(a => a.type === "bid").length, icon: Gavel },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-secondary/30 border border-border/30">
            <stat.icon className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-bold text-foreground">{stat.count}</span>
            <span className="text-[9px] text-muted-foreground hidden sm:inline">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrewActivityFeed;
