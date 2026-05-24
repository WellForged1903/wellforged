import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, lastUpdated, children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-20 pt-28 sm:pt-36 overflow-hidden relative" style={{
        backgroundImage: `
          linear-gradient(to right, hsl(153 30% 22% / 0.02) 1px, transparent 1px),
          linear-gradient(to bottom, hsl(153 30% 22% / 0.02) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }}>
        {/* Shifting Ambient Background Elements */}
        <style>{`
          @keyframes legal-blob-float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.03); }
          }
          @keyframes legal-laser-scan {
            0%, 100% { top: 0%; opacity: 0; }
            5%, 95% { opacity: 0.5; }
            50% { top: 100%; }
          }
          .legal-blob-1 { animation: legal-blob-float 8s ease-in-out infinite; }
          .legal-blob-2 { animation: legal-blob-float 10s ease-in-out infinite alternate; }
          .legal-sweeping-line { animation: legal-laser-scan 7s ease-in-out infinite; }
        `}</style>

        {/* Ambient Glowing Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[12%] left-[8%] w-[45vw] h-[45vw] rounded-full bg-primary/4 blur-[130px] legal-blob-1" />
          <div className="absolute top-[45%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-gold/5 blur-[110px] legal-blob-2" />
        </div>

        {/* Dynamic Sweeping Scan Line */}
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent z-10 pointer-events-none legal-sweeping-line" />

        <div className="mx-auto max-w-4xl px-4 relative z-10">
          <ScrollReveal animation="scale">
            {/* Frosted Glass Luxury Panel Canvas */}
            <div className="premium-panel bg-card/92 border border-border/80 backdrop-blur-md shadow-card p-6 sm:p-10 md:p-14 rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(153,30,22,0.06),rgba(0,0,0,0))]" />
              
              <div className="relative z-10 space-y-8">
                {/* Visual Header */}
                <header className="border-b border-border/60 pb-8 text-center space-y-4">
                  <div className="h-12 w-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight tracking-tight">{title}</h1>
                  
                  {/* Styled Monospaced Badge Stamp */}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 border border-primary/20 text-primary font-mono text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                      <Lock className="h-3 w-3 text-gold" /> Last Updated: {lastUpdated}
                    </span>
                  </div>
                </header>
                
                {/* Content Area - Fully styled for rich typography contrast and maximum readability */}
                <article className="prose prose-sm prose-stone mx-auto sm:prose-base prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-8 prose-headings:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-5 prose-li:text-muted-foreground prose-li:mb-2 prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:font-bold prose-strong:text-foreground">
                  {children}
                </article>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default LegalPageLayout;
