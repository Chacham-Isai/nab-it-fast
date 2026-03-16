import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import nabbitIcon from "@/assets/nabbit-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import usePageMeta from "@/hooks/usePageMeta";

const vibeOptions = [
  { id: "sneakers", emoji: "👟", label: "Sneaker Wall" },
  { id: "tech", emoji: "🖥️", label: "Tech Setup" },
  { id: "vintage", emoji: "🪑", label: "Vintage Shelf" },
  { id: "sports", emoji: "🏆", label: "Sports Memorabilia" },
  { id: "travel", emoji: "✈️", label: "Passport Stamps" },
  { id: "watches", emoji: "⌚", label: "Watch Collection" },
  { id: "art", emoji: "🎨", label: "Art & Design" },
  { id: "outdoor", emoji: "🏕️", label: "Outdoor Gear" },
];

const categoryOptions = [
  "Sports Cards", "Sneakers", "Watches", "Jewelry", "Tech & Gadgets",
  "Vinyl/Music", "Vintage Items", "Art & Prints", "Streetwear",
  "Tools & Gear", "Books & Comics", "LEGO & Toys", "Travel Experiences",
  "Show me something new",
];

const spendOptions = [
  { id: "deal", label: "Deal Hunter", desc: "I love finding bargains and steals" },
  { id: "quality", label: "Quality First", desc: "I pay more for the best" },
  { id: "smart", label: "Smart Spender", desc: "Value for money is my vibe" },
];

const brandOptions = [
  { id: "nike", emoji: "✓", label: "Nike" },
  { id: "jordan", emoji: "🏀", label: "Jordan" },
  { id: "apple", emoji: "🍎", label: "Apple" },
  { id: "supreme", emoji: "📦", label: "Supreme" },
  { id: "rolex", emoji: "⌚", label: "Rolex" },
  { id: "patagonia", emoji: "🏔️", label: "Patagonia" },
  { id: "sony", emoji: "🎮", label: "Sony" },
  { id: "lego", emoji: "🧱", label: "LEGO" },
  { id: "yeti", emoji: "🧊", label: "Yeti" },
  { id: "chrome-hearts", emoji: "✝️", label: "Chrome Hearts" },
  { id: "dyson", emoji: "🌀", label: "Dyson" },
  { id: "bape", emoji: "🦍", label: "BAPE" },
  { id: "leica", emoji: "📷", label: "Leica" },
  { id: "arcteryx", emoji: "🧥", label: "Arc'teryx" },
];

const travelOptions = [
  "Europe", "Japan", "Caribbean", "Latin America",
  "US Cities", "National Parks", "Southeast Asia", "I stay local",
];

const speedOptions = [
  { id: "instant", label: "I buy immediately", desc: "If I want it, I get it" },
  { id: "think", label: "I like to think first", desc: "I research before I buy" },
  { id: "trending", label: "I need to see it trending", desc: "Social proof matters to me" },
];

const loadingPhases = [
  "Analyzing your taste profile...",
  "Scanning 2.4M live listings...",
  "Matching your dream buys...",
  "Curating your first drops...",
  "Your feed is ready. 🎯",
];

