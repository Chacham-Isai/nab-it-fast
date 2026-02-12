import SectionWrapper from "@/components/SectionWrapper";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FinalCTASection = () => {
  return (
    <SectionWrapper>
      <div className="relative rounded-3xl border border-primary/30 p-12 md:p-20 text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-primary/[0.05] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.1] blur-[120px] pointer-events-none" />

        <div className="relative z-10">
          <h2 className="font-heading font-bold text-foreground mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
            Stop overpaying.<br />
            <span className="text-primary">Start nabbing.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join thousands of smart shoppers saving real money on autopilot.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="rounded-full px-8 font-semibold text-base gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 font-semibold text-base border-border hover:bg-secondary">
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FinalCTASection;
