import { useState } from "react";
import { MapPin, FlaskConical, Eye } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const pillars = [
  { icon: MapPin, title: "Provenance", description: "We source exclusively from single-origin regions known for peak potency. No blends. No compromises.", number: "01" },
  { icon: FlaskConical, title: "The Double-Verify", description: "Every batch is tested twice. Once by the producer, and once independently by a third-party NABL lab. We police our own supply chain.", number: "02" },
  { icon: Eye, title: "Radical Disclosure", description: "Real-time access to the exact lab data of the product in your hand. Scan. Verify. Decide.", number: "03" },
];

const IntegrityPillars = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 hidden md:block">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10 px-1 sm:px-0">
        <ScrollReveal animation="fade-up" className="text-center mb-[var(--space-xl)]">
          <span className="inline-block font-body text-[var(--text-xs)] uppercase tracking-[0.14em] sm:tracking-[0.2em] text-primary/70 mb-[var(--space-2xs)]">Our Foundation</span>
          <h2 className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-3xl)" }}>The Integrity Pillars</h2>
          <p className="section-copy max-w-2xl mx-auto mt-3">Every WellForged product is built on traceability, independent verification, and disclosure that respects the customer.</p>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[var(--space-md)]">
          {pillars.map((pillar, index) => (
            <ScrollReveal key={pillar.title} animation="fade-up" delay={index * 150} className={index === 2 ? "sm:col-span-2 md:col-span-1 sm:max-w-md sm:mx-auto md:max-w-none" : ""}>
              <div className="glass-card p-4 sm:p-6 lg:p-8 xl:p-10 h-full cursor-pointer relative transition-all duration-500 ease-out"
                onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}
                style={{ transform: hoveredIndex === index ? "translateY(-12px) rotateX(5deg) rotateY(-2deg)" : "translateY(0) rotateX(0) rotateY(0)", transformStyle: "preserve-3d", perspective: "1000px" }}>
                <span className="font-display text-[var(--text-5xl)] sm:text-[var(--text-6xl)] font-bold text-primary/10 absolute top-[var(--space-xs)] right-[var(--space-sm)] leading-none">{pillar.number}</span>
                <div className={`h-[var(--space-xl)] w-[var(--space-xl)] rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center mb-[var(--space-md)] transition-all duration-300 ${hoveredIndex === index ? "bg-primary/20 scale-110" : ""}`}>
                  <pillar.icon className="h-1/2 w-1/2 text-primary transition-transform duration-300" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2 sm:mb-3 lg:mb-4" style={{ fontSize: "var(--text-xl)" }}>{pillar.title}</h3>
                <p className="font-body text-muted-foreground leading-relaxed" style={{ fontSize: "var(--text-sm)" }}>{pillar.description}</p>
                <p className="font-body text-foreground/80 leading-relaxed mt-3 text-[0.82rem]">
                  {index === 0 && "We choose inputs that can be traced back to a real growing context, not a generic commodity chain."}
                  {index === 1 && "That second layer of testing is what turns a claim into a standard you can actually rely on."}
                  {index === 2 && "The result is a purchase journey where trust is earned through evidence, not branding alone."}
                </p>
                <div className={`absolute bottom-0 left-0 h-0.5 sm:h-1 bg-gradient-to-r from-primary to-primary/50 rounded-b-xl sm:rounded-b-2xl transition-all duration-500 ${hoveredIndex === index ? "w-full" : "w-0"}`} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrityPillars;
