import { useState } from "react";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Product, apiFetch } from "./AdminTypes";

interface Props {
    products: Product[];
}

const BatchesTab = ({ products }: Props) => {
    const [batchData, setBatchData] = useState({
        product_id: '',
        batch_number: '',
        testing_date: new Date().toISOString().split('T')[0],
        tested_by: 'Eurofins Lab Services',
        test_results: [{ test_name: 'Purity', test_value: '99.2', unit: '%', pass_status: true }]
    });

    const inputCls = "w-full h-11 bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchData.product_id) return toast.error('Select a product');
        
        try {
            const res = await apiFetch('/api/inventory/batch-report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(batchData)
            });
            if (res.ok) {
                toast.success('Batch report published!');
                setBatchData({
                    ...batchData,
                    product_id: '',
                    batch_number: '',
                    test_results: [{ test_name: '', test_value: '', unit: '', pass_status: true }]
                });
            } else {
                toast.error('Failed to create batch');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    return (
        <div className="space-y-5 max-w-2xl">
            <div>
                <h2 className="text-xl font-display font-bold text-white">Lab Batch Reports</h2>
                <p className="text-sm text-neutral-500 mt-1">Published reports are publicly visible on the Transparency Portal.</p>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Product</label>
                            <select
                                value={batchData.product_id}
                                onChange={e => setBatchData({...batchData, product_id: e.target.value})}
                                className={inputCls}
                            >
                                <option value="">Select product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Batch Number</label>
                            <input value={batchData.batch_number} onChange={e => setBatchData({...batchData, batch_number: e.target.value})} placeholder="WF-MOR-24A" className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Testing Date</label>
                            <input type="date" value={batchData.testing_date} onChange={e => setBatchData({...batchData, testing_date: e.target.value})} className={inputCls} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Lab Name</label>
                            <input value={batchData.tested_by} onChange={e => setBatchData({...batchData, tested_by: e.target.value})} className={inputCls} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Lab Parameters</label>
                            <button
                                type="button"
                                onClick={() => setBatchData({...batchData, test_results: [...batchData.test_results, { test_name: '', test_value: '', unit: '', pass_status: true }]})}
                                className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1"
                            >
                                <Plus className="h-3 w-3" /> Add Row
                            </button>
                        </div>
                        {batchData.test_results.map((t, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input
                                    placeholder="Test Name"
                                    value={t.test_name}
                                    onChange={e => {
                                        const u = [...batchData.test_results];
                                        u[i] = {...u[i], test_name: e.target.value};
                                        setBatchData({...batchData, test_results: u});
                                    }}
                                    className="flex-1 h-10 bg-[#0d0d0d] border border-neutral-700 rounded-lg px-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                                />
                                <input
                                    placeholder="Result"
                                    value={t.test_value}
                                    onChange={e => {
                                        const u = [...batchData.test_results];
                                        u[i] = {...u[i], test_value: e.target.value};
                                        setBatchData({...batchData, test_results: u});
                                    }}
                                    className="w-24 h-10 bg-[#0d0d0d] border border-neutral-700 rounded-lg px-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                                />
                                <input
                                    placeholder="Unit"
                                    value={t.unit}
                                    onChange={e => {
                                        const u = [...batchData.test_results];
                                        u[i] = {...u[i], unit: e.target.value};
                                        setBatchData({...batchData, test_results: u});
                                    }}
                                    className="w-16 h-10 bg-[#0d0d0d] border border-neutral-700 rounded-lg px-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setBatchData({...batchData, test_results: batchData.test_results.filter((_,j)=>j!==i)})}
                                    className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <button type="submit" className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Publish Lab Report
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BatchesTab;
