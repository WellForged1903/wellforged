import { Router } from 'express';
import { createOrder, updateOrderStatus, getAllOrdersForAdmin } from '../controllers/order.controller.js';
import { authenticate, authorize, optionalAuthenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createOrderSchema } from '../schemas/index.js';

const router = Router();

// Order routes
router.post('/', optionalAuthenticate, validate(createOrderSchema), createOrder);
router.get('/admin/all', requireAdmin, getAllOrdersForAdmin);
router.patch('/:id/status', requireAdmin, updateOrderStatus);

export default router;
