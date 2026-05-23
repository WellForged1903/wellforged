import { X, Package, Ruler, Phone, MapPin, Hash } from "lucide-react";

interface OrderItem {
    id: string;
    product_name: string;
    label: string;
    sku_code: string;
    quantity: number;
    unit_price: number;
    item_total: number;
}

interface OrderDetails extends any {
    items: OrderItem[];
}

interface Props {
    order: OrderDetails;
    onClose: () => void;
}

const OrderDetailsModal = ({ order, onClose }: Props) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in transition-all" onClick={onClose}>
            <div className="bg-[#121212] border border-neutral-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Package className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-white">Order Details</h3>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-mono">#{order.order_number}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-full transition-colors">
                        <X className="h-5 w-5 text-neutral-500" />
                    </button>
                </div>

                <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Item List */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Hash className="h-3 w-3" /> Purchased Items
                        </h4>
                        <div className="space-y-2">
                            {order.items.map(item => (
                                <div key={item.id} className="bg-neutral-900/40 border border-neutral-800/50 rounded-2xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
                                            <Ruler className="h-5 w-5 text-neutral-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{item.product_name}</div>
                                            <div className="text-[10px] text-neutral-500 flex items-center gap-2">
                                                <span className="bg-neutral-800 px-1.5 py-0.5 rounded uppercase font-mono">{item.sku_code}</span>
                                                <span className="text-neutral-600">|</span>
                                                <span>{item.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-white">₹{item.item_total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                        <div className="text-[10px] text-neutral-500">Qty: {item.quantity} × ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer & Shipping Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Shipping Address
                            </h4>
                            <div className="text-sm text-neutral-300 bg-neutral-900/20 border border-neutral-800 p-4 rounded-2xl leading-relaxed">
                                <p className="font-bold text-white mb-1">{order.address_snapshot?.full_name}</p>
                                <p>{order.address_snapshot?.address_line1}</p>
                                {order.address_snapshot?.address_line2 && <p>{order.address_snapshot?.address_line2}</p>}
                                <p>{order.address_snapshot?.city}, {order.address_snapshot?.state} - {order.address_snapshot?.pincode}</p>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Contact Info
                            </h4>
                            <div className="bg-neutral-900/20 border border-neutral-800 p-4 rounded-2xl space-y-2">
                                <div className="text-sm text-neutral-300 flex items-center gap-2">
                                    <Phone className="h-3.5 w-3.5 text-neutral-500" /> {order.address_snapshot?.mobile_number}
                                </div>
                                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-4 mb-1">Payment Metadata</div>
                                <div className="text-[11px] font-mono text-neutral-400 bg-black/40 p-2 rounded border border-neutral-800 break-all">
                                    RPID: {order.razorpay_payment_id || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Sum */}
                <div className="p-6 bg-neutral-900/50 border-t border-neutral-800 flex justify-between items-center">
                    <div className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Total (incl. tax & shipping)</div>
                    <div className="text-2xl font-display font-black text-amber-500">₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
