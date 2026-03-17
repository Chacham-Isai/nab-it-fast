import { useState, useEffect } from "react";
import { Trophy, Zap, Crown, Medal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  referrer_id: string;
  display_name: string;
  avatar_emoji: string;
  total_xp: number;
  referral_count: number;
}

const ReferralLeaderboard = () => {
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    // Get completed referrals grouped by referrer
    const { data: refs } = await supabase
      .from("referrals")
      .select("referrer_id, xp_awarded")
      .eq("status", "completed");

    if (!refs || refs.length === 0) {
      setLoading(false);
      return;
    }

    // Aggregate by referrer
    const agg: Record<string, { total_xp: number; count: number }> = {};
    refs.forEach((r) => {
      if (!agg[r.referrer_id]) agg[r.referrer_id] = { total_xp: 0, count: 0 };
      agg[r.referrer_id].total_xp += r.xp_awarded || 0;
      agg[r.referrer_id].count += 1;
    });

    const ids = Object.keys(agg);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_emoji")
      .in("id", ids);

    const entries: LeaderboardEntry[] = ids
      .map((id) => {
        const profile = profiles?.find((p) => p.id === id);
        return {
          referrer_id: id,
          display_name: profile?.display_name || "Anonymous",
          avatar_emoji: profile?.avatar_emoji || "🐇",
          total_xp: agg[id].total_xp,
          referral_count: agg[id].count,
        };
      })
      .sort((a, b) => b.referral_count - a.referral_count)
      .slice(0, 10);

    setLeaders(entries);
    setLoading(false);
  };

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (i === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (i === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground w-5 text-center">{i + 1}</span>;
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-secondary rounded w-40 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-secondary/50 rounded-xl mb-2" />
        ))}
      </div>
    );
  }

  if (leaders.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="font-heading text-lg font-bold text-foreground">Top Inviters</h2>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
        {leaders.map((entry, i) => (
          <motion.div
            key={entry.referrer_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 p-3 ${i === 0 ? "bg-primary/5" : ""}`}
          >
            <div className="flex items-center justify-center w-6">{rankIcon(i)}</div>
            <span className="text-xl">{entry.avatar_emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{entry.display_name}</p>
              <p className="text-xs text-muted-foreground">{entry.referral_count} invite{entry.referral_count !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <Zap className="w-3 h-3" />
              <span className="text-sm font-bold">{entry.total_xp.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReferralLeaderboard;
