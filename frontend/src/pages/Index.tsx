import { Suspense, lazy } from "react";
import SEO from "@/components/SEO";
import ManifestoHero from "@/components/ManifestoHero";
import Footer from "@/components/Footer";
import StickyBuyButton from "@/components/StickyBuyButton";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

const TrustComparison = lazy(() => import("@/components/TrustComparison"));
const NABLVerification = lazy(() => import("@/components/NABLVerification"));
const IntegrityPillars = lazy(() => import("@/components/IntegrityPillars"));
const ProcessTimeline = lazy(() => import("@/components/ProcessTimeline"));
const TamilNaduTerroir = lazy(() => import("@/components/TamilNaduTerroir"));
const WhyWeExist = lazy(() => import("@/components/WhyWeExist"));

const ManifestoCTA = lazy(() => import("@/components/ManifestoCTA"));

const SectionFallback = () => (
    <div className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
            <div className="premium-panel h-56 animate-pulse bg-secondary/50" />
        </div>
    </div>
);

const Index = () => {
    const { totalItems, setIsOpen: setCartOpen } = useCart();

    return (
        <>
            <SEO 
                title="WellForged"
                description="The No-Nonsense Moringa powder — NABL-certified & independently tested every batch. Enter your batch number to access your lab reports. No fillers. Just proof."
                canonical="/"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "WebSite",
                    "url": "https://www.wellforged.in/",
                    "name": "Wellforged",
                    "potentialAction": {
                        "@type": "SearchAction",
                        "target": "https://www.wellforged.in/product?search={search_term_string}",
                        "query-input": "required name=search_term_string"
                    }
                }}
            />
            <main className="min-h-screen">
                {/* Floating Glassmorphic Cart Button */}
                <button
                    onClick={() => setCartOpen(true)}
                    className="fixed top-4 right-4 z-50 h-12 w-12 flex items-center justify-center bg-background/80 backdrop-blur-md border border-border/80 shadow-soft rounded-full hover:bg-muted transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-primary/45"
                    aria-label={`Cart with ${totalItems} items`}
                >
                    <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                    {totalItems > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300 shadow-sm">
                            {totalItems > 99 ? "99+" : totalItems}
                        </span>
                    )}
                </button>

                <ManifestoHero />
                <Suspense fallback={<SectionFallback />}>
                    <TrustComparison />
                    <NABLVerification />
                    <IntegrityPillars />
                    <ProcessTimeline />
                    <TamilNaduTerroir />
                    <WhyWeExist />

                    <ManifestoCTA />
                </Suspense>
                <Footer />
                <StickyBuyButton />
            </main>
        </>
    );
};

export default Index;
