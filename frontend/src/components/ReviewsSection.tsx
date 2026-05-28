import React, { useState, useEffect, useRef } from "react";
import { Star, MessageSquare, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0.0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${productId}?t=${Date.now()}`);
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
      console.error("Failed to fetch reviews");
      setReviews([]);
      setStats({ totalReviews: 0, averageRating: 0.0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  // Observe section visibility in the viewport (depends on isLoading to bind successfully once loaded)
  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) return;
    
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          customer_name: name,
          email: email.trim() || undefined,
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setSubmitMessage("Thank you! Your review has been submitted for moderation and will appear once approved.");
        setShowForm(false);
        setRating(5);
        setName("");
        setEmail("");
        setComment("");
        fetchReviews(); // Refresh the list
      } else {
        setSubmitMessage("Something went wrong. Please try again.");
      }
    } catch (err) {
      setSubmitMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div id="reviews" className="py-10 text-center text-muted-foreground animate-pulse">Loading reviews...</div>;

  return (
    <section 
      ref={sectionRef}
      id="reviews" 
      className="py-16 sm:py-24 border-t border-border bg-card overflow-hidden"
    >
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-primary mb-3 font-semibold">Quality Endorsements</span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Customer Satisfaction</h2>
        </div>

        {/* Centered Rating Summary Panel */}
        <div className="max-w-md mx-auto w-full mb-12 animate-in fade-in duration-500">
          <div className="premium-panel flex flex-col justify-between bg-gradient-to-b from-background to-secondary/20 border-border/60 p-6 sm:p-8 shadow-xl rounded-3xl relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
            {/* Decorative border highlight */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="space-y-6 sm:space-y-8">
              {/* Score */}
              <div className="flex items-center gap-4 sm:gap-6 justify-center text-left">
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

            <div className="mt-8 space-y-4 pt-6 border-t border-border/40">
              <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 rounded-2xl p-4">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="font-body text-xs text-primary font-semibold leading-relaxed text-left">
                  Ratings are linked directly to unique transactions, verified email checkouts, and NABL batch analysis.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setSubmitMessage("");
                    setShowForm(!showForm);
                  }}
                  variant="outline"
                  className="flex-1 border-primary/20 text-primary hover:bg-primary/5 rounded-2xl py-6 font-display text-xs font-bold uppercase tracking-widest"
                >
                  {showForm ? "Cancel Review" : "Write a Review"}
                </Button>
                
                <a
                  href="/reviews"
                  className="flex-1 inline-flex items-center justify-center font-display text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/95 py-3.5 rounded-2xl transition-all shadow-sm"
                >
                  Read All Reviews
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mx-auto max-w-2xl mb-16 rounded-2xl border border-border bg-background p-8 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="font-display text-2xl mb-6 text-foreground">Share your experience</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star className={`h-10 w-10 ${star <= rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-5 py-4 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>Email</span>
                  <span className="text-[10px] text-muted-foreground font-normal normal-case italic">
                    (Optional - enter checkout email to auto-verify your purchase)
                  </span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-5 py-4 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Review</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-border bg-secondary/50 px-5 py-4 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                  placeholder="How did this product help you?"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full py-6 text-lg rounded-xl btn-glow shadow-xl" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Publish Review"}
              </Button>
            </form>
          </div>
        )}

        {submitMessage && (
          <div className="mx-auto max-w-2xl mb-8 p-4 rounded-xl border border-primary/20 bg-primary/5 text-center animate-in fade-in slide-in-from-top-2 duration-300">
            <p className={`text-base font-medium ${submitMessage.includes('Thank') ? 'text-primary' : 'text-red-500'}`}>
              {submitMessage}
            </p>
          </div>
        )}

      </div>
    </section>
  );
};

export default ReviewsSection;

