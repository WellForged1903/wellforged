import React, { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { Star, MessageSquare, CheckCircle, User, X, Plus } from "lucide-react";
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

const ReviewsPage = () => {
  const [productId, setProductId] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0.0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const slug = "moringa-powder";

  // Fetch product to resolve ID and fetch its reviews
  const fetchReviewsData = async () => {
    try {
      // 1. Get product to obtain correct ID
      const prodRes = await fetch(`${API_BASE_URL}/api/products/${slug}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductId(prodData.id);

        // 2. Get reviews by product ID
        const revRes = await fetch(`${API_BASE_URL}/api/reviews/${prodData.id}?t=${Date.now()}`);
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviews(revData.reviews || []);
          setStats({
            totalReviews: revData.stats.totalReviews,
            averageRating: revData.stats.averageRating
          });
        }
      }
    } catch (error) {
      console.error("Failed to load reviews page data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewsData();
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !name.trim() || !comment.trim()) return;

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
        setTimeout(() => {
          setShowModal(false);
          setSubmitMessage("");
        }, 3000);
        setRating(5);
        setName("");
        setEmail("");
        setComment("");
        fetchReviewsData(); // Refresh reviews
      } else {
        setSubmitMessage("Something went wrong. Please try again.");
      }
    } catch (err) {
      setSubmitMessage("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = reviews.length;
  const fiveStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 5).length / total) * 100) : 0;
  const fourStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 4).length / total) * 100) : 0;
  const threeStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 3).length / total) * 100) : 0;
  const twoStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 2).length / total) * 100) : 0;
  const oneStarPct = total > 0 ? Math.round((reviews.filter(r => r.rating === 1).length / total) * 100) : 0;

  return (
    <>
      <SEO 
        title="Customer Reviews | WellForged"
        description="Read verified experiences, ratings, and independent feedback from actual WellForged customers."
        canonical="/reviews"
      />
      <Navbar />

      <main className="page-pt min-h-screen bg-background pb-[var(--space-2xl)]">
        
        {/* Sticky Write a Review Button */}
        <button
          onClick={() => {
            setSubmitMessage("");
            setShowModal(true);
          }}
          className="fixed bottom-6 right-6 z-40 h-14 bg-primary hover:bg-primary/95 active:scale-95 text-primary-foreground font-display font-bold uppercase tracking-[0.15em] text-xs px-6 rounded-full flex items-center gap-2.5 shadow-elevated transition-all duration-300"
          aria-label="Write a review"
        >
          <Plus className="h-4.5 w-4.5" />
          Write a Review
        </button>

        {/* Modal Overlay Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl rounded-3xl border border-border bg-background p-6 sm:p-8 shadow-elevated animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted border border-border/80 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              <h3 className="font-display text-2xl font-bold mb-1 text-foreground">Share Your Experience</h3>
              <p className="font-body text-xs text-muted-foreground mb-6">Your feedback is verified against laboratory batch integrity records.</p>
              
              {submitMessage ? (
                <div className="p-6 rounded-2xl border border-primary/20 bg-primary/5 text-center animate-in fade-in duration-300 my-8">
                  <p className={`text-base font-semibold ${submitMessage.includes('Thank') ? 'text-primary' : 'text-red-500'}`}>
                    {submitMessage}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Star Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star className={`h-9 w-9 ${star <= rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-secondary/30 px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center justify-between">
                      <span>Email address</span>
                      <span className="text-[9px] text-muted-foreground font-normal normal-case italic">
                        (Enter checkout email to auto-verify purchase)
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-secondary/30 px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-secondary/30 px-4 py-3.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                      placeholder="What was your experience with our single-origin Moringa powder?"
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full py-5 rounded-xl text-sm font-bold uppercase tracking-widest btn-glow shadow-md mt-4" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Publish Review"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          {/* Header Description */}
          <ScrollReveal animation="fade-up" className="text-center mb-12 sm:mb-16">
            <span className="inline-block font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em] text-primary mb-3 font-semibold">Flagship Transparency</span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">Customer Endorsements</h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              Explore true daily reviews from verified buyers. Our social proof is 100% database-driven and fully verifiable.
            </p>
          </ScrollReveal>

          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground animate-pulse font-mono text-xs uppercase tracking-widest">Loading dynamic reviews hub...</div>
          ) : (
            <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-8">
              
              {/* LEFT SUMMARY PANEL */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <ScrollReveal animation="fade-right">
                  <div className="premium-panel flex flex-col bg-gradient-to-b from-background to-secondary/10 border-border/70 p-6 sm:p-8 shadow-xl rounded-3xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    
                    <div className="space-y-6 sm:space-y-8">
                      {/* Big Score */}
                      <div className="flex items-center gap-5 sm:gap-6">
                        <span className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-none tracking-tight">
                          {Number(stats.averageRating).toFixed(1)}
                        </span>
                        <div className="space-y-1">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${i < Math.round(stats.averageRating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`} />
                            ))}
                          </div>
                          <p className="font-body text-xs font-semibold text-muted-foreground">Based on {stats.totalReviews} verified reviews</p>
                        </div>
                      </div>

                      {/* Percentage Distribution Bars */}
                      <div className="space-y-2.5 pt-4 border-t border-border/40">
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
                      
                      <Button
                        onClick={() => {
                          setSubmitMessage("");
                          setShowModal(true);
                        }}
                        className="w-full font-display text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/95 px-5 py-6 rounded-2xl transition-all shadow-sm"
                      >
                        Share Your Review
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* RIGHT REVIEWS LIST */}
              <div className="lg:col-span-8 space-y-6">
                <ScrollReveal animation="fade-left">
                  {reviews.length === 0 ? (
                    <div className="premium-panel border-dashed bg-card text-center py-20 rounded-3xl">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/50 mx-auto mb-4" />
                      <p className="font-display text-lg text-foreground font-bold mb-2">No Reviews Yet</p>
                      <p className="font-body text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed mb-6">
                        Be the first to share your experience with our premium Moringa leaf powder.
                      </p>
                      <Button onClick={() => setShowModal(true)} variant="outline" className="rounded-full px-6 border-primary/20 text-primary">
                        Write First Review
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2">
                      {reviews.map((review) => (
                        <div 
                          key={review.id}
                          className="premium-panel bg-card border-border/80 p-6 sm:p-8 flex flex-col justify-between rounded-3xl hover:border-primary/20 hover:shadow-soft transition-all duration-300"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, idx) => (
                                  <Star
                                    key={idx}
                                    className={`h-4 w-4 ${idx < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                                  />
                                ))}
                              </div>
                              <span className="font-mono text-[9px] text-muted-foreground/80 bg-secondary px-2.5 py-1 rounded-full font-medium">
                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            
                            <p className="font-body text-sm text-foreground leading-relaxed italic mb-6 text-left">
                              "{review.comment}"
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-auto">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <User className="h-4.5 w-4.5" />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="font-display text-sm font-bold text-foreground">{review.customer_name}</span>
                              {review.is_verified_purchase && (
                                <span className="flex items-center gap-1 font-body text-[10px] text-primary font-semibold mt-0.5">
                                  <CheckCircle className="h-3 w-3" /> Verified Buyer
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollReveal>
              </div>

            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
};

export default ReviewsPage;
