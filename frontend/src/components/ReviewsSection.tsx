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

interface ReviewsSectionProps {
  productId: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to fetch reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchReviews();
  }, [productId]);

  // Auto-scroll logic
  useEffect(() => {
    if (!scrollRef.current || reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      
      const maxScroll = container.scrollWidth - container.clientWidth;
      
      // If we've reached the end, scroll back to 0
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll forward by approximately one card width
        container.scrollBy({ left: 350, behavior: 'smooth' });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [reviews]);

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
          rating,
          comment,
        }),
      });

      if (res.ok) {
        setSubmitMessage("Thank you for your feedback!");
        setShowForm(false);
        setRating(5);
        setName("");
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
    <section id="reviews" className="py-16 sm:py-24 border-t border-border bg-card overflow-hidden">
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="mx-auto max-w-[1440px] px-[var(--space-sm)] lg:px-[var(--space-md)]">
        
        {/* Premium Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-8">
          <div className="flex flex-col items-start text-left">
            <h2 className="font-display text-4xl sm:text-5xl text-foreground mb-6">Real Results</h2>
            <div className="flex items-center gap-5">
              <div className="flex flex-col">
                <span className="font-display text-5xl sm:text-6xl font-bold text-foreground leading-none">
                  {Number(stats.averageRating).toFixed(1)}
                </span>
              </div>
              <div className="flex flex-col justify-center gap-1.5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        i < Math.round(stats.averageRating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-body text-sm sm:text-base font-medium text-muted-foreground">
                  Based on {stats.totalReviews} verified reviews
                </span>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full md:w-auto gap-2 border-primary/20 text-primary hover:bg-primary/5 rounded-full px-8 py-6 text-base shadow-sm hover:shadow-md transition-all"
            onClick={() => setShowForm(!showForm)}
          >
            <MessageSquare className="h-5 w-5" />
            {showForm ? "Cancel Review" : "Write a Review"}
          </Button>
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
              
              {submitMessage && (
                <p className={`text-base text-center font-medium mt-4 ${submitMessage.includes('Thank') ? 'text-primary' : 'text-red-500'}`}>
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        )}

        {/* Horizontal Auto-swiping Review Feed */}
        <div 
          ref={scrollRef}
          className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 hide-scroll pt-4"
        >
          {(reviews || []).map((review) => (
            <div 
              key={review.id} 
              className="snap-center flex-shrink-0 w-[85vw] sm:w-[420px] rounded-2xl border border-border bg-background p-8 shadow-md flex flex-col hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <p className="font-body text-base sm:text-lg text-foreground leading-relaxed flex-grow mb-8 italic">
                "{review.comment}"
              </p>
              
              <div className="flex items-center gap-4 mt-auto pt-5 border-t border-border/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-base font-bold text-foreground">{review.customer_name}</span>
                  {review.is_verified_purchase && (
                    <span className="flex items-center gap-1.5 font-body text-xs text-primary font-semibold mt-0.5">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="w-full py-20 text-center text-muted-foreground font-medium text-lg">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default ReviewsSection;

