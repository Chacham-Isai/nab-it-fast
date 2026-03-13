import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Check, X, Minus, Trophy } from "lucide-react";

const features = [
  "AI Visual Matching", "Autonomous Purchase", "200+ Retailers", "Price Alerts",
  "Photo Upload Search", "24/7 Real-Time Scan", "Sub-3s Nab Speed", "Price Prediction AI", "Fraud Protection",
];

type Val = "yes" | "no" | "partial";
const data: Record<string, Val[]> = {
  Nabbit: ["yes","yes","yes","yes","yes","yes","yes","yes","yes"],
  Honey: ["no","no","yes","yes","no","no","no","no","yes"],
  Camel: ["no","no","no","yes","no","yes","no","yes","no"],
  "Google Shopping": ["partial","no","yes","yes","partial","no","no","no","yes"],
};

const AnimatedCheck = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    whileInView={{ scale: 1, opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay, type: "spring", stiffness: 300, damping: 15 }}
  >
    <Check className="w-4 h-4 mx-auto text-primary" />
  </motion.div>
);

const Dot = ({ v, highlighted, rowIndex }: { v: Val; highlighted?: boolean; rowIndex: number }) => {
  if (v === "yes" && highlighted) return <AnimatedCheck delay={0.05 * rowIndex} />;
  if (v === "yes") return <Check className="w-4 h-4 text-success mx-auto" />;
  if (v === "partial") return <Minus className="w-4 h-4 text-muted-foreground mx-auto" />;
  return <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />;
};

const ComparisonSection = () => {
  const competitors = Object.keys(data);
  return (
    <SectionWrapper id="comparison">
      <div className="text-center mb-16">
        <p className="section-label mb-4">COMPETITIVE MOAT</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Not another <span className="gradient-text">coupon app.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          The only platform combining AI matching, real-time tracking, and autonomous purchasing.
        </p>
      </div>

      <div className="glass-card overflow-x-auto gradient-border">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-muted-foreground font-medium">Feature</th>
              {competitors.map((c) => (
                <th
                  key={c}
                  className={`p-4 text-center font-bold relative ${
                    c === "Nabbit"
                      ? "bg-gradient-to-b from-primary/20 to-primary/[0.05] text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {c === "Nabbit" && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/[0.12] border border-primary/30 px-3 py-0.5 rounded-full whitespace-nowrap">
                      <Trophy className="w-3 h-3" /> WINNER
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1.5">
                    {c === "Nabbit" && <Trophy className="w-4 h-4 text-primary" />}
                    {c}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {features.map((f, fi) => (
              <tr key={f} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-4 text-foreground">{f}</td>
                {competitors.map((c) => (
                  <td
                    key={c}
                    className={`p-4 text-center ${c === "Nabbit" ? "bg-primary/[0.05]" : ""}`}
                  >
                    <Dot v={data[c][fi]} highlighted={c === "Nabbit"} rowIndex={fi} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
};

export default ComparisonSection;
