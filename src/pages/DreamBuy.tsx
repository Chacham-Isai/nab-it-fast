import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Plus, X, Search, CheckCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";

interface DreamBuyItem {
  id: string;
  name: string;
  status: string;
  added: string;
  emoji: string;
}

const mockDreams: DreamBuyItem[] = [
  { id: "mock-1", name: "1952 Topps Mickey Mantle #311", status: "found", added: "3 days ago", emoji: "🃏" },
  { id: "mock-2", name: "Air Jordan 1 Bred 2013 DS", status: "hunting", added: "1 week ago", emoji: "👟" },
  { id: "mock-3", name: "Rolex Daytona 116500LN White", status: "hunting", added: "2 weeks ago", emoji: "⌚" },
];

const DreamBuy = () => {
  usePageMeta({ title: "Dream Buys — nabbit.ai", description: "Track your dream purchases. Nabbit hunts them down for you.", path: "/dreams" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dreams, setDreams] = useState<DreamBuyItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [newDream, setNewDream] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetchDreams();
  }, [user]);

  const fetchDreams = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("dream_buys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching dream buys:", error);
      setDreams(mockDreams);
      setIsDemo(true);
    } else if (data && data.length > 0) {
      setDreams(data.map((d: any) => ({
        id: d.id,
        name: d.item_name,
        status: d.status || "hunting",
        added: new Date(d.created_at).toLocaleDateString(),
        emoji: "🎯",
      })));
      setIsDemo(false);
    } else {
      setDreams(mockDreams);
      setIsDemo(true);
    }
    setLoading(false);
  };

  const addDream = async () => {
    if (!newDream.trim() || !user) return;
    const { error } = await supabase.from("dream_buys").insert({
      user_id: user.id,
      item_name: newDream.trim(),
      status: "hunting",
    });
    if (error) {
      console.error("Error adding dream buy:", error);
    } else {
      setNewDream("");
      setAdding(false);
      fetchDreams();
    }
  };

  const removeDream = async (id: string) => {
    if (id.startsWith("mock-")) {
      setDreams(dreams.filter((d) => d.id !== id));
      return;
    }
    const { error } = await supabase.from("dream_buys").delete().eq("id", id);
    if (error) console.error("Error deleting:", error);
    else fetchDreams();
  };

  const activeHunts = dreams.filter((d) => d.status === "hunting").length;
  const matchesFound = dreams.filter((d) => d.status === "found").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Dream Buys</h1>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
            <Zap className="w-3 h-3" /> AI Hunting
          </span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {isDemo && (
          <div className="p-3 rounded-xl bg-secondary/50 border border-border text-center">
            <span className="text-xs text-muted-foreground font-medium">📋 Demo Mode — Add your first dream buy to get started!</span>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-sm text-foreground">
            <Zap className="w-4 h-4 text-primary inline mr-1" />
            Drop your dream items and Navigator hunts 24/7. We'll alert you the moment we find a match below market value.
          </p>
        </div>

        {!adding ? (
          <button onClick={() => setAdding(true)} className="w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-primary">
            <Plus className="w-5 h-5" /> Add a Dream Buy
          </button>
        ) : (
          <div className="flex gap-2">
            <Input autoFocus value={newDream} onChange={(e) => setNewDream(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDream()} placeholder="What's your dream buy?" className="flex-1 bg-secondary border-border" />
            <Button onClick={addDream}>Add</Button>
            <Button variant="ghost" onClick={() => { setAdding(false); setNewDream(""); }}>Cancel</Button>
          </div>
        )}

        <div className="space-y-3">
          {dreams.map((dream) => (
            <div key={dream.id} className="p-4 rounded-2xl bg-card border border-border space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{dream.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground text-sm truncate">{dream.name}</h3>
                    <button onClick={() => removeDream(dream.id)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {dream.status === "hunting" ? (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Search className="w-3 h-3 animate-pulse" /> Hunting</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-primary font-semibold"><CheckCircle className="w-3 h-3" /> Found</span>
                    )}
                    <span className="text-xs text-muted-foreground">· {dream.added}</span>
                  </div>
                </div>
              </div>
              {dream.status === "found" && (
                <Button size="sm" className="w-full rounded-full gap-1 text-xs">
                  View Match — Nab It <ChevronRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Active Hunts", value: activeHunts },
            { label: "Avg Find Time", value: "6.2d" },
            { label: "Matches Found", value: matchesFound },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-card border border-border text-center">
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DreamBuy;
