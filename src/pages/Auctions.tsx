import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gavel, Eye, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";
import BottomNav from "@/components/BottomNav";

interface BidHistory {
  user: string;
  amount: number;
  time: string;
  isYou?: boolean;
}

interface AuctionItem {
  id: number;
  title: string;
  emoji: string;
  category: string;
  currentBid: number;
  startBid: number;
  buyNow: number | null;
  bids: number;
  watchers: number;
  endsIn: number;
  hot: boolean;
  condition: string;
  seller: string;
  history: BidHistory[];
}

const initialAuctions: AuctionItem[] = [
  {
    id: 1, title: "PSA 10 2003 LeBron James Topps Chrome RC", emoji: "🃏",
    category: "Cards", currentBid: 8500, startBid: 5000, buyNow: 12000,
    bids: 34, watchers: 156, endsIn: 1840, hot: true,
    condition: "PSA 10 Gem Mint", seller: "Navigator Authenticated",
    history: [
      { user: "CardKing", amount: 8500, time: "2m ago" },
      { user: "You", amount: 8000, time: "15m ago", isYou: true },
      { user: "CollectorX", amount: 7500, time: "1h ago" },
      { user: "CardKing", amount: 7000, time: "2h ago" },
    ],
  },
  {
    id: 2, title: "Rolex Daytona 116500LN White Dial 2023", emoji: "⌚",
    category: "Watches", currentBid: 28500, startBid: 22000, buyNow: 35000,
    bids: 18, watchers: 89, endsIn: 5400, hot: true,
    condition: "Like New, Box & Papers", seller: "Navigator Authenticated",
    history: [
      { user: "WatchFan", amount: 28500, time: "8m ago" },
      { user: "LuxCollector", amount: 27000, time: "45m ago" },
      { user: "WatchFan", amount: 25000, time: "2h ago" },
    ],
  },
  {
    id: 3, title: "Nike Air Mag 2016 Self-Lacing Size 10", emoji: "👟",
    category: "Sneakers", currentBid: 42000, startBid: 35000, buyNow: null,
    bids: 12, watchers: 312, endsIn: 240, hot: true,
    condition: "Deadstock, Original Box", seller: "Navigator Authenticated",
    history: [
      { user: "SneakerGod", amount: 42000, time: "5m ago" },
      { user: "You", amount: 40000, time: "20m ago", isYou: true },
    ],
  },
];

const getIncrement = (bid: number) => {
  if (bid < 500) return 25;
  if (bid < 2000) return 50;
  return 100;
};

const Auctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState(initialAuctions);
  const [bidTab, setBidTab] = useState<Record<number, "bid" | "history">>({});
  const [customBid, setCustomBid] = useState<Record<number, string>>({});
  const [proxyBid, setProxyBid] = useState<Record<number, string>>({});
  const [bidding, setBidding] = useState<number | null>(null);
  const [bidError, setBidError] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Cards", "Sneakers", "Watches", "Ending Soon"];

  const filtered = auctions.filter((a) => {
    if (filter === "All") return true;
    if (filter === "Ending Soon") return a.endsIn < 600;
    return a.category === filter;
  });

  const placeBid = (auctionId: number, amount: number) => {
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction) return;
    const minBid = auction.currentBid + getIncrement(auction.currentBid);
    if (amount < minBid) {
      setBidError((e) => ({ ...e, [auctionId]: `Minimum bid is $${minBid.toLocaleString()}` }));
      return;
    }
    setBidError((e) => ({ ...e, [auctionId]: "" }));
    setBidding(auctionId);
    setTimeout(() => {
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === auctionId
            ? {
                ...a,
                currentBid: amount,
                bids: a.bids + 1,
                history: [{ user: "You", amount, time: "just now", isYou: true }, ...a.history],
              }
            : a
        )
      );
      setBidding(null);
      setCustomBid((c) => ({ ...c, [auctionId]: "" }));
    }, 700);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Live Auctions</h1>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success text-[10px] font-bold">3 Active</span>
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
        {filtered.map((auction, i) => {
          const inc = getIncrement(auction.currentBid);
          const minBid = auction.currentBid + inc;
          const tab = bidTab[auction.id] || "bid";

          return (
            <motion.div key={auction.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-4xl">{auction.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground font-medium">{auction.category}</span>
                      {auction.hot && <span className="text-[10px] bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full font-bold">🔥 HOT</span>}
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-sm mt-1">{auction.title}</h3>
                    <p className="text-[10px] text-muted-foreground">{auction.condition} · {auction.seller}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-xl bg-secondary text-center">
                    <p className="text-lg font-bold text-foreground">${auction.currentBid.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Current Bid</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Gavel className="w-3 h-3 text-muted-foreground" />
                      <p className="text-lg font-bold text-foreground">{auction.bids}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Bids</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-secondary text-center">
                    <Countdown seconds={auction.endsIn} urgentThreshold={300} className="text-lg" />
                    <p className="text-[10px] text-muted-foreground">Time Left</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {auction.watchers} watching</span>
                  <span>Min bid: ${minBid.toLocaleString()}</span>
                  {auction.buyNow && <span className="text-green-500 font-semibold">Buy Now: ${auction.buyNow.toLocaleString()}</span>}
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button onClick={() => setBidTab((t) => ({ ...t, [auction.id]: "bid" }))} className={`px-3 py-1 rounded-full text-xs font-medium ${tab === "bid" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Place Bid</button>
                  <button onClick={() => setBidTab((t) => ({ ...t, [auction.id]: "history" }))} className={`px-3 py-1 rounded-full text-xs font-medium ${tab === "history" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Bid History</button>
                </div>

                {tab === "bid" && (
                  <div className="space-y-3">
                    {/* Quick bids */}
                    <div className="flex gap-2">
                      {[minBid, minBid + inc, minBid + inc * 2].map((amt) => (
                        <Button
                          key={amt}
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-xl text-xs"
                          disabled={bidding === auction.id}
                          onClick={() => placeBid(auction.id, amt)}
                        >
                          ${amt.toLocaleString()}
                        </Button>
                      ))}
                    </div>

                    {/* Custom bid */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          value={customBid[auction.id] || ""}
                          onChange={(e) => setCustomBid((c) => ({ ...c, [auction.id]: e.target.value }))}
                          className="pl-7 bg-secondary/50 border-border rounded-xl"
                          placeholder={minBid.toLocaleString()}
                        />
                      </div>
                      <Button
                        disabled={bidding === auction.id}
                        onClick={() => placeBid(auction.id, parseInt(customBid[auction.id] || "0"))}
                        className="rounded-xl shimmer-btn"
                      >
                        {bidding === auction.id ? "Bidding..." : "Bid"}
                      </Button>
                    </div>

                    {bidError[auction.id] && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {bidError[auction.id]}
                      </p>
                    )}

                    {/* Proxy */}
                    <div className="p-3 rounded-xl bg-secondary/50 space-y-2">
                      <p className="text-xs font-semibold text-foreground">Max / Proxy Bid</p>
                      <p className="text-[10px] text-muted-foreground">We'll auto-bid for you up to your limit</p>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input
                            type="number"
                            value={proxyBid[auction.id] || ""}
                            onChange={(e) => setProxyBid((p) => ({ ...p, [auction.id]: e.target.value }))}
                            className="pl-7 bg-background border-border rounded-xl"
                          />
                        </div>
                        <Button variant="outline" className="rounded-xl text-xs">Set</Button>
                      </div>
                    </div>

                    {/* Buy Now */}
                    {auction.buyNow && (
                      <Button variant="outline" className="w-full rounded-xl border-green-500/30 text-green-500 hover:bg-green-500/10">
                        Buy Now — ${auction.buyNow.toLocaleString()}
                      </Button>
                    )}
                  </div>
                )}

                {tab === "history" && (
                  <div className="space-y-1.5">
                    {auction.history.map((h, i) => (
                      <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${h.isYou ? "bg-primary/10 border border-primary/20" : "bg-secondary"}`}>
                        <div className="flex-1">
                          <span className={`text-sm font-medium ${h.isYou ? "text-primary" : "text-foreground"}`}>{h.user}</span>
                          {i === 0 && <span className="ml-1.5 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">TOP</span>}
                        </div>
                        <span className="font-bold text-foreground text-sm">${h.amount.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground">{h.time}</span>
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
