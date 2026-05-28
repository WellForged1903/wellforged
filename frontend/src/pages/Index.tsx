import { Suspense, lazy } from "react";
import SEO from "@/components/SEO";
import Navbar from "@/components/Navbar";
import ManifestoHero from "@/components/ManifestoHero";
import Footer from "@/components/Footer";
import StickyBuyButton from "@/components/StickyBuyButton";

const TrustComparison = lazy(() => import("@/components/TrustComparison"));
const NABLVerification = lazy(() => import("@/components/NABLVerification"));
const IntegrityPillars = lazy(() => import("@/components/IntegrityPillars"));
const ProcessTimeline = lazy(() => import("@/components/ProcessTimeline"));
const TamilNaduTerroir = lazy(() => import("@/components/TamilNaduTerroir"));
const WhyWeExist = lazy(() => import("@/components/WhyWeExist"));
const HomeReviews = lazy(() => import("@/components/HomeReviews"));

const ManifestoCTA = lazy(() => import("@/components/ManifestoCTA"));

const SectionFallback = () => (
    <div className="section-padding bg-background">
        <div className="mx-auto max-w-6xl">
            <div className="premium-panel h-56 animate-pulse bg-secondary/50" />
        </div>
    </div>
);

const Index = () => {
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
            <main className="min-h-screen page-pt">
                <Navbar />
                <ManifestoHero />
                <Suspense fallback={<SectionFallback />}>
                    <HomeReviews />
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
