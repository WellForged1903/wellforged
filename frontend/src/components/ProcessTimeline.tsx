import { useEffect, useRef, useState } from "react";
import { MapPin, FlaskConical, FileSearch } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const steps = [
  {
    number: "01",
    title: "Sourcing",
    subtitle: "Single-Origin Selection",
    description:
      "We partner with carefully vetted farms in regions known for optimal growing conditions. Every ingredient is traceable to its exact origin.",
    icon: MapPin,
  },
  {
    number: "02",
    title: "Forging",
    subtitle: "Cold-Processed Integrity",
    description:
      "Unlike heat-treated products, we process below 40C to preserve heat-sensitive nutrients and chlorophyll. The result is a cleaner ingredient with less compromise built in.",
    icon: FlaskConical,
  },
  {
    number: "03",
    title: "Transparency",
    subtitle: "Real-Time Batch Reporting",
    description:
      "Scan your batch code to access the report behind the product in your hand. No hidden data. No gatekeeping. Full disclosure.",
    icon: FileSearch,
  },
];

const ProcessTimeline = () => {
  const [lineProgress, setLineProgress] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const duration = 2000;
            const startTime = performance.now();
            const animate = (currentTime: number) => {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setLineProgress(eased * 100);
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding relative overflow-hidden bg-background">
      <div className="absolute inset-0 hidden opacity-[0.03] sm:block">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>
      <div className="relative z-10 mx-auto max-w-5xl">
        <ScrollReveal animation="fade-up" className="mb-8 text-center sm:mb-12 lg:mb-16 xl:mb-24">
          <span className="inline-block font-body text-[9px] uppercase tracking-[0.12em] text-primary/70 sm:text-[10px] sm:tracking-[0.2em] lg:text-xs lg:tracking-[0.25em]">
            Our Process
          </span>
          <h2 className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-3xl)" }}>
            From Source to Certainty
          </h2>
          <p className="section-copy mx-auto mt-3 max-w-2xl">
            A premium standard is not created by packaging alone. It is built through disciplined process, independent verification, and disclosure at every step.
          </p>
        </ScrollReveal>
        <div className="relative">
          <div className="absolute bottom-0 top-0 left-4 w-px md:hidden sm:left-5 lg:left-6">
            <div className="absolute inset-0 bg-border" />
            <div className="absolute left-0 top-0 w-full bg-gradient-to-b from-primary via-primary to-gold transition-all duration-100" style={{ height: `${lineProgress}%` }} />
          </div>
          <div className="absolute bottom-0 top-0 left-1/2 hidden w-px -translate-x-1/2 md:block">
            <div className="absolute inset-0 bg-border" />
            <div className="absolute left-0 top-0 w-full bg-gradient-to-b from-primary via-primary to-gold transition-all duration-100" style={{ height: `${lineProgress}%` }} />
          </div>

          <div className="space-y-8 sm:space-y-12 lg:space-y-16 xl:space-y-24">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} animation="fade-up" delay={index * 150}>
                <div className={`relative flex items-start gap-4 sm:gap-6 lg:gap-12 xl:gap-16 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 pl-10 sm:pl-14 md:pl-0 ${index % 2 === 0 ? "md:pr-12 md:text-right lg:pr-16" : "md:pl-12 md:text-left lg:pl-16"}`}>
                    <span className="mb-0.5 block font-display text-primary/15 sm:mb-1 lg:mb-2" style={{ fontSize: "var(--text-4xl)" }}>
                      {step.number}
                    </span>
                    <h3 className="mb-0.5 font-display font-semibold text-foreground sm:mb-1 lg:mb-2" style={{ fontSize: "var(--text-2xl)" }}>
                      {step.title}
                    </h3>
                    <p className="mb-2 font-body uppercase tracking-[0.14em] text-gold sm:mb-3 sm:tracking-widest lg:mb-4" style={{ fontSize: "var(--text-xs)" }}>
                      {step.subtitle}
                    </p>
                    <p className="max-w-md font-body leading-relaxed text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                      {step.description}
                    </p>
                  </div>
                  <div className="absolute left-0 flex items-center justify-center md:left-1/2 md:-translate-x-1/2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background shadow-lg sm:h-10 sm:w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14">
                      <step.icon className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                    </div>
                  </div>
                  <div className="hidden flex-1 md:block" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessTimeline;
