import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { ShoppingBag, X, Bookmark, Zap, Bell, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";

interface FeedItem {
  id: number;
  name: string;
  category: string;
  price: number;
  was: number;
  emoji: string;
  tag: string;
  hot: boolean;
  left: number;
  reason: string;
  score: number;
}

const mockFeed: FeedItem[] = [
  { id: 1, name: "Air Jordan 1 Retro High OG 'Chicago'", category: "Sneakers", price: 289, was: 380, emoji: "👟", tag: "DREAM MATCH", hot: true, left: 3, reason: "Matches your sneaker vibe + Jordan affinity", score: 97 },
  { id: 2, name: "1986 Fleer Michael Jordan RC #57", category: "Cards", price: 4200, was: 5500, emoji: "🃏", tag: "LIMITED DROP", hot: true, left: 1, reason: "Top pick for sports card collectors", score: 94 },
  { id: 3, name: "Apple Vision Pro 256GB", category: "Tech", price: 3299, was: 3499, emoji: "🥽", tag: "PRICE DROP", hot: false, left: 12, reason: "Based on your tech setup vibe", score: 88 },
  { id: 4, name: "Rolex Submariner Date 126610LN", category: "Watches", price: 12800, was: 14500, emoji: "⌚", tag: "FIND", hot: true, left: 1, reason: "Dream watch match — below market", score: 96 },
  { id: 5, name: "Supreme Box Logo Hoodie FW23", category: "Streetwear", price: 425, was: 550, emoji: "🧥", tag: "VINTAGE FIND", hot: false, left: 8, reason: "Streetwear + Supreme brand match", score: 82 },
  { id: 6, name: "LEGO Star Wars UCS Millennium Falcon", category: "Vintage", price: 699, was: 849, emoji: "🧱", tag: "PRICE DROP", hot: false, left: 5, reason: "LEGO collector match", score: 85 },
];

const categories = ["All", "Cards", "Sneakers", "Tech", "Watches", "Streetwear", "Vintage"];

const tagColors: Record<string, string> = {
  "DREAM MATCH": "bg-primary text-primary-foreground",
  "LIMITED DROP": "bg-destructive text-destructive-foreground",
  "PRICE DROP": "bg-success text-primary-foreground",
  "FIND": "bg-primary text-primary-foreground",
  "VINTAGE FIND": "bg-secondary text-secondary-foreground",
  "TECH": "bg-secondary text-secondary-foreground",
};

const SwipeCard = ({ item, isTop, onSwipe, onBookmark }: {
  item: FeedItem;
  isTop: boolean;
  onSwipe: (dir: "left" | "right") => void;
  onBookmark: () => void;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const nabOpacity = useTransform(x, [0, 80], [0, 1]);
  const passOpacity = useTransform(x, [-80, 0], [1, 0]);

  return (
    <motion.div
      style={{ x, rotate, zIndex: isTop ? 10 : 1 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 80) onSwipe("right");
        else if (info.offset.x < -80) onSwipe("left");
      }}
      className="absolute inset-0 touch-none"
    >
      <div className="w-full h-full rounded-3xl border border-border bg-card overflow-hidden shadow-lg">
        <motion.div style={{ opacity: nabOpacity }} className="absolute inset-0 bg-success/20 z-20 flex items-center justify-center pointer-events-none rounded-3xl">
          <span className="text-4xl font-heading font-black text-success rotate-[-15deg] border-4 border-success px-6 py-2 rounded-xl">NAB IT ✓</span>
        </motion.div>
        <motion.div style={{ opacity: passOpacity }} className="absolute inset-0 bg-destructive/20 z-20 flex items-center justify-center pointer-events-none rounded-3xl">
          <span className="text-4xl font-heading font-black text-destructive rotate-[15deg] border-4 border-destructive px-6 py-2 rounded-xl">PASS ✗</span>
        </motion.div>

        <div className="h-[55%] bg-secondary flex items-center justify-center relative">
          <span className="text-6xl">{item.emoji}</span>
          <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold ${tagColors[item.tag] || "bg-secondary text-secondary-foreground"}`}>
            {item.tag}
          </span>
          <span className="absolute top-3 right-3 text-xs text-muted-foreground font-medium bg-background/80 px-2 py-0.5 rounded-full">
            {item.category}
          </span>
          {item.hot && (
            <span className="absolute bottom-3 right-3 text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
              🔥 {item.left} left
            </span>
          )}
        </div>

        <div className="h-[45%] p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-heading font-bold text-foreground text-sm leading-tight line-clamp-2">{item.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">{item.reason}</p>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-foreground">${item.price.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground line-through">${item.was.toLocaleString()}</span>
              <span className="text-xs font-bold text-success">-{Math.round((1 - item.price / item.was) * 100)}%</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${item.score}%` }} />
              </div>
              <span className="text-xs font-mono text-primary font-bold">{item.score}%</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-3 h-3 ${s <= Math.round(item.score / 20) ? "fill-primary text-primary" : "text-muted"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Feed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState(mockFeed);
  const [saved, setSaved] = useState<FeedItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);
  const visibleCards = filtered.slice(0, 3);

  const saveToDb = async (item: FeedItem) => {
    if (!user) return;
    try {
      await supabase.from("saved_items").insert({
        user_id: user.id,
        item_name: item.name,
        category: item.category,
        price: item.price,
        was_price: item.was,
        image_emoji: item.emoji,
        tag: item.tag,
      });
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  const handleSwipe = (dir: "left" | "right") => {
    const item = filtered[0];
    if (!item) return;
    if (dir === "right") {
      setSaved((s) => [item, ...s]);
      saveToDb(item);
      toast({ title: "✅ Nabbed!", description: "Added to your saved items." });
    } else {
      toast({ title: "✗ Passed", description: item.name });
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleBookmark = () => {
    const item = filtered[0];
    if (!item) return;
    setSaved((s) => [item, ...s]);
    saveToDb(item);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    toast({ title: "🔖 Saved!", description: item.name });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img src={nabbitLogo} alt="nabbit" className="h-5" style={{ mixBlendMode: "lighten" }} />
            <span className="font-heading font-bold text-foreground text-lg">Today's Drops</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dream-buys")}>
              <Zap className="w-5 h-5 text-primary" />
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notifications")}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="w-5 h-5" />
              {saved.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {saved.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 max-w-lg mx-auto">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        <div className="relative h-[420px] w-full">
          {visibleCards.length > 0 ? (
            visibleCards.map((item, i) => (
              <div key={item.id} className="absolute inset-0" style={{ transform: `scale(${1 - i * 0.04}) translateY(${i * 8}px)`, zIndex: 3 - i }}>
                <SwipeCard item={item} isTop={i === 0} onSwipe={handleSwipe} onBookmark={handleBookmark} />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-5xl mb-4">🎉</span>
              <h3 className="font-heading font-bold text-foreground text-xl">You nabbed it all!</h3>
              <p className="text-muted-foreground text-sm mt-2">Check back tomorrow for new drops</p>
              <Button className="mt-4 rounded-full" onClick={() => setItems(mockFeed)}>Refresh Feed</Button>
              <Button variant="ghost" className="mt-2" onClick={() => navigate("/dream-buys")}>Set up Dream Buys →</Button>
            </div>
          )}
        </div>

        {visibleCards.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-4">
            <button onClick={() => handleSwipe("left")} className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center hover:border-destructive hover:text-destructive transition-all active:scale-95">
              <X className="w-6 h-6" />
            </button>
            <button onClick={() => handleSwipe("right")} className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg active:scale-95 transition-transform" style={{ boxShadow: "0 0 20px hsl(var(--coral) / 0.4)" }}>
              <ShoppingBag className="w-7 h-7" />
            </button>
            <button onClick={handleBookmark} className="w-14 h-14 rounded-full border-2 border-border bg-card flex items-center justify-center hover:border-primary hover:text-primary transition-all active:scale-95">
              <Bookmark className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {saved.length > 0 && (
        <div className="max-w-lg mx-auto px-4 mt-8">
          <h3 className="font-heading font-bold text-foreground mb-3">Saved Drops</h3>
          <div className="space-y-2">
            {saved.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <span className="font-bold text-foreground text-sm">${item.price.toLocaleString()}</span>
                <Button variant="ghost" size="sm" className="text-primary text-xs">Buy</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Feed;
