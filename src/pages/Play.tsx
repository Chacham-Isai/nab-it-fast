import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Sparkles, Gavel, Shield, ChevronRight, Flame, Search, ShoppingBag, Package } from "lucide-react";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";

const Play = () => {
  const navigate = useNavigate();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [liveAuctionCount, setLiveAuctionCount] = useState(0);
  const [recentWins, setRecentWins] = useState<any[]>([]);
  const [tickerItems, setTickerItems] = useState<string[]>([
    "🎉 Welcome to Navigator Play!",
  ]);

  useEffect(() => {
    const interval = setInterval(() => setTickerIndex((i) => (i + 1) % Math.max(tickerItems.length, 1)), 3500);
    return () => clearInterval(interval);
  }, [tickerItems]);

  useEffect(() => {
    loadLiveData();
  }, []);

  const loadLiveData = async () => {
    // Get live auction count
    const { count } = await supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'live');
    setLiveAuctionCount(count || 0);

    // Get recent completed orders for the ticker + wins feed
    const { data: orders } = await supabase
      .from('orders')
      .select('*, listings(title, listing_type, category), profiles:buyer_id(display_name, avatar_emoji)')
      .eq('status', 'paid')
      .order('created_at', { ascending: false })
      .limit(10);

    if (orders && orders.length > 0) {
      const tickers = orders.map((o: any) => {
        const emoji = o.profiles?.avatar_emoji || "🧑";
        const name = o.profiles?.display_name || "A user";
        const method = o.listings?.listing_type?.replace('_', ' ') || "purchase";
        return `${emoji} ${name} won ${o.listings?.title || "an item"} via ${method}!`;
      });
      setTickerItems(tickers.length > 0 ? tickers : ["🎉 Welcome to Navigator Play!"]);

      setRecentWins(orders.slice(0, 4).map((o: any) => ({
        user: o.profiles?.avatar_emoji || "🧑",
        name: o.profiles?.display_name || "User",
        item: o.listings?.title || "Item",
        method: o.listings?.listing_type?.replace('_', ' ') || "purchase",
        price: o.amount,
      })));
    }
  };

  const modes = [
    {
      title: "Breaks", path: "/breaks", desc: "Pick your slot. Watch it rip live.",
      badge: "BROWSE", badgeColor: "bg-destructive text-destructive-foreground",
      stat: "Card breaks with live reveals", icon: Radio,
      gradient: "from-destructive/20 via-destructive/5 to-transparent",
      emoji: "🎴",
    },
    {
      title: "Grab Bags", path: "/grab-bags", desc: "Mystery boxes. Real hits.",
      badge: "4 Tiers", badgeColor: "bg-primary text-primary-foreground",
      stat: "Avg hit rate 94%", icon: Sparkles,
      gradient: "from-primary/20 via-primary/5 to-transparent",
      emoji: "📦",
    },
    {
      title: "Auctions", path: "/auctions", desc: "Bid. Win. Own it.",
      badge: `${liveAuctionCount} LIVE`, badgeColor: "bg-success text-primary-foreground",
      stat: "Real-time bidding with auto-extend", icon: Gavel,
      gradient: "from-success/20 via-success/5 to-transparent",
      emoji: "🔨",
    },
  ];

  const tools = [
    { title: "Browse All", path: "/browse", emoji: "🔍", desc: "Search & filter listings", icon: Search },
    { title: "Sell", path: "/sell", emoji: "💰", desc: "List items for sale", icon: ShoppingBag },
    { title: "My Orders", path: "/orders", emoji: "📦", desc: "Track purchases", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div>
            <h1 className="font-heading font-bold text-foreground text-lg">Navigator Play</h1>
            <p className="text-[10px] text-muted-foreground">Breaks · Grab Bags · Auctions</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl glass-card overflow-hidden h-10 flex items-center">
          <p key={tickerIndex} className="text-xs text-foreground animate-fade-in truncate">{tickerItems[tickerIndex]}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center py-4">
          <h2 className="font-heading font-bold text-2xl text-foreground">The thrill of the <span className="gradient-text">find.</span></h2>
          <p className="text-muted-foreground text-sm mt-1">Built for collectors. Powered by AI.</p>
        </motion.div>

        <div className="space-y-3">
          {modes.map((mode, i) => (
            <motion.button
              key={mode.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
              onClick={() => navigate(mode.path)}
              className={`w-full p-5 rounded-2xl bg-gradient-to-br ${mode.gradient} border border-border text-left transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden`}
            >
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mode.emoji}</span>
                    <h3 className="font-heading font-bold text-foreground text-lg">{mode.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mode.badgeColor}`}>{mode.badge}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{mode.desc}</p>
                  <p className="text-xs text-muted-foreground">{mode.stat}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
              </div>
            </motion.button>
          ))}
        </div>

        {recentWins.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h3 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4 text-primary" /> Recent Wins
            </h3>
            <div className="space-y-2">
              {recentWins.map((win: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <span className="text-2xl">{win.user}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground"><span className="font-semibold">{win.name}</span> won <span className="text-primary font-semibold">{win.item}</span></p>
                    <p className="text-[10px] text-muted-foreground">{win.method} · ${win.price?.toLocaleString()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              onClick={() => navigate(tool.path)}
              className="p-3 rounded-2xl bg-card border border-border text-center hover:border-primary/30 transition-all"
            >
              <span className="text-2xl block mb-1">{tool.emoji}</span>
              <p className="text-xs font-semibold text-foreground">{tool.title}</p>
              <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10 text-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">Navigator Authenticated — every item verified</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Play;
