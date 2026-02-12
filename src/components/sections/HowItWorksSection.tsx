import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Camera, Tag, Zap } from "lucide-react";

const steps = [
  {
    num: "01",
    title: "Upload Your Item",
    icon: Camera,
    desc: "Snap a photo, paste a link, or describe what you want in plain English. Nabbit's AI identifies the exact product across every major marketplace in under one second.",
    tag: "Works with any input",
  },
  {
    num: "02",
    title: "Set Your Max Price",
    icon: Tag,
    desc: "Tell us what you're willing to pay. We show current market prices, price history, and AI-recommended buy windows so you know exactly how aggressive to go.",
    tag: "Smart pricing data",
  },
  {
    num: "03",
    title: "We Auto-Purchase",
    icon: Zap,
    desc: "Nabbit scans 24/7. The second your item drops below your price — we buy it. You get notified. It ships to your door. Fully autonomous. Zero intervention.",
    tag: "Sub-3 second execution",
  },
];

const HowItWorksSection = () => {
  return (
    <SectionWrapper id="how-it-works">
      <div className="text-center mb-16">
        <p className="section-label mb-4">HOW IT WORKS</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Three steps.<br />
          <span className="text-primary">Zero effort.</span>
        </h2>
        <p className="text-muted-foreground text-lg">Set it, forget it — our AI does the hunting 24/7.</p>
      </div>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Connecting line */}
        <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-primary/20" />

        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className="card-surface p-8 relative group overflow-hidden"
          >
            <span className="absolute top-4 right-6 font-heading text-6xl font-bold text-foreground/[0.04]">{step.num}</span>
            <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-6">
              <step.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold text-foreground mb-3">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.desc}</p>
            <span className="inline-block text-xs font-semibold text-primary bg-primary/[0.08] border border-primary/20 px-3 py-1 rounded-full">
              {step.tag}
            </span>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default HowItWorksSection;
