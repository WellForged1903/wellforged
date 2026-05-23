import { useState, useEffect } from "react";
import { Plus, RefreshCcw, FolderTree, Power, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Category, apiFetch } from "./AdminTypes";

const CategoriesTab = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', slug: '', description: '', is_active: true });

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch('/api/admin/categories');
            if (res.ok) setCategories(await res.json());
        } catch (err) {
            toast.error('Failed to load categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isEdit = mode === 'edit';
            const url = isEdit ? `/api/admin/categories/${editingId}` : '/api/admin/categories';
            const method = isEdit ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                toast.success(isEdit ? 'Category updated!' : 'Category created!');
                setForm({ name: '', slug: '', description: '', is_active: true });
                setMode('list');
                setEditingId(null);
                fetchCategories();
            } else {
                toast.error(`Failed to ${isEdit ? 'update' : 'create'} category`);
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
        try {
            const res = await apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Category deleted');
                fetchCategories();
            } else {
                toast.error('Failed to delete category');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            const res = await apiFetch(`/api/admin/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !current })
            });
            if (res.ok) {
                toast.success(`Status updated`);
                fetchCategories();
            }
        } catch (err) { toast.error('Failed to update status'); }
    };

    const inputCls = "w-full h-11 bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors";
    const labelCls = "text-xs font-bold text-neutral-400 uppercase tracking-wider";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-display font-bold text-white mb-1">Product Categories</h2>
                    <p className="text-sm text-neutral-500">Manage the product hierarchy and collections.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCategories} className="p-2.5 bg-[#141414] border border-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-colors">
                        <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                        onClick={() => {
                            setMode(mode === 'list' ? 'add' : 'list');
                            if (mode !== 'list') {
                                setForm({ name: '', slug: '', description: '', is_active: true });
                                setEditingId(null);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm font-bold rounded-xl transition-colors"
                    >
                        {mode === 'list' ? <Plus className="h-4 w-4" /> : <FolderTree className="h-4 w-4" />}
                        {mode === 'list' ? 'New Category' : 'Cancel'}
                    </button>
                </div>
            </div>

            {mode === 'add' || mode === 'edit' ? (
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 max-w-2xl animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="font-bold text-white mb-5">{mode === 'edit' ? 'Edit Category' : 'Create New Category'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className={labelCls}>Category Name</label>
                                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: slugify(e.target.value)})} placeholder="e.g. Performance Superfoods" className={inputCls} />
                            </div>
                            <div className="space-y-1.5">
                                <label className={labelCls}>Slug</label>
                                <input required value={form.slug} onChange={e => setForm({...form, slug: slugify(e.target.value)})} placeholder="auto-generated" className={inputCls} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>Description</label>
                            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} placeholder="A short description of this collection..." className="w-full bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors resize-none" />
                        </div>
                        <button type="submit" className="h-11 px-6 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors">
                            {mode === 'edit' ? 'Save Changes' : 'Create Category'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 group hover:border-neutral-700 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                                <div className="p-2.5 bg-neutral-900 rounded-xl border border-neutral-800 group-hover:bg-amber-500/10 group-hover:border-amber-500/20 transition-colors">
                                    <FolderTree className="h-5 w-5 text-neutral-500 group-hover:text-amber-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', is_active: cat.is_active });
                                            setEditingId(cat.id);
                                            setMode('edit');
                                        }}
                                        className="p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white transition-colors"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => toggleStatus(cat.id, cat.is_active)}
                                        className={`p-2 rounded-lg border transition-colors ${cat.is_active ? 'bg-green-500/5 border-green-500/20 text-green-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}
                                        title="Toggle Status"
                                    >
                                        <Power className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(cat.id, cat.name)}
                                        className="p-2 rounded-lg bg-red-500/5 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <h4 className="font-display font-bold text-white mb-1">{cat.name}</h4>
                            <p className="text-xs text-neutral-500 line-clamp-2 min-h-[32px]">{cat.description || 'No description provided.'}</p>
                            <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center justify-between">
                                <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">{cat.slug}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${cat.is_active ? 'text-green-500' : 'text-neutral-600'}`}>
                                    {cat.is_active ? 'Active' : 'Archived'}
                                </span>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && !isLoading && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-neutral-800 rounded-3xl">
                            <FolderTree className="h-10 w-10 text-neutral-700 mx-auto mb-3" />
                            <p className="text-neutral-500">No categories found. Build your hierarchy now.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategoriesTab;
