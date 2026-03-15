import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Search, Brain, Zap, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    num: "01",
    title: "You spot it.",
    desc: "Drop a link, snap a photo, or just tell us what you want. The Nabbit Engine does the rest.",
    accent: "from-primary to-[hsl(20,100%,60%)]",
  },
  {
    icon: Brain,
    num: "02",
    title: "AI learns you.",
    desc: "Every swipe, bid, and nab trains your personal deal feed. It gets scarily accurate, fast.",
    accent: "from-[hsl(280,100%,65%)] to-[hsl(320,100%,65%)]",
  },
  {
    icon: Zap,
    num: "03",
    title: "Deals drop. You decide.",
    desc: "Bid on auctions. Spin grab bags. Set auto-nab triggers. Your rules, your wins.",
    accent: "from-[hsl(40,100%,55%)] to-primary",
  },
  {
    icon: PartyPopper,
    num: "04",
    title: "Nabbed. Done.",
    desc: "Sub-3 second auto-checkout. Protected. Authenticated. Delivered. You just won.",
    accent: "from-success to-[hsl(170,100%,45%)]",
  },
];

const HowItDropsSection = () => {
  return (
    <SectionWrapper id="how-it-drops">
      <div className="text-center mb-16">
        <p className="section-label mb-4">HOW THE DROP WORKS</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          Four steps to{" "}
          <span className="gradient-text">your next win.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From discovery to doorstep — the entire loop is engineered to feel like winning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card gradient-border p-7 group relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary/0 group-hover:bg-primary/[0.06] transition-all duration-700 blur-[50px]" />
            <div className="relative z-10">
              <span className={`text-xs font-black tracking-widest bg-gradient-to-r ${step.accent} bg-clip-text text-transparent`}>
                {step.num}
              </span>
              <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mt-4 mb-5 group-hover:bg-primary/[0.15] group-hover:border-primary/40 transition-all">
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default HowItDropsSection;