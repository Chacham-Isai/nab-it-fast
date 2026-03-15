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
import nabbitLogo from "@/assets/nabbit-logo.png";

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

    // Text search — use ilike for server-side search
    if (debouncedSearch.trim()) {
      query = query.ilike("title", `%${debouncedSearch.trim()}%`);
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
    <div className="min-h-screen bg-background pb-20">
      {/* ─── Sticky Header ─── */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <Link to="/" className="shrink-0">
              <img src={nabbitLogo} alt="nabbit" className="h-6" />
            </Link>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search cards, sneakers, watches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 bg-secondary/50 border-border/50 h-11 rounded-xl text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl relative transition-all ${showFilters ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-purple)))", color: "white" }}>
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
                {/* Categories */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5">Category</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          category === c
                            ? "text-primary-foreground shadow-md"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                        style={category === c ? { background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)))" } : {}}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listing Types */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5">Type</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {listingTypes.map((t) => (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                          type === t
                            ? "bg-accent text-accent-foreground shadow-md"
                            : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range & Sort */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Price Range</p>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        placeholder="Min $"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="h-9 rounded-lg bg-secondary/50 border-border/50 text-xs"
                      />
                      <span className="text-muted-foreground text-xs">—</span>
                      <Input
                        type="number"
                        placeholder="Max $"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="h-9 rounded-lg bg-secondary/50 border-border/50 text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Sort By</p>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="w-full h-9 rounded-lg bg-secondary/50 border border-border/50 text-xs text-foreground px-2"
                    >
                      {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-xs text-primary hover:underline font-medium">
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
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan) / 0.2), hsl(var(--nab-purple) / 0.2))" }}>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Searching listings...</span>
          </div>
        ) : listings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-heading font-bold text-foreground text-lg">No listings found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {debouncedSearch ? `No results for "${debouncedSearch}"` : "Try adjusting your filters or check back later for new drops"}
            </p>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={clearFilters}>Clear Filters</Button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-bold text-foreground">{totalCount}</span> {totalCount === 1 ? "item" : "items"}
                {debouncedSearch && <> matching "<span className="text-primary font-medium">{debouncedSearch}</span>"</>}
              </p>
              {!showFilters && (
                <button onClick={() => setShowFilters(true)} className="text-xs text-primary font-medium flex items-center gap-1">
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
                    className="group rounded-2xl bg-card border border-border/50 overflow-hidden cursor-pointer hover:border-primary/30 transition-all hover:shadow-lg"
                    style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-secondary">
                      <img
                        src={displayImage}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                      {/* Top badges */}
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/90 text-primary-foreground backdrop-blur-sm">
                          {listing.listing_type.replace("_", " ")}
                        </span>
                      </div>
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/50 text-white/90 backdrop-blur-sm">
                        {listing.category}
                      </span>

                      {/* Urgency */}
                      {listing.quantity <= 3 && (
                        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
                          <Flame className="w-3 h-3" /> {listing.quantity} left
                        </div>
                      )}

                      {/* Auction timer */}
                      {timeLeft > 0 && listing.listing_type === "auction" && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <Countdown seconds={timeLeft} urgentThreshold={300} className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-3.5">
                      <h3 className="font-heading font-bold text-foreground text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">{listing.condition}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <span className="text-lg font-black text-foreground">${price?.toLocaleString()}</span>
                          {listing.buy_now_price && listing.buy_now_price > price && (
                            <span className="text-xs text-muted-foreground line-through ml-1.5">${listing.buy_now_price.toLocaleString()}</span>
                          )}
                        </div>
                        {auction && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Gavel className="w-3.5 h-3.5" />
                            <span className="font-medium">{auction.bid_count} bids</span>
                          </div>
                        )}
                      </div>

                      {/* Watchers */}
                      {auction && auction.watchers > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
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
