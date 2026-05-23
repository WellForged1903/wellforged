import ScrollReveal from "@/components/ScrollReveal";

const WhyWeExist = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-foreground py-10 sm:py-16 md:py-24 lg:py-32">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="scale">
            <blockquote className="text-center">
              <p className="font-display font-semibold leading-tight text-background" style={{ fontSize: "var(--text-2xl)" }}>
                "In an industry built on secrets,
                <br />
                <span className="text-gold">we choose truth.</span>"
              </p>
            </blockquote>
          </ScrollReveal>
        </div>
      </div>
      <div className="section-padding bg-secondary">
        <div className="mx-auto max-w-4xl px-1 text-center sm:px-0">
          <ScrollReveal animation="fade-up">
            <span className="mb-2 inline-block font-body text-[9px] uppercase tracking-[0.15em] text-primary/70 sm:mb-3 sm:text-[10px] sm:tracking-[0.2em] lg:mb-4 lg:text-xs lg:tracking-[0.25em]">
              Founder's Mission
            </span>
          </ScrollReveal>
          <ScrollReveal animation="fade-up" delay={100}>
            <h2 className="mb-4 font-display font-semibold text-foreground sm:mb-6 lg:mb-8" style={{ fontSize: "var(--text-3xl)" }}>
              Eliminating the Trust Gap
            </h2>
          </ScrollReveal>
          <div className="space-y-3 text-left sm:space-y-4 sm:text-center lg:space-y-6">
            <ScrollReveal animation="fade-up" delay={200}>
              <p className="font-body leading-relaxed text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                The supplement industry has a trust problem. Complex blends. Vague promises. Lab results you rarely get to see. We built WellForged to close that gap.
              </p>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={300}>
              <p className="font-body font-medium leading-relaxed text-foreground" style={{ fontSize: "var(--text-base)" }}>
                WellForged exists to reduce the distance between what a brand claims and what a customer can verify.
              </p>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={400}>
              <p className="font-body leading-relaxed text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
                We believe every person has the right to know exactly what they are putting in their body, not through marketing language, but through evidence tied to the batch they receive.
              </p>
            </ScrollReveal>
            <ScrollReveal animation="fade-up" delay={500}>
              <div className="mt-4 border-t border-border pt-4 sm:mt-6 sm:pt-5 lg:mt-8 lg:pt-6">
                <p className="font-display italic text-foreground" style={{ fontSize: "var(--text-lg)" }}>
                  "We don't ask you to trust us.
                  <br />
                  We give you the tools to verify."
                </p>
                <p className="mt-2 font-body tracking-wide text-muted-foreground sm:mt-3 lg:mt-4" style={{ fontSize: "var(--text-xs)" }}>
                  - The WellForged Team
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyWeExist;
