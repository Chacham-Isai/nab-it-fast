import SectionWrapper from "@/components/SectionWrapper";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, ArrowRight, TrendingDown, Clock, ChevronRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CrewDeal {
  id: string;
  title: string;
  emoji: string;
  retail_price: number;
  deal_price: number;
  current_participants: number;
  target_participants: number;
  ends_at: string;
  discount_pct: number;
  category: string | null;
  price_tiers: any;
}

const fallbackDeals: CrewDeal[] = [
  { id: "1", title: "Air Jordan 4 Retro 'Thunder'", emoji: "👟", retail_price: 210, deal_price: 121, current_participants: 18, target_participants: 25, ends_at: new Date(Date.now() + 7200000).toISOString(), discount_pct: 42, category: "Sneakers", price_tiers: [{ tier_name: "Early Bird", price: 121, slots: 10, slots_filled: 10 }, { tier_name: "Standard", price: 145, slots: 10, slots_filled: 8 }, { tier_name: "Late Entry", price: 168, slots: 5, slots_filled: 0 }] },
  { id: "2", title: "PSA 10 Charizard Slab", emoji: "🃏", retail_price: 450, deal_price: 289, current_participants: 32, target_participants: 50, ends_at: new Date(Date.now() + 14400000).toISOString(), discount_pct: 36, category: "Cards", price_tiers: [{ tier_name: "Early Bird", price: 289, slots: 15, slots_filled: 15 }, { tier_name: "Standard", price: 340, slots: 20, slots_filled: 17 }] },
  { id: "3", title: "Rolex Submariner Date", emoji: "⌚", retail_price: 14500, deal_price: 11200, current_participants: 8, target_participants: 10, ends_at: new Date(Date.now() + 3600000).toISOString(), discount_pct: 23, category: "Watches", price_tiers: [{ tier_name: "Founders", price: 11200, slots: 5, slots_filled: 5 }, { tier_name: "Standard", price: 12400, slots: 5, slots_filled: 3 }] },
  { id: "4", title: "PS5 Pro + Extra Controller", emoji: "🎮", retail_price: 559, deal_price: 372, current_participants: 42, target_participants: 50, ends_at: new Date(Date.now() + 5400000).toISOString(), discount_pct: 33, category: "Electronics", price_tiers: [{ tier_name: "Early Bird", price: 372, slots: 20, slots_filled: 20 }, { tier_name: "Standard", price: 420, slots: 20, slots_filled: 22 }] },
];

const LiveFeedSection = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState<CrewDeal[]>(fallbackDeals);

  useEffect(() => {
    const fetchDeals = async () => {
      const { data } = await supabase
        .from("group_deals")
        .select("*")
        .eq("status", "active")
        .order("current_participants", { ascending: false })
        .limit(4);
      if (data && data.length > 0) setDeals(data as any);
    };
    fetchDeals();
  }, []);

  return (
    <SectionWrapper id="live-deals">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-nab-cyan/40 bg-nab-cyan/[0.08] mb-6">
          <Users className="w-4 h-4 text-nab-cyan" />
          <span className="text-sm font-bold text-nab-cyan uppercase tracking-wider">Crew Deals — Live Now</span>
        </div>
        <h2 className="font-heading font-black text-foreground mb-4" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
          More people join.{" "}
          <span className="gradient-text">Price drops.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Crew Deals use collective buying power to unlock tiered pricing. The earlier you join, the more you save. Every deal has a sourcing pipeline so you know exactly where your product comes from.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {deals.map((deal, i) => {
          const progress = Math.round((deal.current_participants / deal.target_participants) * 100);
          const timeLeft = Math.max(0, Math.round((new Date(deal.ends_at).getTime() - Date.now()) / 3600000));
          const tiers = Array.isArray(deal.price_tiers) ? deal.price_tiers : [];
          const isFilling = progress > 70;

          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
              whileHover={{ y: -6, scale: 1.01 }}
              onClick={() => navigate(`/deal/${deal.id}`)}
              className="glass-card gradient-border p-6 group cursor-pointer relative overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_40px_-5px_hsl(var(--nab-cyan)/0.3)]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-nab-cyan/10 via-transparent to-nab-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{deal.emoji}</span>
                    <div>
                      <h3 className="font-heading font-black text-foreground text-base leading-tight">{deal.title}</h3>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{deal.category}</span>
                    </div>
                  </div>
                  {isFilling && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-destructive/10 border border-destructive/30"
                    >
                      <Flame className="w-3 h-3 text-destructive" />
                      <span className="text-[9px] font-black text-destructive">FILLING FAST</span>
                    </motion.div>
                  )}
                </div>

                {/* Price + savings */}
                <div className="flex items-baseline gap-3 mb-4">
                  <span className="text-2xl font-heading font-black gradient-text">${deal.deal_price.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground line-through">${deal.retail_price.toLocaleString()}</span>
                  <span className="text-xs font-black text-success bg-success/10 px-2 py-0.5 rounded-full">-{deal.discount_pct}%</span>
                </div>

                {/* Tier ladder mini */}
                {tiers.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {tiers.slice(0, 3).map((tier: any, ti: number) => {
                      const tierProgress = tier.slots > 0 ? Math.round((tier.slots_filled / tier.slots) * 100) : 0;
                      const isFull = tier.slots_filled >= tier.slots;
                      return (
                        <div key={ti} className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold w-16 truncate ${isFull ? "text-muted-foreground" : ti === 0 ? "text-nab-cyan" : "text-foreground"}`}>
                            {tier.tier_name}
                          </span>
                          <div className="flex-1 h-2 rounded-full bg-muted/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${tierProgress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.8, delay: ti * 0.15 }}
                              className={`h-full rounded-full ${isFull ? "bg-muted-foreground/30" : ti === 0 ? "bg-nab-cyan" : "bg-primary"}`}
                            />
                          </div>
                          <span className={`text-[10px] font-black ${isFull ? "text-muted-foreground line-through" : "text-foreground"}`}>
                            ${tier.price}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{tier.slots_filled}/{tier.slots}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Progress bar + stats */}
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-nab-cyan" />
                    <span className="font-bold text-foreground">{deal.current_participants}/{deal.target_participants}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeLeft}h left</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1 font-bold text-nab-cyan group-hover:gap-2 transition-all">
                    Join <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mt-10"
      >
        <Button
          className="rounded-full px-8 font-black gap-2 shimmer-btn"
          onClick={() => navigate("/community")}
        >
          See All Crew Deals <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </SectionWrapper>
  );
};

export default LiveFeedSection;
