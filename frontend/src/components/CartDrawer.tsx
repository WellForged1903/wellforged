import { useState, useEffect } from "react";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { DEFAULT_PRODUCT_IMAGE, imageErrorFallback } from "@/utils/images";
import { API_BASE_URL } from "@/config";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const total = subtotal;

  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    const fetchLiveCoupons = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/coupons`);
            if (res.ok) setCoupons(await res.json());
        } catch (e) { console.error("Could not fetch coupons"); }
    };
    if (isOpen) {
      fetchLiveCoupons();
    }
  }, [isOpen]);

  // Find the highest currently unlocked coupon and the next available coupon
  const unlockedCoupons = coupons.filter(c => !c.min_order_value || subtotal >= c.min_order_value).sort((a, b) => b.min_order_value - a.min_order_value);
  const lockedCoupons = coupons.filter(c => c.min_order_value && subtotal < c.min_order_value).sort((a, b) => a.min_order_value - b.min_order_value);
  
  const currentBest = unlockedCoupons.length > 0 ? unlockedCoupons[0] : null;
  const nextGoal = lockedCoupons.length > 0 ? lockedCoupons[0] : null;

  let progressMessage = "";
  let progressPercentage = 0;

  if (nextGoal) {
    const amountNeeded = nextGoal.min_order_value - subtotal;
    const discountText = nextGoal.discount_type === 'percentage' ? `${nextGoal.discount_value}%` : `Rs ${nextGoal.discount_value}`;
    progressMessage = `Add Rs ${amountNeeded.toLocaleString()} more to unlock ${discountText} OFF!`;
    progressPercentage = Math.min(100, (subtotal / nextGoal.min_order_value) * 100);
  } else if (currentBest) {
    const discountText = currentBest.discount_type === 'percentage' ? `${currentBest.discount_value}%` : `Rs ${currentBest.discount_value}`;
    progressMessage = `You've unlocked ${discountText} OFF!`;
    progressPercentage = 100;
  } else {
    // Fallback if no coupons exist
    progressMessage = "Enjoy complimentary shipping on all orders.";
    progressPercentage = 100;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader className="border-b border-border pb-[var(--space-sm)]">
          <SheetTitle className="flex items-center gap-2 font-display uppercase tracking-widest" style={{ fontSize: "var(--text-lg)" }}>
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({totalItems})
          </SheetTitle>
          <SheetDescription className="sr-only">
            View your selected WellForged products, adjust quantities, or proceed to secure checkout.
          </SheetDescription>
        </SheetHeader>

        {totalItems === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-[var(--space-md)] py-[var(--space-2xl)] text-center">
            <ShoppingBag className="mb-[var(--space-md)] h-[var(--space-3xl)] w-[var(--space-3xl)] text-muted-foreground/30" />
            <p className="mb-[var(--space-xs)] font-display text-[var(--text-2xl)] font-bold text-foreground">Your cart is empty</p>
            <p className="mb-[var(--space-xl)] font-body text-[var(--text-base)] text-muted-foreground">Add a verified WellForged pack to begin your daily ritual.</p>
            <Link to="/product" className="w-full" onClick={() => setIsOpen(false)}>
              <Button variant="hero" size="lg" className="h-[var(--space-xl)] w-full gap-2 font-bold uppercase tracking-widest">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {coupons.length > 0 && (
              <div className="bg-secondary/30 border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className={`h-3.5 w-3.5 ${progressPercentage >= 100 ? 'text-primary' : 'text-gold'}`} />
                  <p className="font-body text-xs font-semibold text-foreground">{progressMessage}</p>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${progressPercentage >= 100 ? 'bg-primary' : 'bg-gold'}`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-card p-3 shadow-[0_14px_28px_-24px_hsl(var(--primary)/0.35)]">
                  <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
                    <img
                      src={DEFAULT_PRODUCT_IMAGE}
                      alt={item.name}
                      className="h-full w-full object-contain"
                      onError={imageErrorFallback}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1.5 flex items-start justify-between">
                      <div>
                        <h4 className="font-display text-sm font-semibold leading-tight text-foreground">{item.name}</h4>
                        <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">{item.size}</span>
                        <p className="mt-1 font-body text-[11px] text-muted-foreground">Clean single-ingredient nutrition, batch verified.</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="-mr-2.5 p-2.5 text-muted-foreground transition-colors hover:text-foreground">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 items-center gap-1.5 rounded-lg bg-muted">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="flex h-full min-w-[44px] items-center justify-center rounded-l-lg px-3 transition-colors hover:bg-muted-foreground/10">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-6 text-center font-body text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          className={`flex h-full min-w-[44px] items-center justify-center rounded-r-lg px-3 transition-colors ${item.quantity >= item.stock ? "opacity-30 cursor-not-allowed" : "hover:bg-muted-foreground/10"}`}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-semibold text-foreground">Rs {(item.price * item.quantity).toLocaleString()}</p>
                        {item.originalPrice && (
                          <p className="font-body text-xs text-muted-foreground line-through">Rs {(item.originalPrice * item.quantity).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border px-4 pb-[var(--space-md)] pt-4">
              <div className="rounded-2xl border border-border/70 bg-secondary/20 px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-body text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Total</span>
                  <span className="font-display text-lg font-semibold text-foreground">Rs {total.toLocaleString()}</span>
                </div>
                <p className="mt-1 font-body text-[11px] text-muted-foreground">Taxes included. Shipping remains complimentary.</p>
              </div>

              <Link to="/checkout" onClick={() => setIsOpen(false)}>
                <Button variant="hero" size="lg" className="btn-glow animate-pulse-subtle active:scale-[0.98] transition-transform h-12 w-full gap-2 font-bold uppercase tracking-[0.14em] sm:h-[var(--space-xl)]">
                  Proceed to Checkout
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full pt-1 text-center font-body text-[var(--text-sm)] uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