const Onboarding = () => {
  usePageMeta({ title: "Onboarding — nabbit.ai", description: "Set up your taste profile so nabbit can find your perfect deals.", path: "/onboarding" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);

  const [vibes, setVibes] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dreamBuys, setDreamBuys] = useState<string[]>([]);
  const [dreamInput, setDreamInput] = useState("");
  const [spendStyle, setSpendStyle] = useState("");
  const [brands, setBrands] = useState<string[]>([]);
  const [travel, setTravel] = useState<string[]>([]);
  const [buySpeed, setBuySpeed] = useState("");

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  const toggleArray = (arr: string[], item: string, setter: (v: string[]) => void, max?: number) => {
    if (arr.includes(item)) setter(arr.filter((i) => i !== item));
    else if (!max || arr.length < max) setter([...arr, item]);
  };

  const canContinue = () => {
    switch (step) {
      case 1: return vibes.length > 0;
      case 2: return categories.length > 0;
      case 3: return true;
      case 4: return !!spendStyle;
      case 5: return brands.length > 0;
      case 6: return travel.length > 0;
      case 7: return !!buySpeed;
      default: return false;
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      await supabase.from("profiles").update({
        taste_tags: [...vibes, ...categories],
        spending_style: spendStyle,
        buy_speed: buySpeed,
        brand_affinities: brands,
        travel_vibes: travel,
        onboarding_complete: true,
      }).eq("id", user.id);

      if (dreamBuys.length > 0) {
        const dreamRows = dreamBuys.map((name) => ({
          user_id: user.id,
          item_name: name,
          status: "hunting",
        }));
        await supabase.from("dream_buys").insert(dreamRows);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  const handleNext = useCallback(() => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setLoadingPhase(0);
      saveProfile();
      let phase = 0;
      const interval = setInterval(() => {
        phase++;
        if (phase >= loadingPhases.length) {
          clearInterval(interval);
          navigate("/feed");
        } else {
          setLoadingPhase(phase);
        }
      }, 700);
    }
  }, [step, vibes, categories, dreamBuys, spendStyle, brands, travel, buySpeed, navigate, user]);

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate("/");
  };

  const addDreamBuy = () => {
    if (dreamInput.trim() && dreamBuys.length < 3) {
      setDreamBuys([...dreamBuys, dreamInput.trim()]);
      setDreamInput("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center px-4">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full opacity-20 blur-[120px]" style={{ background: "hsl(var(--nab-cyan))" }} />
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-8 relative z-10">
          <div className="relative">
            <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto" />
            <div className="absolute inset-0 w-14 h-14 mx-auto rounded-full animate-ping opacity-20" style={{ background: "hsl(var(--nab-cyan))" }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={loadingPhase} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-lg font-heading font-semibold text-foreground">
              {loadingPhases[loadingPhase]}
            </motion.p>
          </AnimatePresence>
          <div className="flex gap-2 justify-center">
            {loadingPhases.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i <= loadingPhase ? "bg-primary scale-110" : "bg-muted"}`} />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  const stepTitles: Record<number, { title: string; sub: string }> = {
    1: { title: "Vibe Check ✨", sub: "Pick up to 3 that match your style" },
    2: { title: "What do you collect?", sub: "Select all that interest you" },
    3: { title: "Dream Buys 🎯", sub: "What have you always wanted? (optional, max 3)" },
    4: { title: "Spending Style", sub: "How do you shop?" },
    5: { title: "Brand Affinities", sub: "Tap brands you love" },
    6: { title: "Travel Vibes ✈️", sub: "Where do you love exploring?" },
    7: { title: "Buy Speed ⚡", sub: "When you find something you want..." },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 blur-[100px]" style={{ background: "hsl(var(--nab-cyan))" }} />

      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <Link to="/">
            <img src={nabbitIcon} alt="nabbit" className="h-6" />
          </Link>
          <span className="text-sm font-mono text-muted-foreground">{step} / {totalSteps}</span>
        </div>
        <div className="max-w-lg mx-auto mt-2">
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full relative z-10">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-1">{stepTitles[step]?.title}</h2>
            <p className="text-muted-foreground text-sm mb-6">{stepTitles[step]?.sub}</p>

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {vibeOptions.map((v) => {
                  const selected = vibes.includes(v.id);
                  return (
                    <button key={v.id} onClick={() => toggleArray(vibes, v.id, setVibes, 3)} className={`relative p-4 rounded-2xl border-2 transition-all text-left ${selected ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground/30"}`}>
                      {selected && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><Check className="w-3 h-3 text-primary-foreground" /></div>}
                      <span className="text-2xl">{v.emoji}</span>
                      <p className="text-sm font-medium text-foreground mt-2">{v.label}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((cat) => (
                  <button key={cat} onClick={() => toggleArray(categories, cat, setCategories)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${categories.includes(cat) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div>
                {dreamBuys.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {dreamBuys.map((db) => (
                      <span key={db} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary text-sm text-primary bg-primary/10">
                        {db}
                        <button onClick={() => setDreamBuys(dreamBuys.filter((d) => d !== db))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                {dreamBuys.length < 3 && (
                  <div className="flex gap-2">
                    <Input value={dreamInput} onChange={(e) => setDreamInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDreamBuy()} placeholder="e.g. 1952 Topps Mickey Mantle..." className="flex-1 bg-secondary/50 border-border h-12 rounded-xl" />
                    <Button onClick={addDreamBuy} size="icon" variant="outline" className="h-12 w-12 rounded-xl"><Plus className="w-4 h-4" /></Button>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-3">
                {spendOptions.map((opt) => (
                  <button key={opt.id} onClick={() => setSpendStyle(opt.id)} className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${spendStyle === opt.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground/30"}`}>
                    <p className="font-semibold text-foreground">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {brandOptions.map((b) => (
                  <button key={b.id} onClick={() => toggleArray(brands, b.id, setBrands)} className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${brands.includes(b.id) ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground/30"}`}>
                    <span className="text-lg">{b.emoji}</span>
                    <span className="text-[10px] font-medium text-foreground mt-1 leading-tight text-center">{b.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 6 && (
              <div className="flex flex-wrap gap-2">
                {travelOptions.map((t) => (
                  <button key={t} onClick={() => toggleArray(travel, t, setTravel)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${travel.includes(t) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                    {t}
                  </button>
                ))}
              </div>
            )}

            {step === 7 && (
              <div className="space-y-3">
                {speedOptions.map((opt) => (
                  <button key={opt.id} onClick={() => setBuySpeed(opt.id)} className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${buySpeed === opt.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-muted-foreground/30"}`}>
                    <p className="font-semibold text-foreground">{opt.label}</p>
                    <p className="text-sm text-muted-foreground">{opt.desc}</p>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur-2xl border-t border-border px-4 py-4">
        <div className="flex justify-between max-w-lg mx-auto">
          <Button variant="ghost" onClick={handleBack} className="gap-2 rounded-xl">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={handleNext} disabled={!canContinue()} className="rounded-xl px-8 shimmer-btn">
            {step === totalSteps ? "Build My Feed ⚡" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
