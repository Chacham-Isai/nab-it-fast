import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Sparkles, Gavel, Shield, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const tickerItems = [
  "🧑‍🎤 Alex K. won a PSA 10 Charizard in a Break!",
  "👩‍💼 Sarah M. pulled a Legendary hit from a Grab Bag!",
  "🧔 Mike D. won a Rolex Daytona at auction for $8,200!",
  "👩‍🎨 Luna R. nabbed a Supreme collab from a Break!",
  "🧑‍💻 Dev P. got an Ultra hit — Vision Pro from Grab Bag!",
];

const recentWins = [
  { user: "🧑‍🎤", name: "Alex K.", item: "PSA 10 Charizard", method: "Break", price: 450 },
  { user: "👩‍💼", name: "Sarah M.", item: "Jordan 1 Travis Scott", method: "Grab Bag", price: 79 },
  { user: "🧔", name: "Mike D.", item: "Rolex Daytona", method: "Auction", price: 8200 },
  { user: "👩‍🎨", name: "Luna R.", item: "Supreme Box Logo", method: "Break", price: 35 },
];

const Play = () => {
  const navigate = useNavigate();
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((i) => (i + 1) % tickerItems.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const modes = [
    {
      title: "Breaks", path: "/breaks", desc: "Pick your slot. Watch it rip live.",
      badge: "2 LIVE", badgeColor: "bg-destructive text-destructive-foreground",
      stat: "Slots filling 68%", icon: Radio,
      gradient: "from-red-500/20 to-red-500/5",
    },
    {
      title: "Grab Bags", path: "/grab-bags", desc: "Mystery boxes. Real hits.",
      badge: "4 Tiers", badgeColor: "bg-primary text-primary-foreground",
      stat: "Avg hit rate 94%", icon: Sparkles,
      gradient: "from-primary/20 to-primary/5",
    },
    {
      title: "Auctions", path: "/auctions", desc: "Bid. Win. Own it.",
      badge: "3 ACTIVE", badgeColor: "bg-success text-primary-foreground",
      stat: "Auctions closing 14min", icon: Gavel,
      gradient: "from-green-500/20 to-green-500/5",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <div>
            <h1 className="font-heading font-bold text-foreground text-lg">Navigator Play</h1>
            <p className="text-[10px] text-muted-foreground">Breaks · Grab Bags · Auctions</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Ticker */}
        <div className="p-3 rounded-xl bg-card border border-border overflow-hidden h-10 flex items-center">
          <p key={tickerIndex} className="text-xs text-foreground animate-fade-in truncate">
            {tickerItems[tickerIndex]}
          </p>
        </div>

        {/* Hero */}
        <div className="text-center py-2">
          <h2 className="font-heading font-bold text-2xl text-foreground">The thrill of the find.</h2>
          <p className="text-muted-foreground text-sm">Built for collectors.</p>
        </div>

        {/* Mode cards */}
        <div className="space-y-3">
          {modes.map((mode) => (
            <button
              key={mode.title}
              onClick={() => navigate(mode.path)}
              className={`w-full p-5 rounded-2xl bg-gradient-to-br ${mode.gradient} border border-border text-left transition-all hover:scale-[1.02] active:scale-[0.98]`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <mode.icon className="w-5 h-5 text-foreground" />
                    <h3 className="font-heading font-bold text-foreground text-lg">{mode.title}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mode.badgeColor}`}>{mode.badge}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{mode.desc}</p>
                  <p className="text-xs text-muted-foreground mt-1">{mode.stat}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground mt-1" />
              </div>
            </button>
          ))}
        </div>

        {/* Recent Wins */}
        <div>
          <h3 className="font-heading font-bold text-foreground mb-3">Recent Wins</h3>
          <div className="space-y-2">
            {recentWins.map((win, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="text-2xl">{win.user}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground"><span className="font-semibold">{win.name}</span> won <span className="text-primary font-semibold">{win.item}</span></p>
                  <p className="text-[10px] text-muted-foreground">{win.method} · ${win.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust banner */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary text-center justify-center">
          <Shield className="w-4 h-4 text-success" />
          <span className="text-xs font-semibold text-foreground">Navigator Authenticated — every item verified before listing</span>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Play;
