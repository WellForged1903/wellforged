import React from "react";
import { Link } from "react-router-dom";
import { Shield, Sparkles, MapPin, Sun, Droplets, Mountain, ArrowRight, CheckCircle, Leaf, FileText, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";

const AboutUs = () => {
  const terroirFeatures = [
    {
      icon: Sun,
      title: "300+ Days of Sunshine",
      description: "Optimal UV exposure stimulates maximum chlorophyll density, yielding extremely concentrated active nutrients."
    },
    {
      icon: Droplets,
      title: "Mineral-Rich Volcanic Soil",
      description: "Nurtured by ancient river basins, absorbing essential volcanic earth minerals without chemical inputs."
    },
    {
      icon: Mountain,
      title: "Volcanic Foothills Terrain",
      description: "Grown at an elevated gradient, enabling slow plant maturation and pristine bio-potency accumulation."
    },
    {
      icon: MapPin,
      title: "Single-Origin Traceability",
      description: "Harvested directly from our dedicated agricultural partners, eliminating cheap mixed sourcing blends."
    }
  ];

  const processTimeline = [
    {
      step: "01",
      title: "Ethical Sunrise Harvest",
      description: "Leaves are hand-picked at early dawn when nutrient density peaks, maintaining maximum active cell structure."
    },
    {
      step: "02",
      title: "Cold Bio-Preservation",
      description: "Dehydrated in clean-room facilities at low temperatures, locking in vitamins and biological enzymes."
    },
    {
      step: "03",
      title: "Double NABL Audit",
      description: "Tested twice through ISO/IEC accredited NABL facilities for heavy metals, pesticides, and absolute purity."
    },
    {
      step: "04",
      title: "Nitrogen Sealed Ledger",
      description: "Flushed with protective nitrogen in dark bags, stamped with a secure batch code linked to our live digital ledger."
    }
  ];

  return (
    <>
      <SEO 
        title="About Us | WellForged - Supplements Built on Truth"
        description="WellForged stands for uncompromising purity. Sourced from organic volcanic foothills of Tamil Nadu and backed by live NABL lab reports."
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
        {/* Localized Keyframes & Styles */}
        <style>{`
          @keyframes slow-blob-float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.03); }
          }
          @keyframes about-laser-scan {
            0%, 100% { top: 0%; opacity: 0; }
            8%, 92% { opacity: 0.7; }
            50% { top: 100%; }
          }
          .ambient-glow-1 {
            animation: slow-blob-float 8s ease-in-out infinite;
          }
          .ambient-glow-2 {
            animation: slow-blob-float 10s ease-in-out infinite alternate;
          }
          .about-sweeping-line {
            animation: about-laser-scan 6s ease-in-out infinite;
          }
        `}</style>

        {/* Ambient Glowing Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] left-[12%] w-[45vw] h-[45vw] rounded-full bg-primary/4 blur-[130px] ambient-glow-1" />
          <div className="absolute top-[35%] right-[8%] w-[40vw] h-[40vw] rounded-full bg-gold/5 blur-[120px] ambient-glow-2" />
          <div className="absolute bottom-[20%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-primary/3 blur-[110px]" />
        </div>

        {/* Sweeping Laser Scan Line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent z-10 pointer-events-none about-sweeping-line" />

        {/* 1. Hero Section */}
        <section className="relative px-6 py-24 sm:py-32 lg:py-40 flex items-center justify-center border-b border-border/40 z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <ScrollReveal animation="fade-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary font-bold">Forged in Integrity</span>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={100}>
              <h1 className="font-display font-bold text-foreground leading-tight tracking-tight sm:text-5xl lg:text-7xl">
                Supplements built on <span className="text-gold-gradient block sm:inline">uncompromising truth.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={200}>
              <p className="font-body text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We believe you have the absolute right to know what you are putting in your body. We don't ask you to trust our labels—we give you NABL verified evidence tied to the exact batch in your hands.
              </p>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={300}>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <Link to="/product">
                  <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider text-xs px-8 h-[52px] gap-2">
                    Shop Organic Moringa <ArrowRight className="h-4 w-4 text-gold" />
                  </Button>
                </Link>
                <Link to="/transparency">
                  <Button variant="default" size="lg" className="bg-secondary hover:bg-secondary/80 text-foreground font-bold uppercase tracking-wider text-xs px-8 h-[52px] gap-2 border border-border/80">
                    Verify Sample Batch
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* 2. The Core Manifesto & Trust Gap */}
        <section className="relative px-6 py-20 sm:py-28 bg-secondary/30 border-b border-border/40 z-10">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
              
              {/* Graphic Vector Illustration */}
              <div className="md:col-span-5 flex justify-center">
                <ScrollReveal animation="scale">
                  <div className="relative w-64 h-64 rounded-full bg-gradient-to-tr from-primary/15 via-gold/10 to-primary/5 border border-primary/20 flex items-center justify-center shadow-lg group">
                    <div className="absolute inset-2 rounded-full border border-dashed border-primary/30 animate-[spin_40s_linear_infinite]" />
                    <div className="text-center space-y-2 z-10">
                      {/* Stylized custom SVG Leaf & Shield figure */}
                      <svg className="w-16 h-16 text-primary mx-auto group-hover:scale-105 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M12 3a9 9 0 00-9 9m9-9a9 9 0 019 9M3 12a9 9 0 009 9m-9-9h18m-9 9a9 9 0 009-9" />
                        <path d="M12 6.5c-2 1.5-3 3-3 5.5s1 4.5 3 4.5 3-2 3-4.5-1-4-3-5.5z" stroke="currentColor" fill="currentColor" fillOpacity="0.1" />
                      </svg>
                      <span className="font-mono text-[9px] font-bold text-gold uppercase tracking-[0.2em] block">Bio-Traceable</span>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              <div className="md:col-span-7 space-y-6 text-left">
                <ScrollReveal animation="fade-up">
                  <span className="eyebrow-label text-primary block">Founder's Mission</span>
                  <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl mt-2 leading-tight">
                    Eliminating the Trust Gap
                  </h2>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={100}>
                  <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
                    The supplement industry has an integrity problem. Brands rely on complex proprietary blends, obscure supplier networks, and generic promises. You are asked to buy purely on belief. 
                  </p>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={200}>
                  <p className="font-body font-semibold text-foreground text-sm sm:text-base leading-relaxed">
                    WellForged was created to close this distance. We believe true vitality doesn't hide behind secrets or marketing labels. 
                  </p>
                </ScrollReveal>

                <ScrollReveal animation="fade-up" delay={300}>
                  <div className="border-l-2 border-gold pl-6 py-2 my-4">
                    <p className="font-display italic text-foreground text-lg sm:text-xl leading-relaxed">
                      "If we can't prove a batch is 100% active, clean, and organic, we don't bottle it. Verification isn't a cost of doing business—it is our core identity."
                    </p>
                  </div>
                </ScrollReveal>
              </div>

            </div>
          </div>
        </section>

        {/* 3. Sourcing Origin - The Tamil Nadu Terroir */}
        <section className="relative px-6 py-24 sm:py-32 border-b border-border/40 z-10">
          <div className="max-w-6xl mx-auto">
            
            <ScrollReveal>
              <div className="text-center mb-16 relative">
                {/* Visual Geographic Coordinates Stamp */}
                <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 font-mono text-[10px] text-gold border border-gold/30 px-4 py-1.5 rounded-full tracking-[0.2em] font-semibold bg-background z-10 shadow-sm">
                  STAMP: 11.1271° N, 78.6569° E
                </div>
                
                <span className="eyebrow-label text-primary block mt-4">Pristine Origin</span>
                <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl lg:text-5xl mt-2 leading-tight">The Tamil Nadu Terroir</h2>
                <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl sm:max-w-2xl mx-auto mt-4 leading-relaxed">
                  Just as fine wines are defined by their terroir, premium Moringa is sculpted by its origin. Our crops are grown exclusively in the mineral-loaded volcanic soil foothills of South India.
                </p>
              </div>
            </ScrollReveal>

            {/* Terroir Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {terroirFeatures.map((feature, idx) => (
                <ScrollReveal key={idx} delay={idx * 100}>
                  <div className="glass-card p-6 h-full text-center group border border-border/50 bg-card/80 hover:bg-card/95 transition-all duration-300">
                    <div className="h-14 w-14 mx-auto mb-5 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:scale-105 transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-foreground text-lg mb-2 leading-tight">{feature.title}</h3>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* Why Single-Origin Card */}
            <ScrollReveal delay={400}>
              <div className="mt-12 p-6 sm:p-10 bg-card/90 rounded-3xl border border-border shadow-soft relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                  
                  <div className="flex-1 text-center lg:text-left space-y-4">
                    <h3 className="font-display font-bold text-foreground text-xl sm:text-2xl leading-tight">Why Single-Origin Matters</h3>
                    <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      Most commercial supplements blend ingredients from multiple wholesale brokers and regions to maximize profit margins. This compromises molecular consistency. By working directly with a single certified volcanic farm network in South India, we enforce 100% stable active constituents in every single harvest.
                    </p>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-2">
                      {["Farm-to-Pouch Control", "100% Volcanic Soil", "Sustainable Direct Trade", "Stable Yield Density"].map((tag, tagIdx) => (
                        <span key={tagIdx} className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase rounded-full tracking-wider border border-primary/20">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="flex-shrink-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-primary/15 to-gold/5 flex items-center justify-center border border-primary/10 shadow-sm relative group">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-gold/25 to-primary/25 blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="text-center relative z-10">
                      <MapPin className="h-10 w-10 text-primary mx-auto mb-1.5" />
                      <span className="font-display text-base font-bold text-foreground block">Tamil Nadu</span>
                      <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest font-semibold">Foothills Farm</span>
                    </div>
                  </div>

                </div>
              </div>
            </ScrollReveal>

          </div>
        </section>

        {/* 4. Sourcing Timeline & Scientific Process */}
        <section className="relative px-6 py-24 sm:py-32 bg-secondary/20 border-b border-border/40 z-10">
          <div className="max-w-5xl mx-auto">
            
            <ScrollReveal>
              <div className="text-center mb-16">
                <span className="eyebrow-label text-primary block">Pristine Processing</span>
                <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl mt-2 leading-tight">The Molecular Standard</h2>
                <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mt-4 leading-relaxed">
                  How we process premium organic Moringa leaf from soil to secure nitrogen-flushed packages.
                </p>
              </div>
            </ScrollReveal>

            {/* Scientific Timeline Layout */}
            <div className="relative border-l-2 border-border/80 ml-4 md:ml-10 space-y-12">
              {processTimeline.map((item, idx) => (
                <div key={idx} className="relative pl-8 md:pl-12 group">
                  {/* Step indicator circle */}
                  <div className="absolute left-[-11px] top-1.5 h-5 w-5 rounded-full border-2 border-primary bg-background flex items-center justify-center z-20 group-hover:scale-110 transition-transform duration-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>

                  <ScrollReveal animation="fade-up" delay={idx * 100}>
                    <div className="p-6 bg-card rounded-2xl border border-border/60 shadow-sm group-hover:border-primary/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded border border-gold/20">{item.step}</span>
                        <h3 className="font-display font-bold text-foreground text-lg sm:text-xl leading-tight">{item.title}</h3>
                      </div>
                      <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">{item.description}</p>
                    </div>
                  </ScrollReveal>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 5. Live Verification Call-to-Action */}
        <section className="relative px-6 py-24 sm:py-32 z-10">
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
