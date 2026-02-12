import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Footprints, Smartphone, ShoppingBag, Layers, Sparkles, Sofa, Baby, Car } from "lucide-react";

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
      <div className="text-center mb-16">
        <p className="section-label mb-4">USE CASES</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Nab anything.
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
            className="card-surface p-6 text-center group"
          >
            <cat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
            <p className="font-heading text-base font-bold text-foreground mb-1">{cat.name}</p>
            <p className="text-xs text-muted-foreground">{cat.examples}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default CategoriesSection;
