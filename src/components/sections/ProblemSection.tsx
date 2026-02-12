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
          Shopping is broken.
        </h2>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto leading-relaxed">
          Consumers waste hours comparing prices across dozens of sites. Sellers exploit urgency with fake countdowns and manufactured scarcity. Everyone overpays — and they know it.
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
            className="card-surface p-6 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
            <p className="font-heading text-3xl font-bold text-primary mb-3">{stat.value}</p>
            <p className="text-sm text-muted-foreground mb-3">{stat.desc}</p>
            <p className="text-xs text-muted-foreground italic">{stat.source}</p>
          </motion.div>
        ))}
      </div>

      <p className="text-center text-muted-foreground italic text-lg max-w-2xl mx-auto">
        "I know the price will drop — I just don't have time to keep checking."
      </p>
    </SectionWrapper>
  );
};

export default ProblemSection;
