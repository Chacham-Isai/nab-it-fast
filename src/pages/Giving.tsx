import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";

const causes = [
  { id: 1, name: "Youth Education Fund", category: "Education", emoji: "📚", raised: 12400, goal: 25000, pct: 49.6, tribe: "Card Collectors", desc: "Supporting STEM education for underserved communities" },
  { id: 2, name: "Clean Water Initiative", category: "Environment", emoji: "💧", raised: 8900, goal: 15000, pct: 59.3, tribe: "Sneakerheads", desc: "Providing clean water access in developing regions" },
  { id: 3, name: "Mental Health Support", category: "Health", emoji: "🧠", raised: 6200, goal: 20000, pct: 31, tribe: "Tech Heads", desc: "Free counseling for at-risk youth" },
  { id: 4, name: "Animal Rescue Network", category: "Animals", emoji: "🐾", raised: 15600, goal: 18000, pct: 86.7, tribe: "Vintage Hunters", desc: "Rescue and rehome abandoned animals" },
];

const givingHistory = [
  { id: 1, cause: "Youth Education Fund", emoji: "📚", from: "Air Jordan 1 Chicago", date: "2 days ago", amount: 2.89 },
  { id: 2, cause: "Clean Water Initiative", emoji: "💧", from: "Supreme Box Logo", date: "5 days ago", amount: 4.25 },
  { id: 3, cause: "Youth Education Fund", emoji: "📚", from: "LEGO Millennium Falcon", date: "1 week ago", amount: 6.99 },
];

const Giving = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"causes" | "my-giving" | "impact">("causes");
  const [roundupEnabled, setRoundupEnabled] = useState(true);
  const [roundupPct, setRoundupPct] = useState(2);
  const [selectedCauses, setSelectedCauses] = useState<number[]>([1, 2]);

  const toggleCause = (id: number) => {
    setSelectedCauses((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const totalGiven = givingHistory.reduce((sum, g) => sum + g.amount, 0);
  const communityTotal = causes.reduce((sum, c) => sum + c.raised, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Give Back</h1>
          <Heart className="w-5 h-5 fill-primary text-primary" />
        </div>
        <div className="flex gap-2 mt-3 max-w-lg mx-auto">
          {(["causes", "my-giving", "impact"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t === "my-giving" ? "My Giving" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {tab === "causes" && (
          <>
            {/* Round-up toggle */}
            <div className="p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Purchase Round-Ups</h3>
                  <p className="text-xs text-muted-foreground">Automatically donate a % of each purchase</p>
                </div>
                <button
                  onClick={() => setRoundupEnabled(!roundupEnabled)}
                  className={`w-12 h-7 rounded-full transition-colors ${roundupEnabled ? "bg-primary" : "bg-secondary"}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-primary-foreground transition-transform mx-1 ${roundupEnabled ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
              {roundupEnabled && (
                <div className="flex gap-2">
                  {[1, 2, 5].map((pct) => (
                    <button key={pct} onClick={() => setRoundupPct(pct)} className={`flex-1 py-2 rounded-full text-sm font-medium transition-all ${roundupPct === pct ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                      {pct}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Causes */}
            {causes.map((cause) => {
              const selected = selectedCauses.includes(cause.id);
              return (
                <button key={cause.id} onClick={() => toggleCause(cause.id)} className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${selected ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{cause.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">{cause.name}</h3>
                        {selected && <Check className="w-4 h-4 text-primary" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground">{cause.tribe}</span>
                      <p className="text-xs text-muted-foreground mt-1">{cause.desc}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">${cause.raised.toLocaleString()} raised</span>
                          <span className="font-bold text-foreground">{cause.pct}%</span>
                        </div>
                        <Progress value={cause.pct} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}

            <Button className="w-full rounded-full">Save Preferences</Button>
          </>
        )}

        {tab === "my-giving" && (
          <>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">${totalGiven.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Given</p>
            </div>
            <div className="space-y-2">
              {givingHistory.map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                  <span className="text-2xl">{g.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{g.cause}</p>
                    <p className="text-xs text-muted-foreground">From: {g.from} · {g.date}</p>
                  </div>
                  <span className="font-bold text-primary text-sm">${g.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "impact" && (
          <>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-500/5 border border-pink-500/20 text-center">
              <Globe className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">${communityTotal.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Community Total</p>
            </div>
            <div className="space-y-3">
              {causes.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-card border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{c.emoji}</span>
                    <span className="text-sm font-semibold text-foreground flex-1">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">{c.tribe}</span>
                  </div>
                  <Progress value={c.pct} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">${c.raised.toLocaleString()} of ${c.goal.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Giving;
