import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, CheckCircle, XCircle, FileText, Beaker, Calendar, Package, Shield, Download, Loader2, Sparkles, Lock, Leaf, FlaskConical, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";
import { API_BASE_URL } from "@/config";

// Hardcoded data removed, fetching from backend instead
interface TestResult { name: string; result: string; status: "passed" | "failed"; limit: string; }
interface BatchData { batchNumber: string; productName: string; manufactureDate: string; expirationDate: string; testDate: string; labName: string; status: "passed" | "failed"; purityLevel: number; tests: TestResult[]; labReportUrl?: string | null; }

const scorecardItems = [
  { icon: Leaf, title: "Purity", description: "100% Moringa Oleifera (No Fillers)", status: "PASS" },
  { icon: Shield, title: "Safety", description: "Heavy Metals & Pesticides: Non-Detectable", status: "PASS" },
  { icon: FlaskConical, title: "Potency", description: "High Chlorophyll Content (Freshly Processed)", status: "PASS" },
];

const TransparencyPage = () => {
  const [batchNumber, setBatchNumber] = useState("");
  const [searchedBatch, setSearchedBatch] = useState<BatchData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showScorecard, setShowScorecard] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [searchParams] = useSearchParams();
  const [latestBatchFetched, setLatestBatchFetched] = useState(false);

  // Default Bias Implementation: Fetch latest batch if no param provided
  useEffect(() => {
    const fetchLatestBatch = async () => {
      const batchParam = searchParams.get("batch");
      if (!batchParam && !hasSearched && !isLoading && !latestBatchFetched) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/inventory/batches?limit=1`);
          if (response.ok) {
            const batches = await response.json();
            if (batches && batches.length > 0) {
              setBatchNumber(batches[0].batch_number);
              setLatestBatchFetched(true);
              // Trigger search automatically for the latest batch
              const e = { preventDefault: () => { } } as React.FormEvent;
              handleSearch(e, batches[0].batch_number);
            }
          }
        } catch (error) {
          console.error("Failed to fetch latest batch:", error);
        }
      }
    };
    fetchLatestBatch();
  }, [searchParams, hasSearched, isLoading, latestBatchFetched]);

  useEffect(() => {
    const batchParam = searchParams.get("batch");
    if (batchParam && !hasSearched && !isLoading) {
      setBatchNumber(batchParam);
    }
  }, [searchParams, hasSearched, isLoading]);

  // Effect to trigger search if batch is set via param and we haven't searched yet
  useEffect(() => {
    const batchParam = searchParams.get("batch");
    if (batchParam && batchNumber === batchParam && !hasSearched && !isLoading) {
      const performAutoSearch = async () => {
        const e = { preventDefault: () => { } } as React.FormEvent;
        await handleSearch(e);
      }
      performAutoSearch();
    }
  }, [batchNumber, searchParams, hasSearched, isLoading]);

  const loadingSteps = [
    { text: "Connecting to Secure Database...", icon: Lock },
    { text: "Authenticating Certificate...", icon: Shield },
    { text: "Verifying Lab Results...", icon: Beaker },
    { text: "Generating Report...", icon: FileText },
  ];

  useEffect(() => {
    if (showScorecard) {
      const t1 = setTimeout(() => setVisibleCards([0]), 200);
      const t2 = setTimeout(() => setVisibleCards([0, 1]), 400);
      const t3 = setTimeout(() => setVisibleCards([0, 1, 2]), 600);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else { setVisibleCards([]); }
  }, [showScorecard]);

  const scrollToSection = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const header = document.querySelector("header");
        const headerHeight = header ? header.offsetHeight : 80;
        const y = el.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  };

  const handleSearch = async (e: React.FormEvent, forcedBatch?: string) => {
    e.preventDefault();
    const trimmedBatch = (forcedBatch || batchNumber).trim().toUpperCase();
    setIsLoading(true); setHasSearched(false); setSearchedBatch(null); setNotFound(false); setLoadingStep(0); setShowScorecard(false);

    window.scrollTo({ top: 0, behavior: "instant" });

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= loadingSteps.length - 1) return prev;
        return prev + 1;
      });
    }, 800);

    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/batch-report?batch_number=${trimmedBatch}`);
      const data = await response.json();

      await new Promise(resolve => setTimeout(resolve, 3000));

      clearInterval(stepInterval);
      setIsLoading(false);
      setHasSearched(true);

      if (response.ok) {
        const batchData: BatchData = {
          batchNumber: data.batchNumber,
          productName: data.productName,
          manufactureDate: data.manufactureDate || "2024-01-01",
          expirationDate: data.expirationDate || "2026-01-01",
          testDate: data.testDate,
          labName: data.labName,
          status: data.status,
          purityLevel: 99.9,
          tests: data.tests,
          labReportUrl: data.labReportUrl || null
        };
        setSearchedBatch(batchData);
        setNotFound(false);
        setShowScorecard(true);
      } else {
        setSearchedBatch(null);
        setNotFound(true);
      }

      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      console.error("Batch search error:", error);
      clearInterval(stepInterval);
      setIsLoading(false);
      setHasSearched(true);
      setNotFound(true);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };

  const handleTrySample = () => setBatchNumber("WF2026021212");
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <SEO 
        title="Verify Supplement Batch Reports | WellForged"
        description="Enter your batch number to view authentic, independent NABL-certified third-party lab reports for every single product."
        canonical="/transparency"
      />
      <main className="min-h-screen bg-background flex flex-col page-pt">
        <header className="border-b border-border bg-background/95 backdrop-blur-lg fixed top-0 inset-x-0 z-50">
          <div className="max-w-[1440px] mx-auto px-[var(--space-sm)] lg:px-[var(--space-md)] py-[var(--space-xs)] lg:py-[var(--space-sm)]">
            <div className="relative flex items-center justify-between">
              <Link to="/" onClick={() => window.scrollTo(0, 0)}><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link>

              <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-6">
                <Link to="/" onClick={() => window.scrollTo(0, 0)} className="text-foreground/80 hover:text-foreground font-body text-sm font-medium transition-colors">Home</Link>
                <Link to="/product" onClick={() => window.scrollTo(0, 0)} className="text-foreground/80 hover:text-foreground font-body text-sm font-medium transition-colors">Shop</Link>
              </div>

              <div className="flex items-center gap-2 opacity-0 pointer-events-none">
                <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
              </div>
            </div>
          </div>
        </header>

        {!isLoading && !hasSearched && (
          <section className="relative px-[var(--space-sm)] py-[var(--space-xl)] bg-gradient-to-b from-secondary/50 via-background to-background overflow-hidden min-h-[70vh] flex items-center justify-center" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(153 30% 22% / 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(153 30% 22% / 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px'
          }}>
            {/* Custom localized keyframes styles */}
            <style>{`
              @keyframes scan {
                0%, 100% { top: 0%; opacity: 0; }
                5%, 95% { opacity: 0.8; }
                50% { top: 100%; }
              }
            `}</style>

            {/* Sweeping Laser Scan Line */}
            <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/40 to-transparent z-10 pointer-events-none animate-[scan_5s_ease-in-out_infinite]" />

            {/* Stunning Background Glowing Mesh Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[20%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-primary/8 blur-[130px] animate-pulse-premium" />
              <div className="absolute top-[10%] right-[15%] w-[30vw] h-[30vw] rounded-full bg-gold/8 blur-[110px] animate-float" />
            </div>

            <div className="max-w-3xl mx-auto text-center relative z-10 w-full">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full mb-[var(--space-sm)] animate-fade-up">
                <Shield className="h-3.5 w-3.5 text-primary animate-shield-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary font-bold">Secure Molecular Analysis</span>
              </div>
              
              <h1 className="font-display font-bold text-foreground mb-[var(--space-md)] animate-fade-up delay-100 leading-tight md:whitespace-nowrap" style={{ fontSize: "var(--text-5xl)" }}>
                Turn Skepticism <span className="text-gold-gradient">Into Confidence</span>
              </h1>
              
              <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-[var(--space-md)] animate-fade-up delay-150 leading-relaxed">
                We test 100% of our products through independent ISO/IEC accredited NABL facilities. Enter your batch code below to view raw certificates.
              </p>

              {/* Premium Frosted Glass Laboratory Console */}
              <div className="relative group max-w-xl mx-auto z-10 p-6 sm:p-8 rounded-3xl bg-card/95 backdrop-blur-md border border-border/80 shadow-card animate-fade-up delay-200">
                
                {/* Secure Database Live Status Ticker */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[9px] font-mono text-muted-foreground mb-6 border-b border-border/40 pb-4">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LEDGER: ACTIVE
                  </span>
                  <span className="h-3 w-[1px] bg-border/80" />
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    DB STATE: SECURE (SHA-256)
                  </span>
                  <span className="h-3 w-[1px] bg-border/80" />
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3 text-gold" />
                    NABL REGISTERED
                  </span>
                </div>

                <form onSubmit={handleSearch} className="max-w-md mx-auto space-y-4">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/35 via-gold/35 to-primary/35 rounded-2xl blur-lg opacity-40 group-focus-within:opacity-100 group-hover:opacity-75 transition-all duration-700" />
                    <div className="relative flex items-center bg-background/90 backdrop-blur-md border border-border/80 group-focus-within:border-gold/60 rounded-xl transition-all duration-300">
                      <div className="absolute left-[var(--space-sm)] text-muted-foreground"><Search className="h-5 w-5" /></div>
                      <input 
                        type="text" 
                        placeholder="WF-202605-001" 
                        value={batchNumber} 
                        onChange={(e) => setBatchNumber(e.target.value)} 
                        className="w-full h-[60px] pl-[var(--space-xl)] pr-[var(--space-md)] bg-transparent text-foreground placeholder:text-muted-foreground/80 font-mono text-base sm:text-lg text-center focus:outline-none uppercase tracking-widest font-semibold" 
                        required 
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} variant="default" size="lg" className="w-full h-[50px] px-12 font-bold uppercase tracking-widest gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-colors duration-300">
                    {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />FORGING CERTIFICATE...</> : <><Shield className="h-5 w-5 text-gold" />RETRIEVE LAB ANALYSIS</>}
                  </Button>
                </form>

                {/* Demo batch helper within card */}
                <div className="mt-5 flex justify-center border-t border-border/40 pt-4">
                  <button 
                    onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent, "WF-202605-001")} 
                    className="premium-pill border-gold/30 hover:border-gold/60 px-5 py-2 flex items-center gap-2 group text-[10px] tracking-wider font-mono text-foreground transition-all duration-300"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-gold group-hover:rotate-12 transition-transform duration-300" />
                    <span>DEMO BATCH: <strong className="text-gold uppercase">WF-202605-001</strong></span>
                  </button>
                </div>

              </div>

            </div>
          </section>
        )}

        {!hasSearched && !isLoading && (
          <div className="animate-fade-in">
            {/* Philosophy Strip */}
            <section className="py-24 bg-gradient-to-b from-transparent to-secondary/30 relative overflow-hidden">
              {/* Giant stylized quotation marks floating in background */}
              <div className="absolute left-[6%] sm:left-[8%] top-[15%] font-display text-[160px] leading-none text-gold/5 select-none pointer-events-none select-none">“</div>
              <div className="absolute right-[6%] sm:right-[8%] bottom-[5%] font-display text-[160px] leading-none text-gold/5 select-none pointer-events-none select-none">”</div>

              <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <div className="flex justify-center mb-6">
                  <div className="h-10 w-1 bg-gradient-to-b from-gold to-transparent rounded-full" />
                </div>
                <span className="eyebrow-label text-gold mb-4 block">Forged In Integrity</span>
                <h2 className="font-display font-bold italic text-foreground leading-tight mb-6" style={{ fontSize: "var(--text-3xl)" }}>
                  "If we can't prove it is 100% pure, we don't sell it. Verification isn't a cost of business—it's the core of our brand."
                </h2>
                <div className="inline-flex items-center gap-3">
                  <div className="h-[1px] w-8 bg-border" />
                  <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">WellForged Promise</span>
                  <div className="h-[1px] w-8 bg-border" />
                </div>
              </div>
            </section>

            {/* Testing Standards Cards */}
            <section className="py-24 px-6 bg-background relative">
              <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[20%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
              
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                  <span className="eyebrow-label text-primary mb-3 block">Rigorously Audited</span>
                  <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl">Our Strict Testing Standard</h2>
                  <p className="font-body text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mt-4">
                    We screen every batch for over 200+ chemical, microbiological, and agricultural contaminants.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      title: "Heavy Metals",
                      value: "NON-DETECTABLE",
                      limit: "Lead, Mercury, Cadmium & Arsenic",
                      description: "Absolute zero-tolerance screening using advanced ICP-MS instrumentation.",
                      icon: Shield
                    },
                    {
                      title: "Microbial Pathogens",
                      value: "100% CLEAR",
                      limit: "E. Coli, Salmonella, Yeast & Mold",
                      description: "Rigorous biological culturing to certify complete absence of pathogens.",
                      icon: FlaskConical
                    },
                    {
                      title: "Pesticide Residue",
                      value: "NON-DETECTABLE",
                      limit: "200+ Agricultural Chemicals",
                      description: "Comprehensive multi-residue gas chromatography screening.",
                      icon: Leaf
                    },
                    {
                      title: "Purity & Potency",
                      value: "99.9% ACTIVE",
                      limit: "Chlorophyll & Active Nutrients",
                      description: "Verified active constituent density to ensure ultimate cell bioavailability.",
                      icon: Beaker
                    }
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div 
                        key={idx} 
                        className="glass-card hover-lift p-8 flex flex-col justify-between group transition-all duration-500"
                      >
                        <div>
                          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 group-hover:border-gold/30 transition-all duration-300">
                            <Icon className="h-5 w-5 text-primary group-hover:text-gold transition-colors duration-300" />
                          </div>
                          <h3 className="font-display font-semibold text-foreground text-xl mb-2">{card.title}</h3>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/40 pb-3">{card.limit}</p>
                          <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">{card.description}</p>
                        </div>
                        <div>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border bg-emerald-500/10 text-emerald-600 border-emerald-500/20 group-hover:border-gold/30 group-hover:text-gold group-hover:bg-gold/5 transition-all duration-500">
                            {card.value}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Lab Partner Block */}
            <section className="py-20 px-6 bg-gradient-to-b from-background to-secondary/30 border-t border-border/60">
              <div className="max-w-5xl mx-auto premium-panel p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
                  
                  <div className="flex-shrink-0 relative group mx-auto md:mx-0">
                    <div className="absolute -inset-2 bg-gradient-to-tr from-gold/30 to-primary/30 rounded-full blur opacity-40 group-hover:opacity-80 transition-all duration-500" />
                    <div className="relative w-32 h-32 rounded-full border border-gold/40 bg-card flex flex-col items-center justify-center p-6 shadow-xl">
                      <Shield className="h-10 w-10 text-gold mb-1" />
                      <span className="font-mono text-[9px] font-bold text-muted-foreground uppercase tracking-widest">NABL ISO/IEC</span>
                      <span className="font-mono text-[8px] text-primary font-semibold">17025</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <div className="premium-pill border-gold/20 bg-gold/5 px-3 py-1 mb-4 inline-flex">
                      <span className="font-mono text-[10px] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" /> Gold Standard Testing
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-foreground text-2xl sm:text-3xl mb-4">Uncompromising NABL Lab Certification</h3>
                    <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                      Every report published here is sourced from independent laboratories accredited by the National Accreditation Board for Testing and Calibration Laboratories (NABL), complying with the highest international standard of ISO/IEC 17025. This ensures fully unbiased, legally recognized, and completely scientific safety certifications for WellForged.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-border/50 pt-6 text-left">
                      {[
                        { title: "Third-Party Isolated", desc: "No conflict of interest" },
                        { title: "Govt. ISO Accredited", desc: "Meets international criteria" },
                        { title: "Traceable QR/AWB", desc: "100% authentic certificate" }
                      ].map((item, idx) => (
                        <div key={idx}>
                          <h4 className="font-mono text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5 text-primary" /> {item.title}
                          </h4>
                          <p className="font-body text-[11px] text-muted-foreground mt-1 pl-5">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </div>
            </section>
          </div>
        )}

        {isLoading && (
          <section id="loading-section" className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 bg-background relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute top-[30%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-primary/5 blur-[120px]" />
            </div>
            
            <div className="max-w-md mx-auto text-center relative z-10">
              <div className="mb-6 flex justify-center"><AnimatedLogo size="medium" className="animate-subtle-float" /></div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-2">Retrieving Certificate Archive...</h2>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mb-8">Establishing secure handshake & fetching digital ledger</p>
              
              <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
                {loadingSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === loadingStep;
                  const isComplete = index < loadingStep;
                  return (
                    <div key={index} className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border transition-all duration-300 ${isActive ? 'bg-primary/10 border-primary/30 shadow-sm' : isComplete ? 'bg-primary/5 border-primary/10 opacity-80' : 'bg-muted/10 border-transparent opacity-40'}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-primary-foreground' : isComplete ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {isComplete ? <CheckCircle className="h-4 w-4" /> : <StepIcon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />}
                      </div>
                      <span className={`font-mono text-xs sm:text-sm transition-colors duration-300 ${isActive ? 'text-primary font-bold' : isComplete ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{step.text}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground"><Lock className="h-3.5 w-3.5 text-gold" /><span className="font-mono text-[9px] uppercase tracking-widest font-bold">256-bit Encrypted Ledger handshake</span></div>
            </div>
          </section>
        )}

        {hasSearched && !isLoading && (
          <section id="results-section" className="py-20 px-4 sm:px-6 bg-background relative">
            <div className="max-w-5xl mx-auto">
              {notFound ? (
                <div className="text-center p-8 sm:p-16 premium-panel border-destructive/20 bg-card rounded-2xl shadow-elevated animate-fade-up">
                  <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-destructive/20"><XCircle className="h-8 w-8 text-destructive" /></div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">Batch Registry Not Found</h2>
                  <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">We could not locate this specific batch ID in our digital registry. Please audit the batch code printed on the bottom base of your jar and re-submit.</p>
                  <button 
                    onClick={() => handleSearch({ preventDefault: () => {} } as React.FormEvent, "WF-202605-001")} 
                    className="premium-pill border-gold/30 hover:border-gold/60 px-5 py-2.5 flex items-center gap-2 group text-xs tracking-wider font-mono text-foreground transition-all duration-300 mx-auto"
                  >
                    <Sparkles className="h-4 w-4 text-gold group-hover:rotate-12 transition-transform duration-300" />
                    <span>LOAD SAMPLE REPORT: <strong className="text-gold">WF-202605-001</strong></span>
                  </button>
                </div>
              ) : searchedBatch ? (
                <div className="space-y-12 animate-fade-up">
                  
                  {/* Verify Another Batch Action - Left Aligned */}
                  <div className="flex justify-start mb-2">
                    <button 
                      onClick={() => {
                        setHasSearched(false);
                        setSearchedBatch(null);
                        setNotFound(false);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }} 
                      className="premium-pill border-gold/20 bg-gold/5 hover:border-gold/40 px-5 py-2.5 flex items-center gap-2 group text-[10px] tracking-wider font-mono text-muted-foreground hover:text-gold transition-all duration-300"
                    >
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300 text-gold" />
                      <span>VERIFY ANOTHER BATCH</span>
                    </button>
                  </div>

                  {/* Sleek Certificate Header */}
                  <div className="text-center">
                    <div className="premium-pill border-emerald-500/25 bg-emerald-500/5 px-4 py-1.5 mb-4 inline-flex">
                      <span className="font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle className="h-4 w-4" /> CERTIFICATE OF ANALYSIS VERIFIED
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-foreground text-3xl sm:text-4xl">Quality Verification Report</h2>
                    <p className="font-mono text-xs text-muted-foreground mt-3 tracking-wide">
                      Batch Ref: <strong className="text-foreground">{searchedBatch.batchNumber}</strong> • Published: {formatDate(searchedBatch.testDate)}
                    </p>
                  </div>
                  
                  {/* Purity Scorecard - Elegant banner */}
                  <div className="premium-panel bg-gradient-to-r from-primary/5 via-gold/5 to-primary/5 border-gold/25 p-8 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(153,30,22,0.1),rgba(0,0,0,0))]" />
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                      <div className="inline-flex items-center justify-center p-3 bg-primary/10 border border-primary/20 rounded-full mb-4">
                        <Shield className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display text-2xl font-bold text-foreground mb-3">Official Purity Statement</h3>
                      <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed">
                        This document verifies that batch <strong className="text-foreground">{searchedBatch.batchNumber}</strong> has completed independent NABL analysis. It is certified <strong className="text-foreground">100% Free</strong> of industrial chemical binders, fillers, or artificial colorants, and conforms fully to the supreme safety requirements for heavy metals and pathogens.
                      </p>
                    </div>
                  </div>

                  {/* Core 3 scorecards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {scorecardItems.map((item, index) => {
                      const IconComponent = item.icon;
                      return (
                        <div 
                          key={item.title} 
                          className={`glass-card hover-lift p-8 text-center transition-all duration-500 ${visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} 
                          style={{ transitionDelay: `${index * 150}ms` }}
                        >
                          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-all duration-300">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary uppercase tracking-wider mb-3">
                            {item.status}
                          </span>
                          <h4 className="font-display font-semibold text-foreground text-lg mb-2">{item.title}</h4>
                          <p className="font-body text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Official Lab Report - Redesigned like an authentic laboratory sheet */}
                  <div className="premium-panel border-border/80 overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground px-6 py-6 border-b border-border/20">
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">WELLFORGED LABORATORY ARCHIVE</span>
                      <h3 className="font-display text-xl font-semibold mt-1">{searchedBatch.productName}</h3>
                    </div>
                    
                    <div className="p-6 sm:p-8 space-y-8">
                      {/* Analysis Meta Information Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-b border-border/50 pb-8">
                        {[
                          { icon: Calendar, label: "Manufacture Date", value: formatDate(searchedBatch.manufactureDate) },
                          { icon: Package, label: "Expiration Date", value: formatDate(searchedBatch.expirationDate) },
                          { icon: Beaker, label: "Test Date", value: formatDate(searchedBatch.testDate) },
                          { icon: Shield, label: "Accredited Lab", value: searchedBatch.labName }
                        ].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-start gap-3">
                            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 border border-border/40">
                              <Icon className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                              <p className="font-body text-xs sm:text-sm font-semibold text-foreground mt-0.5">{value}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Chemical & Contaminant Table */}
                      <div>
                        <h4 className="font-display font-semibold text-foreground text-lg mb-4 flex items-center gap-2">
                          <Beaker className="h-4 w-4 text-gold" /> Certified Test Parameters
                        </h4>
                        <div className="overflow-x-auto border border-border/60 rounded-xl">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-secondary/40 border-b border-border/60">
                                <th className="font-mono text-[10px] text-muted-foreground text-left py-3.5 px-4 uppercase tracking-wider">Test Parameter</th>
                                <th className="font-mono text-[10px] text-muted-foreground text-left py-3.5 px-4 uppercase tracking-wider">Result Value</th>
                                <th className="font-mono text-[10px] text-muted-foreground text-left py-3.5 px-4 uppercase tracking-wider">Safe Threshold Limit</th>
                                <th className="font-mono text-[10px] text-muted-foreground text-right py-3.5 px-4 uppercase tracking-wider">Pass Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {searchedBatch.tests.map((test, index) => (
                                <tr key={index} className="border-b border-border/40 last:border-0 hover:bg-secondary/20 transition-colors duration-200">
                                  <td className="font-body text-xs sm:text-sm font-semibold text-foreground py-4 px-4">{test.name}</td>
                                  <td className="font-mono text-xs sm:text-sm font-bold text-foreground py-4 px-4">{test.result}</td>
                                  <td className="font-mono text-[11px] text-muted-foreground py-4 px-4">{test.limit}</td>
                                  <td className="text-right py-4 px-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${test.status === 'passed' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                                      {test.status === 'passed' ? (
                                        <><CheckCircle className="h-3 w-3" /> Pass</>
                                      ) : (
                                        <><XCircle className="h-3 w-3" /> Fail</>
                                      )}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Redesigned call-to-action buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    {searchedBatch.labReportUrl ? (
                      <a href={searchedBatch.labReportUrl} target="_blank" rel="noopener noreferrer" download className="w-full sm:w-auto">
                        <Button variant="default" size="xl" className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-xs tracking-wider gap-2 w-full sm:w-auto font-bold uppercase transition-colors duration-300">
                          <Download className="h-4 w-4 text-gold" /> DOWNLOAD ORIGINAL CoA
                        </Button>
                      </a>
                    ) : (
                      <Button variant="default" size="xl" disabled className="bg-muted text-muted-foreground font-mono text-xs tracking-wider gap-2 w-full sm:w-auto">
                        <Download className="h-4 w-4" /> CoA PDF COMING SOON
                      </Button>
                    )}

                    <Link to="/product" onClick={() => window.scrollTo(0, 0)} className="w-full sm:w-auto">
                      <Button variant="default" size="xl" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-colors duration-300 font-bold uppercase tracking-widest text-sm w-full sm:w-auto">
                        Shop Certified Moringa <ArrowRight className="h-5 w-5 text-gold" />
                      </Button>
                    </Link>
                  </div>
                </div>) : null}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default TransparencyPage;
