import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, TrendingUp, Share2, Loader2, Flame, Clock, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import Countdown from "@/components/Countdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import { awardXP } from "@/lib/xp";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";

interface Crew {
  id: string;
  name: string;
  emoji: string;
  description: string | null;
  category: string;
  is_active: boolean;
  member_count: number;
}

interface Member {
  user_id: string;
  joined_at: string;
  profiles: { display_name: string | null; avatar_emoji: string | null; total_xp: number } | null;
}

type TabType = "activity" | "deals" | "members";

const CrewDetail = () => {
  const { name } = useParams<{ name: string }>();
  const crewName = decodeURIComponent(name || "");
  const navigate = useNavigate();
  const { user } = useAuth();
  const { track } = useAnalytics();

  usePageMeta({
    title: `${crewName} — nabbit.ai`,
    description: `Join the ${crewName} crew on nabbit.ai`,
    path: `/crew/${name}`,
  });

  const [crew, setCrew] = useState<Crew | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("activity");
  const [isJoined, setIsJoined] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [joinedDeals, setJoinedDeals] = useState<string[]>([]);
  const [dealAvatars, setDealAvatars] = useState<Record<string, string[]>>({});
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    if (crewName) loadCrewData();
  }, [crewName, user]);

  const loadCrewData = async () => {
    setLoading(true);

    // Load crew info
    const { data: crewData } = await supabase
      .from("crews" as any)
      .select("*")
      .eq("name", crewName)
      .single();

    setCrew(crewData as unknown as Crew);

    // Load members with profiles
    const { data: membersData } = await supabase
      .from("tribe_memberships")
      .select("user_id, joined_at, profiles:user_id(display_name, avatar_emoji, total_xp)")
      .eq("tribe_name", crewName)
      .order("joined_at", { ascending: false })
      .limit(50);

    setMembers((membersData as unknown as Member[]) || []);

    // Check if current user is a member
    if (user) {
      const { data: membership } = await supabase
        .from("tribe_memberships")
        .select("id")
        .eq("user_id", user.id)
        .eq("tribe_name", crewName)
        .maybeSingle();
      setIsJoined(!!membership);

      // Load joined deals
      const { data: participantsData } = await supabase
        .from("group_deal_participants")
        .select("deal_id")
        .eq("user_id", user.id);
      setJoinedDeals(participantsData?.map((d: any) => d.deal_id) || []);
    }

    // Load crew deals
    const { data: dealsData } = await supabase
      .from("group_deals")
      .select("*")
      .eq("tribe_name", crewName)
      .in("status", ["active", "funded"])
      .order("created_at", { ascending: false });
    setDeals(dealsData || []);

    // Load deal avatars
    if (dealsData && dealsData.length > 0) {
      const dealIds = dealsData.map((d: any) => d.id);
      const { data: avatarData } = await supabase
        .from("group_deal_participants")
        .select("deal_id, profiles:user_id(avatar_emoji)")
        .in("deal_id", dealIds)
        .limit(100);

      const avatarMap: Record<string, string[]> = {};
      avatarData?.forEach((p: any) => {
        if (!avatarMap[p.deal_id]) avatarMap[p.deal_id] = [];
        avatarMap[p.deal_id].push(p.profiles?.avatar_emoji || "🐇");
      });
      setDealAvatars(avatarMap);
    }

    // Load recent activity (notifications for this crew)
    const { data: activityData } = await supabase
      .from("notifications_log")
      .select("*")
      .or(`title.ilike.%${crewName}%,body.ilike.%${crewName}%`)
      .order("created_at", { ascending: false })
      .limit(20);
    setActivity(activityData || []);

    setLoading(false);
  };

  const toggleJoin = async () => {
    if (!user) { navigate("/login"); return; }

    if (isJoined) {
      await supabase.from("tribe_memberships").delete().eq("user_id", user.id).eq("tribe_name", crewName);
      setIsJoined(false);
      track("crew_left", { crew_name: crewName });
      setCrew((prev) => prev ? { ...prev, member_count: Math.max(prev.member_count - 1, 0) } : prev);
    } else {
      await supabase.from("tribe_memberships").insert({
        user_id: user.id,
        tribe_name: crewName,
        tribe_emoji: crew?.emoji || "🎯",
      });
      setIsJoined(true);
      track("crew_joined", { crew_name: crewName });
      setCrew((prev) => prev ? { ...prev, member_count: prev.member_count + 1 } : prev);
    }
  };

  const joinDeal = async (dealId: string) => {
    if (!user) { navigate("/login"); return; }
    const { error } = await supabase.from("group_deal_participants").insert({ deal_id: dealId, user_id: user.id });
    if (error) {
      toast({ title: "Couldn't join", description: error.message, variant: "destructive" });
      return;
    }
    setJoinedDeals((prev) => [...prev, dealId]);
    track("group_deal_joined", { deal_id: dealId, crew_name: crewName });
    const xpGain = await awardXP(user.id, "join_deal");
    toast({ title: `+${xpGain} XP! 🎮`, description: "You joined a group deal!" });
  };

  const leaveDeal = async (dealId: string) => {
    if (!user) return;
    await supabase.from("group_deal_participants").delete().eq("deal_id", dealId).eq("user_id", user.id);
    setJoinedDeals((prev) => prev.filter((d) => d !== dealId));
  };

  const shareCrew = () => {
    const url = `${window.location.origin}/crew/${encodeURIComponent(crewName)}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied! 📋", description: "Share this crew with friends." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!crew) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <span className="text-5xl">🔍</span>
        <h2 className="font-heading font-bold text-foreground text-xl">Crew not found</h2>
        <p className="text-muted-foreground text-sm text-center">This crew doesn't exist or may have been removed.</p>
        <Button onClick={() => navigate("/community")} className="rounded-xl">Back to Community</Button>
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "activity", label: "Activity" },
    { key: "deals", label: `Deals (${deals.length})` },
    { key: "members", label: `Members (${crew.member_count})` },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border">
        <div className="px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/community")}>
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <span className="text-2xl">{crew.emoji}</span>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading font-bold text-foreground text-lg truncate">{crew.name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{crew.category}</span>
                {crew.is_active && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-success">
                    <TrendingUp className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
            </div>
            <Button size="sm" variant="ghost" className="rounded-xl" onClick={shareCrew}>
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Crew info card */}
        <div className="px-4 pb-3 max-w-lg mx-auto">
          {crew.description && (
            <p className="text-sm text-muted-foreground mb-3">{crew.description}</p>
          )}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> {crew.member_count.toLocaleString()} {crew.member_count === 1 ? "member" : "members"}
            </span>

            {/* Member avatar stack */}
            {members.length > 0 && (
              <div className="flex -space-x-1.5">
                {members.slice(0, 5).map((m, i) => (
                  <span
                    key={m.user_id}
                    className="w-6 h-6 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-xs"
                  >
                    {m.profiles?.avatar_emoji || "🐇"}
                  </span>
                ))}
                {crew.member_count > 5 && (
                  <span className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                    +{crew.member_count - 5}
                  </span>
                )}
              </div>
            )}

            <div className="flex-1" />

            <Button
              size="sm"
              variant={isJoined ? "secondary" : "default"}
              className="rounded-xl text-xs"
              onClick={toggleJoin}
            >
              {isJoined ? "Joined ✓" : "Join Crew"}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 max-w-lg mx-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Activity Tab */}
        {tab === "activity" && (
          <div className="space-y-2">
            {activity.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">📡</span>
                <p className="text-muted-foreground text-sm">No activity in this crew yet.</p>
                <p className="text-muted-foreground text-xs mt-1">Activity will appear when deals are shared or milestones are hit.</p>
              </div>
            ) : (
              activity.map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <span className="text-lg mt-0.5">
                    {a.type === "deal_funded" ? "🎉" : a.type === "deal_milestone" ? "🔥" : a.type === "deal_shared" ? "📢" : "📋"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(a.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Deals Tab */}
        {tab === "deals" && (
          <div className="space-y-3">
            {deals.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">🤝</span>
                <p className="text-muted-foreground text-sm">No active deals in this crew.</p>
                <p className="text-muted-foreground text-xs mt-1">Create one from the Group Deals tab!</p>
              </div>
            ) : (
              <AnimatePresence>
                {deals.map((deal) => (
                  <GroupDealCard
                    key={deal.id}
                    deal={deal}
                    participantAvatars={dealAvatars[deal.id] || []}
                    isJoined={joinedDeals.includes(deal.id)}
                    onJoin={joinDeal}
                    onLeave={leaveDeal}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* Members Tab */}
        {tab === "members" && (
          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">👥</span>
                <p className="text-muted-foreground text-sm">No members yet. Be the first to join!</p>
              </div>
            ) : (
              members.map((m, i) => (
                <motion.div
                  key={m.user_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <span className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl">
                    {m.profiles?.avatar_emoji || "🐇"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">
                      {m.profiles?.display_name || "Anonymous Nabber"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Joined {new Date(m.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Flame className="w-3 h-3 text-primary" />
                    <span className="font-bold">{m.profiles?.total_xp || 0}</span>
                    <span>XP</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CrewDetail;
