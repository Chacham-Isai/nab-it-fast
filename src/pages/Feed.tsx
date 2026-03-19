import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useScroll, useSpring } from "framer-motion";
import {
  ShoppingBag, Bookmark, Zap, Bell, Loader2, Heart, MessageCircle,
  Share2, Eye, Radio, TrendingUp, ChevronRight, Flame, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import NabbitLogo from "@/components/NabbitLogo";
import PullToRefresh from "@/components/PullToRefresh";
import SwipeableCard from "@/components/SwipeableCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BackToTop from "@/components/BackToTop";
import usePageMeta from "@/hooks/usePageMeta";
import { useAnalytics } from "@/hooks/useAnalytics";
import { getCategoryImage, modeImages } from "@/lib/images";
import AIFeedRecommendations from "@/components/feed/AIFeedRecommendations";
import FeedCardSkeleton from "@/components/feed/FeedCardSkeleton";
import { useTrackInteraction } from "@/hooks/useTrackInteraction";

// Premium product images
import imgCardsBox from "@/assets/products/cards-box.jpg";
import imgSneakersJordans from "@/assets/products/sneakers-jordans.jpg";
import imgWatchRolex from "@/assets/products/watch-rolex.jpg";
import imgElectronicsVr from "@/assets/products/electronics-vr.jpg";
import imgCollectiblePokemon from "@/assets/products/collectible-pokemon.jpg";
import imgFashionBag from "@/assets/products/fashion-bag.jpg";
import imgCardsPrizm from "@/assets/products/cards-prizm.jpg";
import imgSneakersDunks from "@/assets/products/sneakers-dunks.jpg";

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

const categoryProductImages: Record<string, string[]> = {
  Cards: [imgCardsBox, imgCardsPrizm],
  Sneakers: [imgSneakersJordans, imgSneakersDunks],
  Electronics: [imgElectronicsVr],
  Watches: [imgWatchRolex],
  Collectibles: [imgCollectiblePokemon],
  Fashion: [imgFashionBag],
};

const allImages = [imgCardsBox, imgSneakersJordans, imgWatchRolex, imgElectronicsVr, imgCollectiblePokemon, imgFashionBag, imgCardsPrizm, imgSneakersDunks];

const getProductImage = (category: string, index: number) => {
  const images = categoryProductImages[category] || allImages;
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

const liveStreams = [
  { id: "1", title: "PRIZM MEGA BREAK", seller: "CardVault", viewers: 1247, category: "Cards" },
  { id: "2", title: "Jordan 1 Unboxing", seller: "SoleHunter", viewers: 892, category: "Sneakers" },
  { id: "3", title: "Luxury Watch Auction", seller: "LuxFinds", viewers: 634, category: "Watches" },
  { id: "4", title: "Charizard Hunting", seller: "RarePulls", viewers: 2103, category: "Collectibles" },
  { id: "5", title: "Designer Bag Drops", seller: "GrailHQ", viewers: 456, category: "Fashion" },
];

// ─── Live Stream Card ────────────────────────────────────
const LiveStreamCard = ({ stream }: { stream: typeof liveStreams[0] }) => {
  const navigate = useNavigate();
  const streamImage = getCategoryImage(stream.category);

  return (
    <button onClick={() => navigate("/play")} className="flex-shrink-0 w-[140px] group">
      <div className="relative h-[190px] rounded-2xl overflow-hidden glass-card gradient-border">
        <img src={streamImage} alt={stream.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        {/* Live badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-destructive-foreground animate-pulse" />
          LIVE
        </div>
        {/* Viewers */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/90">
          <Eye className="w-3 h-3" /> {stream.viewers.toLocaleString()}
        </div>
        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-[11px] font-bold text-white leading-tight line-clamp-2">{stream.title}</p>
          <p className="text-[10px] text-white/60 mt-0.5">{stream.seller}</p>
        </div>
        <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-primary/50 transition-all" />
      </div>
    </button>
  );
};

// ─── Social Feed Card ────────────────────────────────────
const SocialFeedCard = ({
  item, onNab, onBookmark, onLike
}: {
  item: FeedItem;
  onNab: () => void; onBookmark: () => void; onLike: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: 0.5 });
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const categoryImg = getCategoryImage(item.category);

  const handleLike = () => { setLiked(!liked); onLike(); };
  const handleSave = () => { setSaved(!saved); onBookmark(); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 15 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative w-full"
    >
      <div className="rounded-2xl overflow-hidden glass-card gradient-border">
        {/* Seller Header */}
        <div className="flex items-center gap-2.5 px-4 py-3">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/30">
            <img src={categoryImg} alt="" className="w-full h-full object-cover" />
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
          <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {item.hot && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold shadow-lg backdrop-blur-sm"
            >
              <Flame className="w-3.5 h-3.5" /> {item.left} left
            </motion.div>
          )}

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
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handleLike} className="flex items-center gap-1.5 group/btn">
                <Heart className={`w-5.5 h-5.5 transition-all active:scale-125 ${liked ? "text-destructive fill-destructive" : "text-muted-foreground group-hover/btn:text-foreground"}`} />
                <span className={`text-xs font-medium ${liked ? "text-destructive" : "text-muted-foreground"}`}>{(item.likes + (liked ? 1 : 0)).toLocaleString()}</span>
              </button>
              <button className="flex items-center gap-1.5 group/btn">
                <MessageCircle className="w-5 h-5 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
                <span className="text-xs text-muted-foreground font-medium">{item.comments}</span>
              </button>
              <button className="group/btn">
                <Share2 className="w-5 h-5 text-muted-foreground group-hover/btn:text-foreground transition-colors" />
              </button>
            </div>
            <button onClick={handleSave} className="active:scale-110 transition-transform">
              <Bookmark className={`w-5.5 h-5.5 transition-all ${saved ? "text-primary fill-primary" : "text-muted-foreground hover:text-foreground"}`} />
            </button>
          </div>

          <h3 className="font-heading font-bold text-foreground text-base leading-tight">{item.name}</h3>
          <p className="text-xs text-muted-foreground">{item.reason}</p>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">${item.price.toLocaleString()}</span>
            {item.was > item.price && (
              <>
                <span className="text-sm text-muted-foreground line-through">${item.was.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-success px-2 py-0.5 rounded-full bg-success/10">
                  -{Math.round((1 - item.price / item.was) * 100)}%
                </span>
              </>
            )}
          </div>

          {/* AI Match Score */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Match</span>
            </div>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
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
          <Button onClick={onNab} className="w-full rounded-xl h-11 text-sm font-bold gap-2 shimmer-btn">
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
    "Jordan 4 Thunder dropped 12%",
    "Topps Chrome Hobby Box selling fast",
    "Submariner hit lowest price this month",
    "PSA 10 Charizard matched your Dream Buy",
    "Dunk Low Panda restocked",
    "Vision Pro deals trending",
  ];

  return (
    <div className="overflow-hidden py-2 glass-card border-y border-border/30">
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
  const PAGE_SIZE = 6;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

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
          id: `deal-${d.id}`, name: `Group Deal: ${d.title}`, category: d.category || "Deals",
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
  const visibleItems = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset visible count when category changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeCategory]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + PAGE_SIZE);
            setLoadingMore(false);
          }, 400);
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, loadingMore, visibleCount]);

  const saveToDb = async (item: FeedItem) => {
    if (!user) return;
    try {
      await supabase.from("saved_items").insert({
        user_id: user.id, item_name: item.name, category: item.category,
        price: item.price, was_price: item.was, image_emoji: "📦", tag: item.tag,
      });
    } catch (err) { console.error("Error saving item:", err); }
  };

  const { track: trackInteraction } = useTrackInteraction();

  const handleNab = (item: FeedItem) => {
    setSavedItems((s) => [item, ...s]);
    saveToDb(item);
    track("nab_item", { item_id: item.id, category: item.category, price: item.price });
    trackInteraction("purchase", item.listing_id || item.id, "listing", item.category, item.price);
    toast({ title: "✅ Nabbed!", description: `${item.name} added to your collection.` });
  };

  const handleBookmark = (item: FeedItem) => {
    setSavedItems((s) => [item, ...s]);
    saveToDb(item);
    track("bookmark", { item_id: item.id, category: item.category, price: item.price });
    trackInteraction("save", item.listing_id || item.id, "listing", item.category, item.price);
    toast({ title: "🔖 Saved!", description: item.name });
  };

  const handleLike = (item: FeedItem) => {
    track("like_item", { item_id: item.id, category: item.category });
    trackInteraction("click", item.listing_id || item.id, "listing", item.category, item.price);
  };

  const handleRefresh = useCallback(async () => {
    await loadFeed();
  }, []);




  return (
    <div className="min-h-screen bg-background pb-24">


      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-20 -left-32 w-64 h-64 rounded-full blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute top-[50%] -right-32 w-64 h-64 rounded-full blur-[120px]" style={{ background: "hsl(var(--nab-purple))" }} />
      </div>

      {/* ─── Premium Header ─── */}
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/30">
        <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
          <NabbitLogo size="md" />
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl" onClick={() => navigate("/dream-buys")}>
              <Zap className="w-4.5 h-4.5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl relative" onClick={() => navigate("/notifications")}>
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full animate-pulse" />
            </Button>
            <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl relative">
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

      {/* ─── Live Streams ─── */}
      <div className="px-4 pt-4 pb-2 max-w-lg mx-auto relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20">
              <Radio className="w-3 h-3 text-destructive animate-pulse" />
              <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">Live</span>
            </div>
            <span className="text-sm font-heading font-bold text-foreground">Streams</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground gap-1 rounded-xl" onClick={() => navigate("/play")}>
            See all <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {liveStreams.map((stream) => (
            <LiveStreamCard key={stream.id} stream={stream} />
          ))}
        </div>
      </div>

      {/* ─── AI Recommendations ─── */}
      <div className="max-w-lg mx-auto px-4 pt-3 relative z-10">
        <AIFeedRecommendations />
      </div>

      {/* ─── Category Pills ─── */}
      <div className="px-4 py-3 overflow-x-auto max-w-lg mx-auto relative z-10">
        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "text-primary-foreground border-primary/30 shadow-lg"
                  : "bg-card/50 backdrop-blur-sm border-border/50 text-muted-foreground hover:border-primary/20 hover:text-foreground"
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
      <div className="max-w-lg mx-auto px-4 relative z-10">
        <PullToRefresh onRefresh={handleRefresh}>
          {loading ? (
            <div className="flex flex-col gap-5">
              {[0, 1, 2].map((i) => (
                <FeedCardSkeleton key={i} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {visibleItems.map((item) => (
                <SwipeableCard
                  key={item.id}
                  onSwipeRight={() => handleBookmark(item)}
                  onSwipeLeft={() => track("swipe_left", { item_id: item.id })}
                  rightLabel="Save 🔖"
                  leftLabel="Skip ✕"
                >
                  <SocialFeedCard
                    item={item}
                    onNab={() => handleNab(item)}
                    onBookmark={() => handleBookmark(item)}
                    onLike={() => handleLike(item)}
                  />
                </SwipeableCard>
              ))}

              {/* Infinite scroll sentinel */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-6">
                  {loadingMore && <FeedCardSkeleton index={0} />}
                </div>
              )}

              {filtered.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  {/* Animated empty state illustration */}
                  <div className="relative w-36 h-36 mb-6">
                    {/* Animated gradient ring */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "conic-gradient(from 0deg, hsl(var(--nab-cyan) / 0.4), hsl(var(--nab-blue) / 0.4), hsl(var(--nab-purple) / 0.4), transparent 70%)",
                        padding: "2px",
                        WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
                        mask: "radial-gradient(farthest-side, transparent calc(100% - 2px), black calc(100% - 2px))",
                      }}
                    />
                    {/* Floating cards animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 shadow-lg absolute"
                        style={{ transform: "translateX(-8px)" }}
                      />
                      <motion.div
                        animate={{ y: [0, -14, 0], rotate: [3, -3, 3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                        className="w-16 h-20 rounded-xl bg-gradient-to-br from-accent/20 to-nab-purple/20 border border-accent/30 shadow-lg absolute"
                        style={{ transform: "translateX(8px)" }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                      >
                        <ShoppingBag className="w-5 h-5 text-primary-foreground" />
                      </motion.div>
                    </div>
                  </div>

                  <h3 className="font-heading font-black text-foreground text-xl">You've seen it all!</h3>
                  <p className="text-muted-foreground text-sm mt-2 max-w-xs leading-relaxed">
                    No more items in <span className="text-primary font-bold">{activeCategory === "All" ? "your feed" : activeCategory}</span>. Pull down or tap below to refresh.
                  </p>
                  <Button className="mt-5 rounded-xl shimmer-btn gap-2 font-bold" onClick={loadFeed}>
                    <Zap className="w-4 h-4" /> Refresh Feed
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </PullToRefresh>
      </div>

      <BackToTop />
      <BottomNav />
    </div>
  );
};

export default Feed;
