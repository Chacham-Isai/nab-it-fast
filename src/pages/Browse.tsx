import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, Loader2, Gavel, X, Eye, Clock, Flame, Tag, ChevronRight, ShoppingBag, Bookmark, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import Countdown from "@/components/Countdown";
import usePageMeta from "@/hooks/usePageMeta";
import NabbitLogo from "@/components/NabbitLogo";
import { useTrackInteraction } from "@/hooks/useTrackInteraction";

// Product placeholder images
import imgCardsBox from "@/assets/products/cards-box.jpg";
import imgSneakersJordans from "@/assets/products/sneakers-jordans.jpg";
import imgWatchRolex from "@/assets/products/watch-rolex.jpg";
import imgElectronicsVr from "@/assets/products/electronics-vr.jpg";
import imgCollectiblePokemon from "@/assets/products/collectible-pokemon.jpg";
import imgFashionBag from "@/assets/products/fashion-bag.jpg";
import imgCardsPrizm from "@/assets/products/cards-prizm.jpg";
import imgSneakersDunks from "@/assets/products/sneakers-dunks.jpg";

const categories = ["All", "Cards", "Sneakers", "Watches", "Electronics", "Collectibles", "Fashion"];
const listingTypes = ["All", "Auction", "Buy Now", "Break", "Grab Bag"];
const sortOptions = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Ending Soon", value: "ending_soon" },
  { label: "Most Bids", value: "most_bids" },
];

const categoryImages: Record<string, string[]> = {
  Cards: [imgCardsBox, imgCardsPrizm],
  Sneakers: [imgSneakersJordans, imgSneakersDunks],
  Electronics: [imgElectronicsVr],
  Watches: [imgWatchRolex],
  Collectibles: [imgCollectiblePokemon],
  Fashion: [imgFashionBag],
};
const allPlaceholders = [imgCardsBox, imgSneakersJordans, imgWatchRolex, imgElectronicsVr, imgCollectiblePokemon, imgFashionBag, imgCardsPrizm, imgSneakersDunks];

const getPlaceholderImage = (category: string, index: number) => {
  const imgs = categoryImages[category] || allPlaceholders;
  return imgs[index % imgs.length];
};

const typeMap: Record<string, string> = {
  Auction: "auction",
  "Buy Now": "buy_now",
  Break: "break",
  "Grab Bag": "grab_bag",
};

