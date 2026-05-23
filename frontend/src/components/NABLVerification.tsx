import { Shield, FlaskConical, Leaf, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ScrollReveal from "./ScrollReveal";

const verificationCards = [
  {
    icon: AlertTriangle,
    title: "Heavy Metals",
    subtitle: "Lead, Mercury, Arsenic, Cadmium",
    status: "Non-Detectable",
    description: "Tested below detection limits, ensuring safety for daily consumption.",
    detail: "A clean daily ritual starts with what is absent, not just what is printed on the front label.",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    icon: FlaskConical,
    title: "Pesticides",
    subtitle: "200+ Compounds Screened",
    status: "Non-Detectable",
    description: "Comprehensive screening confirms clean, organic-grade purity.",
    detail: "Our standard is not basic compliance. It is measurable confidence in every serving.",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: Leaf,
    title: "Potency",
    subtitle: "Active Compound Analysis",
    status: "Verified High",
    description: "Chlorophyll and nutrient levels exceed industry standards.",
    detail: "Purity alone is not enough. We also care about retaining the natural value of the ingredient.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const NABLVerification = () => {
  return (
    <section className="section-padding bg-background">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-[var(--space-lg)] sm:mb-[var(--space-xl)]">
            <span className="inline-block font-body text-[var(--text-xs)] lg:text-[var(--text-sm)] uppercase tracking-[0.14em] sm:tracking-[0.2em] lg:tracking-[0.3em] text-primary/70 border border-primary/20 px-4 py-2 rounded-full mb-[var(--space-md)]">
              Lab Verified
            </span>
            <h2 className="font-display font-semibold text-foreground mb-[var(--space-sm)]" style={{ fontSize: "var(--text-3xl)" }}>
              Independent NABL Verification
            </h2>
            <p className="font-body text-[var(--text-base)] sm:text-[var(--text-lg)] text-muted-foreground max-w-xl sm:max-w-2xl mx-auto leading-relaxed px-2">
              Every batch undergoes independent testing at NABL-accredited laboratories. We do not ask you to assume purity. We show you the record behind it.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-[var(--space-md)] mb-[var(--space-xl)]">
          {verificationCards.map((card, index) => (
            <ScrollReveal key={card.title} delay={index * 150}>
              <div className="relative group h-full">
                <div className="glass-card p-4 sm:p-5 lg:p-6 xl:p-8 h-full flex flex-col">
                  <div className="absolute -top-2 sm:-top-3 right-3 sm:right-4 lg:right-6">
                    <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 ${card.bgColor} ${card.color} text-[10px] sm:text-xs font-semibold rounded-full border border-current/20`}>
                      <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      {card.status}
                    </span>
                  </div>
                  <div className={`h-[var(--space-xl)] w-[var(--space-xl)] rounded-lg sm:rounded-xl ${card.bgColor} flex items-center justify-center mb-[var(--space-md)] transition-transform duration-300 group-hover:scale-110`}>
                    <card.icon className="h-1/2 w-1/2" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground mb-1" style={{ fontSize: "var(--text-xl)" }}>
                    {card.title}
                  </h3>
                  <p className="font-body text-[var(--text-xs)] text-muted-foreground mb-3">{card.subtitle}</p>
                  <p className="font-body text-[var(--text-sm)] text-muted-foreground leading-relaxed">{card.description}</p>
                  <p className="font-body text-[0.78rem] text-foreground/80 leading-6 mt-3">{card.detail}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={450}>
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                <div className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="font-display text-base sm:text-lg lg:text-xl font-semibold text-foreground mb-0.5 sm:mb-1">NABL Accredited Testing</h3>
                  <p className="font-body text-xs sm:text-sm text-muted-foreground">National Accreditation Board for Testing and Calibration Laboratories</p>
                  <p className="font-body text-[11px] sm:text-xs text-foreground/80 mt-1">
                    The same proof standard that lets you verify the batch you actually receive, not a generic certificate.
                  </p>
                </div>
              </div>
              <Link to="/transparency" onClick={() => window.scrollTo(0, 0)}>
                <Button variant="hero" size="default" className="gap-2 whitespace-nowrap text-sm sm:text-base">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  Verify Your Batch
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default NABLVerification;
