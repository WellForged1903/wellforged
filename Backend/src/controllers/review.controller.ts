import type { Request, Response } from 'express';
import pool from '../config/db.js';

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { product_id, customer_name, rating, comment } = req.body;

    if (!product_id || !customer_name || !rating || !comment) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be between 1 and 5.' });
      return;
    }

    const query = `
      INSERT INTO reviews (product_id, customer_name, rating, comment, status)
      VALUES ($1, $2, $3, $4, 'published')
      RETURNING *;
    `;
    const result = await pool.query(query, [product_id, customer_name, rating, comment]);

    res.status(201).json({
      message: 'Review published successfully',
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
