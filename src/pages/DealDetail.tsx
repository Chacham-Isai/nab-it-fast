import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Clock, Share2, Trophy, Flame, Gift, Truck, Package, CheckCircle2, Zap, Lock, Check, Copy, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Countdown from "@/components/Countdown";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";
import { awardXP } from "@/lib/xp";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import imgCardsBox from "@/assets/products/cards-box.jpg";
import imgSneakers from "@/assets/products/sneakers-jordans.jpg";
import imgWatch from "@/assets/products/watch-rolex.jpg";
import imgFashion from "@/assets/products/fashion-bag.jpg";
import imgVR from "@/assets/products/electronics-vr.jpg";

const categoryImages: Record<string, string> = {
  cards: imgCardsBox, sneakers: imgSneakers, watches: imgWatch, fashion: imgFashion, electronics: imgVR,
};

interface PriceTier {
  tier_name: string;
  price: number;
  slots: number;
  slots_filled: number;
}

interface Participant {
  id: string;
  user_id: string;
  tier_name: string | null;
  price_paid: number | null;
  joined_at: string;
  profiles: { display_name: string | null; avatar_emoji: string | null } | null;
}

const sourceSteps = [
  { key: "sourcing", icon: Package, label: "Sourcing", desc: "Finding best suppliers" },
  { key: "quoted", icon: Truck, label: "Quoted", desc: "Suppliers submitted bids" },
  { key: "locked", icon: CheckCircle2, label: "Locked", desc: "Best price secured" },
  { key: "ordered", icon: CheckCircle2, label: "Ordered", desc: "Order placed with supplier" },
];

const tierColorMap: Record<string, string> = {
  "Early Bird": "bg-success/15 text-success border-success/30",
  "Standard": "bg-primary/15 text-primary border-primary/30",
  "Late Entry": "bg-accent/15 text-accent border-accent/30",
};

const DealDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deal, setDeal] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  usePageMeta({ title: deal ? `${deal.title} — nabbit.ai` : "Deal — nabbit.ai", description: "Join this crew deal and save together.", path: `/deal/${id}` });

  useEffect(() => { if (id) loadDeal(); }, [id, user]);

  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`deal-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "group_deals", filter: `id=eq.${id}` }, (payload) => {
        setDeal((prev: any) => prev ? { ...prev, ...payload.new } : prev);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "group_deal_participants", filter: `deal_id=eq.${id}` }, () => {
        loadParticipants();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const loadDeal = async () => {
    setLoading(true);
    const [dealRes, participantsRes] = await Promise.all([
      supabase.from("group_deals").select("*").eq("id", id!).single(),
      supabase.from("group_deal_participants").select("*, profiles:user_id(display_name, avatar_emoji)").eq("deal_id", id!).order("joined_at", { ascending: true }),
    ]);
    if (dealRes.data) setDeal(dealRes.data);
    setParticipants((participantsRes.data as any) || []);
    if (user) {
      setIsJoined(participantsRes.data?.some((p: any) => p.user_id === user.id) || false);
    }
    setLoading(false);
  };

  const loadParticipants = async () => {
    const { data } = await supabase.from("group_deal_participants").select("*, profiles:user_id(display_name, avatar_emoji)").eq("deal_id", id!).order("joined_at", { ascending: true });
    setParticipants((data as any) || []);
  };

  const joinDeal = async () => {
    if (!user) { navigate("/login"); return; }
    setJoining(true);
    const { error } = await supabase.from("group_deal_participants").insert({ deal_id: id!, user_id: user.id });
    if (error) { toast({ title: "Couldn't join", description: error.message, variant: "destructive" }); }
    else {
      setIsJoined(true);
      const xpGain = await awardXP(user.id, "join_deal");
      toast({ title: `+${xpGain} XP! 🎮`, description: "You joined this crew deal!" });
    }
    setJoining(false);
  };

  const leaveDeal = async () => {
    if (!user) return;
    await supabase.from("group_deal_participants").delete().eq("deal_id", id!).eq("user_id", user.id);
    setIsJoined(false);
  };

  const shareDeal = async () => {
    const url = `${window.location.origin}/deal/${id}`;
    if (navigator.share) {
      try { await navigator.share({ title: deal?.title, text: `Check out this deal: ${deal?.title} — ${deal?.discount_pct}% off!`, url }); } catch {}
    } else {
      navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Share it with your crew 🔗" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Deal not found</p>
        <Button variant="outline" onClick={() => navigate("/community")}>Back to Crew Hub</Button>
      </div>
    );
  }

  const tiers: PriceTier[] = deal.price_tiers || [];
  const progress = Math.min((deal.current_participants / deal.target_participants) * 100, 100);
  const isFunded = deal.status === "funded";
  const almostThere = progress > 80 && !isFunded;
  const secondsLeft = Math.max(0, Math.floor((new Date(deal.ends_at).getTime() - Date.now()) / 1000));
  const heroImg = categoryImages[deal.category] || imgCardsBox;
  const activeTier = tiers.find(t => t.slots_filled < t.slots);
  const currentPrice = activeTier?.price || deal.deal_price;
  const currentDiscount = Math.round((1 - currentPrice / deal.retail_price) * 100);
  const sourceIdx = sourceSteps.findIndex(s => s.key === (deal.source_status || "sourcing"));

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero image */}
      <div className="relative h-56 overflow-hidden">
        <img src={heroImg} alt={deal.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-background/50 backdrop-blur-xl flex items-center justify-center border border-border/30">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex gap-2">
            {deal.giveaway_enabled && (
              <Badge className="bg-accent/80 backdrop-blur-xl text-foreground border-none">
                <Gift className="w-3 h-3 mr-1" /> {deal.giveaway_prize || "Free order!"}
              </Badge>
            )}
            <Badge className="bg-success/90 text-white border-none font-black">-{currentDiscount}%</Badge>
          </div>
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="flex items-center gap-2 mb-2">
            {deal.tribe_name && (
              <Badge variant="secondary" className="backdrop-blur-xl bg-background/50 border-border/30">
                {deal.emoji} {deal.tribe_name}
              </Badge>
            )}
            {deal.reward_tier && (
              <Badge className={cn(
                "backdrop-blur-xl border",
                deal.reward_tier === "gold" ? "bg-yellow-400/20 text-yellow-400 border-yellow-400/30" :
                deal.reward_tier === "silver" ? "bg-slate-400/20 text-slate-300 border-slate-400/30" :
                "bg-amber-600/20 text-amber-500 border-amber-600/30"
              )}>
                {deal.reward_tier === "gold" ? "🥇" : deal.reward_tier === "silver" ? "🥈" : "🥉"} {deal.reward_tier}
              </Badge>
            )}
          </div>
          <h1 className="font-heading font-black text-2xl text-foreground leading-tight">{deal.title}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-5 -mt-2 relative z-10">

        {/* Price + Timer Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <span className="text-xs text-muted-foreground">Current price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-heading font-black gradient-text">${currentPrice}</span>
                <span className="text-lg text-muted-foreground line-through">${deal.retail_price}</span>
              </div>
              {activeTier && (
                <Badge className={cn("mt-1 text-[10px]", tierColorMap[activeTier.tier_name] || "bg-primary/15 text-primary")}>
                  <Zap className="w-3 h-3 mr-0.5" /> {activeTier.tier_name} tier active
                </Badge>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block mb-1">Ends in</span>
              <div className="bg-secondary/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-mono font-bold text-foreground"><Countdown seconds={secondsLeft} /></span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span className="font-bold text-foreground">{deal.current_participants}</span> / {deal.target_participants} joined
              </span>
              {almostThere && (
                <motion.span animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.2, repeat: Infinity }} className="text-primary font-bold flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-destructive" /> Almost there!
                </motion.span>
              )}
              {isFunded && (
                <span className="text-success font-bold flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> Funded! 🎉</span>
              )}
            </div>
            <div className="relative h-4 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: isFunded ? "linear-gradient(90deg, hsl(var(--success)), hsl(var(--primary)))" : "linear-gradient(90deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)), hsl(var(--nab-purple)))" }}
                initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              {!isFunded && progress > 0 && (
                <motion.div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" animate={{ x: ["-100%", "400%"] }} transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }} />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              className={cn("flex-1 rounded-xl h-12 font-bold text-sm", !isJoined && "shimmer-btn")}
              variant={isJoined ? "secondary" : "default"}
              onClick={() => isJoined ? leaveDeal() : joinDeal()}
              disabled={(isFunded && !isJoined) || joining}
            >
              {joining ? <Loader2 className="w-4 h-4 animate-spin" /> :
                isJoined ? "✓ Joined — Leave" :
                activeTier ? `🚀 Join at $${activeTier.price}` : "🚀 Join Deal"}
            </Button>
            <Button variant="outline" className="rounded-xl h-12 px-5" onClick={shareDeal}>
              <Share2 className="w-4 h-4 mr-1" /> Share
            </Button>
          </div>
        </motion.div>

        {/* Description */}
        {deal.description && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-2xl bg-card border border-border p-5">
            <h2 className="text-sm font-bold text-foreground mb-2">About this deal</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{deal.description}</p>
          </motion.div>
        )}

        {/* Full-Screen Tier Breakdown */}
        {tiers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Price Tier Breakdown
            </h2>
            <div className="space-y-3">
              {tiers.map((tier, i) => {
                const isFull = tier.slots_filled >= tier.slots;
                const isActive = tiers.findIndex(t => t.slots_filled < t.slots) === i;
                const discount = Math.round((1 - tier.price / deal.retail_price) * 100);
                const colorClass = tierColorMap[tier.tier_name] || "bg-primary/15 text-primary border-primary/30";

                return (
                  <motion.div
                    key={tier.tier_name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "rounded-xl border p-4 relative overflow-hidden transition-all",
                      isFull ? "bg-secondary/30 border-border opacity-60" : colorClass.split(" ").find(c => c.startsWith("bg-")) + " " + colorClass.split(" ").find(c => c.startsWith("border-")),
                      isActive && "ring-2 ring-primary/40 shadow-lg"
                    )}
                  >
                    {isActive && (
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" animate={{ x: ["-100%", "200%"] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                    )}
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isFull ? "bg-secondary" : "bg-background/50")}>
                          {isFull ? <Check className="w-5 h-5 text-muted-foreground" /> :
                            isActive ? <Zap className="w-5 h-5 text-primary" /> :
                            <Lock className="w-5 h-5 text-muted-foreground/50" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={cn("font-bold text-sm", isFull ? "text-muted-foreground line-through" : "text-foreground")}>{tier.tier_name}</span>
                            {isActive && <Badge className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0">ACTIVE</Badge>}
                            {isFull && <Badge variant="secondary" className="text-[9px] px-1.5 py-0">FULL</Badge>}
                          </div>
                          <span className="text-xs text-muted-foreground">{tier.slots_filled}/{tier.slots} slots filled</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn("text-2xl font-heading font-black", isFull ? "text-muted-foreground line-through" : "text-foreground")}>${tier.price}</span>
                        <div className={cn("text-xs font-bold", isFull ? "text-muted-foreground" : colorClass.split(" ").find(c => c.startsWith("text-")))}>
                          -{discount}% off
                        </div>
                      </div>
                    </div>
                    {/* Slot progress */}
                    <div className="mt-3 h-2 rounded-full bg-secondary/50 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: isFull ? "hsl(var(--muted-foreground) / 0.3)" : "hsl(var(--primary))" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(tier.slots_filled / tier.slots) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.15 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {/* Savings summary */}
            {deal.total_savings > 0 && (
              <div className="text-center py-2 rounded-xl bg-success/5 border border-success/20">
                <span className="text-xs text-muted-foreground">Total crew savings: </span>
                <span className="text-lg font-heading font-black gradient-text">${deal.total_savings.toLocaleString()}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Supplier Sourcing Timeline */}
        {isFunded && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl bg-card border border-border p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Supplier Sourcing Pipeline
            </h2>
            <div className="space-y-0">
              {sourceSteps.map((step, i) => {
                const Icon = step.icon;
                const isComplete = i <= sourceIdx;
                const isCurrent = i === sourceIdx;
                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Timeline line + dot */}
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.15 }}
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 relative",
                          isComplete ? "bg-primary border-primary" : "bg-secondary border-border",
                          isCurrent && "ring-4 ring-primary/20"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isComplete ? "text-primary-foreground" : "text-muted-foreground")} />
                        {isCurrent && (
                          <motion.div className="absolute inset-0 rounded-full border-2 border-primary" animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                        )}
                      </motion.div>
                      {i < sourceSteps.length - 1 && (
                        <div className={cn("w-0.5 h-12", isComplete && i < sourceIdx ? "bg-primary" : "bg-border")} />
                      )}
                    </div>
                    {/* Content */}
                    <div className="pt-2 pb-6">
                      <span className={cn("font-bold text-sm", isComplete ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Participant List with Tier Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-card border border-border p-5 space-y-4">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Participants ({participants.length})
          </h2>
          {participants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No one has joined yet. Be the first! 🚀</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {participants.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn("flex items-center gap-3 p-3 rounded-xl border border-border/50", p.user_id === user?.id && "bg-primary/5 border-primary/20")}
                >
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="text-base bg-secondary">{p.profiles?.avatar_emoji || "🐇"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{p.profiles?.display_name || "Nabber"}</span>
                      {p.user_id === user?.id && <Badge className="text-[8px] px-1 py-0 bg-primary/15 text-primary border-none">You</Badge>}
                      {i === 0 && <Badge className="text-[8px] px-1 py-0 bg-accent/15 text-accent border-none">First!</Badge>}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(p.joined_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  {p.tier_name && (
                    <Badge className={cn("text-[10px] border", tierColorMap[p.tier_name] || "bg-secondary text-foreground")}>
                      {p.tier_name}
                    </Badge>
                  )}
                  {p.price_paid && (
                    <span className="text-sm font-bold text-foreground">${p.price_paid}</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Giveaway Section */}
        {deal.giveaway_enabled && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20 p-5 space-y-3">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-accent" /> Giveaway
            </h2>
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground">{deal.giveaway_prize || "1 FREE order"}</span> — one random participant wins when the deal is funded.
            </p>
            {deal.current_participants > 0 && !deal.giveaway_winner_id && (
              <div className="flex items-center gap-2 bg-background/50 rounded-xl p-3 border border-border/50">
                <span className="text-2xl">🎰</span>
                <div>
                  <span className="text-xs font-bold text-foreground">Your odds: 1 in {deal.current_participants}</span>
                  <p className="text-[10px] text-muted-foreground">Winner drawn automatically when funded</p>
                </div>
              </div>
            )}
            {deal.giveaway_winner_id && (
              <div className="flex items-center gap-3 bg-success/10 rounded-xl p-4 border border-success/20">
                <span className="text-3xl">🎉</span>
                <div>
                  <span className="text-sm font-bold text-success">Winner selected!</span>
                  <p className="text-xs text-muted-foreground">The lucky nabber has been notified.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Social Sharing Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-card border border-border p-5 space-y-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Share2 className="w-4 h-4 text-primary" /> Share this deal
          </h2>
          <p className="text-xs text-muted-foreground">More people = lower prices. Spread the word!</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl text-xs h-10" onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/deal/${id}`);
              toast({ title: "Link copied!" });
            }}>
              <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
            </Button>
            <Button variant="outline" className="flex-1 rounded-xl text-xs h-10" onClick={() => {
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this deal: ${deal.title} — ${currentDiscount}% off! 🔥`)}&url=${encodeURIComponent(`${window.location.origin}/deal/${id}`)}`, "_blank");
            }}>
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> Tweet
            </Button>
          </div>
        </motion.div>

      </div>
      <BottomNav />
    </div>
  );
};

export default DealDetail;
