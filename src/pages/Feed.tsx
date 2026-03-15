import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  ShoppingBag, X, Bookmark, Zap, Bell, Star, Loader2, Heart, MessageCircle,
  Share2, Eye, Users, Play, Radio, TrendingUp, ChevronRight, Flame, Clock, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import { useAnalytics } from "@/hooks/useAnalytics";

// Premium product images
import imgCardsBox from "@/assets/products/cards-box.jpg";
import imgSneakersJordans from "@/assets/products/sneakers-jordans.jpg";
import imgWatchRolex from "@/assets/products/watch-rolex.jpg";
import imgElectronicsVr from "@/assets/products/electronics-vr.jpg";
import imgCollectiblePokemon from "@/assets/products/collectible-pokemon.jpg";
import imgFashionBag from "@/assets/products/fashion-bag.jpg";
import imgCardsPrizm from "@/assets/products/cards-prizm.jpg";
import imgSneakersDunks from "@/assets/products/sneakers-dunks.jpg";
import imgLiveStreamBg from "@/assets/products/live-stream-bg.jpg";

interface FeedItem {
  id: string;
  name: string;
  category: string;
  price: number;
  was: number;
  image: string;
  tag: string;
  hot: boolean;
  left: number;
  reason: string;
  score: number;
  listing_id?: string;
  listing_type?: string;
  likes: number;
  comments: number;
  seller: string;
  sellerVerified: boolean;
  timeAgo: string;
}

const categories = ["All", "Cards", "Sneakers", "Electronics", "Watches", "Collectibles", "Fashion"];

const categoryImages: Record<string, string[]> = {
  Cards: [imgCardsBox, imgCardsPrizm],
  Sneakers: [imgSneakersJordans, imgSneakersDunks],
  Electronics: [imgElectronicsVr],
  Watches: [imgWatchRolex],
  Collectibles: [imgCollectiblePokemon],
  Fashion: [imgFashionBag],
};

const allImages = [imgCardsBox, imgSneakersJordans, imgWatchRolex, imgElectronicsVr, imgCollectiblePokemon, imgFashionBag, imgCardsPrizm, imgSneakersDunks];

const getProductImage = (category: string, index: number) => {
  const images = categoryImages[category] || allImages;
  return images[index % images.length];
};

const tagStyles: Record<string, string> = {
  "DREAM MATCH": "bg-gradient-to-r from-primary to-accent text-primary-foreground",
  "LIMITED DROP": "bg-destructive text-destructive-foreground",
  "PRICE DROP": "bg-success/90 text-primary-foreground",
  "FIND": "bg-primary/90 text-primary-foreground",
  "NEW LISTING": "bg-accent/90 text-accent-foreground",
};

const sellerNames = ["NabKing", "CardVault", "SoleHunter", "LuxFinds", "GrailHQ", "TechDrip", "BreakCity", "RarePulls"];
const timeAgos = ["2m ago", "5m ago", "12m ago", "23m ago", "38m ago", "1h ago", "2h ago", "3h ago"];

// Mock live streams
const liveStreams = [
  { id: "1", title: "🔥 PRIZM MEGA BREAK", seller: "CardVault", viewers: 1247, image: imgCardsPrizm, category: "Cards" },
  { id: "2", title: "Jordan 1 Unboxing", seller: "SoleHunter", viewers: 892, image: imgSneakersJordans, category: "Sneakers" },
  { id: "3", title: "Luxury Watch Auction", seller: "LuxFinds", viewers: 634, image: imgWatchRolex, category: "Watches" },
  { id: "4", title: "Charizard Hunting 🐉", seller: "RarePulls", viewers: 2103, image: imgCollectiblePokemon, category: "Collectibles" },
  { id: "5", title: "Designer Bag Drops", seller: "GrailHQ", viewers: 456, image: imgFashionBag, category: "Fashion" },
];

