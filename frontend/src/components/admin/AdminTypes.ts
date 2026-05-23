import { Clock, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { API_BASE_URL } from "@/config";

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id: string;
    order_number: string;
    total_amount: number;
    fulfillment_status: OrderStatus;
    payment_status: string;
    created_at: string;
    address_snapshot: any;
    full_name?: string;
    phone?: string;
    tracking_number?: string;
    courier_partner?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    is_active: boolean;
    category_id?: string;
    base_description?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    is_active: boolean;
}

export interface Customer {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    role: string;
    total_orders: number;
    lifetime_value: number;
    created_at: string;
}

export const apiFetch = (url: string, opts: RequestInit = {}) =>
    fetch(`${API_BASE_URL}${url}`, { credentials: 'include', ...opts });

export const statusColor: Record<OrderStatus, string> = {
    pending:    'bg-amber-500/10 text-amber-500 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    shipped:    'bg-purple-500/10 text-purple-500 border-purple-500/20',
    delivered:  'bg-green-500/10 text-green-500 border-green-500/20',
    cancelled:  'bg-red-500/10 text-red-500 border-red-500/20',
};

export const statusIcons: Record<OrderStatus, any> = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    delivered: CheckCircle,
    cancelled: XCircle
};
