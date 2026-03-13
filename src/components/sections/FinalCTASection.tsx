import SectionWrapper from "@/components/SectionWrapper";
import { ArrowRight, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const FinalCTASection = () => {
  const navigate = useNavigate();
  return (
    <SectionWrapper>
      <div className="relative rounded-3xl p-12 md:p-20 text-center overflow-hidden glass-card gradient-border">
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary blur-[150px] pointer-events-none"
        />
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/[0.1] mb-8 text-sm font-bold">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-primary">Deals are dropping right now</span>
            </div>
            <h2
              className="font-heading font-black text-foreground mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
            >
              Stop scrolling.<br />
              <span className="gradient-text">Start nabbing.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              The Nabbit Engine is live. Deals are personalized. Your next great nab is waiting — and it's actually a steal.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="rounded-full px-10 font-black text-lg gap-2 shimmer-btn shadow-[0_0_50px_-5px_hsl(var(--coral)/0.5)]"
                onClick={() => navigate("/signup")}
              >
                Start Nabbing Free <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-5">No credit card · Setup in 30 seconds · Cancel anytime</p>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FinalCTASection;