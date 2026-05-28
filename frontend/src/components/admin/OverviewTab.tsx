import { ClipboardList, IndianRupee, Clock, Truck, TrendingUp, CheckCircle, Package } from "lucide-react";
import { Order, Product, statusColor, statusIcons } from "./AdminTypes";

interface Props {
    orders: Order[];
    products: Product[];
}

const OverviewTab = ({ orders, products }: Props) => {
    // Corrected Revenue Logic: Include Paid, Shipped and Delivered orders
    const relevantOrders = orders.filter(o => 
        o.payment_status === 'paid' || 
        o.fulfillment_status === 'shipped' || 
        o.fulfillment_status === 'delivered'
    );
    
    // Sum total_amount (In Rupees)
    const revenuePaise = relevantOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
    const revenueRupees = revenuePaise;

    const allStockItems: any[] = [];
    products.forEach((p: any) => {
        p.skus?.forEach((s: any) => {
            allStockItems.push({ 
                ...s, 
                product_name: p.name
            });
        });
    });

    const stats = [
        { 
            label: 'Total Orders', 
            value: orders.length, 
            icon: ClipboardList, 
            color: 'text-blue-500', 
            bg: 'bg-blue-500/10' 
        },
        { 
            label: 'Revenue (₹)', 
            value: `₹${revenueRupees.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 
            icon: IndianRupee, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/10' 
        },
        { 
            label: 'Pending', 
            value: orders.filter(o => o.fulfillment_status === 'pending').length, 
            icon: Clock, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/10' 
        },
        { 
            label: 'Shipped', 
            value: orders.filter(o => o.fulfillment_status === 'shipped').length, 
            icon: Truck, 
            color: 'text-purple-500', 
            bg: 'bg-purple-500/10' 
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-display font-bold text-white mb-1">Overview</h2>
                <p className="text-sm text-neutral-500">Live snapshot of your store performance.</p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map(s => (
                    <div key={s.label} className="bg-[#141414] border border-neutral-800 rounded-2xl p-5">
                        <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                            <s.icon className={`h-5 w-5 ${s.color}`} />
                        </div>
                        <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-neutral-500 mt-0.5 uppercase tracking-wider">{s.label}</div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
                    <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-amber-500" /> Recent Orders
                    </h3>
                    <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                        {orders.slice(0, 5).map(o => {
                            const StatusIcon = statusIcons[o.fulfillment_status];
                            return (
                                <div key={o.id} className="flex items-center justify-between py-3 border-b border-neutral-800/60 last:border-0">
                                    <div>
                                        <div className="text-sm font-semibold text-white">{o.full_name || 'Guest'}</div>
                                        <div className="text-xs text-neutral-500">{o.order_number}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">₹{Number(o.total_amount).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusColor[o.fulfillment_status]}`}>
                                            <StatusIcon className="h-3.5 w-3.5" /> {o.fulfillment_status}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6">
                    <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="h-4 w-4 text-amber-500" /> Inventory Stock Status
                    </h3>
                    {allStockItems.length === 0 ? (
                        <div className="py-10 text-center">
                            <Package className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                            <p className="text-xs text-neutral-500 italic">No inventory items found.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                            {allStockItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between py-3 border-b border-neutral-800/60 last:border-0">
                                    <div>
                                        <div className="text-sm font-semibold text-white">{item.product_name}</div>
                                        <div className="text-[10px] text-neutral-500 font-mono tracking-widest">{item.sku_code} ({item.label})</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">{item.stock} / {item.total_stock || item.stock}</div>
                                        <div className="text-[10px] text-neutral-500 uppercase font-black">
                                            {((item.stock / (item.total_stock || item.stock || 1)) * 100).toFixed(0)}% remaining
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
