import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";

const traction = [
  { value: "2.4M+", label: "Items Tracked", desc: "Active across all categories & platforms" },
  { value: "$18.7M", label: "Saved for Users", desc: "Real savings delivered to real shoppers" },
  { value: "200+", label: "Retailers Scanned", desc: "From Amazon to niche resale platforms" },
  { value: "<3s", label: "Avg. Nab Speed", desc: "From price match to completed purchase" },
];

const TractionSection = () => {
  return (
    <SectionWrapper id="traction">
      <div className="text-center mb-16">
        <p className="section-label mb-4">TRACTION</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          The numbers speak.
        </h2>
        <p className="text-muted-foreground text-lg">Real metrics. Real savings. Growing fast.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {traction.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="card-surface p-6 group relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
            <p className="font-heading text-3xl font-bold text-primary mb-2">{item.value}</p>
            <p className="font-semibold text-foreground text-sm mb-1">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="card-surface p-4 text-center">
        <p className="text-xs text-muted-foreground">
          All metrics as of Q1 2026 · Month-over-month growth: 34% users · 28% items tracked · 41% savings generated
        </p>
      </div>
    </SectionWrapper>
  );
};

export default TractionSection;