// ─── Live Stream Card ────────────────────────────────────
const LiveStreamCard = ({ stream }: { stream: typeof liveStreams[0] }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/play")}
      className="flex-shrink-0 w-[140px] group"
    >
      <div className="relative h-[190px] rounded-2xl overflow-hidden">
        <img src={stream.image} alt={stream.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Live badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
          LIVE
        </div>
        {/* Viewers */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 text-[10px] text-white/90">
          <Eye className="w-3 h-3" /> {stream.viewers.toLocaleString()}
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">{stream.title}</p>
          <p className="text-[10px] text-white/60 mt-0.5">{stream.seller}</p>
        </div>
        {/* Ring glow on hover */}
        <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-primary/50 transition-all" />
      </div>
    </button>
  );
};

// ─── Social Feed Card (TikTok/IG style vertical scroll) ──
const SocialFeedCard = ({
  item, index, onNab, onBookmark, onLike
}: {
  item: FeedItem; index: number;
  onNab: () => void; onBookmark: () => void; onLike: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    onLike();
  };

  const handleSave = () => {
    setSaved(!saved);
    onBookmark();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full"
    >
      <div className="rounded-3xl overflow-hidden bg-card border border-border/50 backdrop-blur-sm"
        style={{ boxShadow: "0 8px 40px -12px hsl(var(--nab-cyan) / 0.1), 0 2px 16px -4px rgba(0,0,0,0.2)" }}
      >
        {/* Seller Header */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-purple)))" }}>
            {item.seller[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-foreground">{item.seller}</span>
              {item.sellerVerified && <Shield className="w-3.5 h-3.5 text-primary fill-primary/20" />}
            </div>
            <span className="text-[11px] text-muted-foreground">{item.timeAgo} · {item.category}</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${tagStyles[item.tag] || "bg-secondary text-secondary-foreground"}`}>
            {item.tag}
          </span>
        </div>

        {/* Product Image */}
        <button
          onClick={() => item.listing_id && navigate(`/listing/${item.listing_id}`)}
          className="relative w-full aspect-square overflow-hidden group"
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Urgency badge */}
          {item.hot && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow-lg"
            >
              <Flame className="w-3.5 h-3.5" /> {item.left} left
            </motion.div>
          )}

          {/* Double-tap heart animation */}
          <AnimatePresence>
            {liked && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-20 h-20 text-destructive fill-destructive" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Action Row */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className="flex items-center gap-1.5 group/btn">
                <Heart className={`w-6 h-6 transition-all active:scale-125 ${liked ? "text-destructive fill-destructive" : "text-muted-foreground group-hover/btn:text-foreground"}`} />
                <span className={`text-xs font-medium ${liked ? "text-destructive" : "text-muted-foreground"}`}>{(item.likes + (liked ? 1 : 0)).toLocaleString()}</span>
              </button>
              <button className="flex items-center gap-1.5 group/btn">
                <MessageCircle className="w-5.5 h-5.5 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
                <span className="text-xs text-muted-foreground font-medium">{item.comments}</span>
              </button>
              <button className="group/btn">
                <Share2 className="w-5 h-5 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
              </button>
            </div>
            <button onClick={handleSave} className="active:scale-110 transition-transform">
              <Bookmark className={`w-6 h-6 transition-all ${saved ? "text-primary fill-primary" : "text-muted-foreground hover:text-foreground"}`} />
            </button>
          </div>

          {/* Product Info */}
          <h3 className="font-heading font-bold text-foreground text-base leading-tight">{item.name}</h3>
          <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>

          {/* Price */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">${item.price.toLocaleString()}</span>
              {item.was > item.price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">${item.was.toLocaleString()}</span>
                  <span className="text-xs font-bold text-success px-1.5 py-0.5 rounded bg-success/10">
                    -{Math.round((1 - item.price / item.was) * 100)}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* AI Match Score */}
          <div className="flex items-center gap-3 mt-3 p-2.5 rounded-xl bg-secondary/50">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">AI Match</span>
            </div>
            <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={isInView ? { width: `${item.score}%` } : { width: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)), hsl(var(--nab-purple)))" }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-foreground">{item.score}%</span>
          </div>

          {/* CTA */}
          <Button
            onClick={onNab}
            className="w-full mt-3 rounded-xl h-12 text-sm font-bold gap-2 shimmer-btn"
            style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)))", boxShadow: "0 4px 20px hsl(var(--nab-cyan) / 0.3)" }}
          >
            <ShoppingBag className="w-4 h-4" /> Nab It Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Trending Ticker ─────────────────────────────────────
const TrendingTicker = () => {
  const items = [
    "🔥 Jordan 4 Thunder dropped 12%",
    "🃏 Topps Chrome Hobby Box selling fast",
    "⌚ Submariner hit lowest price this month",
    "🏆 PSA 10 Charizard matched your Dream Buy",
    "👟 Dunk Low Panda restocked",
    "🥽 Vision Pro deals trending",
  ];

  return (
    <div className="overflow-hidden py-2.5 bg-secondary/30 border-y border-border/50">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-8 whitespace-nowrap"
      >
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-xs text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-primary" /> {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// ─── Main Feed ───────────────────────────────────────────
const Feed = () => {
  usePageMeta({ title: "Feed — nabbit.ai", description: "Your personalized deal feed. Swipe to nab deals from 200+ retailers.", path: "/feed" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [savedItems, setSavedItems] = useState<FeedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadFeed(); }, []);

  const loadFeed = async () => {
    setLoading(true);
    const [{ data: listings }, { data: hotDeals }] = await Promise.all([
      supabase.from('listings').select('*, auctions(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(30),
      supabase.from('group_deals').select('*').eq('status', 'active').order('current_participants', { ascending: false }).limit(5),
    ]);

    const feedItems: FeedItem[] = [];
    let imgIdx = 0;

    if (hotDeals) {
      hotDeals.filter((d: any) => d.current_participants / d.target_participants > 0.5).forEach((d: any) => {
        feedItems.push({
          id: `deal-${d.id}`, name: `🤝 Group Deal: ${d.title}`, category: d.category || "Deals",
          price: d.deal_price, was: d.retail_price, image: allImages[imgIdx++ % allImages.length],
          tag: d.current_participants / d.target_participants > 0.8 ? "LIMITED DROP" : "FIND",
          hot: d.current_participants / d.target_participants > 0.8,
          left: d.target_participants - d.current_participants,
          reason: `${d.current_participants}/${d.target_participants} joined · group deal`,
          score: Math.round((d.current_participants / d.target_participants) * 100),
          likes: Math.floor(Math.random() * 800) + 100, comments: Math.floor(Math.random() * 60) + 5,
          seller: sellerNames[imgIdx % sellerNames.length], sellerVerified: Math.random() > 0.3,
          timeAgo: timeAgos[imgIdx % timeAgos.length],
        });
      });
    }

    if (listings && listings.length > 0) {
      listings.forEach((l: any) => {
        const auction = l.auctions?.[0];
        const currentPrice = auction ? auction.current_price : l.starting_price;
        const marketPrice = l.buy_now_price || l.starting_price * 1.3;
        const score = Math.min(99, Math.max(60, Math.round(100 - ((currentPrice / marketPrice) * 40))));
        const tags = ["NEW LISTING", "FIND", "PRICE DROP", "LIMITED DROP"];
        const tag = l.quantity <= 3 ? "LIMITED DROP" : (l.buy_now_price && l.buy_now_price < marketPrice * 0.8) ? "PRICE DROP" : tags[Math.floor(Math.random() * 2)];

        feedItems.push({
          id: l.id, name: l.title, category: l.category, price: currentPrice, was: marketPrice,
          image: getProductImage(l.category, imgIdx++), tag, hot: l.quantity <= 3, left: l.quantity,
          reason: `${l.condition} · ${l.listing_type.replace('_', ' ')}`, score,
          listing_id: l.id, listing_type: l.listing_type,
          likes: Math.floor(Math.random() * 1200) + 50, comments: Math.floor(Math.random() * 80) + 3,
          seller: sellerNames[imgIdx % sellerNames.length], sellerVerified: Math.random() > 0.3,
          timeAgo: timeAgos[imgIdx % timeAgos.length],
        });
      });
    }

    // If no real data, create premium demo items
    if (feedItems.length === 0) {
      const demoItems: Omit<FeedItem, "id">[] = [
        { name: "2024 Topps Chrome Hobby Box", category: "Cards", price: 185, was: 250, image: imgCardsBox, tag: "LIMITED DROP", hot: true, left: 3, reason: "Sealed · hobby box", score: 94, likes: 1832, comments: 67, seller: "CardVault", sellerVerified: true, timeAgo: "2m ago" },
        { name: "Air Jordan 1 High OG 'UNC'", category: "Sneakers", price: 289, was: 380, image: imgSneakersJordans, tag: "PRICE DROP", hot: false, left: 8, reason: "New · buy now", score: 91, likes: 2451, comments: 124, seller: "SoleHunter", sellerVerified: true, timeAgo: "5m ago" },
        { name: "Submariner Date 41mm", category: "Watches", price: 12500, was: 15800, image: imgWatchRolex, tag: "DREAM MATCH", hot: true, left: 1, reason: "Pre-owned · auction", score: 97, likes: 4210, comments: 203, seller: "LuxFinds", sellerVerified: true, timeAgo: "12m ago" },
        { name: "Vision Pro 256GB", category: "Electronics", price: 2899, was: 3499, image: imgElectronicsVr, tag: "FIND", hot: false, left: 5, reason: "New · buy now", score: 85, likes: 987, comments: 45, seller: "TechDrip", sellerVerified: true, timeAgo: "23m ago" },
        { name: "PSA 10 Charizard Holo", category: "Collectibles", price: 4200, was: 5500, image: imgCollectiblePokemon, tag: "LIMITED DROP", hot: true, left: 1, reason: "Graded · auction", score: 96, likes: 5673, comments: 312, seller: "RarePulls", sellerVerified: true, timeAgo: "38m ago" },
        { name: "Monogram Speedy 30", category: "Fashion", price: 1150, was: 1500, image: imgFashionBag, tag: "PRICE DROP", hot: false, left: 2, reason: "Pre-owned · buy now", score: 88, likes: 1456, comments: 78, seller: "GrailHQ", sellerVerified: true, timeAgo: "1h ago" },
        { name: "Panini Prizm Mega Box", category: "Cards", price: 75, was: 100, image: imgCardsPrizm, tag: "NEW LISTING", hot: false, left: 12, reason: "Sealed · buy now", score: 82, likes: 634, comments: 29, seller: "BreakCity", sellerVerified: false, timeAgo: "2h ago" },
        { name: "Nike Dunk Low Retro", category: "Sneakers", price: 95, was: 150, image: imgSneakersDunks, tag: "FIND", hot: false, left: 6, reason: "New · buy now", score: 79, likes: 1123, comments: 56, seller: "SoleHunter", sellerVerified: true, timeAgo: "3h ago" },
      ];
      demoItems.forEach((item, i) => feedItems.push({ ...item, id: `demo-${i}` }));
    }

    setItems(feedItems);
    setLoading(false);
  };

  const filtered = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  const saveToDb = async (item: FeedItem) => {
    if (!user) return;
    try {
      await supabase.from("saved_items").insert({
        user_id: user.id, item_name: item.name, category: item.category,
        price: item.price, was_price: item.was, image_emoji: "📦", tag: item.tag,
      });
    } catch (err) { console.error("Error saving item:", err); }
  };

  const handleNab = (item: FeedItem) => {
    setSavedItems((s) => [item, ...s]);
    saveToDb(item);
    track("nab_item", { item_id: item.id, category: item.category, price: item.price });
    toast({ title: "✅ Nabbed!", description: `${item.name} added to your collection.` });
  };

  const handleBookmark = (item: FeedItem) => {
    setSavedItems((s) => [item, ...s]);
    saveToDb(item);
    track("bookmark", { item_id: item.id, category: item.category, price: item.price });
    toast({ title: "🔖 Saved!", description: item.name });
  };

  const handleLike = (item: FeedItem) => {
    track("like_item", { item_id: item.id, category: item.category });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ─── Premium Header ─── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50">
        <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
          <Link to="/" className="flex items-center gap-2">
            <img src={nabbitLogo} alt="nabbit" className="h-6" />
            <span className="font-heading font-bold text-foreground text-base">nabbit<span className="text-primary">.ai</span></span>
          </Link>
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => navigate("/dream-buys")}>
              <Zap className="w-4.5 h-4.5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 relative" onClick={() => navigate("/notifications")}>
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 relative">
              <Bookmark className="w-4.5 h-4.5" />
              {savedItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {savedItems.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Trending Ticker ─── */}
      <TrendingTicker />

      {/* ─── Live Streams Section ─── */}
      <div className="px-4 pt-4 pb-2 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10">
              <Radio className="w-3 h-3 text-destructive animate-pulse" />
              <span className="text-xs font-bold text-destructive">LIVE</span>
            </div>
            <span className="text-sm font-heading font-bold text-foreground">Streams</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1" onClick={() => navigate("/play")}>
            See all <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {liveStreams.map((stream) => (
            <LiveStreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      </div>

      {/* ─── Category Pills ─── */}
      <div className="px-4 py-3 overflow-x-auto max-w-lg mx-auto">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "text-primary-foreground shadow-lg"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
              style={activeCategory === cat ? {
                background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)))",
                boxShadow: "0 2px 12px hsl(var(--nab-cyan) / 0.3)",
              } : {}}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Social Feed ─── */}
      <div className="max-w-lg mx-auto px-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan) / 0.2), hsl(var(--nab-purple) / 0.2))" }}>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Loading your feed...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filtered.map((item, index) => (
              <SocialFeedCard
                key={item.id}
                item={item}
                index={index}
                onNab={() => handleNab(item)}
                onBookmark={() => handleBookmark(item)}
                onLike={() => handleLike(item)}
              />
            ))}

            {filtered.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <span className="text-5xl mb-4">🎉</span>
                <h3 className="font-heading font-bold text-foreground text-xl">You've seen it all!</h3>
                <p className="text-muted-foreground text-sm mt-2">Check back for new drops</p>
                <Button className="mt-4 rounded-xl" onClick={loadFeed}>Refresh Feed</Button>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Feed;
