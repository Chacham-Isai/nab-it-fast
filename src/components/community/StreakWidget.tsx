import { useEffect, useState } from "react";
import { Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const StreakWidget = () => {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    if (user) loadAndUpdateStreak();
  }, [user]);

  const loadAndUpdateStreak = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("streak_days, total_xp, last_active_date")
      .eq("id", user.id)
      .single();

    if (!data) return;

    const today = new Date().toISOString().split("T")[0];
    const lastActive = data.last_active_date;

    let newStreak = data.streak_days;
    let bonusXp = 0;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      if (lastActive === yesterdayStr) {
        newStreak = data.streak_days + 1;
      } else {
        newStreak = 1;
      }

      bonusXp = 10 * newStreak;

      await supabase
        .from("profiles")
        .update({
          streak_days: newStreak,
          last_active_date: today,
          total_xp: data.total_xp + bonusXp,
        })
        .eq("id", user.id);
    }

    setStreak(newStreak);
    setXp(data.total_xp + bonusXp);
  };

  if (!user || (streak === 0 && xp === 0)) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-4 py-2 px-4 mb-2 rounded-xl bg-card border border-border"
    >
      <div className="flex items-center gap-1.5">
        <Flame className="w-4 h-4 text-destructive" />
        <span className="text-sm font-bold text-foreground">{streak} day{streak !== 1 ? "s" : ""}</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-bold text-primary">{xp.toLocaleString()} XP</span>
      </div>
    </motion.div>
  );
};

export default StreakWidget;
