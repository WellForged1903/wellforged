import { useState, useEffect } from "react";
import { ShoppingCart, ShoppingBag, Truck, Shield, FlaskConical, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import type { ProductData, ProductVariant } from "@/types/store";
import { DEFAULT_PRODUCT_IMAGE } from "@/utils/images";

const ProductSelector = ({ product }: { product: ProductData }) => {
  const [selectedSku, setSelectedSku] = useState<ProductVariant | null>(null);
  const { addItem, setIsOpen } = useCart();

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const defaultSku = product.variants.find((sku) =>
        String(sku.label || sku.size || "").toLowerCase().includes("250"),
      );
      setSelectedSku(defaultSku || product.variants[0]);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!selectedSku) return;

    if (selectedSku.stock !== undefined && selectedSku.stock <= 0) {
      toast.error("This size is currently out of stock");
      return;
    }

    await addItem(
      {
        id: selectedSku.id.toString(),
        name: product.name,
        size: selectedSku.label.replace(/\s+(Pouch|Jar)$/i, ""),
        price: Number(selectedSku.price), // Normalized to Rupees here
        originalPrice: selectedSku.original_price ? Number(selectedSku.original_price) : undefined,
        stock: selectedSku.stock, // Passing live stock count
        image: DEFAULT_PRODUCT_IMAGE,
      },
      1,
    );
  };

  if (!product || !selectedSku) return null;

  const selectedLabel = selectedSku.label.replace(/\s+(Pouch|Jar)$/i, "");
  const inStock = selectedSku.stock === undefined || selectedSku.stock > 0;

  return (
    <>
      <div className="space-y-5">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="eyebrow-label">Choose Your Size</p>
              <p className="mt-1 font-body text-sm text-muted-foreground">Pick the pack that fits your routine and frequency.</p>
            </div>
            <div className="premium-pill px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">
              Ships Fresh
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {product.variants.map((sku) => {
              const sizeLabel = sku.label.replace(/\s+(Pouch|Jar)$/i, "");
              const stockLabel =
                sku.stock === 0 ? "Out of Stock" : (sku.stock ?? 0) < 20 ? `Only ${sku.stock} left` : "In Stock";
              const stockTone = sku.stock === 0 ? "text-destructive" : (sku.stock ?? 0) < 20 ? "text-gold" : "text-primary";
              const variantSavings = sku.original_price ? Number(sku.original_price) - Number(sku.price) : 0;

              return (
                <button
                  key={sku.id}
                  onClick={() => setSelectedSku(sku)}
                  className={`relative flex h-full flex-col justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                    selectedSku.id === sku.id
                      ? "border-gold/50 bg-gradient-to-br from-secondary via-background to-primary/5 shadow-[0_20px_36px_-28px_hsl(var(--gold)/0.38)]"
                      : "border-border bg-card hover:border-primary/35 hover:bg-primary/[0.03]"
                  } ${sku.stock === 0 ? "opacity-60 grayscale-[0.25]" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className={`font-display text-base font-semibold leading-none ${selectedSku.id === sku.id ? "text-primary" : "text-foreground"}`}>{sizeLabel}</div>
                      <p className={`mt-1.5 font-body text-xs ${selectedSku.id === sku.id ? "text-primary/75" : "text-muted-foreground"}`}>
                        {sizeLabel.includes("250") ? "Best for consistent daily use." : "Ideal for trying the ritual first."}
                      </p>
                    </div>
                    {selectedSku.id === sku.id && (
                      <span className="rounded-full border border-gold/35 bg-background/90 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-primary">
                        Selected
                      </span>
                    )}
                  </div>

                    <div className="mt-4">
                    <div className="flex items-end gap-2">
                      <span className="font-display text-xl font-bold text-primary">Rs {Number(sku.price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                      {sku.original_price && (
                        <span className={`pb-0.5 font-body text-xs line-through ${selectedSku.id === sku.id ? "text-primary/55" : "text-muted-foreground"}`}>
                          Rs {Number(sku.original_price).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${selectedSku.id === sku.id && sku.stock !== 0 ? "text-primary" : stockTone}`}>{stockLabel}</span>
                      {variantSavings > 0 && <span className={`font-body text-[10px] ${selectedSku.id === sku.id ? "text-primary/70" : "text-muted-foreground"}`}>Save Rs {variantSavings.toFixed(0)}</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <Button
            variant="hero"
            size="default"
            className="btn-glow h-12 w-full gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground sm:text-sm animate-pulse-subtle active:scale-[0.98] transition-transform"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            {inStock ? (
              <>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </>
            ) : (
              "Out of Stock"
            )}
          </Button>
          <Button
            variant="outline"
            size="default"
            className="h-11 w-full gap-2 text-xs font-bold uppercase tracking-[0.14em] shadow-sm"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingBag className="h-4 w-4" /> Go to Cart
          </Button>
        </div>

        <div className="premium-panel bg-secondary/20 p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2.5">
              <Shield className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-foreground">No Fillers</p>
                <p className="font-body text-xs text-muted-foreground">Nothing hidden in the blend.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FlaskConical className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Third-Party Tested</p>
                <p className="font-body text-xs text-muted-foreground">Every batch backed by reports.</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Truck className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Fast Dispatch</p>
                <p className="font-body text-xs text-muted-foreground">Fresh inventory, quick shipping.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="premium-panel p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex min-w-[11rem] flex-1 items-start gap-2.5">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Expected Experience</p>
                <p className="font-body text-xs text-muted-foreground">Smooth daily mixing, earthy taste, and a clean routine you can sustain.</p>
              </div>
            </div>
            <div className="flex min-w-[11rem] flex-1 items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Best For</p>
                <p className="font-body text-xs text-muted-foreground">Customers looking for simple greens without sweeteners, flavors, or proprietary blends.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </>
  );
};

export default ProductSelector;
