import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Sparkles, Gavel, Shield, ChevronRight, Flame, Search, ShoppingBag, Package, Zap, Gift, Target, Users, Trophy, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import NabbitLogo from "@/components/NabbitLogo";
import { supabase } from "@/integrations/supabase/client";
import usePageMeta from "@/hooks/usePageMeta";
import { modeImages } from "@/lib/images";

const Play = () => {
  usePageMeta({ title: "Play — nabbit.ai", description: "Explore breaks, grab bags, auctions, and mystery drops. Your deal playground.", path: "/play" });
  const navigate = useNavigate();
  const [tickerIndex, setTickerIndex] = useState(0);
  const [liveAuctionCount, setLiveAuctionCount] = useState(0);
  const [recentWins, setRecentWins] = useState<any[]>([]);
  const [tickerItems, setTickerItems] = useState<string[]>(["🎉 Welcome to nabbit Play!"]);
  const [hoveredMode, setHoveredMode] = useState<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setTickerIndex((i) => (i + 1) % Math.max(tickerItems.length, 1)), 3500);
    return () => clearInterval(interval);
  }, [tickerItems]);

  useEffect(() => { loadLiveData(); }, []);

  const loadLiveData = async () => {
    const { count } = await supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'live');
    setLiveAuctionCount(count || 0);

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
      setTickerItems(tickers.length > 0 ? tickers : ["🎉 Welcome to nabbit Play!"]);
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
      title: "Breaks", path: "/breaks", desc: "Pick your slot. Watch it rip live. Keep what you pull.",
      badge: "BROWSE", badgeStyle: "bg-destructive text-destructive-foreground",
      stat: "Card breaks with live reveals", icon: Radio,
      image: modeImages.breaks,
      accent: "destructive",
      liveCount: null,
      tagline: "Real-time pack rips",
      gradient: "from-destructive/30 to-destructive/5",
    },
    {
      title: "Grab Bags", path: "/grab-bags", desc: "Mystery boxes curated by AI. Standard to Legendary tiers.",
      badge: "4 TIERS", badgeStyle: "bg-primary text-primary-foreground",
      stat: "94% avg hit rate", icon: Gift,
      image: modeImages.grabBags,
      accent: "primary",
      liveCount: null,
      tagline: "Every pull hits different",
      gradient: "from-primary/30 to-primary/5",
    },
    {
      title: "Auctions", path: "/auctions", desc: "Bid. Snipe. Win. AI-timed with auto-extend protection.",
      badge: `${liveAuctionCount} LIVE`, badgeStyle: "bg-success text-primary-foreground",
      stat: "Real-time competitive bidding", icon: Gavel,
      image: modeImages.auctions,
      accent: "success",
      liveCount: liveAuctionCount,
      tagline: "Bid smart, win big",
      gradient: "from-success/30 to-success/5",
    },
    {
      title: "Dream Buys", path: "/dream-buys", desc: "Set your price. The Engine hunts 24/7 and auto-nabs.",
      badge: "AI", badgeStyle: "bg-accent text-accent-foreground",
      stat: "200+ retailers scanned nonstop", icon: Target,
      image: modeImages.dreamBuys,
      accent: "accent",
      liveCount: null,
      tagline: "Name your price",
      gradient: "from-accent/30 to-accent/5",
    },
  ];

  const tools = [
    { title: "Browse All", path: "/browse", desc: "Search & filter", icon: Search },
    { title: "Sell", path: "/sell", desc: "List items", icon: ShoppingBag },
    { title: "My Orders", path: "/orders", desc: "Track purchases", icon: Package },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <NabbitLogo size="sm" />
          <h1 className="font-heading font-black text-foreground text-base tracking-tight flex-1">PLAY</h1>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            <Zap className="w-3 h-3" /> Live
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-5">
        {/* Live ticker */}
        <div className="rounded-xl glass-card gradient-border overflow-hidden h-10 flex items-center px-3">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-success shrink-0 mr-2" />
          <AnimatePresence mode="wait">
            <motion.p
              key={tickerIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs text-foreground font-medium truncate"
            >
              {tickerItems[tickerIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden glass-card gradient-border p-6 text-center"
        >
          {/* Animated orbs */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-[80px] pointer-events-none"
            style={{ background: "hsl(var(--nab-cyan))" }}
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full blur-[60px] pointer-events-none"
            style={{ background: "hsl(var(--nab-purple))" }}
          />
          <div className="relative z-10">
            <motion.div
              animate={{ y: [-3, 3, -3], rotate: [-2, 2, -2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-3"
            >
              🎮
            </motion.div>
            <h2 className="font-heading font-black text-2xl text-foreground">
              The thrill of the <span className="gradient-text">find.</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-1.5 max-w-xs mx-auto">
              Four ways to score deals — each one powered by AI and tuned to your vibe.
            </p>
            {/* Live stats */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs font-bold">
              <span className="flex items-center gap-1 text-nab-cyan"><Users className="w-3 h-3" /> 8.2K playing</span>
              <span className="flex items-center gap-1 text-success"><Trophy className="w-3 h-3" /> $47K won today</span>
              <span className="flex items-center gap-1 text-nab-purple"><TrendingUp className="w-3 h-3" /> 94% hit rate</span>
            </div>
          </div>
        </motion.div>

        {/* Mode Cards — big, dramatic, full-bleed */}
        <div className="space-y-3">
          {modes.map((mode, i) => (
            <motion.button
              key={mode.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 120 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredMode(i)}
              onHoverEnd={() => setHoveredMode(null)}
              onClick={() => navigate(mode.path)}
              className="w-full rounded-2xl text-left relative overflow-hidden group h-[160px]"
            >
              {/* Full-bleed background image */}
              <img
                src={mode.image}
                alt={mode.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />

              {/* Hover glow */}
              <motion.div
                animate={hoveredMode === i ? { opacity: 0.15 } : { opacity: 0 }}
                className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} transition-opacity`}
              />

              {/* Content */}
              <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-background/60 backdrop-blur-xl border border-border/30 flex items-center justify-center">
                      <mode.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-black text-foreground text-lg">{mode.title}</h3>
                      <p className="text-[11px] text-primary font-bold">{mode.tagline}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${mode.badgeStyle}`}>{mode.badge}</span>
                    {mode.liveCount !== null && mode.liveCount > 0 && (
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                        live now
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground max-w-[240px]">{mode.desc}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{mode.stat}</p>
                  </div>
                  <motion.div
                    animate={hoveredMode === i ? { x: 0, opacity: 1 } : { x: -5, opacity: 0.5 }}
                    className="w-8 h-8 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center shrink-0"
                  >
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </motion.div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Recent Wins */}
        {recentWins.length > 0 && (
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-foreground text-sm flex items-center gap-2">
                <Flame className="w-4 h-4 text-destructive" /> Recent Wins
              </h3>
              <span className="text-[10px] text-muted-foreground">{recentWins.length} latest</span>
            </div>
            <div className="space-y-2">
              {recentWins.map((win: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors"
                >
                  <span className="text-2xl">{win.user}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">
                      <span className="font-bold">{win.name}</span> won{" "}
                      <span className="text-primary font-semibold">{win.item}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{win.method} · ${win.price?.toLocaleString()}</p>
                  </div>
                  <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-full">WON</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Tools */}
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool, i) => (
            <motion.button
              key={tool.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              onClick={() => navigate(tool.path)}
              className="p-3.5 rounded-2xl bg-card border border-border text-center hover:border-primary/30 hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.15)] transition-all group"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                <tool.icon className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs font-bold text-foreground">{tool.title}</p>
              <p className="text-[10px] text-muted-foreground">{tool.desc}</p>
            </motion.button>
          ))}
        </div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 p-3 rounded-xl glass-card gradient-border text-center justify-center"
        >
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground">nabbit Authenticated — every item verified</span>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Play;