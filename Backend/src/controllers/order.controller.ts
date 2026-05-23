import type { Response } from 'express';
import pool from '../config/db.js';
import MailerService from '../services/mailer.service.js';
import RazorpayService from '../services/razorpay.service.js';
import { deepNormalizePaths } from '../utils/assetUtils.js';

const getSnapshotField = (snapshot: unknown, field: string): string | null => {
    if (!snapshot || typeof snapshot !== 'object') {
        return null;
    }

    const value = (snapshot as Record<string, unknown>)[field];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
};

export const createOrder = async (req: any, res: Response) => {
    const { address_id, coupon_id, idempotency_key, guest_details, items: guest_items } = req.body;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        let profileId = null;
        let finalAddressSnapshot = null;
        let itemsToProcess = [];
        let normalizedPhone: string | null = null;
        let normalizedEmail: string | null = null;

        // Guest Checkout Path
        if (!req.user || guest_details) {
            if (!guest_details || !guest_items || guest_items.length === 0) {
                throw new Error('Guest details and items are required for checkout');
            }
            finalAddressSnapshot = guest_details;

            normalizedPhone = guest_details.mobile_number?.trim() || null;
            normalizedEmail = guest_details.email?.trim().toLowerCase() || null;

            let profileLookup = await client.query(
                'SELECT id, phone, email FROM profiles WHERE phone = $1',
                [normalizedPhone]
            );

            if (profileLookup.rows.length === 0 && normalizedEmail) {
                profileLookup = await client.query(
                    'SELECT id, phone, email FROM profiles WHERE LOWER(email) = $1',
                    [normalizedEmail]
                );
            }

            if (profileLookup.rows.length > 0) {
                profileId = profileLookup.rows[0].id;
                const existingProfile = profileLookup.rows[0];
                const nextEmail = existingProfile.email || normalizedEmail;
                const nextPhone = existingProfile.phone || normalizedPhone;

                await client.query(
                    'UPDATE profiles SET email = $1, phone = $2, full_name = $3 WHERE id = $4',
                    [nextEmail, nextPhone, guest_details.full_name, profileId]
                );
            } else {
                const newProfile = await client.query(
                    'INSERT INTO profiles (full_name, email, phone, role) VALUES ($1, $2, $3, $4) RETURNING id',
                    [guest_details.full_name, normalizedEmail, normalizedPhone, 'customer']
                );
                profileId = newProfile.rows[0].id;
            }

            for (const gItem of guest_items) {
                const skuResult = await client.query(
                    `SELECT s.price, s.stock, s.label, p.name AS product_name
                     FROM skus s
                     JOIN products p ON s.product_id = p.id
                     WHERE s.id = $1`,
                    [gItem.sku_id]
                );
                if (skuResult.rows.length === 0) {
                    throw new Error(`SKU ${gItem.sku_id} not found`);
                }
                itemsToProcess.push({
                    sku_id: gItem.sku_id,
                    quantity: gItem.quantity,
                    price: skuResult.rows[0].price,
                    stock: skuResult.rows[0].stock,
                    label: skuResult.rows[0].label,
                    product_name: skuResult.rows[0].product_name,
                });
            }
        }
        else {
            profileId = req.user.id;
            const itemsResult = await client.query(
                `SELECT ci.*, s.price, s.stock, s.label, p.name AS product_name
                 FROM cart_items ci 
                 JOIN skus s ON ci.sku_id = s.id 
                 JOIN products p ON s.product_id = p.id
                 WHERE ci.profile_id = $1`,
                [profileId]
            );

            if (itemsResult.rows.length === 0) {
                throw new Error('Cart is empty');
            }
            itemsToProcess = itemsResult.rows;

            if (!address_id) {
                throw new Error('Address ID is required for authenticated checkout');
            }

            const addressResult = await client.query('SELECT * FROM addresses WHERE id = $1 AND profile_id = $2', [address_id, profileId]);
            if (addressResult.rows.length === 0) {
                throw new Error('Address not found');
            }
            finalAddressSnapshot = addressResult.rows[0];
        }

        // 1.1 CHECK IDEMPOTENCY
        if (idempotency_key && profileId) {
            const existingOrder = await client.query(
                'SELECT * FROM orders WHERE profile_id = $1 AND idempotency_key = $2',
                [profileId, idempotency_key]
            );
            if (existingOrder.rows.length > 0) {
                await client.query('COMMIT');
                return res.json(existingOrder.rows[0]);
            }
        }

        // 2. Calculate subtotal and check stock
        let subtotal = 0;
        for (const item of itemsToProcess) {
            if (item.stock < item.quantity) {
                throw new Error(`Insufficient stock for SKU ${item.sku_id}`);
            }
            subtotal += item.price * item.quantity;
        }

        const shipping_amount = 0;
        let discount_amount = 0;
        if (coupon_id) {
            const couponResult = await client.query(
                'SELECT * FROM coupons WHERE id = $1 AND expires_at > CURRENT_TIMESTAMP',
                [coupon_id]
            );
            if (couponResult.rows.length > 0) {
                const coupon = couponResult.rows[0];
                if (coupon.discount_type === 'percentage') {
                    discount_amount = Math.floor((subtotal * coupon.discount_value) / 100);
                } else {
                    discount_amount = coupon.discount_value;
                }
            }
        }

        const total_amount = subtotal - discount_amount + shipping_amount;
        const order_number = `WF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 3. Create local order in 'pending_payment' status
        const orderResult = await client.query(
            `INSERT INTO orders (profile_id, order_number, idempotency_key, total_amount, discount_amount, coupon_id, address_snapshot, subtotal, payment_status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [profileId, order_number, idempotency_key || null, total_amount, discount_amount, coupon_id, finalAddressSnapshot, subtotal, 'pending_payment']
        );
        const order = orderResult.rows[0];

        // 4. Create order items (without stock reduction yet, until payment is verified)
        for (const item of itemsToProcess) {
            const item_total = item.price * item.quantity;
            await client.query(
                'INSERT INTO order_items (order_id, sku_id, quantity, unit_price, item_total) VALUES ($1, $2, $3, $4, $5)',
                [order.id, item.sku_id, item.quantity, item.price, item_total]
            );
        }

        // 5. Create Razorpay Order if service is configured
        let razorpayOrder = null;
        if (RazorpayService.isConfigured()) {
            try {
                razorpayOrder = await RazorpayService.createOrder(total_amount, order.id);
                // Link Razorpay Order ID to our internal order
                await client.query(
                    'UPDATE orders SET razorpay_order_id = $1 WHERE id = $2',
                    [razorpayOrder.id, order.id]
                );
                order.razorpay_order_id = razorpayOrder.id;
            } catch (rzpError: any) {
                console.warn("⚠️ Razorpay order creation failed (falling back to Demo/Offline Mode):", rzpError.message || rzpError);
                // Gracefully fallback to demo mode so that dummy/incomplete credentials do not crash local development checkout
            }
        }

        await client.query('COMMIT');

        // Return the local order and the razorpay order details
        res.status(201).json({
            ...deepNormalizePaths(order),
            razorpay: razorpayOrder
        });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("CRITICAL Order creation failed: ", error);
        res.status(500).json({ 
            message: error.message || 'Internal Server Error',
            details: error.stack,
            hint: "Check server console for 'CRITICAL' log"
        });
    } finally {
        client.release();
    }
};

