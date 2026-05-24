import { useState, useEffect } from "react";
import SEO from "@/components/SEO";
import { Truck, Shield, CheckCircle, MapPin, Tag, X, User, Mail, Phone, Building, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE_URL } from "@/config";
import type { CouponValidationResult } from "@/types/store";
import { loadRazorpay } from "@/utils/razorpay";

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResult | null>(null);
  
  // Dynamic Suggestion Logic
  const getSuggestedCoupon = () => {
    if (coupons.length === 0) return null;
    // Find the best coupon that meets min_order_value
    const eligible = coupons
        .filter(c => !c.min_order_value || subtotal >= c.min_order_value)
        .sort((a, b) => b.min_order_value - a.min_order_value); // Get the one with highest requirement/value
    
    if (eligible.length === 0) return null;
    const best = eligible[0];
    return {
        code: best.code,
        discount: best.discount_type === 'percentage' ? `${best.discount_value}%` : `Rs ${best.discount_value}`,
        minSubtotal: best.min_order_value
    };
  };

  useEffect(() => {
    const fetchLiveCoupons = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/coupons`);
            if (res.ok) setCoupons(await res.json());
        } catch (e) { console.error("Could not fetch coupons"); }
    };
    fetchLiveCoupons();
  }, []);

  const [couponCode, setCouponCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponHelper, setCouponHelper] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    city: "",
    state: "",
  });
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const regenerateIdempotencyKey = () => setIdempotencyKey(crypto.randomUUID());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const discount = appliedCoupon?.discount_amount || 0;
  const total = subtotal - discount;
  const suggestedCoupon = getSuggestedCoupon();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (codeOverride?: string) => {
    const codeToApply = codeOverride || couponCode;
    
    if (!codeToApply.trim()) {
      setCouponHelper("Please enter a valid coupon code.");
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponHelper("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply, subtotal }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setCouponHelper(data.message || "This code is invalid or no longer active.");
        toast.error(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponHelper("Best available savings applied to this order.");
        toast.success(data.message);
      }
    } catch (error) {
      setCouponHelper("We could not validate the code right now. Please try again.");
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponHelper("");
    toast.info("Coupon removed");
  };

  const handleContinue = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.pincode || !formData.city || !formData.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Order on Backend (Returns Pending Order + Razorpay Order ID)
      const payload = {
        coupon_id: appliedCoupon?.coupon_id || null,
        idempotency_key: idempotencyKey,
        guest_details: {
          full_name: formData.fullName,
          email: formData.email,
          mobile_number: formData.phone,
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: items.map((item) => ({ sku_id: item.id, quantity: item.quantity })),
      };

      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || "Failed to create order");

      // 2. If Razorpay is not configured on backend, assume success (for development/fallback)
      if (!orderData.razorpay) {
        toast.success("Order placed successfully (Demo Mode)");
        clearCart();
        navigate("/order-success");
        return;
      }

      // 3. Load and Launch Razorpay
      await loadRazorpay();
      
      const rzpKey = (import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_id").trim().replace(/['"]/g, '');
      
        let modalOpenedAt = 0;
        const options = {
        key: rzpKey,
        amount: Math.floor(Number(orderData.razorpay.amount)),
        currency: String(orderData.razorpay.currency || "INR"),
        name: "WellForged",
        description: `Order ${orderData.order_number}`,
        order_id: String(orderData.razorpay.id),
        handler: async (response: any) => {
          try {
            // 4. Verify Payment on Backend
            const verifyResponse = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_id: orderData.id
              }),
            });

            const verifyData = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(verifyData.message || "Payment verification failed");

            toast.success("Payment successful!");
            navigate("/order-success");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Verification failed. Please contact support.");
          }
        },
        prefill: {
          name: formData.fullName || undefined,
          email: formData.email || undefined,
          contact: formData.phone || undefined,
        },
        theme: {
          color: "#1A3C34", // WellForged Dark Green
        },
        modal: {
          ondismiss: () => {
            regenerateIdempotencyKey(); // ⚡ Reset key for subsequent attempts
            const timeOpen = Date.now() - modalOpenedAt;
            // If the modal closes almost instantly (under 2 seconds), it was likely crashed by an Ad-Blocker blocking Razorpay's telemetry/validation.
            if (timeOpen < 2000) {
              toast.error("Checkout failed to load. Please disable your Ad-Blocker (or Brave Shields) and try again.");
            } else {
              toast.info("Payment cancelled.");
            }
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        regenerateIdempotencyKey(); // ⚡ Reset key on payment failure
        toast.error(`Payment failed: ${response.error.description || "Please try a different payment method."}`);
      });
      modalOpenedAt = Date.now();
      rzp.open();

    } catch (error) {
      regenerateIdempotencyKey(); // ⚡ Reset key on failed order attempt
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Checkout | WellForged" noindex={true} canonical="/checkout" />
      <Navbar />
      <main className="page-pt min-h-screen bg-background pb-[var(--space-xl)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="mb-4 font-body text-lg text-muted-foreground">Your cart is empty</p>
              <Button variant="hero" onClick={() => navigate("/product")}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
              <div className="space-y-6 lg:col-span-3">
                {step === 1 && (
                  <div className="premium-panel p-5 sm:p-7">
                    <div className="space-y-4">
                      {/* Section: Contact Information */}
                      <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
                         <div className="sm:col-span-2">
                          <label className="mb-1 block font-body text-xs font-medium text-foreground/70">
                            Full Name
                          </label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                            <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="h-11 pl-10 text-sm transition-all focus:border-primary/50 focus:ring-primary/10" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-1 block font-body text-xs font-medium text-foreground/70">
                            Email Address
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                            <Input name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="yourname@domain.com" className="h-11 pl-10 text-sm transition-all focus:border-primary/50 focus:ring-primary/10" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-1 block font-body text-xs font-medium text-foreground/70">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                            <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="10-digit mobile number" className="h-11 pl-10 text-sm transition-all focus:border-primary/50 focus:ring-primary/10" />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block font-body text-xs font-medium text-foreground/70">
                            Street Address
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                            <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="House/Flat No., Street, Locality" className="h-11 pl-10 text-sm transition-all focus:border-primary/50 focus:ring-primary/10" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-1 block font-body text-xs font-medium text-foreground/70">
                            Pincode
                          </label>
                          <div className="relative">
                            <Hash className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                            <Input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="6-digit pincode" className="h-11 pl-10 text-sm transition-all focus:border-primary/50 focus:ring-primary/10" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="mb-1 block font-body text-xs font-medium text-foreground/70">
                            City
                          </label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city name" className="h-11 pl-10 text-sm transition-all focus:border-primary/50 focus:ring-primary/10" />
                          </div>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="mb-1 block font-body text-xs font-medium text-foreground/70">
                            State
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                            <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state name" className="h-11 pl-10 text-sm transition-all focus:border-primary/50 focus:ring-primary/10" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="hero" size="xl" className="mt-6 h-12 w-full shadow-lg shadow-primary/10 transition-all hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98]" onClick={handleContinue}>
                      Continue to Summary
                    </Button>
                  </div>
                )}

                {step === 2 && (
                  <>
                    <div className="premium-panel p-4 sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div>
                          <p className="eyebrow-label">Review</p>
                          <h2 className="font-display text-foreground" style={{ fontSize: "var(--text-lg)" }}>
                            Shipping Summary
                          </h2>
                        </div>
                        <button onClick={() => setStep(1)} className="ml-auto text-xs text-primary hover:underline">
                          Edit Details
                        </button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="font-body text-foreground">
                          <span className="font-semibold">{formData.fullName}</span>
                        </p>
                        <p className="font-body text-muted-foreground">{formData.address}</p>
                        <p className="font-body text-muted-foreground">
                          {formData.city}, {formData.state} - {formData.pincode}
                        </p>
                        <div className="space-y-1">
                          <p className="break-words font-body text-muted-foreground">Phone: {formData.phone}</p>
                          <p className="break-words font-body text-muted-foreground">Email: {formData.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="premium-panel p-4 sm:p-6">
                      <div className="mb-4 flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <div>
                          <p className="eyebrow-label">Final Step</p>
                          <h2 className="font-display text-foreground" style={{ fontSize: "var(--text-lg)" }}>
                            Order Confirmation
                          </h2>
                        </div>
                      </div>
                      <p className="text-balance font-body text-sm leading-relaxed text-muted-foreground">
                        By clicking "Place Order", you agree to our Terms of Service. Your order will be processed immediately and you will receive a confirmation message shortly.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="lg:col-span-2">
                <div className="sticky top-20 border border-border bg-card p-4 sm:rounded-2xl sm:p-6 rounded-xl">
                  <p className="eyebrow-label mb-1">Your Order</p>
                  <h2 className="mb-4 font-display font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>
                    Order Summary
                  </h2>

                  <div className="mb-4 space-y-3 border-b border-border pb-4">
                    {items.map((item) => (
                      <div key={item.id} className="group flex items-center gap-4">
                        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted p-2 transition-colors group-hover:border-primary/30">
                          <img
                            src={item.image || "/Packaging_Updated.png"}
                            alt={item.name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/Packaging_Updated.png";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 font-body text-sm font-semibold leading-tight text-foreground">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                              Qty: {item.quantity}
                            </span>
                            {item.size && (
                              <span className="rounded-md bg-primary/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 text-right">
                          <p className="font-display text-sm font-bold text-foreground">Rs {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4 border-b border-border pb-4">
                    {!appliedCoupon ? (
                      <div className="rounded-2xl border border-dashed border-primary/20 bg-secondary/15 p-5 transition-all">
                        <div className="mb-4 flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <p className="font-display text-xs font-bold uppercase tracking-widest text-primary">Limited Time Offer</p>
                        </div>

                        {suggestedCoupon ? (
                          <div className="flex flex-col gap-4">
                            <div className="space-y-1">
                              <h3 className="font-display text-sm font-bold text-foreground">
                                Save {suggestedCoupon.discount.startsWith('Rs') ? suggestedCoupon.discount : `Rs ${suggestedCoupon.discount}`} with code {suggestedCoupon.code}
                              </h3>
                              <p className="font-body text-xs text-muted-foreground">
                                Best savings available for your current subtotal of Rs {subtotal.toLocaleString()}.
                              </p>
                            </div>
                            
                            <Button
                              type="button"
                              variant="hero"
                              onClick={() => {
                                const code = suggestedCoupon.code;
                                setCouponCode(code);
                                handleApplyCoupon(code);
                              }}
                              className="h-12 w-full bg-[#1A3C34] text-white hover:bg-[#1A3C34]/90 shadow-lg shadow-[#1A3C34]/10 transition-all font-bold tracking-widest active:scale-[0.98]"
                            >
                              {isValidatingCoupon ? "APPLYING..." : "APPLY COUPON NOW"}
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <p className="font-body text-xs text-muted-foreground">
                              Add more items worth Rs {Math.max(0, 349 - subtotal)} more to unlock exclusive savings.
                            </p>
                          </div>
                        )}

                        {couponHelper && (
                          <p className={`mt-3 text-center font-body text-[10px] ${appliedCoupon ? "text-primary" : "text-muted-foreground/80"}`}>
                            {couponHelper}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 rounded-full bg-background p-2 text-primary">
                              <Tag className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-body text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">Offer Applied</p>
                              <p className="mt-1 font-body text-sm font-medium text-foreground">{appliedCoupon.code}</p>
                              <p className="font-body text-xs text-primary">You saved Rs {appliedCoupon.discount_amount.toLocaleString()} on this order.</p>
                              <p className="mt-1 font-body text-xs text-muted-foreground">Best price applied.</p>
                            </div>
                          </div>
                          <button onClick={handleRemoveCoupon} className="text-muted-foreground transition-colors hover:text-foreground">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-6 space-y-3 rounded-xl bg-muted/30 p-4">
                    <div className="flex items-center justify-between font-body text-sm">
                      <span className="font-medium text-muted-foreground">Subtotal</span>
                      <span className="font-bold text-foreground">Rs {subtotal.toLocaleString()}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex items-center justify-between font-body text-sm">
                        <span className="font-medium text-muted-foreground">Discount ({appliedCoupon.code})</span>
                        <span className="font-bold text-primary">-Rs {discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-body text-sm">
                      <span className="font-medium text-muted-foreground">Delivery</span>
                      <span className="font-bold text-primary">FREE</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between border-t border-border pt-3 font-display text-lg font-bold">
                      <span className="uppercase tracking-wider text-foreground">Total</span>
                      <span className="text-foreground">Rs {total.toLocaleString()}</span>
                    </div>
                  </div>

                  {step === 2 && (
                    <Button variant="hero" size="xl" className="mb-4 h-12 w-full sm:h-14" onClick={handlePlaceOrder} disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : `Place Order - Rs ${total.toLocaleString()}`}
                    </Button>
                  )}

                  <div className="mt-4 flex flex-wrap justify-center gap-3 border-t border-border pt-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-body text-xs">Secure Checkout</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="font-body text-xs">Fast Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage;
