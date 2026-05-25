import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product_id, customer_name, rating, comment, email } = req.body;

    if (!product_id || !customer_name || !rating || !comment) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      return;
    }

    // Guest purchase verification logic
    let is_verified_purchase = false;
    if (email && email.trim()) {
      const verifiedRes = await pool.query(`
        SELECT 1 FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN skus s ON oi.sku_id = s.id
        LEFT JOIN profiles p ON o.profile_id = p.id
        WHERE (LOWER(p.email) = LOWER($1) OR LOWER(o.address_snapshot->>'email') = LOWER($1))
          AND s.product_id = $2
          AND o.payment_status = 'paid'
        LIMIT 1;
      `, [email.trim(), product_id]);
      
      if (verifiedRes.rows.length > 0) {
        is_verified_purchase = true;
      }
    }

    const query = `
      INSERT INTO reviews (product_id, customer_name, rating, comment, email, is_verified_purchase, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *;
    `;
    const result = await pool.query(query, [
      product_id,
      customer_name,
      rating,
      comment,
      email ? email.trim() : null,
      is_verified_purchase
    ]);

    res.status(201).json({
      message: 'Review submitted for moderation',
      review: result.rows[0],
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

export const getReviewsByProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { slug } = req.query;

    let targetProductId = productId;

    // If slug is provided, we must look up the product ID first
    if (!targetProductId && slug) {
      const productRes = await pool.query('SELECT id FROM products WHERE slug = $1', [slug]);
      if (productRes.rows.length === 0) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
      targetProductId = productRes.rows[0].id;
    }

    if (!targetProductId) {
      res.status(400).json({ message: 'Product ID or slug is required' });
      return;
    }

    const query = `
      SELECT * FROM reviews 
      WHERE product_id = $1 AND status = 'published'
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [targetProductId]);

    // Calculate aggregated stats
    const reviews = result.rows;
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? (reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews).toFixed(1)
      : 0;

    res.status(200).json({
      reviews,
      stats: {
        totalReviews,
        averageRating: Number(averageRating),
      }
    });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};
