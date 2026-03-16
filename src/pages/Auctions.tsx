import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Gavel, Eye, Shield, AlertTriangle, Loader2 } from "lucide-react";
import NabbitLogo from "@/components/NabbitLogo";
import { getCategoryImage } from "@/lib/images";
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
      track("bid_placed", { auction_id: auctionId, amount, bid_type: "manual" });
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
      track("bid_placed", { auction_id: auctionId, amount, bid_type: "proxy", max_proxy: amount });
      setProxyBid((p) => ({ ...p, [auctionId]: "" }));
      await loadAuctions();
    } catch (err: any) {
      setBidError((e) => ({ ...e, [auctionId]: err.message }));
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <NabbitLogo size="sm" />
          <h1 className="font-heading font-black text-foreground text-base tracking-tight flex-1">AUCTIONS</h1>
          <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-success/10 border border-success/20 text-success text-[10px] font-black uppercase tracking-wider">
            {auctions.filter(a => a.status === 'live').length} Live
          </span>
        </div>
      </div>

      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 max-w-lg mx-auto">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-black transition-all whitespace-nowrap uppercase tracking-wider ${filter === f ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]" : "bg-secondary/30 text-muted-foreground border border-border/50 hover:border-primary/30"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mb-4">
        <div className="flex items-center gap-2 p-3 rounded-xl glass-card border border-primary/20">
          <Shield className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground">All items are verified authentic.</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
              <Loader2 className="w-7 h-7 text-primary" />
            </motion.div>
            <span className="text-xs text-muted-foreground font-medium">Loading auctions...</span>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 flex items-center justify-center mx-auto mb-4"
            >
              <Gavel className="w-8 h-8 text-primary" />
            </motion.div>
            <p className="font-heading font-black text-foreground text-lg">No active auctions</p>
            <p className="text-xs text-muted-foreground mt-1.5">Check back soon or list your own item</p>
            <Button className="mt-5 rounded-xl shimmer-btn font-black text-xs uppercase tracking-wider gap-1" onClick={() => navigate("/sell")}>Sell an Item</Button>
          </motion.div>
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
            <motion.div key={auction.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl glass-card border border-border/50 overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border/50">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <img src={getCategoryImage(listing.category)} alt={listing.category} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full text-primary font-bold">{listing.category}</span>
                      {timeLeft < 300 && !isEnded && <span className="text-[10px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-black">🔥 HOT</span>}
                      {isEnded && <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">ENDED</span>}
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-sm mt-1">{listing.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{listing.condition}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/15 text-center">
                    <p className="text-lg font-heading font-black text-foreground">${auction.current_price?.toLocaleString()}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Current Bid</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Gavel className="w-3 h-3 text-muted-foreground" />
                      <p className="text-lg font-heading font-black text-foreground">{auction.bid_count}</p>
                    </div>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Bids</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary/30 border border-border/50 text-center">
                    {isEnded ? (
                      <p className="text-lg font-heading font-black text-destructive">Ended</p>
                    ) : (
                      <Countdown seconds={timeLeft} urgentThreshold={300} className="text-lg" />
                    )}
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Time Left</p>
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
                      <button onClick={() => setBidTab((t) => ({ ...t, [auction.id]: "bid" }))} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${tab === "bid" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)]" : "bg-secondary/30 text-muted-foreground border border-border/50"}`}>Place Bid</button>
                      <button onClick={() => setBidTab((t) => ({ ...t, [auction.id]: "history" }))} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${tab === "history" ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)]" : "bg-secondary/30 text-muted-foreground border border-border/50"}`}>Bid History</button>
                    </div>

                    {tab === "bid" && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {[minBid, minBid + inc, minBid + inc * 2].map((amt) => (
                            <Button key={amt} variant="outline" size="sm" className="flex-1 rounded-xl text-xs font-bold border-border/50 hover:border-primary/40 hover:bg-primary/5" disabled={bidding === auction.id} onClick={() => placeBid(auction.id, amt)}>
                              ${amt.toLocaleString()}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm font-bold">$</span>
                            <Input type="number" value={customBid[auction.id] || ""} onChange={(e) => setCustomBid((c) => ({ ...c, [auction.id]: e.target.value }))} className="pl-7 bg-secondary/30 border-border/50 rounded-xl font-medium" placeholder={minBid.toLocaleString()} />
                          </div>
                          <Button disabled={bidding === auction.id} onClick={() => placeBid(auction.id, parseInt(customBid[auction.id] || "0"))} className="rounded-xl shimmer-btn font-black text-xs uppercase tracking-wider">
                            {bidding === auction.id ? "Bidding..." : "Bid"}
                          </Button>
                        </div>
                        {bidError[auction.id] && (
                          <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                            <AlertTriangle className="w-3 h-3" /> {bidError[auction.id]}
                          </p>
                        )}
                        <div className="p-3.5 rounded-xl glass-card border border-border/50 space-y-2">
                          <p className="text-xs font-black text-foreground uppercase tracking-wider">Max / Proxy Bid</p>
                          <p className="text-[10px] text-muted-foreground">We'll auto-bid for you up to your limit</p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-sm font-bold">$</span>
                              <Input type="number" value={proxyBid[auction.id] || ""} onChange={(e) => setProxyBid((p) => ({ ...p, [auction.id]: e.target.value }))} className="pl-7 bg-secondary/30 border-border/50 rounded-xl font-medium" />
                            </div>
                            <Button variant="outline" className="rounded-xl text-xs font-bold border-border/50 hover:border-primary/30" onClick={() => setProxyBidFn(auction.id)}>Set</Button>
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
                  <div className="space-y-2">
                    {history.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4 font-medium">No bids yet — be the first!</p>
                    ) : history.map((h: any, i: number) => (
                      <div key={h.id} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${h.bidder_id === user?.id ? "bg-primary/10 border border-primary/20" : "bg-secondary/30 border border-border/30"}`}>
                        <div className="flex-1">
                          <span className={`text-sm font-bold ${h.bidder_id === user?.id ? "text-primary" : "text-foreground"}`}>
                            {h.bidder_id === user?.id ? "You" : (h.profiles?.display_name || "Anonymous")}
                          </span>
                          {i === 0 && <span className="ml-1.5 text-[9px] bg-gradient-to-r from-primary to-accent text-primary-foreground px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Top</span>}
                        </div>
                        <span className="font-heading font-black text-foreground text-sm">${h.amount?.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{formatTime(h.created_at)}</span>
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
