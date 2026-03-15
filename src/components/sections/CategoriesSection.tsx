import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Footprints, Smartphone, ShoppingBag, Layers, Sparkles, Sofa, Baby, Car, TrendingUp, Users } from "lucide-react";
import nabbitLogo from "@/assets/nabbit-logo.png";
import { useState } from "react";

const categories = [
  { icon: Footprints, name: "Sneakers", examples: "Jordans, Dunks, Yeezys", accent: "nab-cyan", hunters: "4.2K", trending: "Jordan 4 Thunder", savings: "Avg $87 saved" },
  { icon: Smartphone, name: "Electronics", examples: "Gadgets, consoles, parts", accent: "nab-purple", hunters: "3.8K", trending: "PS5 Pro", savings: "Avg $120 saved" },
  { icon: ShoppingBag, name: "Fashion", examples: "Designer bags, watches, streetwear", accent: "success", hunters: "5.1K", trending: "Supreme FW26", savings: "Avg $195 saved" },
  { icon: Layers, name: "Collectibles", examples: "Cards, vinyl, memorabilia", accent: "nab-blue", hunters: "2.9K", trending: "PSA 10 Charizard", savings: "Avg $340 saved" },
  { icon: Sparkles, name: "Beauty", examples: "Skincare, fragrance, makeup", accent: "nab-cyan", hunters: "3.4K", trending: "Dyson Airwrap", savings: "Avg $65 saved" },
  { icon: Sofa, name: "Home & Design", examples: "Furniture, decor, appliances", accent: "nab-purple", hunters: "1.8K", trending: "Herman Miller", savings: "Avg $220 saved" },
  { icon: Baby, name: "Kids & Baby", examples: "Toys, gear, clothing", accent: "success", hunters: "2.1K", trending: "UPPAbaby Vista", savings: "Avg $145 saved" },
  { icon: Car, name: "Cars & Vehicles", examples: "New, used, and luxury", accent: "nab-blue", hunters: "1.2K", trending: "Tesla Model Y", savings: "Avg $2.4K saved" },
];

const CategoriesSection = () => {
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  return (
    <SectionWrapper id="categories">
      <div className="text-center mb-16 relative">
        <motion.img
          src={nabbitLogo}
          alt=""
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 opacity-[0.06] pointer-events-none"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <p className="section-label mb-4">USE CASES</p>
        <h2 className="font-heading font-black text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}>
          Nab <span className="gradient-text">anything.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">From everyday essentials to grail-tier collectibles. If it's sold, we nab it.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 25, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.5, type: "spring", stiffness: 100 }}
            whileHover={{ y: -6, scale: 1.03 }}
            onHoverStart={() => setHoveredCat(i)}
            onHoverEnd={() => setHoveredCat(null)}
            className={`glass-card gradient-border p-5 text-center group relative overflow-hidden cursor-pointer transition-shadow duration-500 hover:shadow-[0_0_35px_-5px_hsl(var(--${cat.accent})/0.25)]`}
          >
            {/* Gradient background on hover */}
            <div className={`absolute inset-0 bg-gradient-to-b from-${cat.accent}/15 via-${cat.accent}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            {/* Pulsing orb */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0, 0.12, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
              className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-${cat.accent} blur-[30px] pointer-events-none`}
            />

            <div className="relative z-10">
              {/* Icon with ring */}
              <div className="relative inline-block mb-3">
                <motion.div
                  className={`w-12 h-12 rounded-2xl bg-${cat.accent}/[0.1] border border-${cat.accent}/30 flex items-center justify-center mx-auto group-hover:bg-${cat.accent}/[0.2] group-hover:border-${cat.accent}/50 transition-all duration-300`}
                >
                  <cat.icon className={`w-6 h-6 text-${cat.accent} group-hover:scale-110 transition-transform duration-300`} />
                </motion.div>
                <motion.div
                  className={`absolute inset-0 rounded-2xl border-2 border-${cat.accent}/40 opacity-0 group-hover:opacity-100`}
                  animate={hoveredCat === i ? { scale: [1, 1.4], opacity: [0.4, 0] } : {}}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </div>

              <p className="font-heading text-base font-black text-foreground mb-0.5">{cat.name}</p>
              <p className="text-[11px] text-muted-foreground mb-3">{cat.examples}</p>

              {/* Hover reveal: trending + stats */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={hoveredCat === i ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className={`rounded-lg bg-${cat.accent}/[0.06] border border-${cat.accent}/15 p-2 space-y-1.5 mt-1`}>
                  <div className="flex items-center justify-center gap-1.5">
                    <TrendingUp className={`w-3 h-3 text-${cat.accent}`} />
                    <span className="text-[10px] font-bold text-foreground/80">{cat.trending}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5">
                    <Users className={`w-3 h-3 text-${cat.accent}`} />
                    <span className="text-[10px] text-muted-foreground">{cat.hunters} hunters</span>
                  </div>
                  <p className={`text-[10px] font-semibold text-${cat.accent}`}>{cat.savings}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom stat bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 glass-card p-4 flex flex-wrap items-center justify-center gap-6 text-center"
      >
        {[
          { val: "8", label: "Categories" },
          { val: "200+", label: "Retailers" },
          { val: "24.5K", label: "Active Hunters" },
          { val: "$4.2M+", label: "Total Saved" },
        ].map((s) => (
          <div key={s.label}>
            <p className="font-heading text-lg font-black gradient-text">{s.val}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
};

export default CategoriesSection;
