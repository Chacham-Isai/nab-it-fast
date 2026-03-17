import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { TrendingUp, Users, ArrowRight } from "lucide-react";
import nabbitIcon from "@/assets/nabbit-icon.png";
import sneakersImg from "@/assets/categories/sneakers.png";
import electronicsImg from "@/assets/categories/electronics.png";
import fashionImg from "@/assets/categories/fashion.png";
import collectiblesImg from "@/assets/categories/collectibles.png";
import beautyImg from "@/assets/categories/beauty.jpg";
import homeImg from "@/assets/categories/home.jpg";
import kidsImg from "@/assets/categories/kids.jpg";
import carsImg from "@/assets/categories/cars.jpg";
import { useState } from "react";

const categories = [
  { name: "Sneakers", image: sneakersImg, examples: "Jordans, Dunks, Yeezys", hunters: "4.2K", trending: "Jordan 4 Thunder", savings: "Avg $87 saved" },
  { name: "Electronics", image: electronicsImg, examples: "Gadgets, consoles, parts", hunters: "3.8K", trending: "PS5 Pro", savings: "Avg $120 saved" },
  { name: "Fashion", image: fashionImg, examples: "Designer bags, watches, streetwear", hunters: "5.1K", trending: "Supreme FW26", savings: "Avg $195 saved" },
  { name: "Collectibles", image: collectiblesImg, examples: "Cards, vinyl, memorabilia", hunters: "2.9K", trending: "PSA 10 Charizard", savings: "Avg $340 saved" },
  { name: "Beauty", image: beautyImg, examples: "Skincare, fragrance, makeup", hunters: "3.4K", trending: "Dyson Airwrap", savings: "Avg $65 saved" },
  { name: "Home & Design", image: homeImg, examples: "Furniture, decor, appliances", hunters: "1.8K", trending: "Herman Miller", savings: "Avg $220 saved" },
  { name: "Kids & Baby", image: kidsImg, examples: "Toys, gear, clothing", hunters: "2.1K", trending: "UPPAbaby Vista", savings: "Avg $145 saved" },
  { name: "Cars & Vehicles", image: carsImg, examples: "New, used, and luxury", hunters: "1.2K", trending: "Tesla Model Y", savings: "Avg $2.4K saved" },
];

const CategoriesSection = () => {
  const [hoveredCat, setHoveredCat] = useState<number | null>(null);

  return (
    <SectionWrapper id="categories">
      <div className="text-center mb-16 relative">
        <motion.img
          src={nabbitIcon}
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
            className="glass-card gradient-border group relative overflow-hidden cursor-pointer transition-shadow duration-500 hover:shadow-[0_0_35px_-5px_hsl(var(--primary)/0.25)]"
          >
            {/* Photo Hero */}
            <div className="relative h-32 sm:h-40 overflow-hidden">
              <motion.img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

              {/* Trending badge on hover */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={hoveredCat === i ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-xl border border-primary/30"
              >
                <TrendingUp className="w-3 h-3 text-primary" />
                <span className="text-[9px] font-black text-foreground">{cat.trending}</span>
              </motion.div>

              {/* Hunter count */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-background/70 backdrop-blur-lg">
                <Users className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-foreground/80">{cat.hunters}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 relative z-10">
              <p className="font-heading text-base font-black text-foreground mb-0.5">{cat.name}</p>
              <p className="text-[11px] text-muted-foreground mb-2">{cat.examples}</p>

              {/* Savings + CTA row */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary">{cat.savings}</span>
                <motion.div
                  animate={hoveredCat === i ? { x: [0, 4, 0] } : {}}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <ArrowRight className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom stat bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-8 glass-card gradient-border p-4 flex flex-wrap items-center justify-center gap-6 text-center"
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
