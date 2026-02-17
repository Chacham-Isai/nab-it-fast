import { motion } from "framer-motion";

const retailers = [
  "Amazon", "eBay", "StockX", "GOAT", "Nordstrom",
  "Farfetch", "NET-A-PORTER", "The RealReal", "Grailed", "SSENSE",
  "Saks Fifth Avenue", "Neiman Marcus", "Vestiaire Collective", "Chrono24",
  "Best Buy", "Target", "Walmart", "Costco", "B&H Photo", "Poshmark",
];

const RetailerMarquee = () => {
  const doubled = [...retailers, ...retailers];

  return (
    <section className="py-12 overflow-hidden relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <p className="section-label text-center mb-8">TRUSTED BY SHOPPERS ACROSS 200+ RETAILERS</p>

      <div className="flex">
        <motion.div
          className="flex shrink-0 gap-8 items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              duration: 35,
              ease: "linear",
              repeat: Infinity,
            },
          }}
        >
          {doubled.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="shrink-0 px-6 py-3 rounded-full border border-border/50 bg-muted/30 backdrop-blur-sm"
            >
              <span className="text-sm font-semibold text-muted-foreground whitespace-nowrap tracking-wide">
                {name}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default RetailerMarquee;
