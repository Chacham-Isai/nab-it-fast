import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Flame, Clock, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import GroupDealCard from "@/components/community/GroupDealCard";
import LeaderboardTab from "@/components/community/LeaderboardTab";
import StreakWidget from "@/components/community/StreakWidget";
import AIPicksBanner from "@/components/community/AIPicksBanner";
import CreateDealForm from "@/components/community/CreateDealForm";
import CrewDiscovery from "@/components/community/CrewDiscovery";
import { awardXP } from "@/lib/xp";
import { toast } from "@/hooks/use-toast";

const activityFeed = [
  { id: 1, user: "🧑‍🎤", name: "Alex K.", action: "just nabbed", item: "Jordan 1 Chicago", price: 289, crew: "Sneakerheads", time: "2m ago", hot: true },
  { id: 2, user: "👩‍💼", name: "Sarah M.", action: "just nabbed", item: "1986 Fleer Jordan RC", price: 4200, crew: "Card Collectors", time: "5m ago", hot: true },
  { id: 3, user: "🧔", name: "Mike D.", action: "just nabbed", item: "Rolex Sub", price: 12800, crew: "Watch Collectors", time: "12m ago", hot: false },
  { id: 4, user: "👩‍🎨", name: "Luna R.", action: "just nabbed", item: "Supreme Box Logo", price: 425, crew: "Streetwear", time: "18m ago", hot: false },
  { id: 5, user: "🧑‍💻", name: "Dev P.", action: "just nabbed", item: "Vision Pro", price: 3299, crew: "Tech Heads", time: "25m ago", hot: false },
];


type TabType = "feed" | "deals" | "tribes" | "leaderboard";

