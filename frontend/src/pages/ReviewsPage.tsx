import React, { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { Star, MessageSquare, CheckCircle, User, X, Plus, Sparkles, ShieldCheck, Filter, Heart } from "lucide-react";
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
  const [filterRating, setFilterRating] = useState<number | "all">("all");

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const slug = "moringa-powder";

  // SVG circular score ring variables
  const [progressOffset, setProgressOffset] = useState(283);

  // Fetch product to resolve ID and fetch its reviews
  const fetchReviewsData = async () => {
    try {
      const prodRes = await fetch(`${API_BASE_URL}/api/products/${slug}`);
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProductId(prodData.id);

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

  // Animate circular rating progress ring on load/refresh
  useEffect(() => {
    if (!isLoading && stats.averageRating) {
      const scorePercent = (stats.averageRating / 5) * 100;
      // Circumference = 2 * Math.PI * 45 = 282.74
      const targetOffset = 283 - (283 * scorePercent) / 100;
      const timer = setTimeout(() => setProgressOffset(targetOffset), 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading, stats.averageRating]);

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
        fetchReviewsData();
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
  const fiveStarCount = reviews.filter(r => r.rating === 5).length;
  const fourStarCount = reviews.filter(r => r.rating === 4).length;
  const threeStarCount = reviews.filter(r => r.rating === 3).length;
  const twoStarCount = reviews.filter(r => r.rating === 2).length;
  const oneStarCount = reviews.filter(r => r.rating === 1).length;

  const fiveStarPct = total > 0 ? Math.round((fiveStarCount / total) * 100) : 0;
  const fourStarPct = total > 0 ? Math.round((fourStarCount / total) * 100) : 0;
  const threeStarPct = total > 0 ? Math.round((threeStarCount / total) * 100) : 0;
  const twoStarPct = total > 0 ? Math.round((twoStarCount / total) * 100) : 0;
  const oneStarPct = total > 0 ? Math.round((oneStarCount / total) * 100) : 0;

  // Filter reviews by selected filter
  const filteredReviews = reviews.filter(
    (review) => filterRating === "all" || review.rating === filterRating
  );

  // Dynamic Avatar Color Generator
  const getAvatarGradient = (rating: number) => {
    if (rating === 5) return "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_4px_12px_rgba(245,158,11,0.25)]";
    if (rating === 4) return "bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 shadow-[0_4px_12px_rgba(16,185,129,0.25)]";
    return "bg-gradient-to-br from-stone-400 via-stone-500 to-stone-600";
  };

  // Helper to extract clean initials from full name
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <SEO 
        title="Customer Reviews & Endorsements | WellForged"
        description="Read authentic verified customer reviews, daily experiences, and NABL batch-tested ratings from our core audience."
        canonical="/reviews"
      />
      <Navbar />

      <main className="page-pt min-h-screen bg-background pb-[var(--space-2xl)] relative overflow-hidden font-body">
        
        {/* Dynamic mesh glow background to create premium luxury mood */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/10 via-accent/5 to-transparent -z-10 pointer-events-none" />
        <div className="absolute top-[300px] -right-20 w-[400px] h-[400px] bg-primary/3 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="absolute top-[600px] -left-20 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[120px] -z-10 pointer-events-none" />

        {/* Floating Write a Review Action Button */}
        <button
          onClick={() => {
            setSubmitMessage("");
            setShowModal(true);
          }}
          className="fixed bottom-8 right-8 z-40 h-14 bg-primary hover:bg-primary/95 hover:scale-105 active:scale-95 text-primary-foreground font-display font-semibold uppercase tracking-[0.16em] text-xs px-7 rounded-full flex items-center gap-3 shadow-[0_12px_36px_rgba(26,60,52,0.3)] transition-all duration-500 border border-white/10 group"
          aria-label="Write a review"
        >
          <Plus className="h-4.5 w-4.5 group-hover:rotate-90 transition-transform duration-500" />
          <span>Write a Review</span>
        </button>

        {/* Modal Overlay Form */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="relative w-full max-w-xl rounded-[2.5rem] border border-border bg-background p-6 sm:p-10 shadow-elevated animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted border border-border/80 hover:rotate-90 transition-all duration-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              <div className="space-y-1 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/10 bg-primary/5 text-primary text-[10px] font-bold tracking-wider uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-gold" />
                  <span>Sourcing Verification</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Share Your Experience</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed">Your feedback is verified against unique email transactions and laboratory batch records.</p>
              </div>
              
              {submitMessage ? (
                <div className="p-8 rounded-3xl border border-primary/20 bg-primary/5 text-center animate-in fade-in duration-300 my-8 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                  <p className={`text-base font-semibold leading-relaxed ${submitMessage.includes('Thank') ? 'text-primary' : 'text-red-500'}`}>
                    {submitMessage}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="bg-secondary/20 p-4 sm:p-5 rounded-2xl border border-border/60">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 text-left">Star Rating</label>
                    <div className="flex gap-2.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="focus:outline-none transition-all duration-300 transform hover:scale-125 active:scale-95"
                        >
                          <Star 
                            className={`h-9 w-9 transition-all duration-300 ${
                              star <= (hoverRating ?? rating) 
                                ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                                : "fill-muted/20 text-muted-foreground/30"
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-secondary/10 px-4 py-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left flex items-center justify-between">
                      <span>Email address</span>
                      <span className="text-[9px] text-muted-foreground font-normal normal-case italic">
                        (Enter checkout email to auto-verify purchase)
                      </span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-secondary/10 px-4 py-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all duration-300"
                      placeholder="jane@example.com"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left">Your Review</label>
                    <textarea
                      required
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-secondary/10 px-4 py-3.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none duration-300"
                      placeholder="What was your experience with our single-origin Moringa powder?"
                    />
                  </div>

                  <Button type="submit" variant="hero" className="w-full py-5 rounded-xl text-xs font-bold uppercase tracking-widest btn-glow shadow-md mt-6 h-12" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting Ledger Entry..." : "Publish Review"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          
          {/* Immersive Editorial Header */}
          <ScrollReveal animation="fade-up" className="text-center mb-16 sm:mb-20">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-widest uppercase mb-4 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Verifiable Sourcing Index</span>
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[1.05]">
              The Voice of <span className="italic font-normal text-primary">Verification</span>
            </h1>
            <p className="font-body text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              Explore authentic daily journals from verified buyers. Every single review is 100% database-driven, tied directly to dynamic laboratory batches, and completely unedited.
            </p>
          </ScrollReveal>

          {isLoading ? (
            <div className="py-24 text-center text-muted-foreground animate-pulse font-mono text-xs uppercase tracking-[0.2em]">Loading Verification Ledger...</div>
          ) : (
            <div className="grid gap-12 lg:grid-cols-12 lg:items-start lg:gap-10">
              
              {/* LEFT SUMMARY PANEL - Glassmorphic & Interactive */}
              <div className="lg:col-span-4 lg:sticky lg:top-24">
                <ScrollReveal animation="fade-right">
                  <div className="premium-panel flex flex-col bg-card/40 backdrop-blur-md border-border/70 p-6 sm:p-8 shadow-card rounded-[2rem] relative overflow-hidden">
                    {/* Glowing highlight top border */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
                    
                    <div className="space-y-6 sm:space-y-8">
                      
                      {/* Premium Circle SVG Rating & Large Score */}
                      <div className="flex flex-col items-center sm:flex-row sm:justify-start gap-6 pt-2">
                        <div className="relative flex items-center justify-center w-24 h-24 shrink-0 select-none">
                          <svg className="absolute w-full h-full transform -rotate-90">
                            {/* Track Circle */}
                            <circle
                              cx="48"
                              cy="48"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="5"
                              fill="transparent"
                              className="text-secondary/60"
                            />
                            {/* Animated Value Circle */}
                            <circle
                              cx="48"
                              cy="48"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="5.5"
                              fill="transparent"
                              strokeDasharray="283"
                              strokeDashoffset={progressOffset}
                              className="text-primary transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="font-display text-3xl font-bold text-foreground relative z-10">
                            {Number(stats.averageRating).toFixed(1)}
                          </span>
                        </div>

                        <div className="text-center sm:text-left space-y-1.5">
                          <div className="flex justify-center sm:justify-start gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4.5 w-4.5 ${i < Math.round(stats.averageRating) ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]" : "fill-muted text-muted-foreground/30"}`} />
                            ))}
                          </div>
                          <p className="font-body text-xs font-semibold text-muted-foreground">Average Verification Score</p>
                          <p className="font-mono text-[10px] text-primary/80 uppercase tracking-wider font-semibold">{stats.totalReviews} Total Submissions</p>
                        </div>
                      </div>

                      {/* Percentage Distribution Graph */}
                      <div className="space-y-3 pt-6 border-t border-border/40">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] w-10 text-left text-muted-foreground">5 Star</span>
                          <div className="flex-1 h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full shadow-[0_0_6px_rgba(245,158,11,0.2)]" style={{ width: `${fiveStarPct}%` }} />
                          </div>
                          <span className="font-mono text-[9px] text-foreground font-bold w-8 text-right">{fiveStarPct}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] w-10 text-left text-muted-foreground">4 Star</span>
                          <div className="flex-1 h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${fourStarPct}%` }} />
                          </div>
                          <span className="font-mono text-[9px] text-foreground font-bold w-8 text-right">{fourStarPct}%</span>
                        </div>
                        <div className={`flex items-center gap-3 ${threeStarPct > 0 ? "" : "opacity-30"}`}>
                          <span className="font-mono text-[9px] w-10 text-left text-muted-foreground">3 Star</span>
                          <div className="flex-1 h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full opacity-60" style={{ width: `${threeStarPct}%` }} />
                          </div>
                          <span className="font-mono text-[9px] text-foreground font-bold w-8 text-right">{threeStarPct}%</span>
                        </div>
                        <div className={`flex items-center gap-3 ${twoStarPct > 0 ? "" : "opacity-30"}`}>
                          <span className="font-mono text-[9px] w-10 text-left text-muted-foreground">2 Star</span>
                          <div className="flex-1 h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full opacity-35" style={{ width: `${twoStarPct}%` }} />
                          </div>
                          <span className="font-mono text-[9px] text-foreground font-bold w-8 text-right">{twoStarPct}%</span>
                        </div>
                        <div className={`flex items-center gap-3 ${oneStarPct > 0 ? "" : "opacity-30"}`}>
                          <span className="font-mono text-[9px] w-10 text-left text-muted-foreground">1 Star</span>
                          <div className="flex-1 h-1.5 bg-secondary/80 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full opacity-15" style={{ width: `${oneStarPct}%` }} />
                          </div>
                          <span className="font-mono text-[9px] text-foreground font-bold w-8 text-right">{oneStarPct}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4 pt-6 border-t border-border/40">
                      <div className="flex items-start gap-2.5 bg-primary/5 border border-primary/10 rounded-2xl p-4 text-left">
                        <CheckCircle className="h-4.5 w-4.5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="font-body text-[11px] text-primary/90 font-medium leading-relaxed">
                          Every score corresponds to verified ledger receipts. Raw chemical reports are fully open-source.
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => {
                          setSubmitMessage("");
                          setShowModal(true);
                        }}
                        className="w-full font-display text-xs font-bold uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/95 px-5 py-6 rounded-2xl transition-all shadow-sm h-12"
                      >
                        Share Your Review
                      </Button>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* RIGHT REVIEWS LIST - Beautifully Grid-Layout & Filterable */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Custom Slicing Filters Section */}
                <div className="flex flex-wrap items-center justify-start gap-2 bg-[#1a2e28]/10 border border-border/40 p-2 rounded-2xl">
                  <div className="text-muted-foreground text-3xs font-mono font-bold uppercase pl-3 pr-2 flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-primary" />
                    <span>Filter:</span>
                  </div>
                  {[
                    { val: "all", label: "All Reviews" },
                    { val: 5, label: "5 Stars", count: fiveStarCount },
                    { val: 4, label: "4 Stars", count: fourStarCount },
                    { val: 3, label: "3 Stars", count: threeStarCount }
                  ].map((f) => (
                    <button
                      key={f.val}
                      onClick={() => setFilterRating(f.val as any)}
                      className={`px-3 py-1.5 rounded-xl text-3xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                        filterRating === f.val
                          ? "bg-primary border-primary text-primary-foreground shadow-soft"
                          : "bg-background/40 border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
                      }`}
                    >
                      {f.label} {f.count !== undefined && f.count > 0 && <span className="opacity-60 ml-0.5">({f.count})</span>}
                    </button>
                  ))}
                </div>

                <ScrollReveal animation="fade-left">
                  {filteredReviews.length === 0 ? (
                    <div className="premium-panel border-dashed bg-card/30 text-center py-20 rounded-[2.5rem]">
                      <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="font-display text-lg text-foreground font-bold mb-2">No Entries Under This Filter</p>
                      <p className="font-body text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed mb-6">
                        We currently do not have any reviews submitted under this rating level.
                      </p>
                      <Button onClick={() => setFilterRating("all")} variant="outline" className="rounded-full px-5 border-primary/20 text-primary text-3xs uppercase tracking-widest font-bold">
                        View All Reviews
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 animate-in fade-in duration-500">
                      {filteredReviews.map((review) => (
                        <div 
                          key={review.id}
                          className="premium-panel bg-card/30 backdrop-blur-sm border-border/70 p-6 sm:p-8 flex flex-col justify-between rounded-[2.5rem] hover:border-primary/20 hover:bg-card/75 hover:shadow-card transition-all duration-500 relative group overflow-hidden"
                        >
                          {/* Large Literary Background Quote Character */}
                          <span className="absolute -top-1 right-3 font-display text-[9rem] leading-none text-primary/5 select-none pointer-events-none group-hover:scale-110 transition-transform duration-700">
                            “
                          </span>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex gap-0.5 relative z-10">
                                {[...Array(5)].map((_, idx) => (
                                  <Star
                                    key={idx}
                                    className={`h-4 w-4 ${idx < review.rating ? "fill-amber-500 text-amber-500 drop-shadow-[0_0_3px_rgba(245,158,11,0.2)]" : "fill-muted text-muted-foreground/20"}`}
                                  />
                                ))}
                              </div>
                              <span className="font-mono text-[9px] text-muted-foreground/80 bg-secondary/80 border border-border/40 px-2.5 py-1 rounded-full font-medium">
                                {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                            
                            <p className="font-body text-[13px] sm:text-[13.5px] text-foreground leading-[1.65] font-light italic text-left relative z-10 pr-2">
                              "{review.comment}"
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3 pt-4 border-t border-border/40 mt-6 relative z-10">
                            {/* Premium Initials Badge utilizing Rating Gradient */}
                            <div className={`flex h-9 w-9 items-center justify-center rounded-full text-white font-mono text-[10px] font-bold ${getAvatarGradient(review.rating)}`}>
                              {getInitials(review.customer_name)}
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="font-display text-[13px] font-bold text-foreground leading-none">{review.customer_name}</span>
                              {review.is_verified_purchase && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[8.5px] font-bold uppercase tracking-wider rounded-full mt-1.5 w-fit">
                                  <ShieldCheck className="h-3 w-3 text-emerald-500" />
                                  <span>Verified Buyer</span>
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
