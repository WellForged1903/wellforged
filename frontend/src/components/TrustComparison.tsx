import { Check, X, Shield, FlaskConical, Leaf } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const comparisonData = [
    {
        feature: "Lab Results",
        wellforged: { text: "Public & Real-time", icon: Check, highlight: true },
        typical: { text: "None / Internal Only", icon: X },
    },
    {
        feature: "Sourcing",
        wellforged: { text: "Traceable Single-Origin", icon: Check, highlight: true },
        typical: { text: "Blended / Unlisted", icon: X },
    },
    {
        feature: "Heavy Metals",
        wellforged: { text: "Non-Detectable (Tested)", icon: Check, highlight: true },
        typical: { text: "Compliance Standard only", icon: X },
    },
    {
        feature: "Fillers",
        wellforged: { text: "0.0% Purity", icon: Check, highlight: true },
        typical: { text: "Maltodextrin/Flavors", icon: X },
    },
];

const TrustComparison = () => {
    return (
        <section className="section-padding bg-background relative overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <ScrollReveal animation="fade-up" className="text-center mb-10 sm:mb-16">
                    <span className="inline-block font-body text-[10px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.2em] text-primary/70 mb-3">Transparency Benchmark</span>
                    <h2 className="font-display font-bold text-foreground mb-4" style={{ fontSize: "var(--text-3xl)" }}>
                        Closing the Trust Gap
                    </h2>
                    <p className="font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed" style={{ fontSize: "var(--text-base)" }}>
                        In an industry built on vague claims, we provide verifiable proof. See how our standards compare to the market default.
                    </p>
                </ScrollReveal>

                <ScrollReveal animation="scale" delay={200}>
                    <div className="glass-card overflow-hidden border-2 border-primary/10 shadow-elevated">
                        <div className="grid grid-cols-3 bg-secondary/50 border-b border-border">
                            <div className="min-h-[52px] sm:min-h-[64px] p-3 sm:p-6 font-display font-bold text-[9px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-widest text-muted-foreground flex items-center justify-start text-left">Standard</div>
                            <div className="min-h-[52px] sm:min-h-[64px] p-3 sm:p-6 bg-primary/5 border-x border-primary/10 font-display font-bold text-[9px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-widest text-primary flex items-center justify-center text-center">WellForged</div>
                            <div className="min-h-[52px] sm:min-h-[64px] p-3 sm:p-6 font-display font-bold text-[9px] sm:text-xs uppercase tracking-[0.12em] sm:tracking-widest text-muted-foreground flex items-center justify-end text-right">Typical Brand</div>
                        </div>

                        {comparisonData.map((row, index) => (
                            <div key={row.feature} className="grid grid-cols-3 items-stretch border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                                <div className="p-3 sm:p-6 font-display font-semibold text-foreground flex items-center justify-start text-left min-h-[88px] sm:min-h-[100px]" style={{ fontSize: "var(--text-sm)" }}>
                                    {row.feature}
                                </div>

                                <div className="p-3 sm:p-6 bg-primary/[0.02] border-x border-primary/5 flex flex-col items-center justify-center gap-1.5 min-h-[88px] sm:min-h-[100px] text-center">
                                    <row.wellforged.icon className="h-5 w-5 text-primary" />
                                    <span className="font-body font-bold text-primary text-center" style={{ fontSize: "var(--text-xs)" }}>
                                        {row.wellforged.text}
                                    </span>
                                </div>

                                <div className="p-3 sm:p-6 flex flex-col items-center justify-center gap-1.5 opacity-60 min-h-[88px] sm:min-h-[100px] text-center sm:text-right">
                                    <row.typical.icon className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-body font-medium text-muted-foreground text-center" style={{ fontSize: "var(--text-xs)" }}>
                                        {row.typical.text}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollReveal>
            </div>
        </section>
    );
};

export default TrustComparison;
