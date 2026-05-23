import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import {
    LayoutDashboard, Package, ClipboardList, ShieldCheck, Tag,
    Star, Menu, RefreshCcw, FolderTree
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

// Modular Components
import { Order, Product, apiFetch } from "@/components/admin/AdminTypes";
import AdminSidebar from "@/components/admin/AdminSidebar";
import OverviewTab from "@/components/admin/OverviewTab";
import OrdersTab from "@/components/admin/OrdersTab";
import ProductsTab from "@/components/admin/ProductsTab";
import BatchesTab from "@/components/admin/BatchesTab";
import MarketingTab from "@/components/admin/MarketingTab";
import CategoriesTab from "@/components/admin/CategoriesTab";
import CouponsTab from "@/components/admin/CouponsTab";

type AdminTab = 'overview' | 'orders' | 'products' | 'categories' | 'coupons' | 'batches' | 'marketing';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    
    const { logout } = useAuth();
    const navigate = useNavigate();

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [ordRes, prodRes] = await Promise.all([
                apiFetch('/api/orders/admin/all'),
                apiFetch('/api/admin/products/all'),
            ]);
            
            if (ordRes.ok) setOrders(await ordRes.json());
            if (prodRes.ok) setProducts(await prodRes.json());
        } catch (error) {
            toast.error('Connection failed. Please check your network.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const navItems = [
        { id: 'overview',  label: 'Overview',   icon: LayoutDashboard },
        { id: 'orders',    label: 'Orders',      icon: ClipboardList },
        { id: 'products',  label: 'Products',    icon: Package },
        { id: 'categories', label: 'Categories',  icon: FolderTree },
        { id: 'coupons',   label: 'Coupons',     icon: Tag },
        { id: 'batches',   label: 'Lab Batches', icon: ShieldCheck },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex overflow-hidden">
            <SEO title="Admin CRM | WellForged" noindex={true} />

            <AdminSidebar 
                navItems={navItems}
                activeTab={activeTab}
                setActiveTab={(id) => setActiveTab(id as AdminTab)}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-y-auto custom-scrollbar">
                {/* Global Admin Header */}
                <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-4 sm:px-6 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(true)} 
                            className="lg:hidden text-neutral-400 hover:text-white p-1 transition-colors"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h1 className="font-display font-bold text-white capitalize hidden sm:block tracking-tight text-sm uppercase opacity-80">
                            {activeTab} Management
                        </h1>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isLoading && (
                            <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-widest bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
                                <RefreshCcw className="h-3 w-3 animate-spin" /> Syncing
                            </div>
                        )}
                        <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-full px-4 py-1.5 shadow-inner">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse" />
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Server Live</span>
                        </div>
                    </div>
                </header>

                {/* Sub-view Rendering */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-20">
                    {activeTab === 'overview' && <OverviewTab orders={orders} products={products} />}
                    {activeTab === 'orders' && <OrdersTab orders={orders} onRefresh={fetchAllData} />}
                    {activeTab === 'products' && <ProductsTab products={products} onRefresh={fetchAllData} />}
                    { activeTab === 'categories' && <CategoriesTab /> }
                    { activeTab === 'coupons' && <CouponsTab /> }
                    { activeTab === 'batches' && <BatchesTab products={products} /> }
                    { activeTab === 'marketing' && <MarketingTab /> }
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
