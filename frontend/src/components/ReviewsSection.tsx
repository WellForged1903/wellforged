import React, { useState, useEffect } from "react";
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
    <section id="reviews" className="py-12 sm:py-20 border-t border-border bg-card">
      <div className="mx-auto max-w-[1440px] px-[var(--space-sm)] lg:px-[var(--space-md)]">
        
        {/* Header & Stats */}
        <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
          <h2 className="font-display text-3xl sm:text-4xl text-foreground mb-4">Real Results from the Community</h2>
          <div className="flex items-center gap-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 sm:h-8 sm:w-8 ${
                    i < Math.round(stats.averageRating) ? "fill-primary text-primary" : "fill-muted text-muted-foreground"
                  }`}
                />
              ))}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-none">{stats.averageRating}</span>
              <span className="font-body text-xs sm:text-sm text-muted-foreground">Based on {stats.totalReviews} reviews</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="mt-8 gap-2 border-primary/20 text-primary hover:bg-primary/5"
            onClick={() => setShowForm(!showForm)}
          >
            <MessageSquare className="h-4 w-4" />
            {showForm ? "Cancel Review" : "Write a Review"}
          </Button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mx-auto max-w-lg mb-16 rounded-2xl border border-border bg-background p-6 shadow-xl">
            <h3 className="font-display text-xl mb-4 text-foreground">Share your experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star className={`h-8 w-8 ${star <= rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Review</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-border bg-secondary/50 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="How did this product help you?"
                />
              </div>

              <Button type="submit" variant="hero" className="w-full btn-glow" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Publish Review"}
              </Button>
              
              {submitMessage && (
                <p className={`text-sm text-center font-medium ${submitMessage.includes('Thank') ? 'text-primary' : 'text-red-500'}`}>
                  {submitMessage}
                </p>
              )}
            </form>
          </div>
        )}

        {/* Review Feed */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(reviews || []).map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-background p-6 shadow-sm flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "fill-muted text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <p className="font-body text-sm text-foreground leading-relaxed flex-grow mb-6">
                "{review.comment}"
              </p>
              
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-display text-sm font-semibold text-foreground">{review.customer_name}</span>
                  {review.is_verified_purchase && (
                    <span className="flex items-center gap-1 font-body text-[10px] text-primary font-medium">
                      <CheckCircle className="h-3 w-3" /> Verified Buyer
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>

      </div>
    </section>
  );
};

export default ReviewsSection;
