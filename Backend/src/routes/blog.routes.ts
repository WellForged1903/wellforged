import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import {
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  deleteBlogPost
} from '../controllers/blog.controller.js';

const router = Router();

// Public routes
router.get('/', getBlogPosts);
router.get('/:slug', getBlogPostBySlug);

// Protected Admin routes
router.post('/admin', requireAdmin, createBlogPost);
router.delete('/admin/:id', requireAdmin, deleteBlogPost);

export default router;
