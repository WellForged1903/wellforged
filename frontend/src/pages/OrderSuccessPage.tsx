import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { CheckCircle, Shield, Truck, Clock3, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderSuccessPage = () => {
  const { clearCart } = useCart();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    // Clear the cart on successful order confirmation
    clearCart();
    
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
        <>
            <SEO title="Order Verified | Wellforged" noindex={true} canonical="/order-success" />
      <Navbar />
      <div className="relative min-h-screen overflow-hidden bg-background page-pt pb-12 pt-8 sm:pt-12">
        <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={170} gravity={0.09} colors={["#D4A545", "#23503D", "#F5F1E8"]} />

        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="animate-hero-fade-up">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 sm:h-20 sm:w-20">
              <CheckCircle className="h-10 w-10 animate-pulse text-primary" />
            </div>
            <p className="eyebrow-label mb-3">Order Confirmed</p>
            <h1 className="mb-4 font-display text-3xl font-bold text-foreground sm:text-5xl">Your WellForged order is now in motion.</h1>
            <p className="mx-auto mb-8 max-w-2xl font-body text-base leading-relaxed text-muted-foreground sm:mb-10 sm:text-xl">
              You did not just place an order. You chose a cleaner standard of wellness, backed by traceable sourcing and verifiable proof.
            </p>
          </div>

          <div className="premium-panel mx-auto mb-8 max-w-2xl p-5 text-left sm:mb-10 sm:p-6">
            <p className="font-body text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-primary/80">What Happens Next</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground">Order Locked</h3>
                <p className="mt-1 font-body text-sm leading-6 text-muted-foreground">Your order has been confirmed and queued for fulfillment.</p>
              </div>
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground">Dispatch Update</h3>
                <p className="mt-1 font-body text-sm leading-6 text-muted-foreground">You will receive dispatch and tracking details shortly by email or SMS.</p>
              </div>
              <div>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/8">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-display text-lg text-foreground">Batch Verification</h3>
                <p className="mt-1 font-body text-sm leading-6 text-muted-foreground">Use the pack QR code on delivery to inspect the batch report behind your order.</p>
              </div>
            </div>
          </div>

          <div className="mb-12 grid gap-4 sm:grid-cols-2 animate-hero-fade-up-delay-3">
            <div className="premium-panel p-6 text-left">
              <Truck className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Delivery Window</h3>
              <p className="mb-0 font-body text-sm text-muted-foreground">
                Standard delivery usually takes 5-7 business days. We will keep you informed as your order moves through dispatch.
              </p>
            </div>
            <div className="premium-panel p-6 text-left">
              <Clock3 className="mb-3 h-6 w-6 text-primary" />
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">Support Promise</h3>
              <p className="mb-0 font-body text-sm text-muted-foreground">
                If you need help before your pack arrives, our team is here to assist with order updates, batch access, and delivery questions.
              </p>
            </div>
          </div>

          {/* Reassurance SLA Banner */}
          <div className="mb-12 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-hero-fade-up-delay-4">
            <div className="space-y-1">
              <h4 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Uncompromising Support SLA
              </h4>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                Need to modify details, track dispatch, or address a quality concern? Our legal Grievance Portal provides direct, verified dispute resolution with our Head of Customer Integrity.
              </p>
            </div>
            <Link to="/support/grievance-redressal" className="w-full md:w-auto flex-shrink-0">
              <Button variant="outline" className="w-full md:w-auto rounded-xl border-primary/20 hover:border-primary text-primary hover:bg-primary/5 text-xs font-semibold py-2">
                Visit Grievance Desk
              </Button>
            </Link>
          </div>

          <div className="animate-hero-fade-up-delay-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/">
              <Button variant="hero" size="xl" className="h-12 px-6 text-sm sm:h-14 sm:px-10 sm:text-lg">
                Back to Home
              </Button>
            </Link>
            <Link to="/transparency">
              <Button variant="outline" size="xl" className="h-12 px-6 text-sm sm:h-14 sm:px-10 sm:text-lg">
                Explore Transparency
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OrderSuccessPage;
