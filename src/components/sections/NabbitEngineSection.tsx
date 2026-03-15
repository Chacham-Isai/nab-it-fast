import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Eye, BarChart3, Bot, ShieldCheck } from "lucide-react";
import nabbitLogo from "@/assets/nabbit-logo.png";

const layers = [
  {
    icon: Eye,
    title: "NabVision AI",
    subtitle: "See everything. Miss nothing.",
    desc: "Visual + semantic matching across 200+ retailers. Identifies the exact item regardless of how it's listed.",
    stat: "99.2% match accuracy",
  },
  {
    icon: BarChart3,
    title: "PriceGraph Engine",
    subtitle: "Predicts the perfect buy window.",
    desc: "5 years of pricing data + ML pattern recognition tells you exactly when a price will crater — so you're already there.",
    stat: "200+ retailers live",
  },
  {
    icon: Bot,
    title: "NabBot Agent",
    subtitle: "Faster than any human checkout.",
    desc: "Autonomous purchase execution in under 3 seconds. Cart → checkout → confirmation before the listing even updates.",
    stat: "<3s execution",
  },
  {
    icon: ShieldCheck,
    title: "TrustShield",
    subtitle: "Every nab is protected.",
    desc: "Full buyer guarantee, instant dispute resolution, authenticity verification, and real-time purchase alerts.",
    stat: "0.02% fraud rate",
  },
];

const metrics = [
  { value: "50M+", label: "Training Images" },
  { value: "99.2%", label: "Match Accuracy" },
  { value: "<800ms", label: "ID Speed" },
  { value: "<3s", label: "Nab Speed" },
  { value: "$4.2M", label: "Saved for Users" },
];

const NabbitEngineSection = () => {
  return (
    <SectionWrapper id="nabbit-engine">
      <div className="text-center mb-16 relative">
        {/* Floating rabbit watermark */}
        <motion.img
          src={nabbitLogo}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-8 w-20 h-20 opacity-[0.08] pointer-events-none"
          animate={{ y: [-4, 4, -4], rotate: [-2, 2, -2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="section-label mb-4">PROPRIETARY TECHNOLOGY</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          The{" "}
          <span className="gradient-text">Nabbit Engine.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Four layers of proprietary AI that find, match, price, and purchase — completely autonomously. This is the unfair advantage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.title}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card gradient-border p-8 group relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/0 group-hover:bg-primary/[0.06] transition-all duration-700 blur-[60px]" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/[0.15] group-hover:border-primary/40 transition-all">
                <layer.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold text-foreground mb-1">{layer.title}</h3>
              <p className="text-sm font-semibold text-primary mb-3">{layer.subtitle}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{layer.desc}</p>
              <span className="inline-block text-xs font-bold text-primary bg-primary/[0.08] border border-primary/20 px-3 py-1 rounded-full">
                {layer.stat}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Metrics strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card gradient-border p-6"
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 text-center">
          {metrics.map((m) => (
            <div key={m.label}>
              <p className="font-heading text-2xl font-black gradient-text">{m.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default NabbitEngineSection;