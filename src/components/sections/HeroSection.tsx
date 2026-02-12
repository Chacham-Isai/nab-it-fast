import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const hunts = [
  {
    name: "Jordan 4 Retro",
    market: "$285",
    target: "$220",
    progress: 65,
    status: "Scanning",
    statusColor: "text-primary",
    progressColor: "bg-primary",
  },
  {
    name: "Rolex Datejust 36",
    market: "$8,200",
    target: "$6,800",
    progress: 42,
    status: "Scanning",
    statusColor: "text-primary",
    progressColor: "bg-primary",
  },
  {
    name: "Chanel Classic Flap",
    market: "$3,200",
    target: "$2,450",
    progress: 100,
    status: "Purchased",
    statusColor: "text-success",
    progressColor: "bg-success",
    nabbed: true,
  },
];

const stats = [
  { value: "2.4M+", label: "Items tracked" },
  { value: "$18.7M", label: "Saved for users" },
  { value: "<3s", label: "Average nab speed" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-primary/[0.07] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary/[0.05] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-8"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/[0.08]">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-dot" />
            <span className="text-sm font-medium text-primary">AI-Powered Shopping Agent</span>
          </div>

          <h1 className="font-heading font-extrabold text-foreground" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", lineHeight: 1.05 }}>
            Stop paying<br />
            <span className="text-primary">full price.</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
            You name the price. We nab it. Nabbit monitors millions of listings across 200+ retailers — 24/7 — and auto-purchases the second your item hits your price.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="rounded-full px-8 font-semibold text-base gap-2">
              Start Nabbing Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold text-base border-border hover:bg-secondary">
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 pt-4">
            {stats.map((s, i) => (
              <div key={s.label} className="flex items-center gap-6">
                <div>
                  <p className="font-heading text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
                {i < stats.length - 1 && <div className="w-px h-10 bg-border" />}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Phone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative">
            {/* Phone frame */}
            <div className="w-[300px] sm:w-[340px] rounded-[36px] border border-border bg-card p-4 shadow-2xl">
              {/* Notch */}
              <div className="w-24 h-6 bg-background rounded-full mx-auto mb-4" />

              {/* Hunt cards */}
              <div className="space-y-3">
                {hunts.map((hunt) => (
                  <div
                    key={hunt.name}
                    className={`rounded-2xl border p-3 space-y-2 ${
                      hunt.nabbed ? "border-success/30 bg-success/[0.05]" : "border-border bg-secondary"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-muted-foreground">{hunt.nabbed ? "Nabbed!" : "Hunting:"}</p>
                        <p className="text-sm font-semibold text-foreground">{hunt.name}</p>
                      </div>
                      <span className={`text-xs font-semibold ${hunt.statusColor}`}>{hunt.status}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{hunt.nabbed ? "Retail" : "Market"} {hunt.market}</span>
                      <span>{hunt.nabbed ? "Paid" : "Your price"} {hunt.target}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-secondary">
                      <div
                        className={`h-full rounded-full ${hunt.progressColor}`}
                        style={{ width: `${hunt.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 sm:-left-12 top-16 px-4 py-2 rounded-full border border-primary/30 bg-card text-sm font-medium shadow-lg"
            >
              <span className="text-primary">⚡</span> Price dropped! Auto-nabbing...
            </motion.div>

            <motion.div
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 sm:-right-12 bottom-24 px-4 py-2 rounded-full border border-success/30 bg-card text-sm font-medium shadow-lg"
            >
              <span className="text-success">💰 You saved $750</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
