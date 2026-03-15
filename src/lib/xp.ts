import { supabase } from "@/integrations/supabase/client";

export type XPAction = "join_deal" | "deal_funded" | "open_grab_bag" | "win_auction" | "daily_streak";

const XP_VALUES: Record<XPAction, number> = {
  join_deal: 50,
  deal_funded: 200,
  open_grab_bag: 25,
  win_auction: 100,
  daily_streak: 10, // multiplied by streak_days
};

export const awardXP = async (userId: string, action: XPAction, multiplier = 1) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();

  if (!profile) return;

  const xpGain = XP_VALUES[action] * multiplier;
  const newXp = (profile.total_xp || 0) + xpGain;

  await supabase
    .from("profiles")
    .update({ total_xp: newXp })
    .eq("id", userId);

  return xpGain;
};
