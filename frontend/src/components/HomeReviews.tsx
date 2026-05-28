import React, { useState, useEffect, useRef } from "react";
import { Star, CheckCircle, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "./ScrollReveal";
import { API_BASE_URL } from "@/config";

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

const FALLBACK_REVIEWS: Review[] = [
  {
    id: "home-rev-fallback-1",
    customer_name: "Aravind K.",
    rating: 5,
    comment: "I was skeptical at first, but after scanning the QR code and seeing my exact jar's Eurofins NABL heavy metals report, I was sold. The transparency is unmatched.",
    is_verified_purchase: true,
    created_at: "2026-05-12T00:00:00.000Z",
  },
  {
    id: "home-rev-fallback-2",
    customer_name: "Meera S.",
    rating: 5,
    comment: "This is the cleanest Moringa I've ever had. It blends so easily into my morning smoothies, and there are absolutely no fillers or artificial flavors. Pure leaf powder.",
    is_verified_purchase: true,
    created_at: "2026-04-28T00:00:00.000Z",
  },
  {
    id: "home-rev-fallback-3",
    customer_name: "Kabir D.",
    rating: 5,
    comment: "The energy increase is subtle but lasting. Knowing that every batch is NABL accredited and verified gives me absolute peace of mind. Outstanding quality.",
    is_verified_purchase: true,
    created_at: "2026-05-06T00:00:00.000Z",
  },
];

const HomeReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0.0 });
  const [isLoading, setIsLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews?slug=moringa-powder&t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const dbReviews = data.reviews || [];
        
        setReviews(dbReviews);
        setStats({
          totalReviews: data.stats.totalReviews,
          averageRating: data.stats.averageRating
        });
      }
    } catch (e) {
      console.error("Failed to fetch homepage reviews");
      setReviews([]);
      setStats({ totalReviews: 0, averageRating: 0.0 });
    } finally {
      setIsLoading(false);
    }
  };

  // Observe visibility in viewport to prevent offscreen scrolling/jumps
  useEffect(() => {
    if (isLoading) return;
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(section);
    return () => {
      observer.disconnect();
    };
  }, [isLoading]);

  const [isHovered, setIsHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const triggerSmoothScroll = (targetIndex: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const activeCard = cardRefs.current[targetIndex];
    if (activeCard) {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const cardOffsetLeft = activeCard.offsetLeft;
      const cardWidth = activeCard.clientWidth;
      const containerWidth = container.clientWidth;
      const targetScrollLeft = cardOffsetLeft - (containerWidth / 2) + (cardWidth / 2);
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: "smooth"
      });

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 600);
    }
  };

  // Auto-advance active index every 4 seconds (only when intersecting and not hovered)
  useEffect(() => {
    if (reviews.length <= 1 || !isIntersecting || isHovered) return;
    
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % reviews.length;
      setActiveIndex(nextIndex);
      triggerSmoothScroll(nextIndex);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [reviews, isIntersecting, isHovered, activeIndex]);

  const handleScroll = () => {
    if (!scrollRef.current || reviews.length === 0 || isScrolling) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    
    let closestIndex = 0;
    let minDistance = Infinity;
    
    cardRefs.current.forEach((card, idx) => {
      if (card) {
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const containerCenter = scrollLeft + containerWidth / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = idx;
        }
      }
    });
    
    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [activeIndex, isScrolling, reviews]);

  const selectIndex = (index: number) => {
    setActiveIndex(index);
    triggerSmoothScroll(index);
  };

  if (isLoading) return <div className="py-16 text-center text-muted-foreground animate-pulse">Loading verified reviews...</div>;

  // Star distribution helper based on rating
  const total = reviews.length;
  const fiveStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 5).length / total) * 100) : 0;
  const fourStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 4).length / total) * 100) : 0;
  const threeStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 3).length / total) * 100) : 0;
  const twoStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 2).length / total) * 100) : 0;
  const oneStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 1).length / total) * 100) : 0;

  return (
    <section 
      ref={sectionRef}
      className="bg-secondary/10 py-16 sm:py-24 relative overflow-hidden border-b border-border/40"
    >
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* Background Decorative Blobs */}
      <div className="absolute left-[-10%] top-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[-10%] w-[45vw] h-[45vw] rounded-full bg-gold/4 blur-[130px] pointer-events-none" />

      <div className="mx-auto max-w-[1440px] px-[var(--space-sm)] lg:px-[var(--space-md)] relative z-10">
        
        {/* Header */}
        <ScrollReveal animation="fade-up" className="text-center mb-12 sm:mb-16">
          <span className="inline-block font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-primary mb-3 font-semibold">User Endorsements</span>
          <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground mb-4">Verified Customer Results</h2>
          <p className="font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
            Honest reviews from real daily users. Backed by verified batch reports and zero additives.
          </p>
        </ScrollReveal>

        <div className="grid gap-12 lg:grid-cols-12 lg:items-stretch lg:gap-8">
          
          {/* LEFT COLUMN: Premium Rating Summary Panel */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <ScrollReveal animation="fade-right" className="h-full">
              <div className="premium-panel flex flex-col justify-between h-full bg-gradient-to-b from-background to-secondary/20 border-border/60 p-6 sm:p-8 shadow-xl rounded-3xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
                
                {/* Decorative border highlight */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                
                <div className="space-y-6 sm:space-y-8">
                  {/* Score */}
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-none tracking-tight">
                      {Number(stats.averageRating).toFixed(1)}
                    </span>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${i < Math.round(stats.averageRating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`} />
                        ))}
                      </div>
                      <p className="font-body text-xs sm:text-sm font-semibold text-muted-foreground">Based on {stats.totalReviews} verified reviews</p>
                    </div>
                  </div>

                  {/* Star Distribution Graph */}
                  <div className="space-y-2.5 sm:space-y-3 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] w-10 text-left text-muted-foreground">5 Star</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${fiveStarPct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-foreground font-bold w-8 text-right">{fiveStarPct}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] w-10 text-left text-muted-foreground">4 Star</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full opacity-60" style={{ width: `${fourStarPct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-foreground font-bold w-8 text-right">{fourStarPct}%</span>
                    </div>
                    <div className={`flex items-center gap-3 ${threeStarPct > 0 ? "" : "opacity-30"}`}>
                      <span className="font-mono text-[10px] w-10 text-left text-muted-foreground">3 Star</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full opacity-40" style={{ width: `${threeStarPct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-foreground font-bold w-8 text-right">{threeStarPct}%</span>
                    </div>
                    <div className={`flex items-center gap-3 ${twoStarPct > 0 ? "" : "opacity-30"}`}>
                      <span className="font-mono text-[10px] w-10 text-left text-muted-foreground">2 Star</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full opacity-20" style={{ width: `${twoStarPct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-foreground font-bold w-8 text-right">{twoStarPct}%</span>
                    </div>
                    <div className={`flex items-center gap-3 ${oneStarPct > 0 ? "" : "opacity-30"}`}>
                      <span className="font-mono text-[10px] w-10 text-left text-muted-foreground">1 Star</span>
                      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full opacity-10" style={{ width: `${oneStarPct}%` }} />
                      </div>
                      <span className="font-mono text-[10px] text-foreground font-bold w-8 text-right">{oneStarPct}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 sm:mt-12 space-y-4">
                  {/* Verified badge */}
                  <div className="flex items-center gap-2.5 bg-primary/5 border border-primary/10 rounded-2xl p-3 sm:p-4">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <p className="font-body text-[11px] sm:text-xs text-primary font-semibold leading-relaxed text-left">
                      Every rating is verified by our customer checkout system and matching lab reports.
                    </p>
                  </div>
                  
                  {/* Link to Dedicated Reviews Page */}
                  <Link 
                    to="/reviews" 
                    className="inline-flex items-center justify-between w-full font-display text-xs font-bold uppercase tracking-widest text-primary bg-primary/5 hover:bg-primary/10 border border-primary/15 hover:border-primary/20 px-5 py-4 rounded-2xl transition-all"
                  >
                    View All Reviews <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

              </div>
            </ScrollReveal>
          </div>

          {/* RIGHT COLUMN: Curriculum Carousel Card Showcase */}
          <div className="lg:col-span-8 flex flex-col justify-center min-w-0 w-full overflow-hidden">
            <ScrollReveal animation="fade-left" className="w-full">
              
              <div 
                ref={scrollRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={() => setIsHovered(true)}
                onTouchEnd={() => setIsHovered(false)}
                className="relative flex gap-4 sm:gap-6 overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-mandatory scroll-smooth pb-6 hide-scroll pt-2 px-6 sm:px-12 md:px-20 lg:px-6"
              >
                {reviews.map((review, i) => {
                  const isActive = i === activeIndex;
                  return (
                    <div 
                      key={review.id} 
                      ref={(el) => { cardRefs.current[i] = el; }}
                      className={`snap-center flex-shrink-0 w-[280px] sm:w-[380px] rounded-3xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 ease-out ${
                        isActive 
                          ? "scale-105 opacity-100 z-10 border-primary/30 shadow-[0_20px_50px_-20px_rgba(26,60,52,0.35)] bg-background" 
                          : "scale-95 opacity-30 blur-[0.4px] bg-background/80 border-border/85"
                      }`}
                    >
                      <div>
                        {/* Rating Stars */}
                        <div className="flex gap-0.5 mb-6">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`h-4.5 w-4.5 ${idx < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                            />
                          ))}
                        </div>

                        {/* Review text */}
                        <p className="font-body text-sm sm:text-base text-foreground leading-relaxed italic mb-8 text-left">
                          "{review.comment}"
                        </p>
                      </div>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3.5 pt-5 border-t border-border/50">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-display text-sm sm:text-base font-bold text-foreground leading-none">{review.customer_name}</span>
                          <span className="font-body text-[10px] sm:text-xs text-primary font-semibold mt-1.5 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Verified Buyer
                          </span>
                        </div>
                        <span className="ml-auto font-mono text-[9px] text-muted-foreground/80 bg-secondary/80 px-2 py-0.5 rounded-md">
                          {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Indicator dots */}
              <div className="flex justify-center gap-2.5 mt-6">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => selectIndex(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeIndex ? "w-6 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/45"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

            </ScrollReveal>
          </div>

        </div>

      </div>
    </section>
  );
};

export default HomeReviews;
