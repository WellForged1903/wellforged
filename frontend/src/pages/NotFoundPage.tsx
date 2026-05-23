import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass, MoveRight, ShoppingBag, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const NotFoundPage = () => {
    return (
        <>
            <SEO title="Page Not Found | Wellforged" noindex={true} description="The page you are looking for doesn't exist. Let's get you back on track with clean nutrition." />
            <Navbar />
            <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 pt-20">
                <div className="max-w-2xl w-full text-center space-y-8 animate-fade-up">
                    <div className="relative inline-block">
                        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl animate-pulse-subtle" />
                        <div className="h-24 w-24 sm:h-32 sm:w-32 bg-card border border-border shadow-elevated rounded-3xl flex items-center justify-center mx-auto relative overflow-hidden group">
                            <Compass className="h-12 w-12 sm:h-16 sm:w-16 text-primary transition-transform duration-700 group-hover:rotate-180" />
                            <div className="absolute top-0 right-0 p-2 opacity-50"><Sparkles className="h-3 w-3 text-gold" /></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="font-display text-4xl sm:text-6xl font-black text-foreground tracking-tight">404</h1>
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">Lost in the Woods?</h2>
                        <p className="font-body text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
                            The page you're searching for seems to have vanished.
                            Let's get you back to the source of clean, transparent nutrition.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                            <Button variant="hero" size="xl" className="w-full sm:w-auto h-14 px-8 gap-2 group">
                                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                                Return Home
                            </Button>
                        </Link>
                        <Link to="/product" onClick={() => window.scrollTo(0, 0)}>
                            <Button variant="outline" size="xl" className="w-full sm:w-auto h-14 px-8 gap-2 border-primary/20 hover:bg-primary/5 text-primary group">
                                <ShoppingBag className="h-4 w-4" />
                                Start Shopping
                                <MoveRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-12 grid grid-cols-2 sm:grid-cols-3 gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Subtle hints for other pages */}
                        <Link to="/transparency" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Lab Reports</Link>
                        <Link to="/about" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Our Story</Link>
          <Link to="/checkout" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors hidden sm:block">Checkout</Link>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default NotFoundPage;
