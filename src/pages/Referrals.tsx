import { useState, useEffect } from "react";
import { ArrowLeft, Copy, Check, Gift, Users, Zap, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import usePageMeta from "@/hooks/usePageMeta";
import NabbitLogo from "@/components/NabbitLogo";
import ReferralLeaderboard from "@/components/community/ReferralLeaderboard";

const Referrals = () => {
  usePageMeta({ title: "Invite Friends — nabbit.ai", description: "Earn 500 XP for every friend who joins nabbit.", path: "/referrals" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  useEffect(() => {
    if (user) loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;
    setLoading(true);

    // Generate or get existing code
    const { data: codeData } = await supabase.rpc("generate_referral_code", { user_id: user.id });
    if (codeData) setCode(codeData);

    // Load completed referrals
    const { data: refs } = await supabase
      .from("referrals")
      .select("*, profiles!referrals_referee_id_fkey(display_name, avatar_emoji)")
      .eq("referrer_id", user.id)
      .neq("status", "pending")
      .order("completed_at", { ascending: false });

    setReferrals(refs || []);
    setTotalXpEarned((refs || []).reduce((sum: number, r: any) => sum + (r.xp_awarded || 0), 0));
    setLoading(false);
  };

  const referralLink = `${window.location.origin}/signup?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Join nabbit.ai!", text: "Sign up for nabbit and we both earn XP! 🎉", url: referralLink });
    } else {
      copyLink();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <NabbitLogo />
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Invite Friends, Earn XP</h1>
          <p className="text-muted-foreground text-sm">You get <span className="text-primary font-bold">500 XP</span> for every friend who signs up. They get <span className="text-primary font-bold">100 XP</span> welcome bonus!</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: "Invited", value: referrals.length },
            { icon: Zap, label: "XP Earned", value: totalXpEarned.toLocaleString() },
            { icon: Gift, label: "Per Invite", value: "500" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <s.icon className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Referral Code */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="text-sm font-semibold text-foreground">Your referral link</p>
          <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3 border border-border">
            <code className="text-xs text-foreground flex-1 truncate">{loading ? "Generating..." : referralLink}</code>
            <Button variant="ghost" size="icon" onClick={copyLink} className="shrink-0">
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={copyLink} variant="outline" className="flex-1 rounded-xl gap-2">
              <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button onClick={shareLink} className="flex-1 rounded-xl gap-2 shimmer-btn">
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
        </motion.div>

        {/* Referral code for manual entry */}
        <div className="bg-card border border-border rounded-2xl p-5 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Or share your code</p>
          <p className="text-2xl font-heading font-bold tracking-widest text-primary">{loading ? "..." : code}</p>
        </div>

        {/* Leaderboard */}
        <ReferralLeaderboard />

        {/* Referral History */}
        {referrals.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-heading text-lg font-bold text-foreground">Invited Friends</h2>
            {referrals.map((ref: any) => (
              <motion.div key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
                <span className="text-2xl">{ref.profiles?.avatar_emoji || "🐇"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{ref.profiles?.display_name || "New User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {ref.completed_at ? new Date(ref.completed_at).toLocaleDateString() : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Zap className="w-3 h-3" />
                  <span className="text-sm font-bold">+{ref.xp_awarded}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {referrals.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No referrals yet. Share your link to start earning!</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Referrals;
