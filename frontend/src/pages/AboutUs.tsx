import React from "react";
import { Link } from "react-router-dom";
import { Shield, MapPin, ArrowRight, CheckCircle, Lock, FlaskConical, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const safetyThresholds = [
    { contaminant: "Lead (Pb)", standardLimit: "3.0 ppm (WHO / FDA)", wellForgedLimit: "Non-Detectable (< 0.05 ppm)", margin: "60x Safer", status: "passed" },
    { contaminant: "Arsenic (As)", standardLimit: "2.0 ppm (EU Standard)", wellForgedLimit: "Non-Detectable (< 0.02 ppm)", margin: "100x Safer", status: "passed" },
    { contaminant: "Cadmium (Cd)", standardLimit: "1.0 ppm (EU Standard)", wellForgedLimit: "Non-Detectable (< 0.01 ppm)", margin: "100x Safer", status: "passed" },
    { contaminant: "Mercury (Hg)", standardLimit: "0.5 ppm (WHO Limit)", wellForgedLimit: "Non-Detectable (< 0.005 ppm)", margin: "100x Safer", status: "passed" },
  ];

  return (
    <>
      <SEO 
        title="Our Story & Philosophy | WellForged - Supplements Built on Truth"
        description="WellForged was born to bridge the trust gap in nutrition. Explore our volcanic South India sourcing, NABL safety thresholds, and cold-dry standards."
        canonical="/about"
      />
      <Navbar />
      
      <main className="min-h-screen bg-background flex flex-col pt-24 overflow-hidden" style={{
        backgroundImage: `
          linear-gradient(to right, hsl(153 30% 22% / 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(153 30% 22% / 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}>
        {/* Localized CSS Keyframe Animations */}
        <style>{`
          @keyframes ambient-blob-move {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.04); }
          }
          @keyframes sweeping-laser {
            0%, 100% { top: 0%; opacity: 0; }
            5%, 95% { opacity: 0.6; }
            50% { top: 100%; }
          }
          .about-blob-1 { animation: ambient-blob-move 9s ease-in-out infinite; }
          .about-blob-2 { animation: ambient-blob-move 12s ease-in-out infinite alternate; }
          .about-sweeping-line { animation: sweeping-laser 7s ease-in-out infinite; }
        `}</style>

        {/* Ambient Glowing Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[8%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-primary/4 blur-[130px] about-blob-1" />
          <div className="absolute top-[40%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-gold/5 blur-[120px] about-blob-2" />
        </div>

        {/* Dynamic Sweeping Scan Line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent z-10 pointer-events-none about-sweeping-line" />

        {/* Luxury Editorial Hero Header */}
        <section className="relative px-6 py-20 sm:py-28 lg:py-36 flex items-center justify-center border-b border-border/40 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <ScrollReveal animation="fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary font-bold">The WellForged Biography</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={100}>
              <h1 className="font-display font-bold text-foreground leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                Behind the Seal: Our <span className="text-gold-gradient block sm:inline">Obsession with Truth</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200}>
              <p className="font-body text-sm sm:text-base lg:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Supplement labels are full of promises. We built WellForged to replace blind belief with raw, clinical proof—tracing every single product batch back to the soil it came from.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* Chapter 1: The Disillusionment (Our Story) */}
        <section className="relative px-6 py-20 sm:py-28 border-b border-border/40 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-5 flex justify-center">
                <ScrollReveal animation="scale">
                  <div className="relative w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/10 via-gold/5 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg p-8 group">
                    <div className="absolute inset-2 rounded-2xl border border-dashed border-primary/30 animate-[spin_60s_linear_infinite]" />
                    <div className="text-center space-y-3 z-10">
                      {/* Premium Custom SVG Icon depicting organic agriculture + science */}
                      <svg className="w-16 h-16 text-primary mx-auto group-hover:scale-105 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.905 0-5.64-.813-7.843-2.236m15.686 0a11.956 11.956 0 00-15.686 0" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" fill="currentColor" fillOpacity="0.15" />
                      </svg>
                      <span className="font-mono text-[9px] font-bold text-gold uppercase tracking-[0.2em] block">Bio-Audited</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              <div className="lg:col-span-7 space-y-6 text-left">
                <ScrollReveal animation="fade-up">
                  <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded">CHAPTER 1</span>
                  <h2 className="font-display font-bold text-foreground text-3xl mt-3 leading-tight">The Disillusionment</h2>
                </ScrollReveal>

                <div className="space-y-4 font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <ScrollReveal animation="fade-up" delay={100}>
                    <p>
                      Like many others, our journey started with a search for vitality. We bought organic powders, premium cold-pressed capsules, and green superfoods, believing we were nourishing our bodies.
                    </p>
                  </ScrollReveal>
                  <ScrollReveal animation="fade-up" delay={200}>
                    <p>
                      Then we asked a simple question: *Where is the proof?* When we requested raw certificates of analysis (CoA) for heavy metals and pesticides from leading brands, we were met with silence, canned responses, or statements about "proprietary safety protocols."
                    </p>
                  </ScrollReveal>
                  <ScrollReveal animation="fade-up" delay={300}>
                    <p className="font-semibold text-foreground">
                      We realized that "Certified Organic" was treated as a marketing shield rather than a scientific standard. We set out to change that.
                    </p>
                  </ScrollReveal>
                </div>

                <ScrollReveal animation="fade-up" delay={400}>
                  <div className="border-l-2 border-gold pl-6 py-2 my-2">
                    <p className="font-display italic text-foreground text-base sm:text-lg leading-relaxed">
                      "We didn't set out to build a supplement company. We set out to build a transparency framework."
                    </p>
                  </div>
                </ScrollReveal>
              </div>

            </div>
          </div>
        </section>

        {/* Chapter 2: Beyond Organic (The Purity Paradox) */}
        <section className="relative px-6 py-20 sm:py-28 bg-secondary/20 border-b border-border/40 z-10">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <ScrollReveal animation="fade-up">
                <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded">CHAPTER 2</span>
                <h2 className="font-display font-bold text-foreground text-3xl mt-3 leading-tight">The Purity Paradox</h2>
              </ScrollReveal>
              <ScrollReveal animation="fade-up" delay={100}>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Why standard organic certifications are not enough to guarantee your safety against heavy metals and environmental toxins.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <ScrollReveal animation="fade-up" delay={150}>
                <div className="p-6 sm:p-8 bg-card rounded-2xl border border-border/80 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-10 w-10 bg-destructive/10 border border-destructive/20 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <h3 className="font-display font-bold text-foreground text-lg sm:text-xl leading-tight">The Limitation of "Certified Organic"</h3>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      Typical organic certifications audit farming history (soil pesticide records, seed sources). However, they **do not test the final harvested batch** for airborne heavy metal deposition, contamination during mechanical processing, or toxic packing residues. Heavy metals can bleed into organic soil through groundwater even if a farm follows strict organic guidelines.
                    </p>
                  </div>
                  <div className="border-t border-border/40 pt-4 mt-6">
                    <span className="font-mono text-[9px] font-bold text-destructive uppercase tracking-wider">CRITICAL RISK: UNCHECKED BATCHES</span>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal animation="fade-up" delay={250}>
                <div className="p-6 sm:p-8 bg-card rounded-2xl border border-primary/30 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-foreground text-lg sm:text-xl leading-tight">The WellForged Double NABL Audit</h3>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">
                      We treat organic practices as our base, but **clinical NABL lab verification** as our absolute safety standard. Every single batch is quarantined post-harvest and double-tested at ISO/IEC accredited laboratory archives. We test for 200+ agricultural toxins, chemical fillers, and post-harvest heavy metals—publishing raw data tied to your batch code.
                    </p>
                  </div>
                  <div className="border-t border-border/40 pt-4 mt-6">
                    <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-wider">OUR GUARANTEE: verified certificates</span>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Chapter 3: Cold-Chain Preservation */}
        <section className="relative px-6 py-20 sm:py-28 border-b border-border/40 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              
              <div className="lg:col-span-7 space-y-6 text-left">
                <ScrollReveal animation="fade-up">
                  <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded">CHAPTER 3</span>
                  <h2 className="font-display font-bold text-foreground text-3xl mt-3 leading-tight">Preserving the Living Molecule</h2>
                </ScrollReveal>

                <div className="space-y-4 font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  <ScrollReveal animation="fade-up" delay={100}>
                    <p>
                      Moringa oleifera is packed with heat-sensitive phytonutrients, active chlorophyll, and cellular enzymes. Most commercial brands sun-dry their leaves in open fields exposed to ambient dust, or dehydrate them quickly using high-heat industrial ovens to reduce production costs.
                    </p>
                  </ScrollReveal>
                  <ScrollReveal animation="fade-up" delay={200}>
                    <p className="font-semibold text-foreground">
                      This extreme heat oxidizes the active chlorophyll, burning away the key bio-active nutrients and turning the powder dark brown or fainted olive.
                    </p>
                  </ScrollReveal>
                  <ScrollReveal animation="fade-up" delay={300}>
                    <p>
                      At WellForged, we implement a strict **Cold-Dry Technique**. Our single-origin South Indian leaves are harvested at dawn, washed in purified mineral water, and dehydrated within sterile cleanrooms strictly under **40°C**. This locks in the pristine molecular density, yielding a bright, vibrant green powder loaded with living nutrients.
                    </p>
                  </ScrollReveal>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <ScrollReveal animation="scale">
                  <div className="relative w-64 h-64 rounded-full bg-gradient-to-br from-gold/15 to-primary/10 flex items-center justify-center shadow-md p-6 border border-gold/30 group">
                    <div className="absolute inset-1.5 rounded-full border border-dashed border-gold/40 animate-[spin_50s_linear_infinite]" />
                    <div className="text-center space-y-1 z-10">
                      {/* Stylized single-origin geographic stamp */}
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-1" />
                      <span className="font-mono text-[10px] font-bold text-foreground block">TAMIL NADU</span>
                      <span className="font-mono text-[9px] text-gold uppercase tracking-[0.2em] font-bold block">11.1271° N, 78.6569° E</span>
                      <span className="font-body text-[10px] text-muted-foreground">Volcanic soil terroir</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

            </div>
          </div>
        </section>

        {/* Chapter 4: International Safety Margin Comparison Grid */}
        <section className="relative px-6 py-20 sm:py-28 bg-secondary/15 border-b border-border/40 z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
              <ScrollReveal animation="fade-up">
                <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded">CHAPTER 4</span>
                <h2 className="font-display font-bold text-foreground text-3xl mt-3 leading-tight">Uncompromising Safety Thresholds</h2>
              </ScrollReveal>
              <ScrollReveal animation="fade-up" delay={100}>
                <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  How WellForged safety limits compare against standard global regulatory requirements.
                </p>
              </ScrollReveal>
            </div>

            {/* Premium Scientific Grid Chart */}
            <ScrollReveal delay={200}>
              <div className="overflow-x-auto border border-border/80 rounded-2xl shadow-sm bg-card">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/80">
                      <th className="font-mono text-[10px] text-muted-foreground text-left py-4 px-5 uppercase tracking-wider">Contaminant / Metal</th>
                      <th className="font-mono text-[10px] text-muted-foreground text-left py-4 px-5 uppercase tracking-wider">Global Standard Limit</th>
                      <th className="font-mono text-[10px] text-muted-foreground text-left py-4 px-5 uppercase tracking-wider">WellForged Safety Threshold</th>
                      <th className="font-mono text-[10px] text-muted-foreground text-right py-4 px-5 uppercase tracking-wider">Safety Margin Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safetyThresholds.map((row, idx) => (
                      <tr key={idx} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors duration-200">
                        <td className="font-body text-xs sm:text-sm font-semibold text-foreground py-4 px-5">{row.contaminant}</td>
                        <td className="font-mono text-xs text-muted-foreground py-4 px-5">{row.standardLimit}</td>
                        <td className="font-mono text-xs font-bold text-foreground py-4 px-5">{row.wellForgedLimit}</td>
                        <td className="text-right py-4 px-5">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <CheckCircle className="h-3 w-3" /> {row.margin}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Live Ledger Verification Call-to-Action */}
        <section className="relative px-6 py-24 sm:py-32 z-10 animate-fade-in">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal animation="scale">
              <div className="premium-panel border-gold/30 bg-card/95 backdrop-blur-md p-8 sm:p-12 text-center relative overflow-hidden shadow-elevated rounded-3xl">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(153,30,22,0.08),rgba(0,0,0,0))]" />
                
                {/* SVG Digital Security Graphic */}
                <div className="relative z-10 flex justify-center mb-6">
                  <div className="h-16 w-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-[-4px] rounded-full border border-dashed border-gold/30 animate-[spin_20s_linear_infinite]" />
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                </div>

                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold font-bold">Secure Molecular Ledger</span>
                  <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl leading-tight">Verify Your Supplement Purity</h2>
                  <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
                    We maintain a public, verifiable digital ledger for every single batch we manufacture. Enter your package batch number to view independent NABL-certified third-party lab reports instantly.
                  </p>

                  <div className="pt-4 flex flex-wrap justify-center gap-4">
                    <Link to="/transparency">
                      <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs px-8 h-[52px] gap-2">
                        Verify Batch <ArrowRight className="h-4 w-4 text-gold" />
                      </Button>
                    </Link>
                    <Link to="/product">
                      <Button variant="default" size="lg" className="bg-secondary hover:bg-secondary/80 text-foreground font-bold uppercase tracking-wider text-xs px-8 h-[52px] border border-border/80">
                        View Products
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default AboutUs;
