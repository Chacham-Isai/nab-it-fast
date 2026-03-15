import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, SlidersHorizontal, Loader2, Gavel, ShoppingBag, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import Countdown from "@/components/Countdown";

const categories = ["All", "Cards", "Sneakers", "Watches", "Electronics", "Collectibles", "Fashion"];
const listingTypes = ["All", "Auction", "Buy Now", "Break", "Grab Bag"];

const Browse = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadListings();
  }, [category, type]);

  const loadListings = async () => {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, auctions(*), seller_profiles!listings_seller_id_fkey(shop_name, rating)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(50);

    if (category !== "All") query = query.eq('category', category);
    if (type !== "All") query = query.eq('listing_type', type.toLowerCase().replace(' ', '_'));

    const { data } = await query;
    setListings(data || []);
    setLoading(false);
  };

  const filtered = listings.filter(l =>
    !search || l.title.toLowerCase().includes(search.toLowerCase())
  );

  const getTimeLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/50 border-border h-10 rounded-xl"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl ${showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="max-w-lg mx-auto space-y-2 overflow-hidden">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {categories.map(c => (
                <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{c}</button>
              ))}
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {listingTypes.map(t => (
                <button key={t} onClick={() => setType(t)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t}</button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No listings found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">{filtered.length} items</p>
            {filtered.map((listing, i) => {
              const auction = listing.auctions?.[0];
              const timeLeft = listing.ends_at ? getTimeLeft(listing.ends_at) : 0;

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  className="p-4 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-3xl shrink-0">
                      {listing.listing_type === 'auction' ? '🔨' : listing.listing_type === 'grab_bag' ? '📦' : listing.listing_type === 'break' ? '🎴' : '🛍️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground font-medium">{listing.category}</span>
                        <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full text-primary font-medium">{listing.listing_type.replace('_', ' ')}</span>
                      </div>
                      <h3 className="font-semibold text-foreground text-sm truncate">{listing.title}</h3>
                      <p className="text-xs text-muted-foreground">{listing.condition}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">
                        ${auction ? auction.current_price?.toLocaleString() : listing.starting_price?.toLocaleString()}
                      </p>
                      {auction && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Gavel className="w-3 h-3" /> {auction.bid_count} bids
                        </p>
                      )}
                      {timeLeft > 0 && (
                        <Countdown seconds={timeLeft} urgentThreshold={300} className="text-xs" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Browse;
