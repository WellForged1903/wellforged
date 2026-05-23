import { useState, useEffect } from "react";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";

const HERO_WORDS = ["Wellness,", "Forged", "with", "Integrity."];

const ManifestoHero = () => {
  const [visibleWords, setVisibleWords] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleWords((prev) => {
        if (prev >= HERO_WORDS.length) { clearInterval(timer); return prev; }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[calc(100svh-var(--nav-height))] flex items-center justify-center overflow-hidden py-6 sm:py-[var(--space-xl)]">
      <div className="absolute inset-0 animate-gradient-shift">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
        <div className="absolute inset-0 bg-gradient-to-tl from-secondary/50 via-transparent to-primary/5 animate-gradient-reverse" />
      </div>
      <div className="hidden sm:block absolute top-20 left-10 w-48 md:w-64 h-48 md:h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="hidden sm:block absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 rounded-full bg-gold/5 blur-3xl animate-float delay-300" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-5 sm:mb-[var(--space-lg)]">
          <AnimatedLogo size="hero" className="animate-subtle-float" />
        </div>

        <div className="animate-hero-fade-up mb-4 sm:mb-[var(--space-sm)]">
          <span className="premium-pill max-w-full gap-2 px-5 py-2.5 text-[0.68rem] sm:text-[var(--text-xs)] font-bold uppercase tracking-[0.18em] text-primary shadow-sm hover:shadow-md transition-shadow duration-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            The No Nonsense Supplement Brand
          </span>
        </div>

        <h1 className="font-display font-semibold text-foreground leading-[1.08] sm:leading-[1.04] mb-4 sm:mb-[var(--space-md)]" style={{ fontSize: "var(--text-5xl)", textWrap: "balance" } as React.CSSProperties}>
          {HERO_WORDS.map((word, index) => (
            <span key={index} className={`inline-block transition-all duration-700 mr-[0.25em] last:mr-0 py-1 ${index < visibleWords ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${word === "Integrity." ? "text-gold-gradient drop-shadow-sm" : ""}`} style={{ transitionDelay: `${index * 150}ms` }}>
              {word}
            </span>
          ))}
        </h1>

        <div className="animate-hero-fade-up-delay-3 max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto">
          <p className="font-body text-[0.96rem] sm:text-[var(--text-lg)] text-muted-foreground leading-[1.75] mb-3 sm:mb-4">
            Most brands ask for your trust. <span className="text-foreground font-semibold">We let you inspect the proof before you commit.</span>
          </p>
          <p className="font-body text-[0.9rem] sm:text-[var(--text-base)] text-muted-foreground/90 leading-[1.7] mb-6 sm:mb-[var(--space-lg)] max-w-xl mx-auto">
            Single-origin sourcing, independent testing, and batch-level verification for a supplement ritual that feels measured, not marketed.
          </p>

          <div className="mb-5 sm:mb-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            <span className="premium-pill px-3 py-1.5 text-[0.68rem] sm:text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-primary">Third-Party Tested</span>
            <span className="premium-pill px-3 py-1.5 text-[0.68rem] sm:text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-primary">Single Ingredient</span>
            <span className="premium-pill px-3 py-1.5 text-[0.68rem] sm:text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-primary">Batch Verified</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-[var(--space-sm)]">
            <Link to="/product" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] group w-full">
                Buy Moringa
                <ShoppingBag className="h-5 w-5 ml-2 transition-transform group-hover:scale-110" />
              </Button>
            </Link>
            <Link to="/transparency" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="h-12 sm:h-14 px-6 sm:px-10 text-sm sm:text-base font-bold uppercase tracking-[0.12em] sm:tracking-[0.16em] border w-full">
                Verify Your Batch
              </Button>
            </Link>
          </div>
        </div>
        <div className="animate-hero-fade-up-delay-5 mt-6 sm:mt-12 lg:mt-16">
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60">
            <span className="text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-widest">Discover</span>
            <div className="w-px h-6 sm:h-8 lg:h-12 bg-gradient-to-b from-primary/30 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManifestoHero;
