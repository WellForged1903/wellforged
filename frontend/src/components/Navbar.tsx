import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { ShoppingCart, ArrowLeft } from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsOpen: setCartOpen } = useCart();

  const isHomePage = location.pathname === "/" || location.pathname === "";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
        ? "bg-background/85 backdrop-blur-2xl border-border/50 py-2"
        : "bg-transparent border-transparent py-3"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* LEFT: BACK BUTTON (Internal Pages Only) */}
          <div className="flex-1 flex items-center min-w-0">

 {!isHomePage && (
              <Link
                to="/"
                className="h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center rounded-full hover:bg-muted border border-border transition-colors group"
                aria-label="Go home"
              >
                <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6 text-foreground/70 group-hover:text-primary transition-colors" />
              </Link>
            )}

          </div>

          {/* RIGHT SECTION: Transparency + Cart */}
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
            <Link
              to="/transparency"
              onClick={() => window.scrollTo(0, 0)}
              className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 px-4 py-2 transition-all duration-300 group hover:border-primary/40 hover:bg-primary/5"
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Verify Batch</span>
            </Link>

            <button
              className="relative p-2.5 hover:bg-muted rounded-full transition-all duration-300 flex items-center justify-center group"
              onClick={() => setCartOpen(true)}
              aria-label={`Cart with ${totalItems} items`}
            >
              <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
