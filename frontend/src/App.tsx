import { Suspense, lazy, useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CartDrawer from "@/components/CartDrawer";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const TransparencyPage = lazy(() => import("./pages/TransparencyPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const PrivacyPolicy = lazy(() => import("./pages/legal/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/legal/TermsConditions"));
const RefundPolicy = lazy(() => import("./pages/legal/RefundPolicy"));
const ShippingPolicy = lazy(() => import("./pages/legal/ShippingPolicy"));
const ContactUs = lazy(() => import("./pages/legal/ContactUs"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));


import PageLoader from "@/components/PageLoader";

const RouteFallback = () => <PageLoader />;

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
};

const App = () => (
    <HelmetProvider>
        <AuthProvider>
            <CartProvider>
                <TooltipProvider>
                    <ErrorBoundary>
                        <Sonner />
                        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                                <ScrollToTop />
                                <CartDrawer />
                                <Suspense fallback={<RouteFallback />}>
                                    <Routes>
                                        <Route path="/" element={<Index />} />
                                        <Route path="/transparency" element={<TransparencyPage />} />
                                        <Route path="/product" element={<ProductPage />} />
                                        <Route path="/about" element={<AboutPage />} />
                                        <Route path="/blog" element={<BlogIndex />} />
                                        <Route path="/checkout" element={<CheckoutPage />} />
                                        
                                        {/* Legal Pages */}
                                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                                        <Route path="/terms-conditions" element={<TermsConditions />} />
                                        <Route path="/refund-policy" element={<RefundPolicy />} />
                                        <Route path="/shipping-policy" element={<ShippingPolicy />} />
                                        <Route path="/contact" element={<ContactUs />} />

                                        <Route path="/order-success" element={<OrderSuccessPage />} />
                                        <Route path="/admin/login" element={<AdminLogin />} />
                                        <Route path="/admin" element={
                                            <ProtectedRoute requiredRole="admin">
                                                <AdminDashboard />
                                            </ProtectedRoute>
                                        } />
                                        <Route path="*" element={<NotFoundPage />} />
                                    </Routes>
                                </Suspense>
                            </BrowserRouter>
                        </ErrorBoundary>
                    </TooltipProvider>
            </CartProvider>
        </AuthProvider>
    </HelmetProvider>
);

export default App;
