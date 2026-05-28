import type { Request, Response } from 'express';
import pool from '../config/db.js';
import { deepNormalizePaths } from '../utils/assetUtils.js';

/**
 * Public: Get all blog posts (supports optional category filtering)
 */
export const getBlogPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query;
    let queryStr = 'SELECT id, title, slug, excerpt, category, read_time, author, image_url, created_at FROM blog_posts';
    const params: any[] = [];

    if (category && category !== 'all') {
      params.push(category);
      queryStr += ' WHERE category = $1';
    }

    queryStr += ' ORDER BY created_at DESC';

    const result = await pool.query(queryStr, params);
    res.json(deepNormalizePaths(result.rows));
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Failed to retrieve articles' });
  }
};

/**
 * Public: Get a single blog post by unique slug
 */
export const getBlogPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const slugVal = typeof slug === 'string' ? slug.trim() : '';
    if (!slugVal) {
      res.status(400).json({ message: 'Invalid slug' });
      return;
    }
    
    const result = await pool.query(
      'SELECT * FROM blog_posts WHERE LOWER(slug) = LOWER($1)',
      [slugVal]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    res.json(deepNormalizePaths(result.rows[0]));
  } catch (error: any) {
    console.error('Error fetching article details:', error);
    res.status(500).json({ message: 'Failed to retrieve article details' });
  }
};

/**
 * Admin: Create a new blog post
 */
export const createBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, excerpt, content, category, read_time, author, image_url } = req.body;

    if (!title || !excerpt || !content) {
      res.status(400).json({ message: 'Title, Excerpt, and Article Content are required.' });
      return;
    }

    // Auto-generate slug from title if not provided
    let finalSlug = slug ? slug.trim() : title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Ensure slug uniqueness
    const checkSlug = await pool.query('SELECT 1 FROM blog_posts WHERE slug = $1', [finalSlug]);
    if (checkSlug.rows.length > 0) {
      // Append a random 4-digit number to guarantee uniqueness
      const randomId = Math.floor(1000 + Math.random() * 9000);
      finalSlug = `${finalSlug}-${randomId}`;
    }

    const queryStr = `
      INSERT INTO blog_posts (title, slug, excerpt, content, category, read_time, author, image_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const result = await pool.query(queryStr, [
      title.trim(),
      finalSlug,
      excerpt.trim(),
      content.trim(),
      category ? category.trim() : 'Nutrition',
      read_time ? read_time.trim() : '5 min read',
      author ? author.trim() : 'WellForged Editorial',
      image_url || null
    ]);

    res.status(201).json({
      message: 'Article published successfully',
      post: deepNormalizePaths(result.rows[0])
    });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Failed to publish article' });
  }
};

/**
 * Admin: Delete a blog post by UUID
 */
export const deleteBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM blog_posts WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    res.json({ message: 'Article deleted successfully', post: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Failed to delete article' });
  }
};
