import React, { useState, useEffect, useRef, useCallback } from "react";
import SEO from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { Check, Leaf, Shield, FlaskConical, QrCode, Globe, CheckCircle, ChevronLeft, ChevronRight, Sparkles, Clock3, HeartHandshake, ArrowRight, CheckCircle2, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import ProductSelector from "@/components/ProductSelector";
import ReviewsSection from "@/components/ReviewsSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageLoader from "@/components/PageLoader";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/config";
import type { HighlightPill, ProductData } from "@/types/store";
import productImage1 from "@/assets/product-carousel-1.jpg";
import productImage2 from "@/assets/product-carousel-2.jpg";
import productImage3 from "@/assets/product-carousel-3.jpg";
import productImage4 from "@/assets/product-carousel-4.jpg";
import productImage5 from "@/assets/product-carousel-5.jpg";
import { imageErrorFallback } from "@/utils/images";

interface TechnicalSpecDetail {
  label: string;
  value: string;
}

interface TechnicalSpecGroup {
  icon: typeof Globe;
  title: string;
  details: TechnicalSpecDetail[];
}

const ProductPage = () => {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const selectorRef = useRef<HTMLDivElement>(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);

  // Setup Intersection Observer for Sticky CTA
  useEffect(() => {
    if (!selectorRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky CTA only when the main selector scrolls out of view upwards
        setShowStickyCTA(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0, rootMargin: "-100px 0px 0px 0px" }
    );
    observer.observe(selectorRef.current);
    return () => observer.disconnect();
  }, [product]);

  const slug = "moringa-powder";

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${slug}`);
        if (response.ok) {
          const data = (await response.json()) as ProductData;
          setProduct(data);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleProcessTransition = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate("/transparency");
      window.scrollTo(0, 0);
    }, 800);
  };

  const carouselImages = [productImage1, productImage2, productImage3, productImage4, productImage5];
  const productImages = carouselImages;

  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    if (productImages.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
    }, 3200);
  }, [productImages.length]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [startAutoPlay]);

  const goTo = (idx: number) => {
    setCurrentImageIndex(idx);
    startAutoPlay();
  };
  const nextImage = () => goTo((currentImageIndex + 1) % productImages.length);
  const prevImage = () => goTo((currentImageIndex - 1 + productImages.length) % productImages.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }
  };

  // Hardcode highlights to prevent duplication from backend metadata
  const trustHighlights: HighlightPill[] = [
    { icon: Leaf, label: "Single Origin" },
    { icon: Shield, label: "No Additives" },
    { icon: FlaskConical, label: "Lab Tested" },
    { icon: QrCode, label: "Batch Verified" },
  ];

  const ingredients =
    product?.metadata
      ?.filter((m) => m.category === "ingredient")
      .map((m) => ({
        icon: Leaf,
        name: m.key,
      })) || [{ icon: Leaf, name: "Moringa Oleifera" }];

  const specs = product?.metadata?.filter((m) => m.category === "spec") || [];
  const technicalSpecs: Record<string, TechnicalSpecGroup> = {
    overview: {
      icon: Globe,
      title: "Technical Overview",
      details: specs.map((s) => ({ label: s.key, value: s.value })),
    },
  };

  const faqs =
    product?.faqs?.length > 0
      ? product.faqs
      : [{ question: "Is this product lab tested?", answer: "Yes, every batch undergoes independent third-party laboratory testing." }];

  if (isLoading) {
    return <PageLoader />;
  }

  const productName = product?.name || "Pure Moringa Leaf Powder";
  const productDescription = product?.base_description || "Wellforged Moringa Leaf Powder - Clean, single-ingredient moringa powder crafted with disciplined sourcing and verified lab quality.";
  const canonicalUrl = "https://www.wellforged.in/product";
  const seoTitle = `${productName} | Clean Single-Ingredient Wellness`;

  return (
    <>
      <SEO 
        title={seoTitle}
        description={productDescription}
        canonical={canonicalUrl}
        ogType="product"
        ogImage="/Packaging_Updated.png"
        jsonLd={{
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": `Wellforged ${productName}`,
          "image": [
            productImage1,
            "https://www.wellforged.in/Packaging_Updated.png"
          ],
          "description": productDescription,
          "sku": slug,
          "mpn": "WF-MOR-01",
          "brand": {
            "@type": "Brand",
            "name": "Wellforged"
          },
          "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "INR",
            "price": "499",
            "availability": "https://schema.org/InStock",
            "itemCondition": "https://schema.org/NewCondition"
          }
        }}
      />
      <Navbar />
      <main className="min-h-screen bg-background pb-20 pt-16 sm:pb-0 sm:pt-20">
        <section className="py-4 sm:py-6">
          <div className="mx-auto max-w-[1440px] px-[var(--space-sm)] lg:px-[var(--space-md)]">
            <div className="grid items-start gap-[var(--space-md)] lg:grid-cols-2 lg:gap-[var(--space-xl)]">
              <div className="lg:sticky lg:top-24 lg:self-start min-w-0">
                <ScrollReveal animation="fade-right">
                  <div
                    className="group relative mx-auto w-full max-w-[400px] select-none sm:max-w-[500px] lg:max-w-[580px]"
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                  >
                    <div className="premium-panel relative aspect-square overflow-hidden bg-[#f6f8f5]">
                      <div className="absolute left-4 top-4 z-10 rounded-full bg-background/85 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur-sm">
                        View {currentImageIndex + 1} / {productImages.length}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          prevImage();
                        }}
                        className="absolute left-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 hover:bg-white"
                      >
                        <ChevronLeft className="h-4 w-4 text-foreground" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          nextImage();
                        }}
                        className="absolute right-2 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/85 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 hover:bg-white"
                      >
                        <ChevronRight className="h-4 w-4 text-foreground" />
                      </button>

                      <div
                        className="flex h-full transition-transform will-change-transform"
                        style={{
                          transitionDuration: "800ms",
                          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // Expo Out - very smooth & premium
                          transform: `translateX(-${currentImageIndex * (100 / productImages.length)}%)`,
                          width: `${productImages.length * 100}%`,
                        }}
                      >
                        {productImages.map((img, i) => (
                          <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / productImages.length}%` }}>
                            <img
                              src={img}
                              alt={`Wellforged ${product?.name || "Product"} - Detailed View ${i + 1}`}
                              loading={i === 0 ? "eager" : "lazy"}
                              className="h-full w-full object-contain p-6 sm:p-10"
                              onError={imageErrorFallback}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {productImages.length > 1 && (
                      <div className="mt-3 grid grid-cols-5 gap-2">
                        {productImages.slice(0, 5).map((img, i) => (
                          <button
                            key={i}
                            onClick={() => goTo(i)}
                            aria-label={`Wellforged product thumbnail ${i + 1}`}
                            className={`overflow-hidden rounded-2xl border transition-all duration-500 ease-out ${
                              i === currentImageIndex ? "border-primary shadow-[0_12px_24px_-18px_hsl(var(--primary)/0.45)]" : "border-border/80 opacity-75 hover:opacity-100"
                            }`}
                          >
                            <div className="aspect-square bg-[#f6f8f5] p-1.5">
                              <img
                                src={img}
                                alt={`Wellforged ${product?.name || "Product"} Preview ${i + 1}`}
                                className="h-full w-full object-contain"
                                onError={imageErrorFallback}
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              </div>

              <div className="space-y-4 sm:space-y-5 lg:space-y-6 min-w-0">
                <ScrollReveal animation="fade-left">
                  <div className="mb-2 space-y-3">
                    <span className="eyebrow-label text-primary font-bold">Wellforged Standard</span>
                    <h1 className="font-display text-foreground" style={{ fontSize: "clamp(1.9rem, 5vw, 2.9rem)", lineHeight: 1.05 }}>
                      {product?.name || "Pure Moringa Powder"}
                    </h1>
                    
                    {/* Dynamic/Hardcoded Stars linking to Review Section */}
                    <div 
                      className="flex items-center gap-2 cursor-pointer group w-fit" 
                      onClick={() => document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      <div className="flex text-[#FFB800]">
                        {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                      </div>
                      <span className="font-body text-xs font-medium text-primary group-hover:underline">
                        4.8/5 Rating
                      </span>
                    </div>
                    <p className="max-w-xl font-body text-muted-foreground" style={{ fontSize: "var(--text-base)", lineHeight: 1.72 }}>
                      {product?.base_description ||
                        "Pure, nutrient-rich moringa powder lab tested, free from fillers, and crafted to deliver clean daily nourishment."}
                    </p>
                    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 no-scrollbar sm:gap-3">
                      {trustHighlights.map(({ icon: Icon, label }, index) => (
                        <span key={`${label}-${index}`} className="premium-pill flex-shrink-0 gap-1.5 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-primary sm:text-[0.7rem]">
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal animation="fade-up">
                  <div ref={selectorRef} className="premium-panel border-gold/20 bg-gradient-to-b from-card to-secondary/30 p-4 shadow-gold sm:p-5">
                    <ProductSelector product={product as ProductData} />
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Philosophy (Why We Chose Moringa) */}
        <section className="premium-hover-gold border-y border-border/50 bg-secondary/15 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <div className="space-y-6 text-center">
                <p className="eyebrow-label text-primary">Ingredient Philosophy</p>
                <h2 className="section-title text-foreground" style={{ fontSize: "var(--text-3xl)" }}>Why We Chose Moringa</h2>
                <p className="section-copy text-balance leading-relaxed text-muted-foreground" style={{ fontSize: "var(--text-lg)" }}>
                  Moringa has long been valued as a nutrient-dense plant ingredient. We chose moringa for its versatility, simplicity, and alignment with our clean nutrition philosophy—disciplined sourcing and absolute purity.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Section 2: Product Differentiators */}
        <section className="premium-hover-gold border-b border-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <div className="mb-12 text-center">
                <p className="eyebrow-label text-gold">The wellforged Advantage</p>
                <h2 className="section-title text-foreground">What Makes This Product Different</h2>
              </div>
              <div className="mx-auto max-w-3xl space-y-4">
                {[
                  "Single-ingredient formulation with no hidden blends",
                  "Verified potency: processed under controlled cold-drying protocols",
                  "Finely triple-milled for smooth texture and superior blending",
                  "Each batch independently lab tested for heavy metals and purity",
                ].map((item, index) => (
                  <div key={index} className="premium-panel group flex items-start gap-4 p-5 transition-all duration-300 hover:border-primary/30">
                    <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-body text-base font-medium text-foreground sm:text-lg">{item}</span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Section 3: Ideal Audience (Who is it for) */}
        <section className="premium-hover-gold border-b border-border/50 bg-primary/[0.02] py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-right">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div className="space-y-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <HeartHandshake className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Who Is It For?</h2>
                  <p className="font-body text-lg leading-relaxed text-muted-foreground">
                    Perfect for those seeking an uncomplicated greens habit without the clutter of sweeteners, flavors, or artificial blends. 
                    If you value ingredient integrity over over-engineered marketing, you've found your daily ritual.
                  </p>
                </div>
                <div className="premium-panel bg-background/50 p-8 shadow-sm">
                   <ul className="space-y-4">
                     {["Clean Label Enthusiasts", "Minimalist Nutrition Seekers", "Daily Habit Builders", "Transparent Quality Advocates"].map((tp) => (
                       <li key={tp} className="flex items-center gap-3 font-display text-sm font-semibold tracking-wide text-primary">
                         <CheckCircle2 className="h-4 w-4" /> {tp}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Section 4: Usage (How to use) */}
        <section className="premium-hover-gold border-b border-border/50 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-left">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                 <div className="order-2 premium-panel bg-secondary/10 p-1 lg:order-1">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted/20">
                      <img src={productImage2} className="h-full w-full object-cover opacity-80" alt="Moringa Ritual" />
                    </div>
                 </div>
                 <div className="order-1 space-y-6 lg:order-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Sparkles className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">How to Use</h2>
                    <p className="font-body text-lg leading-relaxed text-muted-foreground">
                      Add one spoon to water, smoothies, or curd. The ritual is simple: mix well and consume immediately. 
                      Consistency is key—integrated it into your morning routine for the best long-term wellness impact.
                    </p>
                 </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Section 5: The Experience (Expected Experience) */}
        <section className="premium-hover-gold border-b border-border/50 bg-secondary/5 py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <div className="space-y-10 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Clock3 className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-4">
                  <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">The Expected Experience</h2>
                  <p className="mx-auto max-w-2xl font-body text-lg leading-relaxed text-muted-foreground">
                    Our moringa is earthy and neutral—just as nature intended. You'll notice a fine, consistent texture that blends smoothly. 
                    Expect a habit that feels grounded, clean, and entirely sustainable without the 'crash' or gimmicks.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* Section 6: Technical Specs (Transparency Refined) */}
        <section className="bg-background py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <div className="mb-14 text-center">
                <span className="eyebrow-label text-gold">Public Quality Assurance</span>
                <h2 className="section-title mb-4 text-gold-gradient">Technical Specifications</h2>
                <p className="section-copy mx-auto max-w-2xl">
                  Every batch is backed by rigorous documentation. View sourcing and purity metrics below.
                </p>
              </div>
            </ScrollReveal>
            <div className="mx-auto max-w-4xl space-y-6">
              {Object.values(technicalSpecs).map((spec, index) => (
                <div key={spec.title} className="premium-panel overflow-hidden border-border/60 bg-card p-0 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex border-b border-border/50 bg-secondary/30 px-6 py-5 sm:px-8 sm:py-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                       <spec.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-5">
                      <h3 className="font-display text-lg font-bold text-foreground sm:text-xl">{spec.title}</h3>
                      <p className="font-body text-xs text-muted-foreground">Verified Laboratory Standards</p>
                    </div>
                  </div>
                  <div className="px-6 py-6 sm:px-8 sm:py-8">
                    <ul className="grid gap-x-12 gap-y-1.5 sm:grid-cols-2">
                       {spec.details.map((detail, i) => (
                         <li key={i} className="flex items-center justify-between border-b border-border/20 py-2.5 last:border-0 sm:last:border-b">
                            <span className="font-body text-sm text-muted-foreground">{detail.label}</span>
                            <span className="text-right font-display text-sm font-bold text-foreground">{detail.value}</span>
                         </li>
                       ))}
                    </ul>
                    <div className="mt-8 flex justify-center border-t border-border/50 pt-8">
                       <button 
                        onClick={() => navigate("/transparency")}
                        className="inline-flex items-center gap-2 font-display text-[var(--text-xs)] font-bold uppercase tracking-widest text-primary transition-all hover:gap-3 hover:text-primary/80"
                       >
                         <QrCode className="h-4 w-4" /> Verify Spec Benchmarks & Reports <ArrowRight className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 7: FAQ (Restored) */}
        <section className="bg-secondary/30 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <p className="eyebrow-label text-center">Need Clarity</p>
              <h2 className="section-title mb-4 text-center sm:mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="premium-panel bg-background px-5 py-2 transition-all hover:border-primary/30">
                    <AccordionTrigger className="py-4 text-left font-display text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 border-t border-border/30 pt-4 font-body text-sm leading-relaxed text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollReveal>
          </div>
        </section>

        <section className="relative overflow-hidden bg-primary/5 pb-24 pt-10 sm:py-14 sm:pb-14 lg:py-20 lg:pb-20">
          <div className={`pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-primary transition-all duration-700 ${isTransitioning ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}>
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <Shield className="h-12 w-12 animate-shield-pulse text-primary-foreground sm:h-16 sm:w-16" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-bold text-primary-foreground sm:text-3xl">Accessing Transparency Forge</h2>
              <div className="mx-auto h-1 w-48 overflow-hidden rounded-full bg-primary-foreground/20">
                <div className="h-full animate-shimmer-sweep bg-primary-foreground" />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-4xl px-3 sm:px-6 lg:px-8">
            <ScrollReveal animation="scale">
              <div className="space-y-4 text-center sm:space-y-6">
                <p className="eyebrow-label text-center">Start Your Ritual</p>
                <h2 className="section-title">Ready to Experience Clean Nutrition?</h2>
                <p className="section-copy mx-auto max-w-2xl px-2">Join thousands who trust Wellforged for their daily wellness routine.</p>
                <div className="flex justify-center">
                  <button
                    onClick={handleProcessTransition}
                    className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-input bg-background px-5 py-2 text-sm font-medium ring-offset-background transition-colors hover:border-primary/30 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:w-auto"
                  >
                    Learn About Our Process
                  </button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {product && <ReviewsSection productId={product.id.toString()} />}

      {/* Sticky Mobile Add-to-Cart Footer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 p-3 pb-safe backdrop-blur-md transition-transform duration-300 ease-in-out lg:hidden ${
          showStickyCTA ? "translate-y-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]" : "translate-y-full"
        }`}
        style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="font-display text-sm font-bold text-foreground line-clamp-1">{product?.name || "Moringa Powder"}</span>
            <span className="font-body text-xs font-semibold text-primary">From Rs {product?.variants?.[0]?.price || 349}</span>
          </div>
          <Button 
            variant="hero" 
            className="btn-glow h-11 px-6 font-bold uppercase tracking-widest text-xs animate-pulse-subtle active:scale-95 transition-transform"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // Small delay to let the scroll start before we focus attention
              setTimeout(() => {
                const selectorBtn = selectorRef.current?.querySelector('button[variant="hero"]') as HTMLButtonElement;
                if (selectorBtn) {
                  selectorBtn.classList.add('ring-4', 'ring-gold/50', 'ring-offset-2');
                  setTimeout(() => selectorBtn.classList.remove('ring-4', 'ring-gold/50', 'ring-offset-2'), 1000);
                }
              }, 300);
            }}
          >
            Buy Now
          </Button>
        </div>
      </div>

        <Footer />
      </main>
    </>
  );
};

export default ProductPage;
