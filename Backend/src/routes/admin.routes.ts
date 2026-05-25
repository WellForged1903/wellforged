import { Router } from 'express';
import multer from 'multer';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import {
    createAdminProduct,
    updateAdminProduct,
    deleteAdminProduct,
    addAdminSku,
    updateAdminSkuStock,
    uploadAdminProductImage,
    fulfillAdminOrder,
    updateAdminReviewStatus,
    getAdminReviews,
    createAdminCoupon,
    deleteAdminCoupon,
    getAdminCoupons,
    updateAdminCoupon,
    getAllCategories,
    createAdminCategory,
    updateAdminCategory,
    deleteAdminCategory,
    saveAdminProductMetadata,
    saveAdminProductFaqs,
    getAdminOrderDetails,
    getAdminCustomers,
    getAdminGrievances,
    updateAdminGrievanceStatus,
    deleteAdminSku,
    getAdminProducts
} from '../controllers/admin.controller.js';

const router = Router();
// ... (multer config remains same) ...
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
    fileFilter: (_req, file, cb) => {
        const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG, JPEG, and WebP images are allowed'));
        }
    },
});

// All routes in this file require admin authentication
router.use(requireAdmin);

// ─── Products ────────────────────────────────────────────────────
router.get('/products/all', getAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

// ─── Metadata & FAQs ─────────────────────────────────────────────
router.post('/products/:product_id/metadata', saveAdminProductMetadata);
router.post('/products/:product_id/faqs', saveAdminProductFaqs);

// ─── SKUs ────────────────────────────────────────────────────────
router.post('/skus', addAdminSku);
router.patch('/skus/:id/stock', updateAdminSkuStock);
router.delete('/skus/:id', deleteAdminSku);

// ─── Categories ─────────────────────────────────────────────────
router.get('/categories', getAllCategories);
router.post('/categories', createAdminCategory);
router.put('/categories/:id', updateAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

// ─── Images ──────────────────────────────────────────────────────
router.post('/products/:product_id/images', upload.single('image'), uploadAdminProductImage);

// ─── Order Fulfillment & Intelligence ───────────────────────────
router.get('/orders/:id', getAdminOrderDetails);
router.patch('/orders/:id/fulfill', fulfillAdminOrder);
router.get('/customers', getAdminCustomers);

// ─── Reviews (Moderation) ───────────────────────────────────────
router.get('/reviews', getAdminReviews);
router.patch('/reviews/:id/status', updateAdminReviewStatus);

// ─── Grievances (Resolution) ────────────────────────────────────
router.get('/grievances', getAdminGrievances);
router.patch('/grievances/:id/status', updateAdminGrievanceStatus);

// ─── Coupons ─────────────────────────────────────────────────────
router.get('/coupons', getAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.put('/coupons/:id', updateAdminCoupon);
router.delete('/coupons/:id', deleteAdminCoupon);

export default router;
