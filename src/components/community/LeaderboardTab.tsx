import { useState, useEffect } from "react";
import { Trophy, Flame, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  avatar_emoji: string | null;
  total_xp: number;
  streak_days: number;
}

const medals = ["🥇", "🥈", "🥉"];

const LeaderboardTab = () => {
  const { user } = useAuth();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_emoji, total_xp, streak_days")
      .order("total_xp", { ascending: false })
      .limit(20);
    setLeaders((data as LeaderboardEntry[]) || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-center mb-4">
        <Trophy className="w-8 h-8 text-primary mx-auto mb-1" />
        <h3 className="font-heading font-bold text-foreground">Top Nabbers</h3>
        <p className="text-xs text-muted-foreground">Ranked by XP earned</p>
      </div>

      {leaders.map((entry, i) => {
        const isMe = user?.id === entry.id;
        return (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              isMe ? "bg-primary/10 border-primary/30" : "bg-card border-border"
            }`}
          >
            <span className="w-7 text-center font-bold text-sm">
              {i < 3 ? medals[i] : <span className="text-muted-foreground">{i + 1}</span>}
            </span>
            <span className="text-xl">{entry.avatar_emoji || "🐇"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {entry.display_name || "Anonymous"} {isMe && <span className="text-primary text-xs">(you)</span>}
              </p>
              {entry.streak_days > 0 && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3 text-destructive" /> {entry.streak_days} day streak
                </p>
              )}
            </div>
            <span className="font-mono font-bold text-sm text-primary">{entry.total_xp.toLocaleString()} XP</span>
          </motion.div>
        );
      })}

      {leaders.length === 0 && (
        <p className="text-center text-muted-foreground text-sm py-8">No XP earned yet — be the first!</p>
      )}
    </div>
  );
};

export default LeaderboardTab;
