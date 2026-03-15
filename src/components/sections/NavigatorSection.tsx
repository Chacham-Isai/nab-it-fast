import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { ShoppingBag, Radio, Gift, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: ShoppingBag,
    title: "Swipe Feed",
    desc: "AI-curated daily drops matched to your taste. Swipe to nab, swipe to pass.",
  },
  {
    icon: Radio,
    title: "Live Breaks",
    desc: "Open packs live with the community. Lock a team slot and see what you pull in real-time.",
  },
  {
    icon: Gift,
    title: "Grab Bags",
    desc: "Mystery boxes by category. Standard to Legendary tiers. Every pull is a surprise.",
  },
  {
    icon: Users,
    title: "Group Deals",
    desc: "Crews that shop together save together. Unlock bulk pricing when your group hits the target.",
  },
];

const NavigatorSection = () => {
  return (
    <SectionWrapper id="navigator">
      <div className="text-center mb-16">
        <p className="section-label mb-4">NAVIGATOR</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          But nabbit is more than <span className="gradient-text">price alerts.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Navigator is the discovery side of nabbit — a gamified, community-powered shopping experience built for collectors, hunters, and deal obsessives.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card gradient-border p-8 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/[0.15] group-hover:border-primary/40 transition-all">
              <feature.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-3">{feature.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <Button asChild size="lg" className="rounded-full px-8 font-semibold text-base gap-2 shimmer-btn shadow-[0_0_30px_-5px_hsl(var(--nab-cyan)/0.4)]">
          <Link to="/feed">
            Explore Navigator <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </motion.div>
    </SectionWrapper>
  );
};

export default NavigatorSection;
