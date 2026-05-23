import { useState } from "react";
import { Search, RefreshCcw, Truck, Eye } from "lucide-react";
import { toast } from "sonner";
import { Order, apiFetch, statusColor, statusIcons } from "./AdminTypes";
import OrderDetailsModal from "./OrderDetailsModal";

interface Props {
    orders: Order[];
    onRefresh: () => void;
}

const OrdersTab = ({ orders, onRefresh }: Props) => {
    const [search, setSearch] = useState('');
    const [fulfillOrder, setFulfillOrder] = useState<Order | null>(null);
    const [fulfillData, setFulfillData] = useState({
        tracking_number: '',
        courier_partner: '',
        fulfillment_status: 'shipped'
    });
    const [viewOrder, setViewOrder] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const filtered = orders.filter(o => {
        const matchesSearch = (o.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
            o.order_number?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.fulfillment_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleFulfill = async () => {
        if (!fulfillOrder) return;
        try {
            const res = await apiFetch(`/api/admin/orders/${fulfillOrder.id}/fulfill`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fulfillData),
            });
            if (res.ok) {
                toast.success('Order fulfilled!');
                setFulfillOrder(null);
                onRefresh();
            } else {
                toast.error('Failed to update order');
            }
        } catch (err) {
            toast.error('Network error during fulfillment');
        }
    };

    const handleStatusChange = async (id: string, status: string) => {
        try {
            const res = await apiFetch(`/api/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fulfillment_status: status }),
            });
            if (res.ok) {
                toast.success(`Status updated`);
                onRefresh();
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            toast.error('Network error');
        }
    };

    const handleViewDetails = async (id: string) => {
        setIsLoadingDetails(true);
        try {
            const res = await apiFetch(`/api/admin/orders/${id}`);
            if (res.ok) {
                const data = await res.json();
                setViewOrder(data);
            } else {
                toast.error('Failed to fetch order details');
            }
        } catch (err) {
            toast.error('Error connecting to server');
        } finally {
            setIsLoadingDetails(false);
        }
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold text-white">Orders</h2>
                <button onClick={onRefresh} className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors">
                    <RefreshCcw className="h-3.5 w-3.5" /> Refresh
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search by name or order #"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#141414] border border-neutral-800 rounded-xl">
                    {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                statusFilter === s 
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                                : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[640px]">
                        <thead>
                            <tr className="border-b border-neutral-800">
                                {['Order #', 'Customer', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-neutral-500 italic">No orders found.</td></tr>
                            ) : filtered.map(order => {
                                const StatusIcon = statusIcons[order.fulfillment_status];
                                return (
                                    <tr key={order.id} className="hover:bg-neutral-800/20 transition-colors">
                                        <td className="px-5 py-4 font-mono text-xs text-neutral-400">{order.order_number || order.id.slice(0, 12)}</td>
                                        <td className="px-5 py-4">
                                            <div className="text-sm font-semibold text-white">{order.full_name || 'Guest'}</div>
                                            <div className="text-[11px] text-neutral-500">{order.phone}</div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-neutral-400">{new Date(order.created_at).toLocaleDateString('en-IN')}</td>
                                        <td className="px-5 py-4 text-sm font-bold text-white">₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor[order.fulfillment_status]}`}>
                                                <StatusIcon className="h-3.5 w-3.5" /> {order.fulfillment_status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 flex items-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(order.id)}
                                                disabled={isLoadingDetails}
                                                className="p-1.5 bg-neutral-800 border border-neutral-700 text-neutral-400 hover:text-white rounded-lg transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setFulfillOrder(order);
                                                    setFulfillData({
                                                        tracking_number: order.tracking_number || '',
                                                        courier_partner: order.courier_partner || '',
                                                        fulfillment_status: 'shipped'
                                                    });
                                                }}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-lg transition-colors"
                                            >
                                                <Truck className="h-3 w-3" /> Fulfill
                                            </button>
                                            <select
                                                value={order.fulfillment_status}
                                                onChange={e => handleStatusChange(order.id, e.target.value)}
                                                className="text-xs bg-neutral-800 border border-neutral-700 rounded-lg py-1.5 px-2 text-neutral-300 focus:outline-none focus:border-amber-500/40 font-semibold"
                                            >
                                                {['pending','processing','shipped','delivered','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Fulfill Modal */}
            {fulfillOrder && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setFulfillOrder(null)}>
                    <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-display font-bold text-white mb-1">Fulfill Order</h3>
                        <p className="text-xs text-neutral-500 mb-5">Order #{fulfillOrder.order_number}</p>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Tracking Number</label>
                                <input
                                    value={fulfillData.tracking_number}
                                    onChange={e => setFulfillData({...fulfillData, tracking_number: e.target.value})}
                                    placeholder="e.g. 1234567890123"
                                    className="mt-1.5 w-full h-11 bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/40 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Courier Partner</label>
                                <select
                                    value={fulfillData.courier_partner}
                                    onChange={e => setFulfillData({...fulfillData, courier_partner: e.target.value})}
                                    className="mt-1.5 w-full h-11 bg-[#0d0d0d] border border-neutral-700 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-amber-500/40 transition-colors"
                                >
                                    <option value="">Select courier...</option>
                                    {['Delhivery','BlueDart','DTDC','Ekart','India Post','Xpressbees','Shadowfax'].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setFulfillOrder(null)} className="flex-1 h-10 border border-neutral-700 rounded-xl text-sm text-neutral-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleFulfill} className="flex-1 h-10 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-colors">Mark Shipped</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Order Details Modal */}
            {viewOrder && (
                <OrderDetailsModal order={viewOrder} onClose={() => setViewOrder(null)} />
            )}
        </div>
    );
};

export default OrdersTab;
