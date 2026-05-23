import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SEO from "@/components/SEO";
import { ShieldCheck, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const AdminLogin = () => {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return toast.error("Password is required");

        setIsSubmitting(true);
        const result = await login(password);
        setIsSubmitting(false);

        if (result.success) {
            toast.success("Welcome back, Admin!");
            navigate("/admin");
        } else {
            toast.error(result.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a] flex items-center justify-center px-4">
            <SEO title="Admin Login | WellForged" noindex={true} canonical="/admin/login" />

            <div className="w-full max-w-md">
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 mb-5">
                        <ShieldCheck className="w-8 h-8 text-amber-500" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-white tracking-tight">
                        WellForged Admin
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1.5 font-body">
                        Secure operations portal
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-8 shadow-2xl shadow-black/40">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                                Admin Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter admin password"
                                    className="w-full h-12 bg-[#0d0d0d] border border-neutral-700 rounded-xl pl-11 pr-12 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-600/20"
                        >
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="h-4 w-4" />
                                    Access Dashboard
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center text-[11px] text-neutral-600 mt-6">
                    This portal is restricted to authorized personnel only.
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;
