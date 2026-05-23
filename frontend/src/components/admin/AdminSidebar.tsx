import { ShieldCheck, ChevronRight, LogOut } from "lucide-react";

interface NavItem {
    id: string;
    label: string;
    icon: React.FC<any>;
}

interface Props {
    navItems: NavItem[];
    activeTab: string;
    setActiveTab: (id: string) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    handleLogout: () => void;
}

const AdminSidebar = ({
    navItems,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    handleLogout
}: Props) => {
    return (
        <>
            {/* Sidebar Overlay (mobile) */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" 
                    onClick={() => setSidebarOpen(false)} 
                />
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed top-0 left-0 h-full w-64 bg-[#101010] border-r border-neutral-800 z-40 flex flex-col transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } lg:translate-x-0 lg:static`}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <div className="font-display font-bold text-white text-sm">WellForged</div>
                            <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Admin Panel</div>
                        </div>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map(({ id, label, icon: Icon }) => (
                        <button 
                            key={id} 
                            onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                                activeTab === id 
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-white border border-transparent'
                            }`}
                        >
                            <Icon className={`h-4 w-4 flex-shrink-0 transition-colors ${
                                activeTab === id ? 'text-amber-500' : 'group-hover:text-amber-500/70'
                            }`} />
                            <span className="flex-1 text-left">{label}</span>
                            {activeTab === id && <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                    ))}
                </nav>

                {/* Bottom Section (Logout) */}
                <div className="p-3 border-t border-neutral-800">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:bg-red-500/10 hover:text-red-400 border border-transparent transition-all"
                    >
                        <LogOut className="h-4 w-4" /> 
                        <span>Logout</span>
                    </button>
                    <div className="mt-4 px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800">
                        <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold text-center">Version 1.0.0-PROD</p>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
