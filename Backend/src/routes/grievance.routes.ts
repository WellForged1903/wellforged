import { Router } from 'express';
import multer from 'multer';
import { createGrievance, trackGrievance, uploadAttachment } from '../controllers/grievance.controller.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and image formats (PNG, JPEG, WebP) are allowed.'));
    }
  }
});

router.post('/', createGrievance);
router.get('/track', trackGrievance);
router.post('/upload', upload.single('attachment'), uploadAttachment);

export default router;
