import { motion } from "framer-motion";

const row1 = [
  "Amazon", "eBay", "StockX", "GOAT", "Nordstrom",
  "Farfetch", "NET-A-PORTER", "The RealReal", "Grailed", "SSENSE",
];

const row2 = [
  "Saks Fifth Avenue", "Neiman Marcus", "Vestiaire Collective", "Chrono24",
  "Best Buy", "Target", "Walmart", "Costco", "B&H Photo", "Poshmark",
];

const MarqueeRow = ({ items, direction = "left", speed = 35 }: { items: string[]; direction?: "left" | "right"; speed?: number }) => {
  const doubled = [...items, ...items];
  const from = direction === "left" ? "0%" : "-50%";
  const to = direction === "left" ? "-50%" : "0%";

  return (
    <div className="flex">
      <motion.div
        className="flex shrink-0 gap-6 items-center"
        animate={{ x: [from, to] }}
        transition={{ x: { duration: speed, ease: "linear", repeat: Infinity } }}
      >
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="shrink-0 px-5 py-2.5 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm"
            style={{ opacity: 0.6 + (i % 3) * 0.15 }}
          >
            <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap tracking-wide">
              {name}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const RetailerMarquee = () => {
  return (
    <section className="py-12 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <p className="section-label text-center mb-8">TRUSTED BY SHOPPERS ACROSS 200+ RETAILERS</p>

      <div className="space-y-4">
        <MarqueeRow items={row1} direction="left" speed={35} />
        <MarqueeRow items={row2} direction="right" speed={40} />
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        ...and <strong className="text-foreground">180+ more</strong> retailers scanned in real-time
      </p>
    </section>
  );
};

export default RetailerMarquee;
