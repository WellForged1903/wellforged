import { useState, useEffect } from "react";
import { Plus, Trash2, Tag, Calendar, Users, AlertCircle, Percent, IndianRupee, RefreshCcw, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiFetch } from "./AdminTypes";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
}

const CouponsTab = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_type: "percentage" as const,
    discount_value: "",
    min_order_value: "0",
    max_uses: "",
    expires_at: "",
    is_active: true
  });

  const fetchCoupons = async () => {
    try {
      const response = await apiFetch(`/api/admin/coupons`);
      if (!response.ok) throw new Error("Failed to fetch coupons");
      const data = await response.json();
      setCoupons(data);
    } catch (error) {
      toast.error("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const resetForm = () => {
    setCouponForm({
      code: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_value: "0",
      max_uses: "",
      expires_at: "",
      is_active: true
    });
    setEditingId(null);
    setMode('list');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discount_value) {
      toast.error("Please fill required fields");
      return;
    }

    try {
      const payload = {
        ...couponForm,
        discount_value: parseFloat(couponForm.discount_value),
        min_order_value: parseFloat(couponForm.min_order_value || "0"),
        max_uses: couponForm.max_uses ? parseInt(couponForm.max_uses) : null,
        expires_at: couponForm.expires_at || null
      };

      const url = mode === 'edit' ? `/api/admin/coupons/${editingId}` : `/api/admin/coupons`;
      const method = mode === 'edit' ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save coupon");
      
      toast.success(mode === 'edit' ? "Coupon updated" : "Coupon created");
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to save coupon");
    }
  };

  const handleEditClick = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCouponForm({
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        min_order_value: coupon.min_order_value.toString(),
        max_uses: coupon.max_uses?.toString() || "",
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : "",
        is_active: coupon.is_active
    });
    setMode('edit');
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const response = await apiFetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete coupon");
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const inputCls = "w-full h-11 bg-[#0d0d0d] border border-neutral-800 rounded-xl px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors";
  const labelCls = "text-[10px] font-bold text-neutral-500 uppercase tracking-widest";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-display font-bold text-white">Discount Coupons</h3>
          <p className="text-xs text-neutral-400">Manage promo codes and special offers.</p>
        </div>
        <Button 
          onClick={() => mode === 'list' ? setMode('add') : resetForm()} 
          variant="outline" 
          className="gap-2 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-500"
        >
          {mode === 'list' ? <><Plus className="h-4 w-4" /> Create Coupon</> : "Cancel"}
        </Button>
      </div>

      {mode !== 'list' && (
        <div className="rounded-2xl border border-neutral-800 bg-[#141414] p-6 shadow-xl animate-in fade-in slide-in-from-top-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className={labelCls}>Coupon Code</label>
                <input 
                  className={inputCls}
                  placeholder="e.g. WELCOME10" 
                  value={couponForm.code} 
                  onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Discount Type</label>
                <select 
                  className={inputCls}
                  value={couponForm.discount_type}
                  onChange={e => setCouponForm({...couponForm, discount_type: e.target.value as any})}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className={labelCls}>
                  {couponForm.discount_type === 'percentage' ? 'Discount %' : 'Discount Amount (₹)'}
                </label>
                <input 
                  className={inputCls}
                  type="number"
                  placeholder={couponForm.discount_type === 'percentage' ? "10" : "100"}
                  value={couponForm.discount_value}
                  onChange={e => setCouponForm({...couponForm, discount_value: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Min. Order Value (₹)</label>
                <input 
                  className={inputCls}
                  type="number"
                  placeholder="0"
                  value={couponForm.min_order_value}
                  onChange={e => setCouponForm({...couponForm, min_order_value: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Max Uses (Optional)</label>
                <input 
                  className={inputCls}
                  type="number"
                  placeholder="Unlimited"
                  value={couponForm.max_uses}
                  onChange={e => setCouponForm({...couponForm, max_uses: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className={labelCls}>Expiry Date</label>
                <input 
                  className={inputCls}
                  type="date"
                  value={couponForm.expires_at}
                  onChange={e => setCouponForm({...couponForm, expires_at: e.target.value})}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input 
                    type="checkbox" 
                    checked={couponForm.is_active} 
                    onChange={e => setCouponForm({...couponForm, is_active: e.target.checked})}
                    className="w-4 h-4 rounded border-neutral-700 bg-[#0d0d0d] text-amber-500 focus:ring-amber-500/20"
                />
                <label className={labelCls}>Is Active</label>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" className="px-10 bg-amber-500 hover:bg-amber-400 text-black font-bold h-12 rounded-xl">
                {mode === 'edit' ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-neutral-500">
           <RefreshCcw className="mx-auto mb-4 h-6 w-6 animate-spin" />
           Syncing Coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 py-24 text-center">
          <Tag className="mx-auto mb-4 h-10 w-10 text-neutral-600/30" />
          <p className="font-display font-medium text-neutral-500">No active coupons found.</p>
          <p className="text-[11px] text-neutral-600 mt-1 uppercase tracking-widest">Create a promotional campaign to boost your metrics.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-[#141414] p-5 group transition-all hover:border-amber-500/30">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-bold tracking-tight text-white">{coupon.code}</span>
                    {coupon.is_active ? 
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> :
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                    }
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500">
                    {coupon.discount_type === 'percentage' ? (
                        <><Percent className="h-3.5 w-3.5" /> {coupon.discount_value}% Off</>
                    ) : (
                        <><IndianRupee className="h-3.5 w-3.5" /> ₹{coupon.discount_value} Off</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                        onClick={() => handleEditClick(coupon)}
                        className="p-2 text-neutral-600 hover:text-amber-500 transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="p-2 text-neutral-600 hover:text-red-500 transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-y-4 pt-5 border-t border-neutral-800/50">
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('en-IN') : 'Infinite'}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 justify-end">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {coupon.max_uses 
                        ? `${coupon.max_uses - coupon.used_count} Remaining` 
                        : '∞ Remaining'}
                  </span>
                </div>
                <div className="col-span-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-neutral-500 font-bold">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500/50" />
                    <span>Min Order: ₹{coupon.min_order_value.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CouponsTab;
