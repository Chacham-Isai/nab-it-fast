import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Eye, BarChart3, Bot, ShieldCheck } from "lucide-react";

const techs = [
  {
    icon: Eye,
    title: "NabVision AI",
    subtitle: "Visual Product Recognition",
    desc: "Identifies exact items across 200+ retailers using visual + semantic matching. Sees through different listings of the same product.",
    stat: "99.2% match accuracy",
  },
  {
    icon: BarChart3,
    title: "PriceGraph Engine",
    subtitle: "Real-Time Price Intelligence",
    desc: "Predicts price floors and optimal buy windows using 5 years of historical pricing data and ML pattern recognition.",
    stat: "200+ retailers scanned",
  },
  {
    icon: Bot,
    title: "NabBot Agent",
    subtitle: "Autonomous Purchase Execution",
    desc: "Autonomous checkout agent that secures your item the second your target price hits — before inventory disappears.",
    stat: "<3s purchase speed",
  },
  {
    icon: ShieldCheck,
    title: "TrustShield",
    subtitle: "Fraud & Authenticity Layer",
    desc: "Every auto-purchase is protected with a full buyer guarantee, instant dispute resolution, and purchase confirmation alerts.",
    stat: "0.02% fraud rate",
  },
];

const metrics = [
  { value: "50M+", label: "Training Images" },
  { value: "99.2%", label: "Match Accuracy" },
  { value: "<800ms", label: "ID Speed" },
  { value: "<3s", label: "Purchase Speed" },
  { value: "0.02%", label: "Fraud Rate" },
];

const TechnologySection = () => {
  return (
    <SectionWrapper id="technology">
      <div className="text-center mb-16">
        <p className="section-label mb-4">PROPRIETARY TECHNOLOGY</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          The Nabbit <span className="gradient-text">Engine.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four layers of proprietary AI working together to find, match, and purchase — autonomously.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {techs.map((tech, i) => (
          <motion.div
            key={tech.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card gradient-border p-8 group relative overflow-hidden"
          >
            {/* Corner glow on hover */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/0 group-hover:bg-primary/[0.06] transition-all duration-700 blur-[60px]" />
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/[0.15] group-hover:border-primary/40 transition-all">
                <tech.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-1">{tech.title}</h3>
              <p className="text-sm text-primary font-medium mb-3">{tech.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{tech.desc}</p>
              <span className="inline-block text-xs font-semibold text-primary bg-primary/[0.08] border border-primary/20 px-3 py-1 rounded-full">
                {tech.stat}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Metrics bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card gradient-border p-6"
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="font-heading text-2xl font-bold gradient-text">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default TechnologySection;