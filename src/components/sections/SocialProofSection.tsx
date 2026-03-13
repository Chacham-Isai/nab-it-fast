import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";

const recentNabs = [
  { emoji: "👟", item: "Jordan 4 Retro", user: "Jake R.", saved: "$89", method: "Auto-Nab" },
  { emoji: "⌚", item: "Rolex Explorer II", user: "Lena S.", saved: "$2,100", method: "Dream Buy" },
  { emoji: "🎮", item: "PS5 Slim Bundle", user: "Dev P.", saved: "$127", method: "Grab Bag" },
  { emoji: "👜", item: "Chanel Le Boy", user: "Maria K.", saved: "$890", method: "Auction" },
  { emoji: "💻", item: "MacBook Pro M4", user: "Chris M.", saved: "$340", method: "Auto-Nab" },
  { emoji: "💄", item: "Dyson Airwrap", user: "Ava T.", saved: "$165", method: "Live Break" },
];

const testimonials = [
  {
    quote: "I nabbed a PS5 Pro for $340 under retail while literally sleeping. This thing is insane.",
    name: "Marcus T.",
    handle: "@marcusnabs",
  },
  {
    quote: "The grab bags are dangerously addictive. Pulled a $800 pair of Yeezys from a $50 bag.",
    name: "Priya D.",
    handle: "@priyadeals",
  },
  {
    quote: "Nabbit replaced my entire deal-hunting routine. I just set prices and forget it.",
    name: "James W.",
    handle: "@jwatches",
  },
];

const SocialProofSection = () => {
  return (
    <SectionWrapper id="social-proof">
      <div className="text-center mb-16">
        <p className="section-label mb-4">THE NAB FEED</p>
        <h2
          className="font-heading font-black text-foreground mb-6"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
        >
          People are nabbing{" "}
          <span className="gradient-text">right now.</span>
        </h2>
      </div>

      {/* Recent nabs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
        {recentNabs.map((nab, i) => (
          <motion.div
            key={nab.item}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="glass-card p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/[0.08] border border-primary/20 flex items-center justify-center text-xl shrink-0">
              {nab.emoji}
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-foreground text-sm truncate">{nab.item}</p>
              <p className="text-xs text-muted-foreground">{nab.user} · {nab.method}</p>
            </div>
            <span className="ml-auto text-sm font-black text-success whitespace-nowrap">-{nab.saved}</span>
          </motion.div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="glass-card gradient-border p-7"
          >
            <div className="flex mb-3">
              {[...Array(5)].map((_, si) => (
                <span key={si} className="text-primary text-sm">★</span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.quote}"</p>
            <div>
              <p className="font-heading font-bold text-foreground text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.handle}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default SocialProofSection;