const Community = () => {
  usePageMeta({ title: "Community — nabbit.ai", description: "Join crews, group deals, and connect with fellow deal hunters.", path: "/community" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<TabType>("feed");
  const [joinedTribes, setJoinedTribes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Group deals state
  const [deals, setDeals] = useState<any[]>([]);
  const [joinedDeals, setJoinedDeals] = useState<string[]>([]);
  const [dealAvatars, setDealAvatars] = useState<Record<string, string[]>>({});
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  // Realtime subscription for group deals
  useEffect(() => {
    const channel = supabase
      .channel("group-deals-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_deals" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setDeals((prev) => prev.map((d) => (d.id === payload.new.id ? { ...d, ...payload.new } : d)));
        } else if (payload.eventType === "INSERT") {
          setDeals((prev) => [payload.new as any, ...prev]);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_deal_participants" }, () => {
        // Reload avatars when participants change
        loadDealAvatars();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const dealsPromise = supabase.from("group_deals").select("*").in("status", ["active", "funded"]).order("created_at", { ascending: false });

    if (user) {
      const [dealsRes, tribesRes, participantsRes] = await Promise.all([
        dealsPromise,
        supabase.from("tribe_memberships").select("tribe_name").eq("user_id", user.id),
        supabase.from("group_deal_participants").select("deal_id").eq("user_id", user.id),
      ]);
      setDeals(dealsRes.data || []);
      setJoinedTribes(tribesRes.data?.map((d: any) => d.tribe_name) || []);
      setJoinedDeals(participantsRes.data?.map((d: any) => d.deal_id) || []);
    } else {
      const dealsRes = await dealsPromise;
      setDeals(dealsRes.data || []);
    }

    await loadDealAvatars();
    setLoading(false);
  };

  const loadDealAvatars = async () => {
    const { data } = await supabase
      .from("group_deal_participants")
      .select("deal_id, profiles:user_id(avatar_emoji)")
      .order("joined_at", { ascending: false })
      .limit(100);

    const avatarMap: Record<string, string[]> = {};
    data?.forEach((p: any) => {
      if (!avatarMap[p.deal_id]) avatarMap[p.deal_id] = [];
      avatarMap[p.deal_id].push(p.profiles?.avatar_emoji || "🐇");
    });
    setDealAvatars(avatarMap);
  };

  const joinDeal = async (dealId: string) => {
    if (!user) { navigate("/login"); return; }
    const { error } = await supabase.from("group_deal_participants").insert({ deal_id: dealId, user_id: user.id });
    if (error) {
      toast({ title: "Couldn't join", description: error.message, variant: "destructive" });
      return;
    }
    setJoinedDeals((prev) => [...prev, dealId]);

    // Award XP
    const xpGain = await awardXP(user.id, "join_deal");
    toast({ title: `+${xpGain} XP! 🎮`, description: "You joined a group deal!" });
  };

  const leaveDeal = async (dealId: string) => {
    if (!user) return;
    await supabase.from("group_deal_participants").delete().eq("deal_id", dealId).eq("user_id", user.id);
    setJoinedDeals((prev) => prev.filter((d) => d !== dealId));
  };

  const toggleTribe = async (tribeName: string, tribeEmoji: string) => {
    if (!user) { navigate("/login"); return; }
    if (joinedTribes.includes(tribeName)) {
      await supabase.from("tribe_memberships").delete().eq("user_id", user.id).eq("tribe_name", tribeName);
      setJoinedTribes((prev) => prev.filter((t) => t !== tribeName));
    } else {
      await supabase.from("tribe_memberships").insert({ user_id: user.id, tribe_name: tribeName, tribe_emoji: tribeEmoji });
      setJoinedTribes((prev) => [...prev, tribeName]);
    }
  };

  const handleCreateFromAI = async (deal: any) => {
    if (!user) { navigate("/login"); return; }
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + 24);

    const { error } = await supabase.from("group_deals").insert({
      title: deal.title,
      description: deal.description,
      emoji: deal.emoji,
      category: deal.category,
      tribe_name: deal.tribe_name,
      deal_price: deal.deal_price,
      retail_price: deal.retail_price,
      discount_pct: deal.discount_pct,
      target_participants: deal.target_participants,
      ends_at: endsAt.toISOString(),
      created_by: user.id,
    });

    if (error) {
      toast({ title: "Failed to create deal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deal created! 🚀", description: "Share it with your crew." });
    }
  };

  const shareDeal = async (dealId: string) => {
    const url = `${window.location.origin}/community?deal=${dealId}`;
    navigator.clipboard.writeText(url);

    // Notify tribe members about this deal
    const deal = deals.find((d) => d.id === dealId);
    if (user && deal?.tribe_name) {
      const { data: tribeMembers } = await supabase
        .from("tribe_memberships")
        .select("user_id")
        .eq("tribe_name", deal.tribe_name)
        .neq("user_id", user.id)
        .limit(50);

      if (tribeMembers && tribeMembers.length > 0) {
        const notifications = tribeMembers.map((m: any) => ({
          user_id: m.user_id,
          type: "deal_shared",
           title: `${deal.emoji} Deal shared in ${deal.tribe_name}!`,
          body: `${deal.title} — $${deal.deal_price} (${deal.discount_pct}% off). Join before it fills up!`,
          action_label: "View Deal",
        }));
        await supabase.from("notifications_log").insert(notifications);
      }
    }

    toast({ title: "Link copied!", description: "Your crew has been notified too! 🔔" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "feed", label: "Feed" },
    { key: "deals", label: "Group Deals" },
    { key: "tribes", label: "Crews" },
    { key: "leaderboard", label: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Community</h1>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> 12.6K</span>
        </div>
        <div className="flex gap-2 mt-3 max-w-lg mx-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        {/* Streak widget for logged-in users */}
        {user && <StreakWidget />}

        {/* Feed Tab */}
        {tab === "feed" && (
          <div className="space-y-2">
            {activityFeed.map((a, i) => (
              <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
                <span className="text-2xl">{a.user}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground"><span className="font-semibold">{a.name}</span> {a.action} <span className="font-semibold text-primary">{a.item}</span>{a.price && <span className="text-muted-foreground"> · ${a.price.toLocaleString()}</span>}</p>
                  <p className="text-[10px] text-muted-foreground">{a.crew} · {a.time}</p>
                </div>
                {a.hot && <Flame className="w-4 h-4 text-destructive shrink-0" />}
              </motion.div>
            ))}
          </div>
        )}

        {/* Group Deals Tab */}
        {tab === "deals" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <AIPicksBanner onCreateDeal={handleCreateFromAI} />
            </div>

            {user && (
              <Button
                className="w-full rounded-xl h-11 mb-2"
                variant="outline"
                onClick={() => setShowCreateDeal(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Create Group Deal
              </Button>
            )}

            {deals.length === 0 && (
              <div className="text-center py-12">
                <span className="text-4xl mb-3 block">🤝</span>
                <p className="text-muted-foreground text-sm">No group deals yet. Use AI picks above to create one!</p>
              </div>
            )}

            <AnimatePresence>
              {deals.map((deal) => (
                <GroupDealCard
                  key={deal.id}
                  deal={deal}
                  participantAvatars={dealAvatars[deal.id] || []}
                  isJoined={joinedDeals.includes(deal.id)}
                  onJoin={joinDeal}
                  onLeave={leaveDeal}
                  onShare={shareDeal}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Tribes Tab */}
        {tab === "tribes" && (
          <div className="grid grid-cols-2 gap-3">
            {tribes.map((tribe, i) => {
              const joined = joinedTribes.includes(tribe.name);
              return (
                <motion.div key={tribe.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="p-4 rounded-2xl bg-card border border-border text-center space-y-2">
                  <span className="text-3xl">{tribe.emoji}</span>
                  <h3 className="font-semibold text-foreground text-sm">{tribe.name}</h3>
                  <div className="flex items-center justify-center gap-1.5">
                    {tribe.active && <span className="w-2 h-2 rounded-full bg-success" />}
                    <span className="text-xs text-muted-foreground">{tribe.members.toLocaleString()} members</span>
                  </div>
                  <Button size="sm" variant={joined ? "secondary" : "default"} className="w-full rounded-xl text-xs" onClick={() => toggleTribe(tribe.name, tribe.emoji)}>{joined ? "Joined" : "Join"}</Button>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Leaderboard Tab */}
        {tab === "leaderboard" && <LeaderboardTab />}
      </div>

      <CreateDealForm
        open={showCreateDeal}
        onClose={() => setShowCreateDeal(false)}
        onCreated={loadData}
      />
      <BottomNav />
    </div>
  );
};

export default Community;
