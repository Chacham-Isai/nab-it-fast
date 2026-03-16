import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Zap, DollarSign, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const BuyingPowerDashboard = () => {
  const [stats, setStats] = useState({ totalSavings: 0, activeDeals: 0, totalParticipants: 0 });
  const [displaySavings, setDisplaySavings] = useState(0);
  const animRef = useRef<number>();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("group_deals")
        .select("total_savings, current_participants, status")
        .in("status", ["active", "funded", "completed"]);
      
      if (data) {
        const totalSavings = data.reduce((s, d) => s + (Number(d.total_savings) || 0), 0);
        const activeDeals = data.filter(d => d.status === "active" || d.status === "funded").length;
        const totalParticipants = data.reduce((s, d) => s + d.current_participants, 0);
        setStats({ totalSavings, activeDeals, totalParticipants });
      }
    };
    load();
  }, []);

  // Animated counter for savings
  useEffect(() => {
    const target = stats.totalSavings;
    if (target === 0) return;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplaySavings(Math.round(target * eased));
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [stats.totalSavings]);

  const statItems = [
    { icon: DollarSign, label: "Total Saved", value: `$${displaySavings.toLocaleString()}`, color: "text-success", bg: "bg-success/10" },
    { icon: Target, label: "Active Deals", value: stats.activeDeals.toString(), color: "text-primary", bg: "bg-primary/10" },
    { icon: Users, label: "Participants", value: stats.totalParticipants.toLocaleString(), color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, hsl(var(--nab-cyan) / 0.08), hsl(var(--nab-blue) / 0.06), hsl(var(--nab-purple) / 0.08))",
        border: "1px solid hsl(var(--nab-cyan) / 0.15)",
      }}
    >
      {/* Animated background pulse */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 6, repeat: Infinity }}
        className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[60px]"
        style={{ background: "hsl(var(--nab-cyan))" }}
      />

      <div className="relative p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(var(--nab-cyan)), hsl(var(--nab-blue)))" }}>
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Collective Buying Power</h3>
            <p className="text-[9px] text-muted-foreground">Real savings from crew deals</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {statItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 p-3 text-center"
              >
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center mx-auto mb-1.5`}>
                  <Icon className={`w-4 h-4 ${item.color}`} />
                </div>
                <p className="font-heading font-black text-foreground text-lg leading-none">{item.value}</p>
                <p className="text-[9px] text-muted-foreground mt-1">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default BuyingPowerDashboard;
