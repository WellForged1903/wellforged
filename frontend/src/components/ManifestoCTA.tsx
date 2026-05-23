import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";

const ManifestoCTA = () => {
  return (
    <section className="section-padding relative overflow-hidden bg-secondary pb-24 sm:pb-16 lg:pb-20">
      <div className="absolute inset-0">
        <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-1 text-center sm:px-0">
        <ScrollReveal animation="fade-up">
          <span className="inline-block font-body text-[9px] uppercase tracking-[0.15em] text-primary/70 sm:text-[10px] sm:tracking-[0.2em] lg:text-xs lg:tracking-[0.25em]">
            Your Next Move
          </span>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={100}>
          <h2 className="mb-3 font-display font-semibold text-foreground sm:mb-4 lg:mb-6" style={{ fontSize: "var(--text-3xl)" }}>
            Buy with Clarity, Not Guesswork
          </h2>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={200}>
          <p className="mx-auto mb-6 max-w-xl px-2 font-body leading-relaxed text-muted-foreground sm:mb-8 sm:max-w-2xl lg:mb-10" style={{ fontSize: "var(--text-base)" }}>
            Explore the formula, inspect the standard, and choose a daily ritual that feels transparent from first click to first serving.
          </p>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={300}>
          <div className="flex flex-col justify-center gap-2.5 sm:flex-row sm:gap-3 lg:gap-4">
            <Link to="/transparency" onClick={() => window.scrollTo(0, 0)} className="w-full sm:w-auto">
              <Button variant="hero" size="default" className="group h-11 w-full gap-2 border-2 border-transparent text-sm transition-all duration-300 hover:border-primary/30 sm:w-auto sm:text-base">
                Verify Your Batch
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/product" onClick={() => window.scrollTo(0, 0)} className="w-full sm:w-auto">
              <Button variant="outline" size="default" className="h-11 w-full gap-2 border-2 text-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 sm:w-auto sm:text-base">
                <ShoppingBag className="h-5 w-5" />
                Shop the Collection
              </Button>
            </Link>
          </div>
        </ScrollReveal>
        <ScrollReveal animation="fade-up" delay={400}>
          <div className="mt-8 border-t border-border pt-6 sm:mt-12 sm:pt-8 lg:mt-16 lg:pt-10">
            <p className="mb-2 font-display italic text-foreground" style={{ fontSize: "var(--text-base)" }}>
              "Proof should arrive before trust."
            </p>
            <p className="font-body text-sm font-semibold uppercase tracking-[0.16em] text-primary/80">WellForged Team</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default ManifestoCTA;
