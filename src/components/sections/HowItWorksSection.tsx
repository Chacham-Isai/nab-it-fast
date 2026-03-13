import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Camera, Tag, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const steps = [
  { num: "01", title: "Tell nabbit what you want", icon: Camera, desc: "Search by item name, photo, or URL. nabbit identifies the exact product across every listing.", tag: "Works with any input" },
  { num: "02", title: "Set your price", icon: Tag, desc: "Enter your target. nabbit tracks every retailer in real-time and learns when prices are likely to drop.", tag: "Smart pricing data" },
  { num: "03", title: "We buy it for you", icon: Zap, desc: "The moment your price hits, NabBot checks out instantly — faster than any human can click.", tag: "Sub-3 second execution" },
];

const HowItWorksSection = () => {
  const navigate = useNavigate();
  return (
    <SectionWrapper id="how-it-works">
      <div className="text-center mb-16">
        <p className="section-label mb-4">HOW IT WORKS</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Three steps.<br /><span className="gradient-text">Zero effort.</span>
        </h2>
        <p className="text-muted-foreground text-lg">Set it, forget it — our AI does the hunting 24/7.</p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        {steps.map((step, i) => (
          <motion.div key={step.num} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="glass-card gradient-border p-8 relative group overflow-hidden">
            <span className="absolute top-4 right-6 font-heading text-6xl font-bold text-foreground/[0.04] group-hover:text-primary/[0.08] transition-colors duration-500">{step.num}</span>
            <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/[0.15] transition-colors">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-3">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
            <span className="inline-block text-xs font-semibold text-primary bg-primary/[0.08] border border-primary/20 px-3 py-1 rounded-full">{step.tag}</span>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
        <Button size="lg" className="rounded-full px-8 font-semibold text-base gap-2 shimmer-btn shadow-[0_0_30px_-5px_hsl(var(--coral)/0.4)]" onClick={() => navigate("/signup")}>
          Try It Free — No Credit Card <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </SectionWrapper>
  );
};

export default HowItWorksSection;
