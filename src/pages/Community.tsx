import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Flame, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";

const activityFeed = [
  { id: 1, user: "🧑‍🎤", name: "Alex K.", action: "just nabbed", item: "Jordan 1 Chicago", price: 289, tribe: "Sneakerheads", time: "2m ago", hot: true },
  { id: 2, user: "👩‍💼", name: "Sarah M.", action: "just nabbed", item: "1986 Fleer Jordan RC", price: 4200, tribe: "Card Collectors", time: "5m ago", hot: true },
  { id: 3, user: "🧔", name: "Mike D.", action: "just nabbed", item: "Rolex Sub", price: 12800, tribe: "Watch Collectors", time: "12m ago", hot: false },
  { id: 4, user: "👩‍🎨", name: "Luna R.", action: "just nabbed", item: "Supreme Box Logo", price: 425, tribe: "Streetwear", time: "18m ago", hot: false },
  { id: 5, user: "🧑‍💻", name: "Dev P.", action: "just nabbed", item: "Vision Pro", price: 3299, tribe: "Tech Heads", time: "25m ago", hot: false },
];

const groupDeals = [
  { id: 1, emoji: "👟", tribe: "Sneakerheads", item: "Nike Dunk Low Pack (3 pairs)", price: 180, retail: 330, pct: 45, current: 8, target: 10, endsIn: "2h 15m" },
  { id: 2, emoji: "🃏", tribe: "Card Collectors", item: "2024 Topps Chrome Hobby Box", price: 195, retail: 250, pct: 22, current: 5, target: 15, endsIn: "5h 30m" },
  { id: 3, emoji: "🧱", tribe: "Tech Heads", item: "PS5 Slim + Extra Controller", price: 410, retail: 530, pct: 23, current: 14, target: 15, endsIn: "45m" },
];

const tribes = [
  { id: 1, name: "Card Collectors", emoji: "🃏", members: 2840, active: true, gradient: "from-primary/20 to-primary/5" },
  { id: 2, name: "Sneakerheads", emoji: "👟", members: 3120, active: true, gradient: "from-blue-500/20 to-blue-500/5" },
  { id: 3, name: "Watch Collectors", emoji: "⌚", members: 1560, active: false, gradient: "from-amber-500/20 to-amber-500/5" },
  { id: 4, name: "Tech Heads", emoji: "🖥️", members: 2200, active: true, gradient: "from-green-500/20 to-green-500/5" },
  { id: 5, name: "Vintage Hunters", emoji: "🪑", members: 890, active: false, gradient: "from-purple-500/20 to-purple-500/5" },
  { id: 6, name: "Streetwear", emoji: "🧥", members: 1980, active: true, gradient: "from-pink-500/20 to-pink-500/5" },
];

const Community = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"feed" | "deals" | "tribes">("feed");
  const [joinedTribes, setJoinedTribes] = useState<number[]>([1, 2]);
  const [joinedDeals, setJoinedDeals] = useState<number[]>([]);

  const toggleTribe = (id: number) => {
    setJoinedTribes((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const toggleDeal = (id: number) => {
    setJoinedDeals((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Community</h1>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> 12.6K</span>
        </div>
        <div className="flex gap-2 mt-3 max-w-lg mx-auto">
          {(["feed", "deals", "tribes"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t === "deals" ? "Group Deals" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {tab === "feed" && (
          <div className="space-y-2">
            {activityFeed.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="text-2xl">{a.user}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{a.name}</span> {a.action} <span className="font-semibold text-primary">{a.item}</span>
                    {a.price && <span className="text-muted-foreground"> · ${a.price.toLocaleString()}</span>}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{a.tribe} · {a.time}</p>
                </div>
                {a.hot && <Flame className="w-4 h-4 text-destructive shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {tab === "deals" && (
          <div className="space-y-4">
            {groupDeals.map((deal) => {
              const joined = joinedDeals.includes(deal.id);
              const almostThere = deal.current / deal.target > 0.85;
              return (
                <div key={deal.id} className="p-4 rounded-2xl bg-card border border-border space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{deal.emoji}</span>
                    <div className="flex-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">{deal.tribe}</span>
                      <h3 className="font-semibold text-foreground text-sm">{deal.item}</h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-bold text-foreground">${deal.price}</span>
                        <span className="text-sm text-muted-foreground line-through">${deal.retail}</span>
                        <span className="text-xs font-bold text-success">-{deal.pct}%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{deal.current} of {deal.target} joined</span>
                      {almostThere && <span className="text-primary font-bold">Almost there!</span>}
                    </div>
                    <Progress value={(deal.current / deal.target) * 100} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {deal.endsIn}</span>
                    <Button
                      size="sm"
                      variant={joined ? "secondary" : "default"}
                      className="rounded-full text-xs"
                      onClick={() => toggleDeal(deal.id)}
                    >
                      {joined ? "Joined! ✓" : "Join Deal"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "tribes" && (
          <div className="grid grid-cols-2 gap-3">
            {tribes.map((tribe) => {
              const joined = joinedTribes.includes(tribe.id);
              return (
                <div key={tribe.id} className={`p-4 rounded-2xl bg-gradient-to-br ${tribe.gradient} border border-border text-center space-y-2`}>
                  <span className="text-3xl">{tribe.emoji}</span>
                  <h3 className="font-semibold text-foreground text-sm">{tribe.name}</h3>
                  <div className="flex items-center justify-center gap-1.5">
                    {tribe.active && <span className="w-2 h-2 rounded-full bg-success" />}
                    <span className="text-xs text-muted-foreground">{tribe.members.toLocaleString()} members</span>
                  </div>
                  <Button
                    size="sm"
                    variant={joined ? "secondary" : "default"}
                    className="w-full rounded-full text-xs"
                    onClick={() => toggleTribe(tribe.id)}
                  >
                    {joined ? "Joined" : "Join"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Community;
