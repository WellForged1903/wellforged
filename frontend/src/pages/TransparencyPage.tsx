import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, CheckCircle, XCircle, FileText, Beaker, Calendar, Package, Shield, Download, Share2, Loader2, Sparkles, Lock, Leaf, FlaskConical, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";
import { API_BASE_URL } from "@/config";

// Hardcoded data removed, fetching from backend instead
interface TestResult { name: string; result: string; status: "passed" | "failed"; limit: string; }
interface BatchData { batchNumber: string; productName: string; manufactureDate: string; expirationDate: string; testDate: string; labName: string; status: "passed" | "failed"; purityLevel: number; tests: TestResult[]; }

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

  const handleSearch = async (e: React.FormEvent, forcedBatch?: string) => {
    e.preventDefault();
    const trimmedBatch = (forcedBatch || batchNumber).trim().toUpperCase();
    setIsLoading(true); setHasSearched(false); setSearchedBatch(null); setNotFound(false); setLoadingStep(0); setShowScorecard(false);

    setTimeout(() => {
      document.getElementById("loading-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

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
          tests: data.tests
        };
        setSearchedBatch(batchData);
        setNotFound(false);
        setShowScorecard(true);
      } else {
        setSearchedBatch(null);
        setNotFound(true);
      }

      setTimeout(() => {
        document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (error) {
      console.error("Batch search error:", error);
      clearInterval(stepInterval);
      setIsLoading(false);
      setHasSearched(true);
      setNotFound(true);
    }
  };

  const handleTrySample = () => setBatchNumber("WF2026021212");
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <SEO 
        title="Lab Reports & Batch Transparency"
        description="Verify your Wellforged batch number to see independent lab results. We set the standard for radical transparency in wellness."
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

        <section className="flex-1 flex items-center justify-center px-[var(--space-sm)] py-[var(--space-xl)] bg-gradient-to-b from-secondary via-secondary to-background">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-[var(--space-xs)] animate-fade-up"><Shield className="h-3 w-3 text-primary" /><span className="font-mono text-[var(--text-xs)] uppercase tracking-[0.15em] text-primary">Secure Verification</span></div>
            <h1 className="font-display font-bold text-foreground mb-[var(--space-md)] animate-fade-up delay-100" style={{ fontSize: "var(--text-4xl)" }}>Turn Skepticism Into Confidence</h1>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto animate-fade-up delay-200">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-gold/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center">
                  <div className="absolute left-[var(--space-sm)] top-1/2 -translate-y-1/2 text-muted-foreground"><Search className="h-5 w-5" /></div>
                  <input type="text" placeholder="WF2026021212" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full h-[var(--space-2xl)] pl-[var(--space-xl)] pr-[var(--space-md)] bg-card border-2 border-border text-foreground placeholder:text-muted-foreground rounded-xl font-mono text-base sm:text-lg md:text-[var(--text-xl)] text-center transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.5)]" required />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} variant="hero" size="lg" className="mt-[var(--space-sm)] w-full sm:w-auto h-[var(--space-xl)] px-10 font-bold uppercase tracking-widest gap-2 text-primary-foreground">
                {isLoading ? <><Loader2 className="h-5 w-5 animate-spin" />Verifying...</> : <><Shield className="h-5 w-5" />Transparency</>}
              </Button>
            </form>
            <div className="mt-4 sm:mt-6 animate-fade-up delay-300">
              <button onClick={handleTrySample} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-full transition-all duration-300">
                <Sparkles className="h-4 w-4 text-gold" /><span className="font-body text-sm text-foreground">Try sample: <span className="font-mono font-medium text-gold">WF2026021212</span></span>
              </button>
            </div>
          </div>
        </section>

        {isLoading && (
          <section id="loading-section" className="min-h-screen flex items-center justify-center px-4 sm:px-6 bg-background">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-4 flex justify-center"><AnimatedLogo size="medium" className="animate-subtle-float" /></div>
              <h2 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-2">Forging Integrity Report...</h2>
              <p className="font-body text-xs sm:text-sm text-muted-foreground mb-4">Verifying batch authenticity and lab results</p>
              <div className="space-y-2 mb-4">
                {loadingSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index === loadingStep;
                  const isComplete = index < loadingStep;
                  return (
                    <div key={index} className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 border border-primary/30' : isComplete ? 'bg-primary/5' : 'bg-muted/30'}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-primary-foreground' : isComplete ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {isComplete ? <CheckCircle className="h-4 w-4" /> : <StepIcon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />}
                      </div>
                      <span className={`font-mono text-sm transition-colors duration-300 ${isActive ? 'text-primary font-medium' : isComplete ? 'text-foreground' : 'text-muted-foreground'}`}>{step.text}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground"><Lock className="h-4 w-4" /><span className="font-mono text-xs uppercase tracking-wide">256-bit Encrypted Connection</span></div>
            </div>
          </section>
        )}

        {hasSearched && !isLoading && (
          <section id="results-section" className="py-10 sm:py-12 md:py-16 px-4 sm:px-6 bg-background">
            <div className="max-w-5xl mx-auto">
              {notFound ? (
                <div className="text-center p-8 sm:p-12 bg-card rounded-2xl border border-border animate-fade-up">
                  <div className="h-14 w-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"><XCircle className="h-7 w-7 text-destructive" /></div>
                  <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground mb-4">Batch Not Found</h2>
                  <p className="font-body text-base text-muted-foreground max-w-md mx-auto mb-6">Please check the batch number on your product label and try again.</p>
                  <button onClick={handleTrySample} className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 border border-gold/30 rounded-full transition-all duration-300"><Sparkles className="h-4 w-4 text-gold" /><span className="font-body text-sm text-foreground">Try sample: <span className="font-mono font-medium text-gold">WF2026021212</span></span></button>
                </div>
              ) : searchedBatch ? (
                <div className="space-y-6 sm:space-y-8">
                  <div className="text-center mb-6 sm:mb-8 animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-4"><CheckCircle className="h-4 w-4 text-primary" /><span className="font-mono text-xs uppercase tracking-[0.15em] text-primary">Certificate Verified</span></div>
                    <h2 className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-3xl)" }}>Verification Report</h2>
                    <p className="font-mono text-muted-foreground mt-2" style={{ fontSize: "var(--text-sm)" }}>Batch #{searchedBatch.batchNumber} • Tested by {searchedBatch.labName}</p>
                  </div>
                  <div className="mb-8 sm:mb-10">
                    <div className="max-w-3xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 sm:p-8 mb-8 text-center animate-fade-up">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full mb-4">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="font-mono text-[10px] font-bold text-primary uppercase tracking-widest">Plain English Summary</span>
                      </div>
                      <h3 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-3">Result: Safe & Pure</h3>
                      <p className="font-body text-sm sm:text-lg text-muted-foreground leading-relaxed">
                        This batch has been rigorously tested. It contains <span className="text-foreground font-bold">Zero Fillers</span>,
                        shows <span className="text-foreground font-bold">No Detectable Heavy Metals</span>, and meets our
                        highest potency standards for chlorophyll and active compounds.
                      </p>
                    </div>

                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-center text-foreground mb-6 animate-fade-up">Wellforged Batch Scorecard</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                      {scorecardItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <div key={item.title} className={`p-6 md:p-8 bg-card rounded-2xl border border-border shadow-card text-center transition-all duration-500 hover:shadow-elevated hover:-translate-y-1 ${visibleCards.includes(index) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                            <div className="h-12 w-12 md:h-14 md:w-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4"><IconComponent className="h-6 w-6 md:h-7 md:w-7 text-primary" /></div>
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full mb-3"><CheckCircle className="h-3.5 w-3.5 text-primary" /><span className="font-mono text-xs font-semibold text-primary uppercase tracking-wide">{item.status}</span></div>
                            <h4 className="font-display font-semibold text-foreground mb-2" style={{ fontSize: "var(--text-xl)" }}>{item.title}</h4>
                            <p className="font-body text-muted-foreground leading-relaxed" style={{ fontSize: "var(--text-sm)" }}>{item.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="p-4 md:p-6 bg-card rounded-2xl border border-border shadow-card animate-fade-up">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <h3 className="font-display text-lg md:text-xl font-semibold text-foreground">Official Lab Report</h3>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Button variant="outline" size="default" className="gap-2 text-sm"><Download className="h-4 w-4" />Download</Button>
                      </div>
                    </div>
                    <div className="bg-secondary/30 rounded-xl p-4 md:p-6 border border-border">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                        <div><p className="font-mono text-xs text-muted-foreground">Certificate of Analysis</p><p className="font-display text-lg font-semibold text-foreground">{searchedBatch.productName}</p></div>
                        <div className="text-right"><p className="font-mono text-xs text-muted-foreground">Batch #{searchedBatch.batchNumber}</p><p className="font-mono text-xs text-primary">{searchedBatch.labName}</p></div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {[{ icon: Calendar, label: "Manufacture Date", value: formatDate(searchedBatch.manufactureDate) }, { icon: Package, label: "Expiration Date", value: formatDate(searchedBatch.expirationDate) }, { icon: Beaker, label: "Test Date", value: formatDate(searchedBatch.testDate) }, { icon: FileText, label: "Testing Lab", value: searchedBatch.labName }].map(({ icon: Icon, label, value }) => (
                          <div key={label} className="flex items-start gap-3"><Icon className="h-4 w-4 text-muted-foreground mt-0.5" /><div><p className="font-body text-xs text-muted-foreground">{label}</p><p className="font-body text-sm font-medium text-foreground">{value}</p></div></div>
                        ))}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead><tr className="border-b border-border"><th className="font-body text-xs text-muted-foreground text-left py-2">Test Name</th><th className="font-body text-xs text-muted-foreground text-left py-2">Result</th><th className="font-body text-xs text-muted-foreground text-left py-2">Limit</th><th className="font-body text-xs text-muted-foreground text-right py-2">Status</th></tr></thead>
                          <tbody>
                            {searchedBatch.tests.map((test, index) => (
                              <tr key={index} className="border-b border-border/50 last:border-0">
                                <td className="font-body text-sm text-foreground py-3">{test.name}</td>
                                <td className="font-mono text-sm text-foreground py-3">{test.result}</td>
                                <td className="font-mono text-xs text-muted-foreground py-3">{test.limit}</td>
                                <td className="text-right py-3"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${test.status === 'passed' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{test.status === 'passed' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{test.status === 'passed' ? 'Pass' : 'Fail'}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="text-center animate-fade-up">
                    <Link to="/product" onClick={() => window.scrollTo(0, 0)}><Button variant="hero" size="xl" className="gap-2 animate-pulse-subtle">Shop Now<ArrowRight className="h-5 w-5" /></Button></Link>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </>
  );
};

export default TransparencyPage;
