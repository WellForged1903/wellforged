import { useState, useRef } from "react";
import { Upload, RefreshCcw, Plus, Trash2, Info, HelpCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Product, apiFetch } from "./AdminTypes";
import { API_BASE_URL } from "@/config";

interface Props {
    products: Product[];
    onRefresh: () => void;
}

const ProductsTab = ({ products, onRefresh }: Props) => {
    const [mode, setMode] = useState<'list' | 'add-product' | 'add-sku' | 'stock' | 'metadata' | 'faqs'>('list');
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [metaItems, setMetaItems] = useState([{ category: 'Highlights', key: '', value: '', icon_name: '', display_order: 0 }]);
    const [faqItems, setFaqItems] = useState([{ question: '', answer: '', is_active: true, display_order: 0 }]);
    const [productForm, setProductForm] = useState({ name: '', slug: '', base_description: '', is_active: true });
    const [skuForm, setSkuForm] = useState({ product_id: '', sku_code: '', label: '', price: '', original_price: '', stock: '' });
    const [stockForm, setStockForm] = useState({ sku_id: '', adjustment: '' });
    const [uploading, setUploading] = useState(false);
    const [imageForm, setImageForm] = useState({ product_id: '', is_main: false, display_order: '0' });
    const fileRef = useRef<HTMLInputElement>(null);

    const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const submit = async (url: string, body: any) => {
        try {
            const res = await apiFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Success!');
                onRefresh();
                setMode('list');
                return true;
            }
            toast.error(data.message || 'Error');
            return false;
        } catch (err) {
            toast.error('Network error');
            return false;
        }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submit('/api/admin/products', productForm);
        setProductForm({ name: '', slug: '', base_description: '', is_active: true });
    };

    const handleSkuSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submit('/api/admin/skus', {
            ...skuForm,
            price: Math.round(parseFloat(skuForm.price)),
            original_price: skuForm.original_price ? Math.round(parseFloat(skuForm.original_price)) : undefined,
            stock: parseInt(skuForm.stock)
        });
        setSkuForm({ product_id: '', sku_code: '', label: '', price: '', original_price: '', stock: '' });
    };

    const handleStockSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await apiFetch(`/api/admin/skus/${stockForm.sku_id}/stock`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adjustment: parseInt(stockForm.adjustment) })
            });
            if (res.ok) {
                toast.success('Stock updated!');
                onRefresh();
                setMode('list');
            } else {
                toast.error('Failed to update stock');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const handleDeleteProduct = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This will also remove all associated SKUs and images.`)) return;
        try {
            const res = await apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
            if (res.ok) { toast.success('Deleted'); onRefresh(); }
        } catch (err) { toast.error('Error deleting product'); }
    };

    const handleDeleteSku = async (id: string, code: string) => {
        if (!confirm(`Delete SKU ${code}?`)) return;
        try {
            const res = await apiFetch(`/api/admin/skus/${id}`, { method: 'DELETE' });
            if (res.ok) { toast.success('SKU removed'); onRefresh(); }
        } catch (err) { toast.error('Error'); }
    };

    const handleMetadataSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await apiFetch(`/api/admin/products/${selectedProductId}/metadata`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metadata: metaItems })
        });
        if (res.ok) { toast.success('Metadata saved'); setMode('list'); }
    };

    const handleFaqSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await apiFetch(`/api/admin/products/${selectedProductId}/faqs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ faqs: faqItems })
        });
        if (res.ok) { toast.success('FAQs saved'); setMode('list'); }
    };

    const handleImageUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileRef.current?.files?.[0] || !imageForm.product_id) return toast.error('Select a product and image');
        
        setUploading(true);
        const fd = new FormData();
        fd.append('image', fileRef.current.files[0]);
        fd.append('is_main', String(imageForm.is_main));
        fd.append('display_order', imageForm.display_order);

        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/products/${imageForm.product_id}/images`, {
                method: 'POST',
                credentials: 'include',
                body: fd,
            });
            if (res.ok) toast.success('Image uploaded!');
            else toast.error('Upload failed');
        } catch (err) {
            toast.error('Network error');
        } finally {
            setUploading(false);
        }
    };

    const inputCls = "w-full h-11 bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors";
    const labelCls = "text-xs font-bold text-neutral-400 uppercase tracking-wider";

    const tabs = [
        { id: 'list', label: 'Products' },
        { id: 'add-product', label: '+ New Product' },
        { id: 'add-sku', label: '+ SKU' },
        { id: 'stock', label: '± Stock' },
    ] as const;

    return (
        <div className="space-y-5">
            <h2 className="text-xl font-display font-bold text-white">Products & Inventory</h2>
            
            <div className="flex gap-2 flex-wrap">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setMode(t.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${mode === t.id ? 'bg-amber-500 text-black' : 'bg-[#141414] border border-neutral-800 text-neutral-400 hover:text-white'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {mode === 'list' && (
                <div className="space-y-4">
                    {products.map(p => (
                        <div key={p.id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                                    <p className="text-xs text-neutral-500 font-mono">{p.slug}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => { setSelectedProductId(p.id); setMode('metadata'); }} className="p-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all" title="Edit Metadata"><Info className="h-4 w-4" /></button>
                                    <button onClick={() => { setSelectedProductId(p.id); setMode('faqs'); }} className="p-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl hover:bg-purple-500/20 transition-all" title="Edit FAQs"><HelpCircle className="h-4 w-4" /></button>
                                    <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all" title="Delete Product"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>

                            <div className="bg-black/20 rounded-xl border border-neutral-800/50 overflow-hidden mt-4">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-neutral-900/50">
                                        <tr>
                                            <th className="px-4 py-2.5 font-bold text-neutral-500 uppercase tracking-widest">SKU Detail</th>
                                            <th className="px-4 py-2.5 font-bold text-neutral-500 uppercase tracking-widest">Price</th>
                                            <th className="px-4 py-2.5 font-bold text-neutral-500 uppercase tracking-widest">Stock</th>
                                            <th className="px-4 py-2.5 font-bold text-neutral-500 uppercase tracking-widest">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/50">
                                        {(p as any).skus?.map((sku: any) => (
                                            <tr key={sku.id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold text-white">{sku.label}</div>
                                                    <div className="text-neutral-500 font-mono text-[10px]">{sku.sku_code}</div>
                                                </td>
                                                <td className="px-4 py-3 text-neutral-300">₹{sku.price.toFixed(0)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`flex items-center gap-1 font-bold ${sku.stock < 10 ? 'text-rose-500' : 'text-neutral-400'}`}>
                                                        {sku.stock}
                                                        {sku.stock < 10 && <AlertTriangle className="h-3 w-3 animate-pulse" />}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button onClick={() => handleDeleteSku(sku.id, sku.sku_code)} className="text-neutral-600 hover:text-red-500 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {mode === 'add-product' && (
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 space-y-4 max-w-2xl">
                    <h3 className="font-bold text-white">Create Product</h3>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Name</label>
                                <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value, slug: slugify(e.target.value)})} placeholder="e.g. Ashwagandha Powder" className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Slug</label>
                                <input required value={productForm.slug} onChange={e => setProductForm({...productForm, slug: slugify(e.target.value)})} placeholder="auto-generated" className={inputCls} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Description</label>
                            <textarea required value={productForm.base_description} onChange={e => setProductForm({...productForm, base_description: e.target.value})} rows={3} placeholder="Product description..." className="w-full bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors resize-none" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={productForm.is_active} onChange={e => setProductForm({...productForm, is_active: e.target.checked})} className="accent-amber-500" />
                            <span className="text-sm text-neutral-300">Active (visible on store)</span>
                        </label>
                        <button type="submit" className="h-11 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors">Create Product</button>
                    </form>

                    <div className="border-t border-neutral-800 pt-5 space-y-4">
                        <h4 className="font-bold text-white text-sm">Upload Product Image</h4>
                        <form onSubmit={handleImageUpload} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Select Product</label>
                                <select value={imageForm.product_id} onChange={e => setImageForm({...imageForm, product_id: e.target.value})} className={inputCls}>
                                    <option value="">Choose product...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-neutral-700 hover:border-amber-500/40 rounded-xl p-8 text-center cursor-pointer transition-colors group">
                                <Upload className="h-6 w-6 text-neutral-500 group-hover:text-amber-500 mx-auto mb-2 transition-colors" />
                                <p className="text-sm text-neutral-400">Click to upload PNG / JPEG / WebP</p>
                                <p className="text-xs text-neutral-600 mt-1">Max 3MB · Auto-converted to WebP</p>
                                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" />
                            </div>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={imageForm.is_main} onChange={e => setImageForm({...imageForm, is_main: e.target.checked})} className="accent-amber-500" />
                                    <span className="text-sm text-neutral-300">Set as Main Thumbnail</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-neutral-500">Order:</label>
                                    <input type="number" value={imageForm.display_order} onChange={e => setImageForm({...imageForm, display_order: e.target.value})} className="w-16 h-8 bg-[#0d0d0d] border border-neutral-700 rounded-lg px-2 text-sm text-white focus:outline-none" />
                                </div>
                            </div>
                            <button type="submit" disabled={uploading} className="h-10 px-5 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                                {uploading ? <RefreshCcw className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload Image
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {mode === 'add-sku' && (
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 max-w-2xl">
                    <h3 className="font-bold text-white mb-4">Add SKU / Variant</h3>
                    <form onSubmit={handleSkuSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className={labelCls}>Product</label>
                            <select required value={skuForm.product_id} onChange={e => setSkuForm({...skuForm, product_id: e.target.value})} className={inputCls}>
                                <option value="">Select product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className={labelCls}>SKU Code</label><input required value={skuForm.sku_code} onChange={e => setSkuForm({...skuForm, sku_code: e.target.value})} placeholder="WF-ASH-100" className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Label</label><input required value={skuForm.label} onChange={e => setSkuForm({...skuForm, label: e.target.value})} placeholder="100g Pouch" className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Price (₹ Rupees)</label><input required type="number" value={skuForm.price} onChange={e => setSkuForm({...skuForm, price: e.target.value})} placeholder="e.g. 349" className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Original Price (₹)</label><input type="number" value={skuForm.original_price} onChange={e => setSkuForm({...skuForm, original_price: e.target.value})} placeholder="e.g. 499" className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Initial Stock</label><input required type="number" value={skuForm.stock} onChange={e => setSkuForm({...skuForm, stock: e.target.value})} placeholder="100" className={inputCls} /></div>
                        </div>
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 text-xs text-blue-400 font-medium">ℹ Enter prices in normal Rupees. System automatically handles storage.</div>
                        <button type="submit" className="h-11 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors">Add SKU</button>
                    </form>
                </div>
            )}

            {mode === 'stock' && (
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 max-w-md">
                    <h3 className="font-bold text-white mb-4">Adjust Stock</h3>
                    <form onSubmit={handleStockSubmit} className="space-y-4">
                        <div className="space-y-1.5"><label className={labelCls}>SKU ID</label><input required value={stockForm.sku_id} onChange={e => setStockForm({...stockForm, sku_id: e.target.value})} placeholder="Paste SKU UUID" className={inputCls} /></div>
                        <div className="space-y-1.5"><label className={labelCls}>Adjustment (+ or -)</label><input required type="number" value={stockForm.adjustment} onChange={e => setStockForm({...stockForm, adjustment: e.target.value})} placeholder="+50 or -10" className={inputCls} /></div>
                        <button type="submit" className="h-11 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors">Update Stock</button>
                    </form>
                </div>
            )}
            {mode === 'metadata' && (
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 space-y-6 max-w-3xl">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">Product Highlights & Metadata</h3>
                        <button onClick={() => setMetaItems([...metaItems, { category: 'Highlights', key: '', value: '', icon_name: '', display_order: metaItems.length }])} className="text-xs bg-amber-500 text-black px-3 py-1.5 rounded-lg font-bold">Add Row</button>
                    </div>
                    <form onSubmit={handleMetadataSubmit} className="space-y-4">
                        {metaItems.map((item, i) => (
                            <div key={i} className="grid grid-cols-5 gap-2 items-center">
                                <input value={item.key} onChange={e => { const n = [...metaItems]; n[i].key = e.target.value; setMetaItems(n); }} placeholder="Key (e.g. Diet)" className={inputCls} />
                                <input value={item.value} onChange={e => { const n = [...metaItems]; n[i].value = e.target.value; setMetaItems(n); }} placeholder="Value (e.g. Keto)" className={inputCls} />
                                <input value={item.icon_name} onChange={e => { const n = [...metaItems]; n[i].icon_name = e.target.value; setMetaItems(n); }} placeholder="Icon (Lucide name)" className={inputCls} />
                                <input type="number" value={item.display_order} onChange={e => { const n = [...metaItems]; n[i].display_order = parseInt(e.target.value); setMetaItems(n); }} className={inputCls} />
                                <button type="button" onClick={() => setMetaItems(metaItems.filter((_, idx) => idx !== i))} className="text-red-500 p-2">×</button>
                            </div>
                        ))}
                        <button type="submit" className="bg-amber-500 text-black px-6 h-11 rounded-xl font-bold">Save Metadata</button>
                    </form>
                </div>
            )}

            {mode === 'faqs' && (
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 space-y-6 max-w-3xl">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white">Product FAQs</h3>
                        <button onClick={() => setFaqItems([...faqItems, { question: '', answer: '', is_active: true, display_order: faqItems.length }])} className="text-xs bg-amber-500 text-black px-3 py-1.5 rounded-lg font-bold">Add FAQ</button>
                    </div>
                    <form onSubmit={handleFaqSubmit} className="space-y-4">
                        {faqItems.map((item, i) => (
                            <div key={i} className="p-4 border border-neutral-800 rounded-xl space-y-3 bg-black/10">
                                <input value={item.question} onChange={e => { const n = [...faqItems]; n[i].question = e.target.value; setFaqItems(n); }} placeholder="Question" className={inputCls} />
                                <textarea value={item.answer} onChange={e => { const n = [...faqItems]; n[i].answer = e.target.value; setFaqItems(n); }} placeholder="Answer" className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2 text-sm text-white" />
                                <button type="button" onClick={() => setFaqItems(faqItems.filter((_, idx) => idx !== i))} className="text-xs text-red-500 underline">Remove FAQ</button>
                            </div>
                        ))}
                        <button type="submit" className="bg-amber-500 text-black px-6 h-11 rounded-xl font-bold">Save FAQs</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProductsTab;
