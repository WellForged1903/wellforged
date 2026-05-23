import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StickyBuyButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 640;
      setIsVisible(shouldShow);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`safe-area-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/92 px-3 py-3 backdrop-blur-xl transition-all duration-300 md:hidden ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base text-foreground">Moringa Powder</p>
          <p className="mt-0.5 font-body text-xs text-muted-foreground">Single-ingredient daily greens with a batch report behind every pack.</p>
        </div>
        <Button
          variant="hero"
          size="default"
          className="h-11 flex-shrink-0 gap-1.5 px-4 text-xs font-bold uppercase tracking-[0.14em]"
          onClick={() => navigate("/product")}
        >
          <ShoppingCart className="h-4 w-4" />
          View Product
        </Button>
      </div>
    </div>
  );
};

export default StickyBuyButton;
