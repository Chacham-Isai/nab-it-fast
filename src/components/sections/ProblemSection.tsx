import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";

const stats = [
  { value: "87%", desc: "of shoppers would wait for a better price", source: "NRF Consumer Survey" },
  { value: "14 hrs", desc: "average monthly time spent deal-hunting", source: "McKinsey Digital" },
  { value: "$1,200+", desc: "left on the table per household annually", source: "Deloitte Consumer" },
  { value: "73%", desc: "abandon carts hoping for a future price drop", source: "Baymard Institute" },
];

const ProblemSection = () => {
  return (
    <SectionWrapper id="problem">
      <div className="text-center mb-16">
        <p className="section-label mb-4">THE PROBLEM</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Shopping is <span className="gradient-text">broken.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
          Consumers waste hours comparing prices across dozens of sites. Sellers exploit urgency with fake countdowns and manufactured scarcity. <strong className="text-foreground">Everyone overpays</strong> — and they know it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.value}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card p-6 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <p className="font-heading text-3xl font-bold gradient-text mb-3">{stat.value}</p>
            <p className="text-sm text-muted-foreground mb-3">{stat.desc}</p>
            <p className="text-xs text-muted-foreground/60 italic">{stat.source}</p>
          </motion.div>
        ))}
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-muted-foreground italic text-lg max-w-2xl mx-auto border-l-2 border-primary/30 pl-6 text-left"
      >
        "I know the price will drop — I just don't have time to keep checking."
      </motion.p>
    </SectionWrapper>
  );
};

export default ProblemSection;