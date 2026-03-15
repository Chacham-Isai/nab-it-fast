import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Flame, Clock, Loader2, Plus, ChevronRight, Zap, ShoppingBag, Gavel, Gift, Search, TrendingUp, Share2, Trophy, Sparkles, Crown, Star, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import AIPicksBanner from "@/components/community/AIPicksBanner";
import CreateDealForm from "@/components/community/CreateDealForm";
import CreateCrewForm from "@/components/community/CreateCrewForm";
import Countdown from "@/components/Countdown";
import ConfettiCelebration from "@/components/community/ConfettiCelebration";
import { awardXP } from "@/lib/xp";
import { toast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/useAnalytics";
import { cn } from "@/lib/utils";
import nabbitLogo from "@/assets/nabbit-logo.png";

import crewHeroImg from "@/assets/crew/crew-hero.jpg";
import streakBgImg from "@/assets/crew/streak-bg.jpg";
import leaderboardHeroImg from "@/assets/crew/leaderboard-hero.jpg";
import dealsHeroImg from "@/assets/crew/deals-hero.jpg";
import imgCardsBox from "@/assets/products/cards-box.jpg";
import imgSneakers from "@/assets/products/sneakers-jordans.jpg";
import imgWatch from "@/assets/products/watch-rolex.jpg";
import imgFashion from "@/assets/products/fashion-bag.jpg";
import imgVR from "@/assets/products/electronics-vr.jpg";

type TabType = "feed" | "crew-deals" | "leaderboard";

const categoryImages: Record<string, string> = {
  cards: imgCardsBox,
  sneakers: imgSneakers,
  watches: imgWatch,
  fashion: imgFashion,
  electronics: imgVR,
};

const listingTypeIcon: Record<string, any> = {
  auction: Gavel,
  buy_now: ShoppingBag,
  grab_bag: Gift,
  break: Flame,
};

const listingTypeGradient: Record<string, string> = {
  auction: "from-amber-500/20 to-orange-500/20",
  buy_now: "from-emerald-500/20 to-teal-500/20",
  grab_bag: "from-purple-500/20 to-pink-500/20",
  break: "from-red-500/20 to-orange-500/20",
};

const Community = () => {
  usePageMeta({ title: "Crew Hub — nabbit.ai", description: "Join crews, unlock group deals, and compete on the leaderboard.", path: "/community" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { track } = useAnalytics();
  const [tab, setTab] = useState<TabType>("feed");
  const [joinedTribes, setJoinedTribes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [feedListings, setFeedListings] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [joinedDeals, setJoinedDeals] = useState<string[]>([]);
  const [dealAvatars, setDealAvatars] = useState<Record<string, string[]>>({});
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [crews, setCrews] = useState<any[]>([]);
  const [crewSearch, setCrewSearch] = useState("");
  const [showCreateCrew, setShowCreateCrew] = useState(false);
  const [showCelebration, setShowCelebration] = useState<{ show: boolean; title: string }>({ show: false, title: "" });

  // Streak state
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);

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
      const [dealsRes, tribesRes, participantsRes, listingsRes, crewsRes, profileRes] = await Promise.all([
        dealsPromise,
        supabase.from("tribe_memberships").select("tribe_name").eq("user_id", user.id),
        supabase.from("group_deal_participants").select("deal_id").eq("user_id", user.id),
        listingsPromise,
        crewsPromise,
        supabase.from("profiles").select("streak_days, total_xp, last_active_date").eq("id", user.id).single(),
      ]);
      setDeals(dealsRes.data || []);
      setJoinedTribes(tribesRes.data?.map((d: any) => d.tribe_name) || []);
      setJoinedDeals(participantsRes.data?.map((d: any) => d.deal_id) || []);
      setFeedListings(listingsRes.data || []);
      setCrews((crewsRes.data as any[]) || []);

      // Streak logic
      if (profileRes.data) {
        const today = new Date().toISOString().split("T")[0];
        const lastActive = profileRes.data.last_active_date;
        let newStreak = profileRes.data.streak_days;
        let bonusXp = 0;
        if (lastActive !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];
          newStreak = lastActive === yesterdayStr ? profileRes.data.streak_days + 1 : 1;
          bonusXp = 10 * newStreak;
          await supabase.from("profiles").update({ streak_days: newStreak, last_active_date: today, total_xp: profileRes.data.total_xp + bonusXp }).eq("id", user.id);
        }
        setStreak(newStreak);
        setXp(profileRes.data.total_xp + bonusXp);
      }
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
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading your crew...</p>
        </motion.div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: any }[] = [
    { key: "feed", label: "For You", icon: Sparkles },
    { key: "crew-deals", label: "Crew Deals", icon: Target },
    { key: "leaderboard", label: "Rankings", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 8, repeat: Infinity }} className="absolute top-10 -left-32 w-80 h-80 rounded-full blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }} transition={{ duration: 10, repeat: Infinity, delay: 2 }} className="absolute top-60 -right-32 w-72 h-72 rounded-full blur-[100px]" style={{ background: "hsl(var(--nab-purple))" }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border">
        {/* Hero banner strip */}
        <div className="relative overflow-hidden">
          <img src={crewHeroImg} alt="" className="w-full h-28 object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 flex items-center max-w-lg mx-auto px-4">
            <div className="flex items-center gap-3 flex-1">
              <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-background/40 backdrop-blur-xl flex items-center justify-center hover:bg-background/60 transition-colors border border-border/30">
                <ArrowLeft className="w-4 h-4 text-foreground" />
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <img src={nabbitLogo} alt="" className="h-5" />
                  <h1 className="font-heading font-black text-foreground text-xl tracking-tight">CREW HUB</h1>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Squad up. Nab together. Win bigger.</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/40 backdrop-blur-xl border border-primary/20">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-success" />
                <Users className="w-3 h-3 text-primary" />
                <span className="text-xs font-bold text-primary">12.6K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 max-w-lg mx-auto px-4 py-2.5">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative overflow-hidden",
                  active
                    ? "text-primary-foreground shadow-lg"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
                style={active ? {
                  background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)), hsl(var(--nab-purple)))",
                  boxShadow: "0 4px 20px hsl(var(--nab-cyan) / 0.3)",
                } : {}}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                {active && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-5 relative z-10">

        {/* ===== STREAK BANNER (inline, premium) ===== */}
        {user && (streak > 0 || xp > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden"
          >
            <img src={streakBgImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" />
            <div className="relative flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-destructive/20 to-orange-500/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-foreground">{streak} <span className="text-sm font-normal text-muted-foreground">day{streak !== 1 ? "s" : ""}</span></p>
                  <p className="text-[10px] text-muted-foreground">Current streak</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xl font-heading font-bold gradient-text">{xp.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Total XP</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== FOR YOU FEED ===== */}
        <AnimatePresence mode="wait">
          {tab === "feed" && (
            <motion.div key="feed" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {/* Hot Now Banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden glass-card gradient-border p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                    <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-[10px] font-black text-destructive uppercase tracking-wider">Hot Now</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{feedListings.length} active listings</span>
                </div>
                <h2 className="font-heading font-black text-foreground text-xl tracking-tight">
                  YOUR CREW'S <span className="gradient-text">LATEST DROPS</span>
                </h2>
                <p className="text-xs text-muted-foreground mt-1">Curated from sellers your crew trusts</p>
                {/* Mini preview images */}
                <div className="flex gap-2 mt-3">
                  {[imgCardsBox, imgSneakers, imgWatch, imgFashion].map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * i }}
                      className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-border"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.div>
                  ))}
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary">+{Math.max(0, feedListings.length - 4)}</span>
                  </div>
                </div>
              </motion.div>

              {feedListings.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-foreground font-heading font-bold text-lg">No listings yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Be the first to list something!</p>
                  <Button className="mt-4 rounded-xl shimmer-btn gap-1.5" onClick={() => navigate("/sell")}>
                    <Plus className="w-4 h-4" /> Create Listing
                  </Button>
                </motion.div>
              ) : (
                feedListings.map((listing: any, i: number) => {
                  const Icon = listingTypeIcon[listing.listing_type] || ShoppingBag;
                  const typeLabel = listing.listing_type?.replace('_', ' ') || "listing";
                  const price = listing.buy_now_price || listing.starting_price;
                  const sellerEmoji = listing.profiles?.avatar_emoji || "🐇";
                  const sellerName = listing.profiles?.display_name || "Seller";
                  const catImage = categoryImages[listing.category?.toLowerCase()] || imgCardsBox;
                  const gradient = listingTypeGradient[listing.listing_type] || "from-primary/20 to-accent/20";

                  return (
                    <motion.button
                      key={listing.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="w-full rounded-2xl glass-card gradient-border text-left transition-all hover:scale-[1.01] active:scale-[0.98] group overflow-hidden"
                    >
                      {/* Product image strip */}
                      <div className="relative h-32 overflow-hidden">
                        <img src={catImage} alt={listing.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                        {/* Type badge */}
                        <div className={cn("absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg backdrop-blur-xl bg-gradient-to-r text-xs font-bold text-foreground", gradient)}>
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{typeLabel}</span>
                        </div>
                        {/* Category badge */}
                        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-primary/20 backdrop-blur-xl">
                          <span className="text-[10px] font-bold text-primary uppercase">{listing.category}</span>
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-xl shrink-0 ring-2 ring-border">
                            {sellerEmoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-foreground">{sellerName}</span>
                              <span className="text-[10px] text-muted-foreground/40">·</span>
                              <span className="text-[10px] text-muted-foreground">{listing.condition || "New"}</span>
                            </div>
                            <h3 className="font-heading font-semibold text-foreground text-sm leading-tight line-clamp-2">{listing.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xl font-heading font-bold gradient-text">${price?.toLocaleString()}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary mt-1 shrink-0 transition-colors" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ===== CREW DEALS ===== */}
          {tab === "crew-deals" && (
            <motion.div key="crew-deals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
              {/* Crew Deals Header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl glass-card gradient-border p-5 relative overflow-hidden"
              >
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-primary/[0.03] to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Group Buying Power</span>
                  </div>
                  <h2 className="font-heading font-black text-foreground text-xl tracking-tight">
                    CREW <span className="gradient-text">DEALS</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">Team up → Unlock discounts → Win together</p>
                  <div className="flex gap-3 mt-3">
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-success/10 border border-success/20">
                      <TrendingUp className="w-3 h-3 text-success" />
                      <span className="text-[10px] font-bold text-success">{deals.length} active</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20">
                      <Users className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary">{deals.reduce((s, d) => s + d.current_participants, 0)} joined</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* AI Picks */}
              <AIPicksBanner onCreateDeal={handleCreateFromAI} />

              {/* Your Crews */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-primary" /> Your Crews
                  </h3>
                  <button onClick={() => setShowCreateCrew(true)} className="text-[10px] text-primary font-bold flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                    <Plus className="w-3 h-3" /> New Crew
                  </button>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                  {filteredCrews.slice(0, 10).map((crew: any, i: number) => {
                    const joined = joinedTribes.includes(crew.name);
                    return (
                      <motion.button
                        key={crew.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(`/crew/${encodeURIComponent(crew.name)}`)}
                        className={cn(
                          "shrink-0 px-4 py-3 rounded-2xl text-center transition-all min-w-[90px] glass-card",
                          joined ? "gradient-border shadow-lg shadow-primary/10" : ""
                        )}
                      >
                        <span className="text-2xl block mb-1">{crew.emoji}</span>
                        <p className="text-[11px] font-bold text-foreground truncate max-w-[72px]">{crew.name}</p>
                        <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5 mt-0.5">
                          <Users className="w-2.5 h-2.5" /> {crew.member_count}
                        </p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Create deal */}
              {user && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setShowCreateDeal(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 transition-all flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group bg-gradient-to-r from-primary/5 to-accent/5"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-foreground block">Create Crew Deal</span>
                    <span className="text-[10px] text-muted-foreground">Start a group buy and invite your crew</span>
                  </div>
                </motion.button>
              )}

              {/* Deal cards */}
              {deals.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-foreground font-heading font-bold">No crew deals yet</p>
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
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className={cn(
                          "p-5 rounded-2xl glass-card gradient-border space-y-4 relative overflow-hidden",
                          isFunded && "shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]",
                        )}
                      >
                        {isFunded && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-primary to-accent" />}
                        {almostThere && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent"
                          />
                        )}

                        <div className="flex items-start gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center text-3xl shrink-0">
                            {deal.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {deal.tribe_name && (
                                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{deal.tribe_name}</span>
                              )}
                              {deal.reward_tier && (
                                <span className={cn("text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full",
                                  deal.reward_tier === "gold" ? "text-yellow-400 bg-yellow-400/10" :
                                  deal.reward_tier === "silver" ? "text-slate-400 bg-slate-400/10" :
                                  "text-amber-600 bg-amber-600/10"
                                )}>
                                  {deal.reward_tier === "gold" ? "🥇" : deal.reward_tier === "silver" ? "🥈" : "🥉"} {deal.reward_tier}
                                </span>
                              )}
                            </div>
                            <h3 className="font-heading font-semibold text-foreground text-sm leading-tight mt-1">{deal.title}</h3>
                            <div className="flex items-baseline gap-2 mt-1.5">
                              <span className="text-xl font-heading font-bold gradient-text">${deal.deal_price}</span>
                              <span className="text-sm text-muted-foreground line-through">${deal.retail_price}</span>
                              <span className="text-xs font-bold text-success bg-success/10 px-1.5 py-0.5 rounded">-{deal.discount_pct}%</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress */}
                        <div>
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span className="font-bold text-foreground">{deal.current_participants}</span> of {deal.target_participants}
                            </span>
                            {almostThere && (
                              <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-primary font-bold flex items-center gap-1">
                                <Flame className="w-3 h-3" /> Almost there!
                              </motion.span>
                            )}
                            {isFunded && (
                              <span className="text-success font-bold flex items-center gap-1">
                                <Trophy className="w-3 h-3" /> Funded!
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <Progress value={progress} className="h-2.5 rounded-full" />
                            {progress > 0 && (
                              <motion.div
                                className="absolute top-0 left-0 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent opacity-30"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                              />
                            )}
                          </div>
                        </div>

                        {/* Avatars */}
                        {avatars.length > 0 && (
                          <div className="flex items-center gap-1">
                            {avatars.slice(0, 6).map((emoji, j) => (
                              <span key={j} className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-sm ring-2 ring-background -ml-1 first:ml-0">
                                {emoji}
                              </span>
                            ))}
                            {deal.current_participants > 6 && (
                              <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary ring-2 ring-background -ml-1">
                                +{deal.current_participants - 6}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3" /><Countdown seconds={secondsLeft} />
                          </span>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="rounded-xl text-xs px-2.5 h-8" onClick={() => shareDeal(deal.id)}>
                              <Share2 className="w-3.5 h-3.5" />
                            </Button>
                            <motion.div whileTap={{ scale: 0.92 }}>
                              <Button
                                size="sm"
                                variant={isJoined ? "secondary" : "default"}
                                className={cn("rounded-xl text-xs h-8 px-4", !isJoined && "shimmer-btn")}
                                onClick={() => isJoined ? leaveDeal(deal.id) : joinDeal(deal.id)}
                                disabled={isFunded && !isJoined}
                              >
                                {isJoined ? "Joined ✓" : "Join Deal"}
                              </Button>
                            </motion.div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* ===== LEADERBOARD ===== */}
          {tab === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4">
              {/* Hero banner */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden h-40"
              >
                <img src={leaderboardHeroImg} alt="Leaderboard" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                <div className="relative h-full flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <h2 className="font-heading font-bold text-foreground text-xl">Top Nabbers</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">Ranked by XP earned across the platform</p>
                </div>
              </motion.div>

              <LeaderboardInline />
            </motion.div>
          )}
        </AnimatePresence>
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

// Premium inline leaderboard
const LeaderboardInline = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, avatar_emoji, total_xp, streak_days")
        .order("total_xp", { ascending: false })
        .limit(20);
      setProfiles(data || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-2.5">
      {/* Top 3 podium */}
      {profiles.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pb-4">
          {[1, 0, 2].map((idx) => {
            const p = profiles[idx];
            if (!p) return null;
            const isCenter = idx === 0;
            const isMe = user?.id === p.id;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "flex flex-col items-center",
                  isCenter ? "order-2" : idx === 1 ? "order-1" : "order-3"
                )}
              >
                <div className={cn(
                  "rounded-2xl flex items-center justify-center text-3xl mb-2 ring-2",
                  isCenter ? "w-16 h-16 ring-yellow-400/40 bg-yellow-400/10" : "w-12 h-12 ring-border bg-secondary"
                )}>
                  {p.avatar_emoji || "🐇"}
                </div>
                <span className="text-lg mb-0.5">{medals[idx]}</span>
                <p className="text-xs font-bold text-foreground text-center max-w-[80px] truncate">
                  {p.display_name || "Anonymous"}
                  {isMe && <span className="text-primary ml-0.5">(you)</span>}
                </p>
                <p className="text-[10px] font-bold gradient-text">{p.total_xp.toLocaleString()} XP</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of list */}
      {profiles.slice(3).map((p, i) => {
        const isMe = user?.id === p.id;
        const rank = i + 4;
        return (
          <motion.div
            key={p.id || i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (i + 3) * 0.03 }}
            className={cn(
              "flex items-center gap-3 p-3.5 rounded-2xl transition-all glass-card",
              isMe && "gradient-border shadow-lg shadow-primary/10"
            )}
          >
            <span className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
              {rank}
            </span>
            <span className="text-xl">{p.avatar_emoji || "🐇"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {p.display_name || "Anonymous"}
                {isMe && <span className="text-primary text-xs ml-1">(you)</span>}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                {p.streak_days > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Flame className="w-3 h-3 text-destructive" /> {p.streak_days}d streak
                  </span>
                )}
              </p>
            </div>
            <span className="font-mono font-bold text-sm gradient-text">{p.total_xp.toLocaleString()} XP</span>
          </motion.div>
        );
      })}

      {profiles.length === 0 && (
        <div className="text-center py-12">
          <Star className="w-8 h-8 text-primary mx-auto mb-3 opacity-50" />
          <p className="text-muted-foreground text-sm">No XP earned yet — be the first!</p>
        </div>
      )}
    </div>
  );
};

export default Community;
