import { useState, useEffect } from "react";
import { Tag, Star } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "./AdminTypes";

const MarketingTab = () => {
    const [couponForm, setCouponForm] = useState({
        code: '',
        discount_type: 'fixed',
        discount_value: '',
        min_order_value: '',
        expires_at: '',
        max_uses: '1000'
    });
    const [reviews, setReviews] = useState<any[]>([]);
    
    useEffect(() => {
        apiFetch('/api/reviews')
            .then(r => r.json())
            .then(setReviews)
            .catch(() => {});
    }, []);

    const inputCls = "w-full h-11 bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors";

    const handleCouponSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await apiFetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...couponForm,
                    discount_value: parseInt(couponForm.discount_value),
                    min_order_value: couponForm.min_order_value ? parseInt(couponForm.min_order_value) : null,
                    max_uses: parseInt(couponForm.max_uses)
                })
            });
            if (res.ok) {
                toast.success(`Coupon ${couponForm.code} created!`);
                setCouponForm({ code: '', discount_type: 'fixed', discount_value: '', min_order_value: '', expires_at: '', max_uses: '1000' });
            } else {
                toast.error('Failed to create coupon');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const updateReview = async (id: string, status: string) => {
        try {
            const res = await apiFetch(`/api/admin/reviews/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                toast.success(`Review ${status}`);
                setReviews(prev => prev.map(r => r.id === id ? {...r, status} : r));
            } else {
                toast.error('Failed to update review');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    return (
        <div className="space-y-10">
            {/* Coupons Section */}
            <div className="space-y-5 max-w-xl">
                <h2 className="text-xl font-display font-bold text-white">Marketing Coupons</h2>
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
                    <form onSubmit={handleCouponSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Code</label>
                                <input required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="SAVE30" className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Type</label>
                                <select value={couponForm.discount_type} onChange={e => setCouponForm({...couponForm, discount_type: e.target.value})} className={inputCls}>
                                    <option value="fixed">Fixed (₹)</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Discount Value</label>
                                <input required type="number" value={couponForm.discount_value} onChange={e => setCouponForm({...couponForm, discount_value: e.target.value})} placeholder={couponForm.discount_type === 'fixed' ? '30 = ₹30 off' : '10 = 10% off'} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Min Order (₹)</label>
                                <input type="number" value={couponForm.min_order_value} onChange={e => setCouponForm({...couponForm, min_order_value: e.target.value})} placeholder="Optional" className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Expires At</label>
                                <input type="datetime-local" value={couponForm.expires_at} onChange={e => setCouponForm({...couponForm, expires_at: e.target.value})} className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Max Uses</label>
                                <input type="number" value={couponForm.max_uses} onChange={e => setCouponForm({...couponForm, max_uses: e.target.value})} className={inputCls} />
                            </div>
                        </div>
                        <button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                            <Tag className="h-4 w-4" /> Create Coupon
                        </button>
                    </form>
                </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-5">
                <h2 className="text-xl font-display font-bold text-white">Review Moderation</h2>
                {reviews.length === 0 ? (
                    <p className="text-neutral-500 text-sm italic">No reviews found.</p>
                ) : (
                    <div className="space-y-3">
                        {reviews.map(r => (
                            <div key={r.id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}</span>
                                            {r.highlight && <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">{r.highlight}</span>}
                                        </div>
                                        <p className="text-sm text-neutral-300">{r.comment}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
                                            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest bg-neutral-800 px-2 py-0.5 rounded">Product ID: {r.product_id?.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 min-w-[120px]">
                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border text-center ${r.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : r.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>{r.status}</span>
                                        <div className="flex gap-1.5">
                                            <button onClick={() => updateReview(r.id, 'approved')} className="flex-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-bold rounded-lg border border-green-500/20 transition-colors uppercase tracking-wider">Approve</button>
                                            <button onClick={() => updateReview(r.id, 'rejected')} className="flex-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold rounded-lg border border-red-500/20 transition-colors uppercase tracking-wider">Reject</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketingTab;
