import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Gavel, ShoppingBag, Share2, Bookmark, Star, Shield, Loader2, ChevronLeft, ChevronRight, Clock, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "@/hooks/use-toast";
import Countdown from "@/components/Countdown";
import BottomNav from "@/components/BottomNav";
import usePageMeta from "@/hooks/usePageMeta";
import ReviewList from "@/components/reviews/ReviewList";

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [listing, setListing] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const [saved, setSaved] = useState(false);

  usePageMeta({
    title: listing ? `${listing.title} — nabbit.ai` : "Listing — nabbit.ai",
    description: listing?.description || "View listing details",
    path: `/listing/${id}`,
  });

  useEffect(() => {
    if (id) loadListing();
  }, [id]);

  const loadListing = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*, auctions(*)")
      .eq("id", id!)
      .single();

    if (!data) { setLoading(false); return; }
    setListing(data);

    const auc = data.auctions?.[0];
    if (auc) {
      setAuction(auc);
      setBidAmount(String(auc.current_price + auc.bid_increment));
      // Load bids
      const { data: bidData } = await supabase
        .from("bids")
        .select("*, profiles:bidder_id(display_name, avatar_emoji)")
        .eq("auction_id", auc.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setBids(bidData || []);
    }

    // Load seller and reviews in parallel
    const [{ data: sellerData }, { data: reviewData }] = await Promise.all([
      supabase
        .from("seller_profiles")
        .select("*")
        .eq("id", data.seller_id)
        .single(),
      supabase
        .from("reviews")
        .select("*, profiles:reviewer_id(display_name, avatar_emoji)")
        .eq("seller_id", data.seller_id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    setSeller(sellerData);
    setReviews(reviewData || []);

    // Check saved
    if (user) {
      const { data: savedData } = await supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_name", data.title)
        .limit(1);
      if (savedData && savedData.length > 0) setSaved(true);
    }

    setLoading(false);
  };

  // Realtime auction updates
  useEffect(() => {
    if (!auction) return;
    const channel = supabase
      .channel(`auction-${auction.id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "auctions", filter: `id=eq.${auction.id}` }, (payload) => {
        setAuction(payload.new);
        setBidAmount(String((payload.new as any).current_price + (payload.new as any).bid_increment));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [auction?.id]);

  const handleBid = async () => {
    if (!user) { navigate("/login"); return; }
    if (!auction) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount < auction.current_price + auction.bid_increment) {
      toast({ title: "Invalid bid", description: `Minimum bid: $${(auction.current_price + auction.bid_increment).toFixed(2)}`, variant: "destructive" });
      return;
    }
    setBidding(true);
    try {
      const { data, error } = await supabase.functions.invoke("place-bid", {
        body: { auction_id: auction.id, amount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "🎉 Bid placed!", description: `You bid $${amount.toLocaleString()}` });
      track("bid_placed", { auction_id: auction.id, amount, listing_id: listing?.id });
      loadListing();
    } catch (err: any) {
      toast({ title: "Bid failed", description: err.message, variant: "destructive" });
    }
    setBidding(false);
  };

  const handleBuyNow = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { listing_id: listing.id, type: "buy_now" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    }
  };

  const handleSave = async () => {
    if (!user) { navigate("/login"); return; }
    if (saved) {
      toast({ title: "Already saved" });
      return;
    }
    await supabase.from("saved_items").insert({
      user_id: user.id,
      item_name: listing.title,
      category: listing.category,
      price: auction?.current_price || listing.starting_price,
      was_price: listing.buy_now_price,
      image_emoji: listing.listing_type === "auction" ? "🔨" : "🛍️",
      tag: "SAVED",
    });
    setSaved(true);
    toast({ title: "🔖 Saved!", description: listing.title });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "📋 Link copied!" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Listing not found</p>
        <Button onClick={() => navigate("/browse")}>Browse Listings</Button>
      </div>
    );
  }

  const images = listing.images && listing.images.length > 0 ? listing.images : null;
  const timeLeft = auction ? Math.max(0, Math.floor((new Date(auction.ends_at).getTime() - Date.now()) / 1000)) : 0;
  const isOwner = user?.id === listing.seller_id;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleShare}><Share2 className="w-5 h-5" /></Button>
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Bookmark className={`w-5 h-5 ${saved ? "fill-primary text-primary" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        {/* Image Gallery */}
        <div className="relative aspect-square bg-secondary flex items-center justify-center overflow-hidden">
          {images ? (
            <img src={images[imgIdx]} alt={listing.title} className="w-full h-full object-contain" />
          ) : (
            <span className="text-7xl">{listing.listing_type === "auction" ? "🔨" : listing.listing_type === "grab_bag" ? "📦" : "🛍️"}</span>
          )}
          {images && images.length > 1 && (
            <>
              <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_: string, i: number) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? "bg-primary w-4" : "bg-foreground/30"}`} />
                ))}
              </div>
            </>
          )}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="bg-background/90 text-foreground text-xs font-medium px-2.5 py-1 rounded-full">{listing.category}</span>
            <span className="bg-primary/90 text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">{listing.listing_type.replace("_", " ")}</span>
          </div>
        </div>

        {/* Thumbnail strip */}
        {images && images.length > 1 && (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto">
            {images.map((img: string, i: number) => (
              <button key={i} onClick={() => setImgIdx(i)} className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 ${i === imgIdx ? "border-primary" : "border-transparent"}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="px-4 py-4 space-y-4">
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">{listing.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{listing.condition} · Qty: {listing.quantity}</p>
          </div>

          {/* Auction info */}
          {auction && auction.status === "live" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Current Bid</p>
                  <p className="text-2xl font-bold text-foreground">${auction.current_price?.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end"><Clock className="w-3 h-3" /> Time Left</p>
                  {timeLeft > 0 ? (
                    <Countdown seconds={timeLeft} urgentThreshold={300} className="text-lg font-bold" />
                  ) : (
                    <span className="text-sm font-bold text-destructive">Ended</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Gavel className="w-3 h-3" /> {auction.bid_count} bids</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {auction.watchers} watchers</span>
                {auction.reserve_price && auction.current_price < auction.reserve_price && (
                  <span className="text-destructive font-medium">Reserve not met</span>
                )}
              </div>

              {!isOwner && timeLeft > 0 && (
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      className="w-full h-11 pl-7 pr-3 rounded-xl bg-secondary border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <Button onClick={handleBid} disabled={bidding} className="h-11 rounded-xl px-6 font-bold">
                    {bidding ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gavel className="w-4 h-4 mr-1" /> Bid</>}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {/* Buy Now */}
          {listing.buy_now_price && !isOwner && (
            <Button onClick={handleBuyNow} className="w-full h-12 rounded-xl text-base font-bold gap-2" style={{ boxShadow: "0 0 20px hsl(var(--nab-cyan) / 0.3)" }}>
              <ShoppingBag className="w-5 h-5" /> Buy Now — ${listing.buy_now_price.toLocaleString()}
            </Button>
          )}

          {/* Description */}
          {listing.description && (
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm mb-2">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            </div>
          )}

          {/* Seller Card */}
          {seller && (
            <div className="p-4 rounded-2xl bg-card border border-border">
              <h2 className="font-heading font-bold text-foreground text-sm mb-3">Seller</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                  {seller.shop_avatar || "🏪"}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">{seller.shop_name || "Seller"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= Math.round(seller.rating || 0) ? "fill-primary text-primary" : "text-muted"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">({seller.review_count || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{seller.total_sales || 0} sales</span>
                    {seller.verified && (
                      <span className="flex items-center gap-0.5 text-xs text-primary font-medium"><Shield className="w-3 h-3" /> Verified</span>
                    )}
                  </div>
                </div>
              </div>
              {seller.shop_description && (
                <p className="text-xs text-muted-foreground mt-3">{seller.shop_description}</p>
              )}
            </div>
          )}

          {/* Seller Reviews */}
          {reviews.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm mb-3">Seller Reviews</h2>
              <ReviewList reviews={reviews} />
            </div>
          )}

          {/* Bid History */}
          {bids.length > 0 && (
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm mb-3">Bid History</h2>
              <div className="space-y-2">
                {bids.map((bid, i) => (
                  <div key={bid.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-card border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{(bid.profiles as any)?.avatar_emoji || "🐇"}</span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{(bid.profiles as any)?.display_name || "Bidder"}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(bid.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">${bid.amount?.toLocaleString()}</p>
                      {i === 0 && <span className="text-[10px] text-primary font-bold">LEADING</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ListingDetail;
