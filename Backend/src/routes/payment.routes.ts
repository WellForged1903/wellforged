import { Router } from 'express';
import { verifyPayment } from '../controllers/payment.controller.js';
import { optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Payment routes
router.post('/verify', optionalAuthenticate, verifyPayment);

export default router;
