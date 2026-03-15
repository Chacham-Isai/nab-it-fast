import { useState, useEffect, useMemo } from "react";
import { Search, Users, Loader2, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Crew {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  category: string;
  is_active: boolean;
  member_count: number;
}

interface CrewDiscoveryProps {
  joinedCrews: string[];
  onToggleCrew: (name: string, emoji: string) => void;
}

const categoryFilters = ["All", "Fashion", "Collectibles", "Electronics", "Luxury", "Home", "Music", "Art", "Sports"];

const CrewDiscovery = ({ joinedCrews, onToggleCrew }: CrewDiscoveryProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    fetchCrews();

    const channel = supabase
      .channel("crews-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "crews" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setCrews((prev) => prev.map((c) => (c.id === (payload.new as Crew).id ? { ...c, ...payload.new } : c)));
        } else if (payload.eventType === "INSERT") {
          setCrews((prev) => [...prev, payload.new as Crew]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchCrews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("crews" as any)
      .select("*")
      .order("member_count", { ascending: false });
    setCrews(data || []);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return crews.filter((c) => {
      const matchesSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "All" || c.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [crews, search, category]);

  const handleJoin = (crew: Crew) => {
    if (!user) { navigate("/login"); return; }
    onToggleCrew(crew.name, crew.emoji);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search crews..."
          className="pl-9 bg-card border-border rounded-xl h-10"
        />
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categoryFilters.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0",
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} crew{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Crew cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">🔍</span>
          <p className="text-muted-foreground text-sm">No crews match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((crew, i) => {
              const joined = joinedCrews.includes(crew.name);
              return (
                <motion.div
                  key={crew.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                  className={cn(
                    "p-4 rounded-2xl bg-card border transition-all space-y-3",
                    joined ? "border-primary/40 shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)]" : "border-border"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <motion.span
                      className="text-3xl"
                      whileHover={{ scale: 1.2, rotate: 8 }}
                    >
                      {crew.emoji}
                    </motion.span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{crew.name}</h3>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{crew.category}</span>
                    </div>
                  </div>

                  {crew.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{crew.description}</p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {crew.member_count.toLocaleString()}
                      </span>
                      {crew.is_active && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                          <TrendingUp className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={joined ? "secondary" : "default"}
                      className="rounded-xl text-xs h-8"
                      onClick={() => handleJoin(crew)}
                    >
                      {joined ? "Joined ✓" : "Join"}
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default CrewDiscovery;