export const getAllOrdersForAdmin = async (req: any, res: Response) => {
    try {
        // Simple role check (should be in middleware ideally, but here for speed/audit fix)
        if (!req.admin) {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }

        const result = await pool.query(
            `SELECT o.*, 
                    COALESCE(p.full_name, (o.address_snapshot->>'full_name')) as full_name, 
                    COALESCE(p.phone, (o.address_snapshot->>'mobile_number')) as phone
             FROM orders o 
             LEFT JOIN profiles p ON o.profile_id = p.id 
             ORDER BY o.created_at DESC`
        );
        res.json(result.rows.map(row => deepNormalizePaths(row)));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateOrderStatus = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { payment_status, fulfillment_status } = req.body;

        const existingOrderResult = await pool.query(
            `SELECT o.order_number,
                    o.address_snapshot,
                    p.email,
                    p.full_name
             FROM orders o
             LEFT JOIN profiles p ON o.profile_id = p.id
             WHERE o.id = $1`,
            [id]
        );

        if (existingOrderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const result = await pool.query(
            `UPDATE orders 
             SET payment_status = COALESCE($1, payment_status), 
                 fulfillment_status = COALESCE($2, fulfillment_status),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3 RETURNING *`,
            [payment_status, fulfillment_status, id]
        );

        const updatedOrder = result.rows[0];
        const existingOrder = existingOrderResult.rows[0];
        const recipientEmail = existingOrder.email || getSnapshotField(existingOrder.address_snapshot, 'email');
        const recipientName = existingOrder.full_name || getSnapshotField(existingOrder.address_snapshot, 'full_name') || 'Customer';
        const statusForEmail = fulfillment_status || payment_status;

        if (recipientEmail && statusForEmail && MailerService.isConfigured()) {
            try {
                await MailerService.sendShippingUpdate(
                    recipientEmail,
                    recipientName,
                    existingOrder.order_number,
                    statusForEmail
                );
            } catch (emailError) {
                console.error('Order status email send failed:', emailError);
            }
        }

        res.json(updatedOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
