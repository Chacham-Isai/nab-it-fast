import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Gavel, Eye, Shield, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/useAnalytics";
import { toast } from "@/hooks/use-toast";
import usePageMeta from "@/hooks/usePageMeta";

const getIncrement = (bid: number) => {
  if (bid < 500) return 25;
  if (bid < 2000) return 50;
  return 100;
};

const Auctions = () => {
  usePageMeta({ title: "Auctions — nabbit.ai", description: "Bid on exclusive items in live auctions. Real-time bidding with auto-extend.", path: "/auctions" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [bidsMap, setBidsMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [bidTab, setBidTab] = useState<Record<string, "bid" | "history">>({});
  const [customBid, setCustomBid] = useState<Record<string, string>>({});
  const [proxyBid, setProxyBid] = useState<Record<string, string>>({});
  const [bidding, setBidding] = useState<string | null>(null);
  const [bidError, setBidError] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Cards", "Sneakers", "Watches", "Ending Soon"];

  useEffect(() => {
    loadAuctions();

    // Subscribe to realtime auction updates
    const channel = supabase
      .channel('auctions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auctions' }, () => {
        loadAuctions();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids' }, () => {
        loadAuctions();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadAuctions = async () => {
    const { data: auctionData } = await supabase
      .from('auctions')
      .select('*, listings(id, title, category, condition, images, seller_id, buy_now_price, starting_price, listing_type), profiles:highest_bidder_id(display_name)')
      .in('status', ['live', 'ended'])
      .order('ends_at', { ascending: true });

    if (auctionData) {
      setAuctions(auctionData);

      // Load bid history for each auction
      const auctionIds = auctionData.map((a: any) => a.id);
      if (auctionIds.length > 0) {
        const { data: allBids } = await supabase
          .from('bids')
          .select('*, profiles:bidder_id(display_name)')
          .in('auction_id', auctionIds)
          .order('created_at', { ascending: false })
          .limit(50);

        const grouped: Record<string, any[]> = {};
        (allBids || []).forEach((bid: any) => {
          if (!grouped[bid.auction_id]) grouped[bid.auction_id] = [];
          grouped[bid.auction_id].push(bid);
        });
        setBidsMap(grouped);
      }
    }
    setLoading(false);
  };

  const getTimeLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const filtered = auctions.filter((a) => {
    const listing = a.listings;
    if (!listing) return false;
    if (filter === "All") return true;
    if (filter === "Ending Soon") return getTimeLeft(a.ends_at) < 600;
    return listing.category === filter;
  });

  const placeBid = async (auctionId: string, amount: number) => {
    if (!user) {
      toast({ title: "Please log in", description: "You need an account to bid.", variant: "destructive" });
      navigate("/login");
      return;
    }

    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction) return;
    const minBid = auction.current_price + auction.bid_increment;
    if (amount < minBid) {
      setBidError((e) => ({ ...e, [auctionId]: `Minimum bid is $${minBid.toLocaleString()}` }));
      return;
    }
    setBidError((e) => ({ ...e, [auctionId]: "" }));
    setBidding(auctionId);

    try {
      const { data, error } = await supabase.functions.invoke('place-bid', {
        body: { auction_id: auctionId, amount, bid_type: 'manual' },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Bid placed! 🎉", description: `Your bid of $${amount.toLocaleString()} is now the highest.` });
      setCustomBid((c) => ({ ...c, [auctionId]: "" }));
      await loadAuctions();
    } catch (err: any) {
      setBidError((e) => ({ ...e, [auctionId]: err.message || 'Failed to place bid' }));
    } finally {
      setBidding(null);
    }
  };

  const setProxyBidFn = async (auctionId: string) => {
    if (!user) { navigate("/login"); return; }
    const amount = parseFloat(proxyBid[auctionId] || "0");
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction || amount <= auction.current_price) {
      setBidError((e) => ({ ...e, [auctionId]: "Proxy bid must be higher than current price" }));
      return;
    }

    const minBid = auction.current_price + auction.bid_increment;
    try {
      const { data, error } = await supabase.functions.invoke('place-bid', {
        body: { auction_id: auctionId, amount: minBid, bid_type: 'proxy', max_proxy_amount: amount },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Proxy bid set! 🤖", description: `Auto-bidding up to $${amount.toLocaleString()}` });
      setProxyBid((p) => ({ ...p, [auctionId]: "" }));
      await loadAuctions();
    } catch (err: any) {
      setBidError((e) => ({ ...e, [auctionId]: err.message }));
    }
  };

  const getCategoryEmoji = (cat: string) => {
    const map: Record<string, string> = { Cards: "🃏", Sneakers: "👟", Watches: "⌚", Electronics: "🥽", Collectibles: "🏆", Fashion: "🧥" };
    return map[cat] || "📦";
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Live Auctions</h1>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold">
            {auctions.filter(a => a.status === 'live').length} Active
          </span>
        </div>
      </div>

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 max-w-lg mx-auto">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${filter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/10">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs text-foreground">All items are verified authentic.</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No active auctions</p>
            <p className="text-xs text-muted-foreground mt-1">Check back soon or list your own item</p>
            <Button className="mt-4 rounded-xl shimmer-btn" onClick={() => navigate("/sell")}>Sell an Item</Button>
          </div>
        ) : filtered.map((auction, i) => {
          const listing = auction.listings;
          if (!listing) return null;
          const inc = auction.bid_increment;
          const minBid = auction.current_price + inc;
          const tab = bidTab[auction.id] || "bid";
          const timeLeft = getTimeLeft(auction.ends_at);
          const history = bidsMap[auction.id] || [];
          const isEnded = auction.status === 'ended' || timeLeft <= 0;

          return (
            <motion.div key={auction.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-4xl">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full rounded-xl object-cover" />
                    ) : getCategoryEmoji(listing.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground font-medium">{listing.category}</span>
                      {timeLeft < 300 && !isEnded && <span className="text-[10px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-bold">🔥 HOT</span>}
                      {isEnded && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">ENDED</span>}
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-sm mt-1">{listing.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{listing.condition}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-secondary text-center">
                    <p className="text-lg font-bold text-foreground">${auction.current_price?.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Current Bid</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Gavel className="w-3 h-3 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{auction.bid_count}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Bids</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary text-center">
                    {isEnded ? (
                      <p className="text-lg font-bold text-destructive">Ended</p>
                    ) : (
                      <Countdown seconds={timeLeft} urgentThreshold={300} className="text-lg" />
                    )}
                    <p className="text-[10px] text-muted-foreground">Time Left</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {auction.watchers} watching</span>
                  {!isEnded && <span>Min bid: ${minBid.toLocaleString()}</span>}
                  {listing.buy_now_price && !isEnded && <span className="text-success font-semibold">Buy Now: ${listing.buy_now_price.toLocaleString()}</span>}
                </div>

                {!isEnded && (
                  <>
                    <div className="flex gap-2">
                      <button onClick={() => setBidTab((t) => ({ ...t, [auction.id]: "bid" }))} className={`px-3 py-1 rounded-full text-xs font-medium ${tab === "bid" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Place Bid</button>
                      <button onClick={() => setBidTab((t) => ({ ...t, [auction.id]: "history" }))} className={`px-3 py-1 rounded-full text-xs font-medium ${tab === "history" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Bid History</button>
                    </div>

                    {tab === "bid" && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {[minBid, minBid + inc, minBid + inc * 2].map((amt) => (
                            <Button key={amt} variant="outline" size="sm" className="flex-1 rounded-xl text-xs" disabled={bidding === auction.id} onClick={() => placeBid(auction.id, amt)}>
                              ${amt.toLocaleString()}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input type="number" value={customBid[auction.id] || ""} onChange={(e) => setCustomBid((c) => ({ ...c, [auction.id]: e.target.value }))} className="pl-7 bg-secondary/50 border-border rounded-xl" placeholder={minBid.toLocaleString()} />
                          </div>
                          <Button disabled={bidding === auction.id} onClick={() => placeBid(auction.id, parseInt(customBid[auction.id] || "0"))} className="rounded-xl shimmer-btn">
                            {bidding === auction.id ? "Bidding..." : "Bid"}
                          </Button>
                        </div>
                        {bidError[auction.id] && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {bidError[auction.id]}
                          </p>
                        )}
                        <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                          <p className="text-xs font-semibold text-foreground">Max / Proxy Bid</p>
                          <p className="text-[10px] text-muted-foreground">We'll auto-bid for you up to your limit</p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                              <Input type="number" value={proxyBid[auction.id] || ""} onChange={(e) => setProxyBid((p) => ({ ...p, [auction.id]: e.target.value }))} className="pl-7 bg-background border-border rounded-xl" />
                            </div>
                            <Button variant="outline" className="rounded-xl text-xs" onClick={() => setProxyBidFn(auction.id)}>Set</Button>
                          </div>
                        </div>
                        {listing.buy_now_price && (
                          <Button variant="outline" className="w-full rounded-xl border-success/30 text-success hover:bg-success/10" onClick={async () => {
                            if (!user) { navigate("/login"); return; }
                            const { data, error } = await supabase.functions.invoke('create-checkout', {
                              body: { listing_id: listing.id, type: 'buy_now' },
                            });
                            if (data?.url) window.location.href = data.url;
                            else toast({ title: "Error", description: error?.message || data?.error || "Checkout failed", variant: "destructive" });
                          }}>
                            Buy Now — ${listing.buy_now_price.toLocaleString()}
                          </Button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {(tab === "history" || isEnded) && (
                  <div className="space-y-1.5">
                    {history.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No bids yet — be the first!</p>
                    ) : history.map((h: any, i: number) => (
                      <div key={h.id} className={`flex items-center gap-3 p-2.5 rounded-xl ${h.bidder_id === user?.id ? "bg-primary/10 border border-primary/20" : "bg-secondary"}`}>
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${h.bidder_id === user?.id ? "text-primary" : "text-foreground"}`}>
                            {h.bidder_id === user?.id ? "You" : (h.profiles?.display_name || "Anonymous")}
                          </span>
                          {i === 0 && <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">TOP</span>}
                        </div>
                        <span className="font-bold text-foreground text-sm">${h.amount?.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTime(h.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default Auctions;
