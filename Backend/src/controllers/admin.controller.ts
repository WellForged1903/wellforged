import type { Request, Response } from 'express';
import sharp from 'sharp';
import pool from '../config/db.js';
import { uploadImageToSupabase, deleteImageFromSupabase } from '../services/supabase.service.js';
import { deepNormalizePaths } from '../utils/assetUtils.js';
import logger from '../utils/logger.js';
import MailerService from '../services/mailer.service.js';

/**
 * PRODUCTS & SKUS
 */

export const getAdminProducts = async (req: Request, res: Response) => {
    try {
        const productsResult = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        const products = productsResult.rows;
        
        for (let product of products) {
            const skusResult = await pool.query('SELECT * FROM skus WHERE product_id = $1 ORDER BY created_at ASC', [product.id]);
            product.skus = skusResult.rows;
        }
        
        res.json(deepNormalizePaths(products));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAdminProduct = async (req: Request, res: Response) => {
    const { name, slug, base_description, category_id, is_active } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO products (name, slug, base_description, category_id, is_active) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [name, slug, base_description, category_id, is_active ?? true]
        );
        res.status(201).json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        logger.error(`Error creating product: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, slug, base_description, category_id, is_active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE products 
             SET name = COALESCE($1, name), 
                 slug = COALESCE($2, slug), 
                 base_description = COALESCE($3, base_description), 
                 category_id = COALESCE($4, category_id), 
                 is_active = COALESCE($5, is_active),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $6 RETURNING *`,
            [name, slug, base_description, category_id, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Product not found' });
        res.json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // This will cascade delete SKUs and Product Images if foreign keys are set to Cascade
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addAdminSku = async (req: Request, res: Response) => {
    const { product_id, sku_code, label, price, original_price, stock } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO skus (product_id, sku_code, label, price, original_price, stock) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [product_id, sku_code, label, price, original_price, stock || 0]
        );
        res.status(201).json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminSkuStock = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { adjustment } = req.body; // e.g., +10 or -5
    try {
        const result = await pool.query(
            `UPDATE skus SET stock = stock + $1 WHERE id = $2 RETURNING *`,
            [adjustment, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'SKU not found' });
        res.json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminSku = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM skus WHERE id = $1', [id]);
        res.json({ message: 'SKU deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * IMAGES
 */

export const uploadAdminProductImage = async (req: Request, res: Response) => {
    const { product_id } = req.params;
    const { is_main, display_order } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'No image provided' });

    try {
        // 1. Process with Sharp (Convert to WebP)
        const webpBuffer = await sharp(file.buffer)
            .webp({ quality: 80 })
            .toBuffer();

        const fileName = `product-${product_id}-${Date.now()}.webp`;

        // 2. Upload to Supabase Storage
        const publicUrl = await uploadImageToSupabase(webpBuffer, fileName, 'image/webp');

        // 3. Save to DB
        const result = await pool.query(
            `INSERT INTO product_images (product_id, image_url, is_main, display_order) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [product_id, publicUrl, is_main === 'true', display_order || 0]
        );

        res.status(201).json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        logger.error(`Upload error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

/**
 * FULFILLMENT
 */

export const fulfillAdminOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tracking_number, courier_partner, fulfillment_status } = req.body;

    try {
        const result = await pool.query(
            `UPDATE orders 
             SET tracking_number = $1, 
                 courier_partner = $2, 
                 fulfillment_status = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 RETURNING *`,
            [tracking_number, courier_partner, fulfillment_status || 'shipped', id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        // Trigger email notification
        try {
            const order = result.rows[0];
            const address = order.address_snapshot;
            // Get customer details for email
            await MailerService.sendShippingUpdate(
                address.email,
                address.full_name || 'Customer',
                order.order_number,
                fulfillment_status || 'shipped'
            );
        } catch (emailErr: any) {
            logger.warn(`Failed to send status update email: ${emailErr.message}`);
        }

        res.json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * REVIEWS & MARKETING
 */

export const updateAdminReviewStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // 'approved' | 'rejected' | 'pending'
    try {
        const result = await pool.query(
            `UPDATE product_reviews SET status = $1 WHERE id = $2 RETURNING *`,
            [status, id]
        );
        res.json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminCoupons = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
        res.json(deepNormalizePaths(result.rows));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAdminCoupon = async (req: Request, res: Response) => {
    const { code, discount_type, discount_value, min_order_value, expires_at, max_uses } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO coupons (code, discount_type, discount_value, min_order_value, expires_at, max_uses) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [code, discount_type, discount_value, min_order_value, expires_at, max_uses]
        );
        res.status(201).json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminCoupon = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query(`DELETE FROM coupons WHERE id = $1`, [id]);
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminCoupon = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { code, discount_type, discount_value, min_order_value, expires_at, max_uses, is_active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE coupons 
             SET code = COALESCE($1, code),
                 discount_type = COALESCE($2, discount_type),
                 discount_value = COALESCE($3, discount_value),
                 min_order_value = COALESCE($4, min_order_value),
                 expires_at = COALESCE($5, expires_at),
                 max_uses = COALESCE($6, max_uses),
                 is_active = COALESCE($7, is_active)
             WHERE id = $8 RETURNING *`,
            [code, discount_type, discount_value, min_order_value, expires_at, max_uses, is_active, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Coupon not found' });
        res.json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * CATEGORIES
 */

export const getAllCategories = async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC');
        res.json(deepNormalizePaths(result.rows));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAdminCategory = async (req: Request, res: Response) => {
    const { name, slug, description, is_active } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO categories (name, slug, description, is_active) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, slug, description, is_active ?? true]
        );
        res.status(201).json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAdminCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, slug, description, is_active } = req.body;
    try {
        const result = await pool.query(
            `UPDATE categories 
             SET name = COALESCE($1, name), 
                 slug = COALESCE($2, slug), 
                 description = COALESCE($3, description), 
                 is_active = COALESCE($4, is_active)
             WHERE id = $5 RETURNING *`,
            [name, slug, description, is_active, id]
        );
        res.json(deepNormalizePaths(result.rows[0]));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteAdminCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        res.json({ message: 'Category deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * PRODUCT METADATA & FAQS
 */

export const saveAdminProductMetadata = async (req: Request, res: Response) => {
    const { product_id } = req.params;
    const { metadata } = req.body; // Array of { category, key, value, icon_name, display_order }
    try {
        // Simple strategy: Clear and re-insert for the product
        await pool.query('DELETE FROM product_metadata WHERE product_id = $1', [product_id]);
        
        for (const item of metadata) {
            await pool.query(
                `INSERT INTO product_metadata (product_id, category, key, value, icon_name, display_order) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [product_id, item.category, item.key, item.value, item.icon_name, item.display_order || 0]
            );
        }
        res.json({ message: 'Metadata updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const saveAdminProductFaqs = async (req: Request, res: Response) => {
    const { product_id } = req.params;
    const { faqs } = req.body; // Array of { question, answer, is_active, display_order }
    try {
        await pool.query('DELETE FROM faqs WHERE product_id = $1', [product_id]);
        
        for (const item of faqs) {
            await pool.query(
                `INSERT INTO faqs (product_id, question, answer, is_active, display_order) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [product_id, item.question, item.answer, item.is_active ?? true, item.display_order || 0]
            );
        }
        res.json({ message: 'FAQs updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * ORDER INTELLIGENCE
 */

export const getAdminOrderDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
        if (orderResult.rows.length === 0) return res.status(404).json({ message: 'Order not found' });
        
        const itemsResult = await pool.query(
            `SELECT oi.*, s.label, s.sku_code, p.name as product_name 
             FROM order_items oi 
             JOIN skus s ON oi.sku_id = s.id 
             JOIN products p ON s.product_id = p.id 
             WHERE oi.order_id = $1`, 
            [id]
        );
        
        res.json(deepNormalizePaths({
            ...orderResult.rows[0],
            items: itemsResult.rows
        }));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAdminCustomers = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT p.*, 
                   COUNT(o.id) as total_orders, 
                   SUM(o.total_amount) as lifetime_value
            FROM profiles p
            LEFT JOIN orders o ON p.id = o.profile_id
            GROUP BY p.id
            ORDER BY lifetime_value DESC NULLS LAST
        `);
        res.json(deepNormalizePaths(result.rows));
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