const Browse = () => {
  usePageMeta({ title: "Browse — nabbit.ai", description: "Browse auctions, buy-now deals, breaks, and grab bags. Find your next nab.", path: "/browse" });
  const navigate = useNavigate();
  const { track: trackInteraction } = useTrackInteraction();
  const [searchParams, setSearchParams] = useSearchParams();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters from URL
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("cat") || "All");
  const [type, setType] = useState(searchParams.get("type") || "All");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [showFilters, setShowFilters] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

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

  // Server-side query — runs when any filter changes
  const loadListings = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("listings")
      .select("*, auctions(*)", { count: "exact" })
      .eq("status", "active");

    // Category filter
    if (category !== "All") {
      query = query.eq("category", category);
    }

    // Listing type filter
    if (type !== "All" && typeMap[type]) {
      query = query.eq("listing_type", typeMap[type]);
    }

    // Text search — use Postgres full-text search via tsvector
    if (debouncedSearch.trim()) {
      query = query.textSearch("search_vector", debouncedSearch.trim(), { type: "websearch" });
    }

    // Price range — filter on starting_price server-side
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      query = query.gte("starting_price", min);
    }
    if (!isNaN(max)) {
      query = query.lte("starting_price", max);
    }

    // Sort
    switch (sort) {
      case "price_asc":
        query = query.order("starting_price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("starting_price", { ascending: false });
        break;
      case "ending_soon":
        query = query.not("ends_at", "is", null).order("ends_at", { ascending: true });
        break;
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    query = query.limit(100);

    const { data, count } = await query;
    let results = data || [];

    // Client-side sort for "most_bids" (requires joined data)
    if (sort === "most_bids") {
      results = [...results].sort(
        (a: any, b: any) => (b.auctions?.[0]?.bid_count ?? 0) - (a.auctions?.[0]?.bid_count ?? 0)
      );
    }

    setListings(results);
    setTotalCount(count ?? results.length);
    setLoading(false);
  }, [category, type, debouncedSearch, minPrice, maxPrice, sort]);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  const getTimeLeft = (endsAt: string) => Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));

  const activeFilterCount = [category !== "All", type !== "All", minPrice, maxPrice, sort !== "newest"].filter(Boolean).length;

  const clearFilters = () => {
    setCategory("All");
    setType("All");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setSearch("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ─── Sticky Header ─── */}
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <NabbitLogo size="sm" />
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search cards, sneakers, watches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 bg-secondary/30 border-border/50 h-11 rounded-xl text-sm font-medium placeholder:text-muted-foreground/50"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl relative transition-all ${showFilters ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)]" : "bg-secondary/30 border border-border/50 text-muted-foreground hover:text-foreground hover:border-primary/30"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center bg-primary text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* ─── Filter Panel ─── */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-3"
              >
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1.5">Category</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all uppercase tracking-wider ${
                          category === c
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)]"
                            : "bg-secondary/30 text-muted-foreground border border-border/50 hover:border-primary/30"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mb-1.5">Type</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {listingTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap transition-all uppercase tracking-wider ${
                          type === t
                            ? "bg-gradient-to-r from-accent to-nab-purple text-primary-foreground shadow-[0_0_16px_-4px_hsl(var(--accent)/0.4)]"
                            : "bg-secondary/30 text-muted-foreground border border-border/50 hover:border-primary/30"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Price Range</p>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        placeholder="Min $"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-9 rounded-xl bg-secondary/30 border-border/50 text-xs font-medium"
                      />
                      <span className="text-muted-foreground/40 text-xs">—</span>
                      <Input
                        type="number"
                        placeholder="Max $"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-9 rounded-xl bg-secondary/30 border-border/50 text-xs font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">Sort By</p>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full h-9 rounded-xl bg-secondary/30 border border-border/50 text-xs text-foreground px-2 font-medium"
                    >
                      {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline font-bold">
                    ✕ Clear all filters
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Results ─── */}
      <div className="max-w-5xl mx-auto px-4 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-7 h-7 text-primary" />
            </motion.div>
            <span className="text-xs text-muted-foreground font-medium">Searching listings...</span>
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              <Search className="w-7 h-7 text-primary" />
            </motion.div>
            <h3 className="font-heading font-black text-foreground text-lg">No listings found</h3>
            <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : "Try adjusting your filters or check back later for new drops"}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="mt-5 rounded-full border-primary/30 text-primary font-bold" onClick={clearFilters}>Clear Filters</Button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground font-medium">
                <span className="font-black text-foreground">{totalCount}</span> {totalCount === 1 ? "item" : "items"}
                {debouncedSearch && <> matching "<span className="text-primary font-bold">{debouncedSearch}</span>"</>}
              </p>
              {!showFilters && (
                <button onClick={() => setShowFilters(true)} className="text-xs text-primary font-bold flex items-center gap-1 hover:underline">
                  <SlidersHorizontal className="w-3 h-3" /> Filters
                </button>
              )}
            </div>

            {/* Grid of listings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing, i) => {
                const auction = listing.auctions?.[0];
                const timeLeft = listing.ends_at ? getTimeLeft(listing.ends_at) : 0;
                const price = auction?.current_price ?? listing.starting_price;
                const hasImage = listing.images && listing.images.length > 0 && listing.images[0];
                const displayImage = hasImage ? listing.images[0] : getPlaceholderImage(listing.category, i);

                return (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    className="group rounded-2xl glass-card gradient-border overflow-hidden cursor-pointer hover:shadow-[0_0_30px_-6px_hsl(var(--primary)/0.2)] transition-all"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-secondary/30">
                      <img
                        src={displayImage}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

                      {/* Top badges */}
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/90 text-primary-foreground backdrop-blur-sm shadow-lg">
                          {listing.listing_type.replace("_", " ")}
                        </span>
                      </div>
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-background/70 text-foreground backdrop-blur-sm border border-border/30">
                        {listing.category}
                      </span>

                      {/* Urgency */}
                      {listing.quantity <= 3 && (
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black uppercase tracking-wider">
                          <Flame className="w-3 h-3" /> {listing.quantity} left
                        </div>
                      )}

                      {/* Auction timer */}
                      {timeLeft > 0 && listing.listing_type === "auction" && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <Countdown seconds={timeLeft} urgentThreshold={300} className="text-[10px] bg-background/70 text-foreground px-2.5 py-1 rounded-full backdrop-blur-sm border border-border/30 font-bold" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1 font-medium">{listing.condition}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-heading font-black text-foreground">${price?.toLocaleString()}</span>
                          {listing.buy_now_price && listing.buy_now_price > price && (
                            <span className="text-[10px] text-muted-foreground line-through ml-1.5">${listing.buy_now_price.toLocaleString()}</span>
                          )}
                        </div>
                        {auction && (
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground bg-secondary/30 px-2 py-1 rounded-full border border-border/30">
                            <Gavel className="w-3 h-3" />
                            <span className="font-bold">{auction.bid_count} bids</span>
                          </div>
                        )}
                      </div>

                      {auction && auction.watchers > 0 && (
                        <div className="flex items-center gap-1 mt-2.5 text-[10px] text-muted-foreground">
                          <Eye className="w-3 h-3" /> {auction.watchers} watching
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Browse;
