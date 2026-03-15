import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";
import BottomNav from "@/components/BottomNav";

interface Slot {
  team: string;
  emoji: string;
  price: number;
  taken: boolean;
  buyer?: string;
  yours?: boolean;
}

interface BreakItem {
  id: number;
  title: string;
  host: string;
  status: "LIVE" | "STARTING SOON";
  viewers: number;
  endsIn: number;
  prize: string;
  totalValue: string;
  category: string;
  emoji: string;
  slots: Slot[];
}

const liveBreaks: BreakItem[] = [
  {
    id: 1, title: "2024 Topps Chrome Hobby", host: "CardKing", status: "LIVE",
    viewers: 342, endsIn: 185, prize: "Chase: Rookie Auto PSA 10", totalValue: "$2,400",
    category: "Cards", emoji: "🃏",
    slots: [
      { team: "Yankees", emoji: "⚾", price: 45, taken: false },
      { team: "Dodgers", emoji: "⚾", price: 42, taken: true, buyer: "Alex K." },
      { team: "Braves", emoji: "⚾", price: 38, taken: false },
      { team: "Phillies", emoji: "⚾", price: 35, taken: true, buyer: "Sarah M." },
      { team: "Astros", emoji: "⚾", price: 40, taken: false },
      { team: "Rangers", emoji: "⚾", price: 32, taken: false },
    ],
  },
  {
    id: 2, title: "Pokemon 151 Booster Box", host: "PokeMaster", status: "STARTING SOON",
    viewers: 128, endsIn: 900, prize: "Chase: Charizard ex SAR", totalValue: "$1,800",
    category: "Cards", emoji: "⚡",
    slots: [
      { team: "Slot 1", emoji: "🎴", price: 55, taken: false },
      { team: "Slot 2", emoji: "🎴", price: 55, taken: true, buyer: "Mike D." },
      { team: "Slot 3", emoji: "🎴", price: 55, taken: false },
      { team: "Slot 4", emoji: "🎴", price: 55, taken: false },
    ],
  },
];

const upcomingBreaks = [
  { id: 3, emoji: "🏀", title: "2024 Panini Prizm Basketball", price: 60, slotsLeft: 22, time: "Tomorrow 8PM EST" },
  { id: 4, emoji: "🏈", title: "2024 Topps Chrome Football", price: 35, slotsLeft: 18, time: "Fri 9PM EST" },
];

const Breaks = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"live" | "upcoming" | "my-breaks">("live");
  const [breaks, setBreaks] = useState(liveBreaks);
  const [buyingSlot, setBuyingSlot] = useState<string | null>(null);

  const buySlot = (breakId: number, slotIdx: number) => {
    const key = `${breakId}-${slotIdx}`;
    setBuyingSlot(key);
    setTimeout(() => {
      setBreaks((prev) =>
        prev.map((b) =>
          b.id === breakId
            ? { ...b, slots: b.slots.map((s, i) => (i === slotIdx ? { ...s, taken: true, yours: true, buyer: "You" } : s)) }
            : b
        )
      );
      setBuyingSlot(null);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Navigator Breaks</h1>
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold">
            <Radio className="w-3 h-3 animate-pulse" /> 2 LIVE
          </span>
        </div>
        <div className="flex gap-2 mt-3 max-w-lg mx-auto">
          {(["live", "upcoming", "my-breaks"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
              {t === "my-breaks" ? "My Breaks" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {tab === "live" && breaks.map((brk, i) => (
          <motion.div key={brk.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{brk.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-foreground">{brk.title}</h3>
                  <p className="text-xs text-muted-foreground">Host: {brk.host}</p>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${
                  brk.status === "LIVE" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  {brk.status === "LIVE" && <Radio className="w-3 h-3 animate-pulse" />}
                  {brk.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {brk.viewers}</span>
                <Countdown seconds={brk.endsIn} urgentThreshold={60} className="text-xs" />
              </div>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                <p className="text-xs font-semibold text-foreground">{brk.prize}</p>
                <p className="text-[10px] text-muted-foreground">Total Value: {brk.totalValue}</p>
              </div>

              {/* Slots */}
              <div className="grid grid-cols-2 gap-2">
                {brk.slots.map((slot, i) => {
                  const key = `${brk.id}-${i}`;
                  const isBuying = buyingSlot === key;
                  return (
                    <button
                      key={i}
                      disabled={slot.taken || isBuying}
                      onClick={() => !slot.taken && buySlot(brk.id, i)}
                      className={`p-3 rounded-xl text-left transition-all ${
                        slot.yours
                          ? "bg-primary/10 border-2 border-primary"
                          : slot.taken
                          ? "bg-secondary opacity-60"
                          : "bg-card border-2 border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{slot.emoji}</span>
                        <span className="text-sm font-medium text-foreground">{slot.team}</span>
                      </div>
                      {slot.yours ? (
                        <p className="text-xs text-primary font-bold mt-1">✓ Yours</p>
                      ) : slot.taken ? (
                        <p className="text-xs text-muted-foreground mt-1">{slot.buyer}</p>
                      ) : isBuying ? (
                        <p className="text-xs text-primary mt-1 animate-pulse">Buying...</p>
                      ) : (
                        <p className="text-xs text-primary font-bold mt-1">${slot.price}</p>
                      )}
                    </button>
                  );
                })}
              </div>

              <button className="w-full p-3 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm hover:border-primary/50 hover:text-primary transition-colors">
                🎲 Random Slot — Best Value Pick
              </button>
            </div>
          </motion.div>
        ))}

        {tab === "upcoming" && (
          <div className="space-y-3">
            {upcomingBreaks.map((brk, i) => (
              <motion.div key={brk.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                <span className="text-3xl">{brk.emoji}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">{brk.title}</h3>
                  <p className="text-xs text-muted-foreground">${brk.price}/slot · {brk.slotsLeft} slots left</p>
                  <p className="text-xs text-muted-foreground">{brk.time}</p>
                </div>
                <Button size="sm" className="rounded-xl text-xs">Reserve</Button>
              </motion.div>
            ))}
          </div>
        )}

        {tab === "my-breaks" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
            <span className="text-4xl mb-4 block">🎴</span>
            <p className="text-muted-foreground">No breaks joined yet</p>
            <Button className="mt-4 rounded-xl shimmer-btn" onClick={() => setTab("live")}>Browse Live Breaks</Button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Breaks;
