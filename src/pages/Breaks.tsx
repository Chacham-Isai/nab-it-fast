import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Radio, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import NabbitLogo from "@/components/NabbitLogo";
import { motion } from "framer-motion";
import Countdown from "@/components/Countdown";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import usePageMeta from "@/hooks/usePageMeta";
import { getCategoryImage, modeImages } from "@/lib/images";

const Breaks = () => {
  usePageMeta({ title: "Breaks — nabbit.ai", description: "Join live card breaks and claim your slots", path: "/breaks" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState<"live" | "upcoming" | "my-breaks">("live");
  const [listings, setListings] = useState<any[]>([]);
  const [slots, setSlots] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [buyingSlot, setBuyingSlot] = useState<string | null>(null);
  const [myBreakIds, setMyBreakIds] = useState<string[]>([]);

  useEffect(() => {
    loadBreaks();
  }, []);

  // Realtime slot updates
  useEffect(() => {
    const channel = supabase
      .channel("break-slots-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "break_slots" }, (payload) => {
        const updated = payload.new as any;
        setSlots((prev) => {
          const listingSlots = prev[updated.listing_id] || [];
          return {
            ...prev,
            [updated.listing_id]: listingSlots.map((s) => (s.id === updated.id ? updated : s)),
          };
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const loadBreaks = async () => {
    setLoading(true);

    // Fetch break listings
    const { data: breakListings } = await supabase
      .from("listings")
      .select("*, seller_profiles!listings_seller_id_fkey(shop_name)")
      .eq("listing_type", "break")
      .in("status", ["active", "draft"])
      .order("created_at", { ascending: false })
      .limit(30);

    const items = breakListings || [];
    setListings(items);

    // Fetch all slots for these listings
    if (items.length > 0) {
      const ids = items.map((l: any) => l.id);
      const { data: allSlots } = await supabase
        .from("break_slots")
        .select("*, profiles:buyer_id(display_name)")
        .in("listing_id", ids);

      const grouped: Record<string, any[]> = {};
      (allSlots || []).forEach((s: any) => {
        if (!grouped[s.listing_id]) grouped[s.listing_id] = [];
        grouped[s.listing_id].push(s);
      });
      setSlots(grouped);

      // Find breaks the user has joined
      if (user) {
        const joined = (allSlots || []).filter((s: any) => s.buyer_id === user.id).map((s: any) => s.listing_id);
        setMyBreakIds([...new Set(joined)]);
      }
    }

    setLoading(false);
  };

  const buySlot = async (listingId: string, slotId: string) => {
    if (!user) { navigate("/login"); return; }
    setBuyingSlot(slotId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { listing_id: listingId, type: "break_slot", slot_id: slotId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
    }
    setBuyingSlot(null);
  };

  const getTimeLeft = (endsAt: string | null) => {
    if (!endsAt) return 0;
    return Math.max(0, Math.floor((new Date(endsAt).getTime() - Date.now()) / 1000));
  };

  const liveListings = listings.filter((l) => l.status === "active");
  const upcomingListings = listings.filter((l) => l.status === "draft");
  const myBreaks = listings.filter((l) => myBreakIds.includes(l.id));
  const liveCount = liveListings.length;

  const getMetadata = (listing: any) => {
    const meta = listing.metadata || {};
    return {
      prize: meta.prize || "",
      totalValue: meta.total_value || "",
      viewers: meta.viewers || 0,
    };
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/60 backdrop-blur-2xl border-b border-border/50">
        <div className="flex items-center gap-3 max-w-lg mx-auto px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <img src={nabbitLogo} alt="" className="w-5 h-5" />
            <h1 className="font-heading font-black text-foreground text-base tracking-tight">BREAKS</h1>
          </div>
          {liveCount > 0 && (
            <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black uppercase tracking-wider">
              <Radio className="w-3 h-3 animate-pulse" /> {liveCount} LIVE
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-3 max-w-lg mx-auto px-4 pb-2">
          {(["live", "upcoming", "my-breaks"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-full text-xs font-black capitalize transition-all uppercase tracking-wider ${tab === t ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]" : "bg-secondary/30 text-muted-foreground border border-border/50 hover:border-primary/30"}`}>
              {t === "my-breaks" ? "My Breaks" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {tab === "live" && (liveListings.length === 0 ? (
               <div className="text-center py-16">
                 <img src={modeImages.emptyState} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 opacity-80" />
                 <p className="text-muted-foreground">No live breaks right now</p>
                <p className="text-xs text-muted-foreground mt-1">Check upcoming or come back later</p>
              </div>
            ) : liveListings.map((listing, i) => {
              const meta = getMetadata(listing);
              const listingSlots = slots[listing.id] || [];
              const timeLeft = getTimeLeft(listing.ends_at);

              return (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="rounded-2xl glass-card border border-border/50 overflow-hidden">
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                       <img src={getCategoryImage(listing.category)} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-foreground">{listing.title}</h3>
                        <p className="text-xs text-muted-foreground">Host: {listing.seller_profiles?.shop_name || "Seller"}</p>
                      </div>
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-destructive text-destructive-foreground">
                        <Radio className="w-3 h-3 animate-pulse" /> LIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {meta.viewers > 0 && <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {meta.viewers}</span>}
                      {timeLeft > 0 && <Countdown seconds={timeLeft} urgentThreshold={60} className="text-xs" />}
                    </div>
                    {meta.prize && (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                        <p className="text-xs font-semibold text-foreground">{meta.prize}</p>
                        {meta.totalValue && <p className="text-[10px] text-muted-foreground">Total Value: {meta.totalValue}</p>}
                      </div>
                    )}

                    {listingSlots.length > 0 && (
                      <div className="grid grid-cols-2 gap-2">
                        {listingSlots.map((slot) => {
                          const isYours = slot.buyer_id === user?.id;
                          const isBuying = buyingSlot === slot.id;
                          return (
                            <button
                              key={slot.id}
                              disabled={slot.taken || isBuying}
                              onClick={() => !slot.taken && buySlot(listing.id, slot.id)}
                              className={`p-3 rounded-xl text-left transition-all ${
                                isYours
                                  ? "bg-primary/10 border-2 border-primary"
                                  : slot.taken
                                  ? "bg-secondary opacity-60"
                                  : "bg-card border-2 border-border hover:border-primary/50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span>{slot.slot_emoji}</span>
                                <span className="text-sm font-medium text-foreground">{slot.slot_label}</span>
                              </div>
                              {isYours ? (
                                <p className="text-xs text-primary font-bold mt-1">✓ Yours</p>
                              ) : slot.taken ? (
                                <p className="text-xs text-muted-foreground mt-1">{(slot.profiles as any)?.display_name || "Taken"}</p>
                              ) : isBuying ? (
                                <p className="text-xs text-primary mt-1 animate-pulse">Buying...</p>
                              ) : (
                                <p className="text-xs text-primary font-bold mt-1">${slot.price}</p>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {listingSlots.some((s) => !s.taken) && (
                      <button
                        onClick={() => {
                          const available = listingSlots.filter((s) => !s.taken);
                          if (available.length > 0) {
                            const random = available[Math.floor(Math.random() * available.length)];
                            buySlot(listing.id, random.id);
                          }
                        }}
                        className="w-full p-3 rounded-xl border-2 border-dashed border-border text-muted-foreground text-sm hover:border-primary/50 hover:text-primary transition-colors"
                      >
                        🎲 Random Slot — Best Value Pick
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            }))}

            {tab === "upcoming" && (upcomingListings.length === 0 ? (
               <div className="text-center py-16">
                 <img src={modeImages.emptyState} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-4 opacity-80" />
                 <p className="text-muted-foreground">No upcoming breaks scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingListings.map((listing, i) => {
                  const listingSlots = slots[listing.id] || [];
                  const slotsLeft = listingSlots.filter((s) => !s.taken).length;
                  const avgPrice = listingSlots.length > 0
                    ? Math.round(listingSlots.reduce((sum, s) => sum + Number(s.price), 0) / listingSlots.length)
                    : listing.starting_price;

                  return (
                    <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border">
                       <img src={getCategoryImage(listing.category)} alt="" className="w-10 h-10 rounded-xl object-cover" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground text-sm">{listing.title}</h3>
                        <p className="text-xs text-muted-foreground">${avgPrice}/slot · {slotsLeft}/{listingSlots.length} slots left</p>
                        {listing.ends_at && <p className="text-xs text-muted-foreground">{new Date(listing.ends_at).toLocaleString()}</p>}
                      </div>
                      <Button size="sm" className="rounded-xl text-xs" onClick={() => navigate(`/listing/${listing.id}`)}>View</Button>
                    </motion.div>
                  );
                })}
              </div>
            ))}

            {tab === "my-breaks" && (myBreaks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                 <span className="text-4xl mb-4 block">
                   <img src={modeImages.emptyState} alt="" className="w-16 h-16 rounded-2xl object-cover mx-auto opacity-80" />
                 </span>
                <Button className="mt-4 rounded-xl shimmer-btn" onClick={() => setTab("live")}>Browse Live Breaks</Button>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {myBreaks.map((listing, i) => {
                  const listingSlots = slots[listing.id] || [];
                  const mySlots = listingSlots.filter((s) => s.buyer_id === user?.id);
                  return (
                    <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="p-4 rounded-2xl bg-card border border-border">
                      <div className="flex items-center gap-3">
                        <img src={getCategoryImage(listing.category)} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground text-sm">{listing.title}</h3>
                          <p className="text-xs text-muted-foreground">{mySlots.length} slot{mySlots.length !== 1 ? "s" : ""} claimed</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${listing.status === "active" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"}`}>
                          {listing.status === "active" ? "LIVE" : "UPCOMING"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {mySlots.map((s) => (
                          <span key={s.id} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                            {s.slot_emoji} {s.slot_label}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Breaks;
