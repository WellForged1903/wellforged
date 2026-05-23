import { MapPin, Sun, Droplets, Mountain } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const TamilNaduTerroir = () => {
  const terroirFeatures = [
    { icon: Sun, title: "300+ Days of Sunshine", description: "Optimal UV exposure for maximum nutrient density and chlorophyll production." },
    { icon: Droplets, title: "Natural Irrigation", description: "Fed by ancient river systems, ensuring mineral-rich soil without synthetic inputs." },
    { icon: Mountain, title: "Elevated Terrain", description: "Grown at optimal elevation for slower maturation and concentrated phytonutrients." },
    { icon: MapPin, title: "Single-Origin Traceability", description: "Every batch traced to specific farms in Tamil Nadu's premium growing region." },
  ];

  return (
    <section className="section-padding bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-8 sm:mb-10 lg:mb-14">
            <span className="inline-block font-body text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] lg:tracking-[0.3em] text-primary/70 border border-primary/20 px-2.5 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full mb-3 sm:mb-4 lg:mb-6">The Origin</span>
            <h2 className="font-display font-semibold text-foreground mb-3 sm:mb-4 lg:mb-6" style={{ fontSize: "var(--text-3xl)" }}>The Tamil Nadu Terroir</h2>
            <p className="font-body text-muted-foreground max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2" style={{ fontSize: "var(--text-base)" }}>Just as fine wines are defined by their terroir, our Moringa is defined by its origin. Tamil Nadu's unique microclimate creates the gold standard of Moringa cultivation.</p>
          </div>
        </ScrollReveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {terroirFeatures.map((feature, index) => (
            <ScrollReveal key={feature.title} delay={index * 100}>
              <div className="glass-card p-3 sm:p-4 lg:p-5 xl:p-6 h-full text-center group">
                <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 mx-auto mb-2 sm:mb-3 lg:mb-4 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1 sm:mb-2 leading-tight" style={{ fontSize: "var(--text-base)" }}>{feature.title}</h3>
                <p className="font-body text-muted-foreground leading-relaxed" style={{ fontSize: "var(--text-xs)" }}>{feature.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={400}>
          <div className="mt-6 sm:mt-10 lg:mt-14 p-4 sm:p-6 lg:p-8 bg-card rounded-xl sm:rounded-2xl border border-border">
            <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 lg:gap-10">
              <div className="flex-1 text-center lg:text-left">
                <h3 className="font-display font-semibold text-foreground mb-2 sm:mb-3" style={{ fontSize: "var(--text-xl)" }}>Why Single-Origin Matters</h3>
                <p className="font-body text-muted-foreground leading-relaxed mb-3 sm:mb-4" style={{ fontSize: "var(--text-sm)" }}>Unlike blended supplements that source from multiple unknown locations, our single-origin approach ensures consistent quality, traceable provenance, and direct farmer relationships that support sustainable agriculture.</p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3">
                  {["Farm-to-Package Traceability", "Direct Farmer Partnerships", "Zero Middlemen"].map(tag => (
                    <span key={tag} className="px-2 sm:px-3 py-1 sm:py-1.5 bg-primary/10 text-primary text-[10px] sm:text-xs font-medium rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-primary mx-auto mb-1 sm:mb-2" />
                  <span className="font-display text-sm sm:text-base lg:text-lg xl:text-xl font-semibold text-foreground block">Tamil Nadu</span>
                  <span className="font-body text-[10px] sm:text-xs text-muted-foreground">South India</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default TamilNaduTerroir;
