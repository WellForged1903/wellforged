import type { Request, Response } from 'express';
import pool from '../config/db.js';
import RazorpayService from '../services/razorpay.service.js';
import MailerService from '../services/mailer.service.js';
import logger from '../utils/logger.js';

export const verifyPayment = async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !order_id) {
    return res.status(400).json({ message: 'Missing required payment verification fields' });
  }

  const client = await pool.connect();

  try {
    // 1. Verify Signature
    const isValid = RazorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    await client.query('BEGIN');

    // 2. Fetch Order and lock it
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 FOR UPDATE',
      [order_id]
    );

    if (orderResult.rows.length === 0) {
      throw new Error('Order not found');
    }

    const order = orderResult.rows[0];

    if (order.payment_status === 'paid') {
      await client.query('COMMIT');
      return res.json({ message: 'Payment already verified', order });
    }

    // 3. Update Order Status
    const updatedOrderResult = await client.query(
      `UPDATE orders 
       SET payment_status = 'paid', 
           razorpay_payment_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [razorpay_payment_id, order_id]
    );
    const updatedOrder = updatedOrderResult.rows[0];

    // 3.5 Log the highly detailed payment record
    await client.query(
      `INSERT INTO payments (order_id, payment_method, amount, status, raw_response)
       VALUES ($1, $2, $3, $4, $5)`,
      [order_id, 'razorpay', updatedOrder.total_amount, 'captured', JSON.stringify(req.body)]
    );

    // 4. Update Stock and Clear Cart
    const itemsResult = await client.query(
      'SELECT sku_id, quantity FROM order_items WHERE order_id = $1',
      [order_id]
    );

    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE skus SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.sku_id]
      );
    }

    // 4.5 Increment Coupon used_count if applied
    if (order.coupon_id) {
        await client.query(
            'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
            [order.coupon_id]
        );
        logger?.info?.(`Coupon ${order.coupon_id} used_count incremented`);
    }

    // Clear cart for the user
    if (order.profile_id) {
      await client.query('DELETE FROM cart_items WHERE profile_id = $1', [order.profile_id]);
    }

    await client.query('COMMIT');

    // 5. Send Confirmation Email
    const profileResult = await client.query('SELECT email, full_name FROM profiles WHERE id = $1', [order.profile_id]);
    const profile = profileResult.rows[0];
    
    // We can extract email/name from address_snapshot if profile is missing (guest)
    const address = typeof order.address_snapshot === 'string' ? JSON.parse(order.address_snapshot) : order.address_snapshot;
    const customerEmail = profile?.email || address?.email;
    const customerName = profile?.full_name || address?.full_name || 'Customer';

    if (customerEmail && MailerService.isConfigured()) {
       try {
         // Fetch items for email
         const emailItems = await pool.query(
           `SELECT oi.quantity, oi.unit_price, s.label, p.name 
            FROM order_items oi 
            JOIN skus s ON oi.sku_id = s.id 
            JOIN products p ON s.product_id = p.id 
            WHERE oi.order_id = $1`, 
           [order_id]
         );

         await MailerService.sendOrderConfirmation(
           customerEmail,
           customerName,
           updatedOrder.order_number,
           Number(updatedOrder.total_amount),
           emailItems.rows.map(item => ({
             productName: item.name,
             quantity: item.quantity,
             price: item.unit_price,
             variantLabel: item.label
           })),
           '3-5 business days'
         );
       } catch (e) {
         console.error("Failed to send order confirmation email:", e);
       }
    }

    res.json({ message: 'Payment verified successfully', order: updatedOrder });

  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("Payment verification failed:", error);
    res.status(500).json({ message: error.message || 'Verification failed' });
  } finally {
    client.release();
  }
};
