import SectionWrapper from "@/components/SectionWrapper";
import { motion } from "framer-motion";
import { Star, Quote, BadgeCheck } from "lucide-react";

const avatarGradients = [
  "from-primary to-[hsl(var(--coral-glow))]",
  "from-[#6366f1] to-[#8b5cf6]",
  "from-[#f59e0b] to-[#ef4444]",
  "from-[#10b981] to-[#06b6d4]",
  "from-[#ec4899] to-[#8b5cf6]",
  "from-[#14b8a6] to-[#3b82f6]",
];

const testimonials = [
  { name: "Sarah K.", role: "Luxury Reseller", rating: 5, text: "Nabbit nabbed me a Chanel Classic Flap for $2,100 under retail. I didn't even have to refresh the page — it just happened while I slept.", saved: "$2,100", verified: true },
  { name: "Marcus T.", role: "Sneaker Collector", rating: 5, text: "I've been manually tracking drops for years. Nabbit does in 3 seconds what used to take me 3 hours. My collection has never looked better.", saved: "$4,350", verified: true },
  { name: "Emily R.", role: "Smart Shopper", rating: 5, text: "Set a target price on a Dyson and forgot about it. Two weeks later, got an email saying it was purchased and on its way. Unreal.", saved: "$180", verified: true },
  { name: "James W.", role: "Watch Enthusiast", rating: 4, text: "The AI pricing engine is genuinely impressive. It caught a mispriced Rolex listing that sold out in under 10 seconds — but Nabbit was faster.", saved: "$6,800", verified: true },
  { name: "Priya D.", role: "Fashion Buyer", rating: 5, text: "I track over 40 items across 12 retailers. Nabbit handles all of it. The fraud protection alone makes it worth every penny.", saved: "$3,200", verified: true },
  { name: "Alex M.", role: "Deal Hunter", rating: 5, text: "Switched from three different price tracking apps to just Nabbit. Faster alerts, auto-purchase, and I've already saved more in a month than I did all last year.", saved: "$890", verified: true },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
    ))}
  </div>
);

const TestimonialsSection = () => {
  return (
    <SectionWrapper id="testimonials">
      <div className="text-center mb-16">
        <p className="section-label mb-4">TESTIMONIALS</p>
        <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Loved by <span className="gradient-text">smart shoppers.</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Real people. Real savings. Here's what our users have to say.
        </p>
        {/* Aggregate rating */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground">4.9</strong> average from <strong className="text-foreground">2,400+</strong> reviews
          </span>
        </div>
      </div>

      <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="glass-card gradient-border p-6 break-inside-avoid group relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform" />
            <Quote className="w-5 h-5 text-primary/30 mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.text}"</p>

            <div className="flex items-center justify-between mb-4">
              <StarRating rating={t.rating} />
              <span className="text-xs font-semibold gradient-text">Saved {t.saved}</span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradients[i]} flex items-center justify-center`}>
                <span className="text-xs font-bold text-white">{t.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  {t.verified && <BadgeCheck className="w-3.5 h-3.5 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default TestimonialsSection;
