import SectionWrapper from "@/components/SectionWrapper";
import { Check, X, Minus } from "lucide-react";

const features = [
  "AI Visual Matching",
  "Autonomous Purchase",
  "200+ Retailers",
  "Price Alerts",
  "Photo Upload Search",
  "24/7 Real-Time Scan",
  "Sub-3s Nab Speed",
  "Price Prediction AI",
  "Fraud Protection",
];

type Val = "yes" | "no" | "partial";
const data: Record<string, Val[]> = {
  Nabbit: ["yes","yes","yes","yes","yes","yes","yes","yes","yes"],
  Honey: ["no","no","yes","yes","no","no","no","no","yes"],
  Camel: ["no","no","no","yes","no","yes","no","yes","no"],
  "Google Shopping": ["partial","no","yes","yes","partial","no","no","no","yes"],
};

const Dot = ({ v, highlighted }: { v: Val; highlighted?: boolean }) => {
  if (v === "yes") return <Check className={`w-4 h-4 mx-auto ${highlighted ? "text-primary" : "text-success"}`} />;
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
                  className={`p-4 text-center font-bold ${
                    c === "Nabbit" ? "bg-primary/[0.08] text-primary" : "text-muted-foreground"
                  }`}
                >
                  {c}
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
                    className={`p-4 text-center ${c === "Nabbit" ? "bg-primary/[0.08]" : ""}`}
                  >
                    <Dot v={data[c][fi]} highlighted={c === "Nabbit"} />
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