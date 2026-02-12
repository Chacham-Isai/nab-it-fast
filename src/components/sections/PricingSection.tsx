import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Nibble",
    price: "$0",
    period: "/mo",
    tagline: "Test the waters",
    features: ["3 active hunts", "Email alerts", "Major retailers", "Standard speed"],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Nabber",
    price: "$9",
    period: "/mo",
    tagline: "For serious hunters",
    features: ["25 active hunts", "SMS + push alerts", "200+ retailers", "Priority scan", "Auto-purchase"],
    cta: "Start Nabbing",
    featured: true,
  },
  {
    name: "Nabbit Pro",
    price: "$29",
    period: "/mo",
    tagline: "Unlimited. Relentless.",
    features: ["Unlimited hunts", "Instant alerts", "All marketplaces", "Real-time scan", "Deal concierge", "Price analytics"],
    cta: "Go Pro",
    featured: false,
  },
];

const PricingSection = () => {
  return (
    <SectionWrapper id="pricing">
      <div className="text-center mb-16">
        <p className="section-label mb-4">PRICING</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Pick your plan.
        </h2>
        <p className="text-muted-foreground text-lg">Start free. Upgrade when you're hooked.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={`rounded-3xl border p-8 relative ${
              plan.featured
                ? "border-primary/50 bg-card shadow-[0_0_60px_-12px_hsl(var(--coral-glow))]"
                : "border-border bg-card"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-primary bg-primary/[0.12] border border-primary/30 px-4 py-1 rounded-full">
                MOST POPULAR
              </span>
            )}
            <h3 className="font-heading text-xl font-bold text-foreground mb-1">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-6">{plan.tagline}</p>
            <div className="mb-6">
              <span className="font-heading text-4xl font-bold text-foreground">{plan.price}</span>
              <span className="text-muted-foreground">{plan.period}</span>
            </div>
            <div className="space-y-3 mb-8">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-3 border-b border-border pb-3 last:border-0">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{f}</span>
                </div>
              ))}
            </div>
            <Button
              className={`w-full rounded-full font-semibold ${
                plan.featured ? "" : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
              variant={plan.featured ? "default" : "secondary"}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default PricingSection;
