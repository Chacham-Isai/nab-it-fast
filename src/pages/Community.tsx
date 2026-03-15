import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Flame, Clock, Loader2, Plus, ChevronRight, Zap, ShoppingBag, Gavel, Gift, Search, TrendingUp, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import StreakWidget from "@/components/community/StreakWidget";
import AIPicksBanner from "@/components/community/AIPicksBanner";
import CreateDealForm from "@/components/community/CreateDealForm";
import CreateCrewForm from "@/components/community/CreateCrewForm";
import Countdown from "@/components/Countdown";
import ConfettiCelebration from "@/components/community/ConfettiCelebration";
import { awardXP } from "@/lib/xp";
import { toast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";

type TabType = "feed" | "crew-deals" | "leaderboard";

const listingTypeIcon: Record<string, any> = {
  auction: Gavel,
  buy_now: ShoppingBag,
  grab_bag: Gift,
  break: Flame,
};

const Community = () => {
  usePageMeta({ title: "Community — nabbit.ai", description: "Join crews, crew deals, and connect with fellow deal hunters.", path: "/community" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [tab, setTab] = useState<TabType>("feed");
  const [joinedTribes, setJoinedTribes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Feed state
  const [feedListings, setFeedListings] = useState<any[]>([]);

  // Crew deals state
  const [deals, setDeals] = useState<any[]>([]);
  const [joinedDeals, setJoinedDeals] = useState<string[]>([]);
  const [dealAvatars, setDealAvatars] = useState<Record<string, string[]>>({});
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  // Crews state (inline in crew-deals tab)
  const [crews, setCrews] = useState<any[]>([]);
  const [crewSearch, setCrewSearch] = useState("");
  const [showCreateCrew, setShowCreateCrew] = useState(false);
  const [showCelebration, setShowCelebration] = useState<{ show: boolean; title: string }>({ show: false, title: "" });

  useEffect(() => { loadData(); }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("community-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "group_deals" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setDeals((prev) => prev.map((d) => (d.id === payload.new.id ? { ...d, ...payload.new } : d)));
        } else if (payload.eventType === "INSERT") {
          setDeals((prev) => [payload.new as any, ...prev]);
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_deal_participants" }, () => {
        loadDealAvatars();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadData = async () => {
    setLoading(true);
    const dealsPromise = supabase.from("group_deals").select("*").in("status", ["active", "funded"]).order("created_at", { ascending: false });
    const listingsPromise = supabase
      .from("listings")
      .select("*, profiles:seller_id(display_name, avatar_emoji)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20);
    const crewsPromise = supabase.from("crews" as any).select("*").order("member_count", { ascending: false });

    if (user) {
      const [dealsRes, tribesRes, participantsRes, listingsRes, crewsRes] = await Promise.all([
        dealsPromise,
        supabase.from("tribe_memberships").select("tribe_name").eq("user_id", user.id),
        supabase.from("group_deal_participants").select("deal_id").eq("user_id", user.id),
        listingsPromise,
        crewsPromise,
      ]);
      setDeals(dealsRes.data || []);
      setJoinedTribes(tribesRes.data?.map((d: any) => d.tribe_name) || []);
      setJoinedDeals(participantsRes.data?.map((d: any) => d.deal_id) || []);
      setFeedListings(listingsRes.data || []);
      setCrews((crewsRes.data as any[]) || []);
    } else {
      const [dealsRes, listingsRes, crewsRes] = await Promise.all([dealsPromise, listingsPromise, crewsPromise]);
      setDeals(dealsRes.data || []);
      setFeedListings(listingsRes.data || []);
      setCrews((crewsRes.data as any[]) || []);
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
    if (error) { toast({ title: "Couldn't join", description: error.message, variant: "destructive" }); return; }
    setJoinedDeals((prev) => [...prev, dealId]);
    track("group_deal_joined", { deal_id: dealId });
    const deal = deals.find(d => d.id === dealId);
    if (deal && deal.current_participants + 1 >= deal.target_participants) {
      setShowCelebration({ show: true, title: deal.title });
    }
    const xpGain = await awardXP(user.id, "join_deal");
    toast({ title: `+${xpGain} XP! 🎮`, description: "You joined a crew deal!" });
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
      track("crew_left", { crew_name: tribeName });
      setJoinedTribes((prev) => prev.filter((t) => t !== tribeName));
    } else {
      await supabase.from("tribe_memberships").insert({ user_id: user.id, tribe_name: tribeName, tribe_emoji: tribeEmoji });
      track("crew_joined", { crew_name: tribeName });
      setJoinedTribes((prev) => [...prev, tribeName]);
    }
  };

  const handleCreateFromAI = async (deal: any) => {
    if (!user) { navigate("/login"); return; }
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + 24);
    const { error } = await supabase.from("group_deals").insert({
      title: deal.title, description: deal.description, emoji: deal.emoji, category: deal.category,
      tribe_name: deal.tribe_name, deal_price: deal.deal_price, retail_price: deal.retail_price,
      discount_pct: deal.discount_pct, target_participants: deal.target_participants,
      ends_at: endsAt.toISOString(), created_by: user.id,
    });
    if (error) { toast({ title: "Failed to create deal", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Deal created! 🚀", description: "Share it with your crew." }); }
  };

  const shareDeal = async (dealId: string) => {
    const url = `${window.location.origin}/community?deal=${dealId}`;
    navigator.clipboard.writeText(url);
    const deal = deals.find((d) => d.id === dealId);
    if (user && deal?.tribe_name) {
      const { data: tribeMembers } = await supabase
        .from("tribe_memberships").select("user_id").eq("tribe_name", deal.tribe_name).neq("user_id", user.id).limit(50);
      if (tribeMembers && tribeMembers.length > 0) {
        const notifications = tribeMembers.map((m: any) => ({
          user_id: m.user_id, type: "deal_shared",
          title: `${deal.emoji} Deal shared in ${deal.tribe_name}!`,
          body: `${deal.title} — $${deal.deal_price} (${deal.discount_pct}% off). Join before it fills up!`,
          action_label: "View Deal",
        }));
        await supabase.from("notifications_log").insert(notifications);
      }
    }
    toast({ title: "Link copied!", description: "Your crew has been notified too! 🔔" });
  };

  const filteredCrews = crews.filter((c: any) =>
    !crewSearch || c.name.toLowerCase().includes(crewSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: "feed", label: "For You" },
    { key: "crew-deals", label: "Crew Deals" },
    { key: "leaderboard", label: "🏆" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-2xl border-b border-border">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5 text-foreground" /></button>
          <h1 className="font-heading font-bold text-foreground text-lg flex-1">Community</h1>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> 12.6K</span>
        </div>
        <div className="flex gap-2 max-w-lg mx-auto px-4 pb-3">
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

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {user && <StreakWidget />}

        {/* ===== FOR YOU FEED ===== */}
        {tab === "feed" && (
          <div className="space-y-3">
            {feedListings.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <p className="text-foreground font-heading font-bold">No listings yet</p>
                <p className="text-xs text-muted-foreground mt-1">Be the first to list something!</p>
                <Button className="mt-4 rounded-xl shimmer-btn text-xs gap-1" onClick={() => navigate("/sell")}>
                  <Plus className="w-3.5 h-3.5" /> Create Listing
                </Button>
              </motion.div>
            ) : (
              feedListings.map((listing: any, i: number) => {
                const Icon = listingTypeIcon[listing.listing_type] || ShoppingBag;
                const typeLabel = listing.listing_type?.replace('_', ' ') || "listing";
                const price = listing.buy_now_price || listing.starting_price;
                const sellerEmoji = listing.profiles?.avatar_emoji || "🐇";
                const sellerName = listing.profiles?.display_name || "Seller";

                return (
                  <motion.button
                    key={listing.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate(`/listing/${listing.id}`)}
                    className="w-full p-4 rounded-2xl glass-card gradient-border text-left transition-all hover:scale-[1.01] active:scale-[0.99] group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
                        {sellerEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-semibold text-foreground">{sellerName}</span>
                          <span className="text-[10px] text-muted-foreground/60">·</span>
                          <span className="flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                            <Icon className="w-3 h-3" /> {typeLabel}
                          </span>
                        </div>
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{listing.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-base font-bold text-foreground">${price?.toLocaleString()}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold uppercase">{listing.category}</span>
                          {listing.condition && listing.condition !== "new" && (
                            <span className="text-[10px] text-muted-foreground">{listing.condition}</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary mt-1 shrink-0 transition-colors" />
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        )}

        {/* ===== CREW DEALS ===== */}
        {tab === "crew-deals" && (
          <div className="space-y-5">
            {/* AI Picks */}
            <AIPicksBanner onCreateDeal={handleCreateFromAI} />

            {/* Your Crews (compact horizontal) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-primary" /> Your Crews
                </h3>
                <button onClick={() => setShowCreateCrew(true)} className="text-[10px] text-primary font-semibold flex items-center gap-0.5">
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {filteredCrews.slice(0, 10).map((crew: any) => {
                  const joined = joinedTribes.includes(crew.name);
                  return (
                    <button
                      key={crew.id}
                      onClick={() => navigate(`/crew/${encodeURIComponent(crew.name)}`)}
                      className={cn(
                        "shrink-0 px-3 py-2 rounded-xl border text-center transition-all min-w-[80px]",
                        joined ? "bg-primary/10 border-primary/30" : "bg-card border-border"
                      )}
                    >
                      <span className="text-xl block">{crew.emoji}</span>
                      <p className="text-[10px] font-semibold text-foreground mt-0.5 truncate max-w-[64px]">{crew.name}</p>
                      <p className="text-[9px] text-muted-foreground">{crew.member_count}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Create deal button */}
            {user && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowCreateDeal(true)}
                className="w-full p-3 rounded-xl border border-dashed border-border hover:border-primary/40 transition-all flex items-center justify-center gap-2 text-muted-foreground hover:text-primary group"
              >
                <div className="w-7 h-7 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-xs font-medium">Create Crew Deal</span>
              </motion.button>
            )}

            {/* Deal cards */}
            {deals.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <p className="text-foreground font-heading font-bold text-sm">No crew deals yet</p>
                <p className="text-[10px] text-muted-foreground mt-1">Use AI picks above to create one!</p>
              </div>
            ) : (
              <AnimatePresence>
                {deals.map((deal, i) => {
                  const progress = Math.min((deal.current_participants / deal.target_participants) * 100, 100);
                  const almostThere = progress > 80 && deal.status === "active";
                  const isFunded = deal.status === "funded";
                  const secondsLeft = Math.max(0, Math.floor((new Date(deal.ends_at).getTime() - Date.now()) / 1000));
                  const isJoined = joinedDeals.includes(deal.id);
                  const avatars = dealAvatars[deal.id] || [];

                  return (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "p-4 rounded-2xl glass-card space-y-3 relative overflow-hidden",
                        isFunded && "border-primary/50 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]",
                        almostThere && "border-primary/30"
                      )}
                    >
                      {isFunded && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-success via-primary to-nab-cyan" />}

                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{deal.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {deal.tribe_name && <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{deal.tribe_name}</span>}
                            {deal.reward_tier && (
                              <span className={cn("text-xs font-bold", deal.reward_tier === "gold" ? "text-yellow-400" : deal.reward_tier === "silver" ? "text-slate-400" : "text-amber-600")}>
                                {deal.reward_tier === "gold" ? "🥇" : deal.reward_tier === "silver" ? "🥈" : "🥉"} {deal.reward_tier}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground text-sm leading-tight">{deal.title}</h3>
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-lg font-bold text-foreground">${deal.deal_price}</span>
                            <span className="text-sm text-muted-foreground line-through">${deal.retail_price}</span>
                            <span className="text-xs font-bold text-success">-{deal.discount_pct}%</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {deal.current_participants} of {deal.target_participants}</span>
                          {almostThere && <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-primary font-bold">Almost there! 🔥</motion.span>}
                          {isFunded && <span className="text-success font-bold flex items-center gap-1"><Trophy className="w-3 h-3" /> Funded!</span>}
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {avatars.length > 0 && (
                        <div className="flex items-center gap-1">
                          {avatars.slice(0, 5).map((emoji, j) => (
                            <span key={j} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs">{emoji}</span>
                          ))}
                          {deal.current_participants > 5 && <span className="text-[10px] text-muted-foreground ml-1">+{deal.current_participants - 5}</span>}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /><Countdown seconds={secondsLeft} /></span>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="rounded-xl text-xs px-2" onClick={() => shareDeal(deal.id)}>
                            <Share2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant={isJoined ? "secondary" : "default"}
                            className={cn("rounded-xl text-xs", !isJoined && "shimmer-btn")}
                            onClick={() => isJoined ? leaveDeal(deal.id) : joinDeal(deal.id)}
                            disabled={isFunded && !isJoined}
                          >
                            {isJoined ? "Joined ✓" : "Join Deal"}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        )}

        {/* ===== LEADERBOARD ===== */}
        {tab === "leaderboard" && (
          <div>
            {/* Lazy import equivalent — just render inline */}
            <LeaderboardInline />
          </div>
        )}
      </div>

      <ConfettiCelebration
        show={showCelebration.show}
        xpAmount={200}
        dealTitle={showCelebration.title}
        onComplete={() => setShowCelebration({ show: false, title: "" })}
      />
      <CreateDealForm open={showCreateDeal} onClose={() => setShowCreateDeal(false)} onCreated={loadData} />
      <CreateCrewForm open={showCreateCrew} onClose={() => setShowCreateCrew(false)} onCreated={loadData} />
      <BottomNav />
    </div>
  );
};

// Inline leaderboard to avoid import issues
const LeaderboardInline = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, avatar_emoji, total_xp, streak_days")
        .order("total_xp", { ascending: false })
        .limit(20);
      setProfiles(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-2">
      {profiles.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className={cn(
            "flex items-center gap-3 p-3 rounded-xl border",
            i === 0 ? "glass-card gradient-border" : "bg-card border-border"
          )}
        >
          <span className={cn(
            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
            i === 0 ? "bg-yellow-400/20 text-yellow-400" : i === 1 ? "bg-slate-400/20 text-slate-400" : i === 2 ? "bg-amber-600/20 text-amber-600" : "bg-secondary text-muted-foreground"
          )}>
            {i + 1}
          </span>
          <span className="text-xl">{p.avatar_emoji || "🐇"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{p.display_name || "Anonymous"}</p>
            <p className="text-[10px] text-muted-foreground flex items-center gap-2">
              <span className="flex items-center gap-0.5"><Zap className="w-3 h-3 text-primary" /> {p.total_xp.toLocaleString()} XP</span>
              <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-destructive" /> {p.streak_days}d</span>
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Community;
