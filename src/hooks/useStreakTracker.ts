import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/**
 * Tracks daily login streak. Updates streak_days and last_active_date on each session.
 * If user logged in yesterday → increment streak. If today → no-op. Otherwise → reset to 1.
 */
const useStreakTracker = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const updateStreak = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("last_active_date, streak_days")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      const today = new Date().toISOString().slice(0, 10);
      const lastActive = profile.last_active_date;

      if (lastActive === today) return; // Already tracked today

      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newStreak = lastActive === yesterday ? (profile.streak_days || 0) + 1 : 1;

      await supabase.from("profiles").update({
        last_active_date: today,
        streak_days: newStreak,
      }).eq("id", user.id);
    };

    updateStreak();
  }, [user]);
};

export default useStreakTracker;
