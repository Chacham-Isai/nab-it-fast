import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Footprints, Smartphone, ShoppingBag, Layers, Sparkles, Sofa, Baby, Car } from "lucide-react";
import nabbitLogo from "@/assets/nabbit-logo.png";

const categories = [
  { icon: Footprints, name: "Sneakers", examples: "Jordans, Dunks, Yeezys" },
  { icon: Smartphone, name: "Electronics", examples: "Gadgets, consoles, parts" },
  { icon: ShoppingBag, name: "Fashion", examples: "Designer bags, watches, streetwear" },
  { icon: Layers, name: "Collectibles", examples: "Cards, vinyl, memorabilia" },
  { icon: Sparkles, name: "Beauty", examples: "Skincare, fragrance, makeup" },
  { icon: Sofa, name: "Home & Design", examples: "Furniture, decor, appliances" },
  { icon: Baby, name: "Kids & Baby", examples: "Toys, gear, clothing" },
  { icon: Car, name: "Cars & Vehicles", examples: "New, used, and luxury" },
];

const CategoriesSection = () => {
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
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Nab <span className="gradient-text">anything.</span>
        </h2>
        <p className="text-muted-foreground text-lg">From everyday essentials to grail-tier collectibles. If it's sold, we nab it.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            className="glass-card p-6 text-center group relative overflow-hidden"
          >
            {/* Subtle icon glow on hover */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-primary/0 group-hover:bg-primary/[0.08] blur-[30px] transition-all duration-500" />
            <cat.icon className="w-8 h-8 text-primary mx-auto mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300" />
            <p className="font-heading text-base font-bold text-foreground mb-1 relative z-10">{cat.name}</p>
            <p className="text-xs text-muted-foreground relative z-10">{cat.examples}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default CategoriesSection;