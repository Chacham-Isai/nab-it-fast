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
  const newLevel = calculateLevel(newXp);

  await supabase
    .from("profiles")
    .update({ total_xp: newXp, level: newLevel })
    .eq("id", userId);

  return xpGain;
};

export const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const xpForLevel = (level: number): number => {
  return (level - 1) * (level - 1) * 100;
};

export const xpProgress = (xp: number): { level: number; current: number; needed: number; percent: number } => {
  const level = calculateLevel(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const current = xp - currentLevelXp;
  const needed = nextLevelXp - currentLevelXp;
  return { level, current, needed, percent: Math.min((current / needed) * 100, 100) };
};

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earned: boolean;
}

export const computeBadges = (stats: {
  orders: number;
  saved: number;
  dreams: number;
  deals: number;
  crews: number;
  referrals: number;
  streakDays: number;
  totalXp: number;
  totalSpent: number;
}): Badge[] => [
  { id: "first_nab", name: "First Nab", emoji: "🎯", description: "Made your first purchase", earned: stats.orders >= 1 },
  { id: "collector", name: "Collector", emoji: "📦", description: "Saved 20+ items", earned: stats.saved >= 20 },
  { id: "dream_chaser", name: "Dream Chaser", emoji: "✨", description: "Set 5+ dream buys", earned: stats.dreams >= 5 },
  { id: "deal_hunter", name: "Deal Hunter", emoji: "🤝", description: "Joined 5+ group deals", earned: stats.deals >= 5 },
  { id: "crew_builder", name: "Crew Builder", emoji: "👥", description: "Joined 3+ crews", earned: stats.crews >= 3 },
  { id: "streak_master", name: "Streak Master", emoji: "🔥", description: "7-day login streak", earned: stats.streakDays >= 7 },
  { id: "big_spender", name: "Big Spender", emoji: "💎", description: "Spent $500+", earned: stats.totalSpent >= 500 },
  { id: "referral_king", name: "Referral King", emoji: "👑", description: "Invited 5+ friends", earned: stats.referrals >= 5 },
  { id: "xp_warrior", name: "XP Warrior", emoji: "⚡", description: "Reached 1000 XP", earned: stats.totalXp >= 1000 },
  { id: "early_bird", name: "Early Bird", emoji: "🐇", description: "Early access member", earned: true },
  { id: "saver", name: "Saver", emoji: "💰", description: "Saved 10+ items", earned: stats.saved >= 10 },
  { id: "social_butterfly", name: "Social Butterfly", emoji: "🦋", description: "Joined a crew & a deal", earned: stats.crews >= 1 && stats.deals >= 1 },
];
