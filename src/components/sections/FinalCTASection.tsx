import SectionWrapper from "@/components/SectionWrapper";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FinalCTASection = () => {
  return (
    <SectionWrapper>
      <div className="relative rounded-3xl p-12 md:p-20 text-center overflow-hidden glass-card gradient-border">
        {/* Animated glows */}
        <motion.div 
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary blur-[150px] pointer-events-none" 
        />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, var(--grid-dot-color) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
              Stop overpaying.<br />
              <span className="gradient-text">Start nabbing.</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-4 max-w-xl mx-auto">
              Join <strong className="text-foreground">12,000+</strong> smart shoppers saving real money on autopilot.
            </p>
            
            {/* Urgency */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/[0.06] mb-8 text-sm">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">Free tier limited to first <strong className="text-foreground">5,000</strong> users</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="rounded-full px-10 font-semibold text-base gap-2 shimmer-btn shadow-[0_0_40px_-5px_hsl(var(--coral)/0.5)]">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold text-base border-border hover:bg-secondary">
                Watch Demo
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">No credit card required · Setup in 30 seconds</p>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FinalCTASection;