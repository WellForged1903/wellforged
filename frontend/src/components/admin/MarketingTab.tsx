import { useState, useEffect } from "react";
import { Star, RefreshCcw, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "./AdminTypes";

const MarketingTab = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch('/api/admin/reviews');
            if (res.ok) {
                setReviews(await res.json());
            } else {
                toast.error('Failed to load reviews');
            }
        } catch (err) {
            toast.error('Network error loading reviews');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const updateReview = async (id: string, status: string) => {
        try {
            const res = await apiFetch(`/api/admin/reviews/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success(`Review successfully ${status === 'published' ? 'approved' : 'rejected'}`);
                setReviews(prev => prev.map(r => r.id === id ? {...r, status: status === 'published' ? 'published' : 'rejected'} : r));
            } else {
                toast.error('Failed to update review status');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const toggleVerification = async (id: string, currentStatus: boolean) => {
        try {
            const res = await apiFetch(`/api/admin/reviews/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_verified_purchase: !currentStatus })
            });
            if (res.ok) {
                toast.success(`Verification status updated`);
                setReviews(prev => prev.map(r => r.id === id ? {...r, is_verified_purchase: !currentStatus} : r));
            } else {
                toast.error('Failed to update verification status');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-display font-bold text-white mb-1">Review Moderation</h2>
                    <p className="text-sm text-neutral-500">Approve or reject customer reviews. Approved reviews will display instantly on the product details page.</p>
                </div>
                <button 
                    onClick={fetchReviews} 
                    className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
                >
                    <RefreshCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-neutral-500">
                    <RefreshCcw className="mx-auto mb-4 h-6 w-6 animate-spin" />
                    Syncing Reviews...
                </div>
            ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-800 py-24 text-center">
                    <Star className="mx-auto mb-4 h-10 w-10 text-neutral-600/30" />
                    <p className="font-display font-medium text-neutral-500">No reviews found.</p>
                    <p className="text-[11px] text-neutral-600 mt-1 uppercase tracking-widest">Customer feedback will appear here once submitted.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(r => {
                        const isPublished = r.status === 'published' || r.status === 'approved';
                        const statusLabel = isPublished ? 'Approved' : r.status;

                        return (
                            <div key={r.id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 shadow-sm hover:border-neutral-700/50 transition-all duration-200">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-amber-400 text-sm">
                                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                            </span>
                                            {r.is_verified_purchase ? (
                                                <span className="text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    Verified Purchase
                                                </span>
                                            ) : (
                                                <span className="text-[9px] bg-neutral-800 text-neutral-400 border border-neutral-700/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    Unverified
                                                </span>
                                            )}
                                            <button
                                                onClick={() => toggleVerification(r.id, r.is_verified_purchase)}
                                                className="text-[9px] text-amber-500/80 hover:text-amber-400 underline uppercase tracking-wider font-bold transition-colors ml-1"
                                            >
                                                {r.is_verified_purchase ? "Mark Unverified" : "Mark Verified"}
                                            </button>
                                        </div>
                                        <p className="text-sm text-neutral-200 font-medium italic">"{r.comment}"</p>
                                        <div className="flex items-center gap-3 mt-3 text-[10px] text-neutral-500 flex-wrap">
                                            <p className="font-bold text-neutral-400">{r.customer_name}</p>
                                            <span>•</span>
                                            <p className="uppercase tracking-wider">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                                            <span>•</span>
                                            <p className="font-mono bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded">Product ID: {r.product_id?.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-2 min-w-[140px] justify-between md:justify-start items-center md:items-stretch w-full md:w-auto mt-2 md:mt-0 border-t md:border-t-0 pt-3 md:pt-0 border-neutral-800/50">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border text-center uppercase tracking-widest ${
                                            isPublished
                                                ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                                                : r.status === 'rejected' 
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                        }`}>
                                            {statusLabel}
                                        </span>
                                        <div className="flex gap-1.5 mt-1">
                                            <button 
                                                onClick={() => updateReview(r.id, 'published')} 
                                                disabled={isPublished}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 transition-all uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                <CheckCircle2 className="h-3 w-3" /> Approve
                                            </button>
                                            <button 
                                                onClick={() => updateReview(r.id, 'rejected')} 
                                                disabled={r.status === 'rejected'}
                                                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 transition-all uppercase tracking-wider disabled:opacity-50 disabled:pointer-events-none"
                                            >
                                                <XCircle className="h-3 w-3" /> Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MarketingTab;
