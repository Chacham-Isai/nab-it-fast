import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, SlidersHorizontal, Loader2, Gavel, X, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import Countdown from "@/components/Countdown";
import usePageMeta from "@/hooks/usePageMeta";

const categories = ["All", "Cards", "Sneakers", "Watches", "Electronics", "Collectibles", "Fashion"];
const listingTypes = ["All", "Auction", "Buy Now", "Break", "Grab Bag"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low", value: "price_asc" },
  { label: "Price: High", value: "price_desc" },
  { label: "Ending Soon", value: "ending_soon" },
  { label: "Most Bids", value: "most_bids" },
];

const Browse = () => {
  usePageMeta({ title: "Browse — nabbit.ai", description: "Browse auctions, buy-now deals, breaks, and grab bags. Find your next nab.", path: "/browse" });
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("cat") || "All");
  const [type, setType] = useState(searchParams.get("type") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    loadListings();
  }, [category, type]);

  // Sync URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category !== "All") params.set("cat", category);
    if (type !== "All") params.set("type", type);
    if (sort !== "newest") params.set("sort", sort);
    if (minPrice) params.set("min", minPrice);
    if (maxPrice) params.set("max", maxPrice);
    setSearchParams(params, { replace: true });
  }, [search, category, type, sort, minPrice, maxPrice]);

  const loadListings = async () => {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, auctions(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100);

    if (category !== "All") query = query.eq('category', category);
    if (type !== "All") {
      const typeMap: Record<string, string> = { "Auction": "auction", "Buy Now": "buy_now", "Break": "break", "Grab Bag": "grab_bag" };
      query = query.eq('listing_type', typeMap[type] || type.toLowerCase());
    }

    const { data } = await query;
    setListings(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    let result = listings;

    // Text search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
      );
    }

    // Price range
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      result = result.filter(l => {
        const price = l.auctions?.[0]?.current_price ?? l.starting_price;
        return price >= min;
      });
    }
    if (!isNaN(max)) {
      result = result.filter(l => {
        const price = l.auctions?.[0]?.current_price ?? l.starting_price;
        return price <= max;
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      const priceA = a.auctions?.[0]?.current_price ?? a.starting_price;
      const priceB = b.auctions?.[0]?.current_price ?? b.starting_price;
      switch (sort) {
        case "price_asc": return priceA - priceB;
        case "price_desc": return priceB - priceA;
        case "ending_soon": {
          const ea = a.ends_at ? new Date(a.ends_at).getTime() : Infinity;
          const eb = b.ends_at ? new Date(b.ends_at).getTime() : Infinity;
          return ea - eb;
        }
        case "most_bids": return (b.auctions?.[0]?.bid_count ?? 0) - (a.auctions?.[0]?.bid_count ?? 0);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [listings, debouncedSearch, minPrice, maxPrice, sort]);

  const getTimeLeft = (endsAt: string) => Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));

  const activeFilterCount = [category !== "All", type !== "All", minPrice, maxPrice, sort !== "newest"].filter(Boolean).length;

  const clearFilters = () => {
    setCategory("All");
    setType("All");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
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
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-xl relative ${showFilters ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="max-w-lg mx-auto space-y-2.5 overflow-hidden">
              {/* Categories */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {categories.map(c => (
                  <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{c}</button>
                ))}
              </div>
              {/* Types */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {listingTypes.map(t => (
                  <button key={t} onClick={() => setType(t)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${type === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t}</button>
                ))}
              </div>
              {/* Price range & Sort */}
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-1 flex-1">
                  <Input type="number" placeholder="Min $" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="h-8 rounded-lg bg-secondary/50 border-border text-xs" />
                  <span className="text-muted-foreground text-xs">—</span>
                  <Input type="number" placeholder="Max $" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="h-8 rounded-lg bg-secondary/50 border-border text-xs" />
                </div>
                <select value={sort} onChange={e => setSort(e.target.value)} className="h-8 rounded-lg bg-secondary/50 border border-border text-xs text-foreground px-2">
                  {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-primary hover:underline">Clear all filters</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
              const price = auction?.current_price ?? listing.starting_price;

              return (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                  className="p-3 rounded-2xl bg-card border border-border cursor-pointer hover:border-primary/30 transition-all"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      {listing.images?.[0] ? (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{listing.listing_type === 'auction' ? '🔨' : listing.listing_type === 'grab_bag' ? '📦' : listing.listing_type === 'break' ? '🎴' : '🛍️'}</span>
                      )}
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
                      <p className="text-sm font-bold text-foreground">${price?.toLocaleString()}</p>
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
