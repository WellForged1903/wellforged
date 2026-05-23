import { Router } from 'express';
import { createReview, getReviewsByProduct } from '../controllers/review.controller.js';

const router = Router();

router.post('/', createReview);
router.get('/:productId', getReviewsByProduct);
router.get('/', getReviewsByProduct);

export default router;
