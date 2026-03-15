import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Nibble",
    monthly: 0,
    annual: 0,
    tagline: "Test nabbit on up to 3 hunts. Perfect for first-time buyers.",
    features: ["3 active hunts", "Email alerts", "Major retailers", "Standard speed"],
    cta: "Get Started Free",
    featured: false,
    slug: "nibble",
  },
  {
    name: "Nabber",
    monthly: 9,
    annual: 7,
    tagline: "For serious hunters. Track up to 25 items across all 200+ retailers with priority NabBot speed.",
    features: ["25 active hunts", "SMS + push alerts", "200+ retailers", "Priority scan", "Auto-purchase"],
    cta: "Start Nabbing",
    featured: true,
    slug: "nabber",
  },
  {
    name: "Nabbit Pro",
    monthly: 29,
    annual: 23,
    tagline: "Unlimited hunts + full Navigator access: swipe feed, live breaks, grab bags, group deals, and auctions.",
    features: ["Unlimited hunts", "Instant alerts", "All marketplaces", "Real-time scan", "Deal concierge", "Price analytics"],
    cta: "Go Pro",
    featured: false,
    slug: "pro",
  },
];

const PricingSection = () => {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

  return (
    <SectionWrapper id="pricing">
      <div className="text-center mb-16">
        <p className="section-label mb-4">PRICING</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Pick your <span className="gradient-text">plan.</span>
        </h2>
        <p className="text-muted-foreground text-lg mb-8">Start free. Upgrade when you're hooked.</p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-3 p-1 rounded-full bg-secondary border border-border">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all relative ${annual ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
          >
            Annual
            <span className="absolute -top-2.5 -right-3 text-[10px] font-bold text-success bg-success/[0.12] border border-success/30 px-1.5 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, i) => {
          const price = annual ? plan.annual : plan.monthly;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`rounded-3xl p-8 relative group ${
                plan.featured
                  ? "glass-card border-primary/50 shadow-[0_0_80px_-12px_hsl(var(--nab-glow))]"
                  : "glass-card"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/[0.12] border border-primary/30 px-4 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" /> MOST POPULAR
                </span>
              )}
              <h3 className="font-heading text-xl font-bold text-foreground mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>
              <div className="mb-6">
                <span className="font-heading text-4xl font-bold text-foreground">${price}</span>
                <span className="text-muted-foreground">/mo</span>
                {annual && price > 0 && (
                  <span className="text-xs text-success ml-2">Save ${(plan.monthly - plan.annual) * 12}/yr</span>
                )}
              </div>
              <div className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 border-b border-border/50 pb-3 last:border-0">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground">{f}</span>
                  </div>
                ))}
              </div>
              <Button
                className={`w-full rounded-full font-semibold gap-2 ${
                  plan.featured ? "shimmer-btn shadow-[0_0_20px_-5px_hsl(var(--nab-cyan)/0.4)]" : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
                variant={plan.featured ? "default" : "secondary"}
                onClick={() => navigate(`/signup?plan=${plan.slug}`)}
              >
                {plan.cta} {plan.featured && <ArrowRight className="w-4 h-4" />}
              </Button>
              {plan.featured && (
                <p className="text-xs text-center text-muted-foreground mt-3">No credit card required</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-sm text-muted-foreground mt-10"
      >
        30-day money-back guarantee · Cancel anytime · No hidden fees
      </motion.p>
    </SectionWrapper>
  );
};

export default PricingSection;
