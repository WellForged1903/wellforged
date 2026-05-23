import { Router } from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import logger from '../utils/logger.js';

const router = Router();

// POST /api/auth/admin/login
router.post('/admin/login', (req: Request, res: Response) => {
    const { password } = req.body;

    const actualPassword = process.env.ADMIN_PASSWORD;
    const secret = process.env.JWT_SECRET;

    if (!actualPassword || !secret) {
        logger.error('CRITICAL: Environment variables for auth are not set.');
        return res.status(500).json({ message: 'Server configuration error.' });
    }

    if (!password || password !== actualPassword) {
        return res.status(401).json({ message: 'Invalid credentials. Access denied.' });
    }

    try {
        // Issue JWT token valid for 12 hours
        const token = jwt.sign(
            { role: 'admin', timestamp: Date.now() },
            secret,
            { expiresIn: '12h' }
        );

        // Security Configuration for the cookie
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.cookie('admin_token', token, {
            httpOnly: true, // Prevents JS access (XSS Defense)
            secure: isProduction, // HTTPS only in production
            sameSite: isProduction ? 'none' : 'lax', // Cross-domain compatibility for Vercel
            maxAge: 12 * 60 * 60 * 1000 // 12 hours in milliseconds
        });

        logger.info('Admin successfully logged in and token cookie generated.');
        return res.json({ 
            message: 'Login successful', 
            user: { role: 'admin' } 
        });
    } catch (error) {
        logger.error(`Login error: ${error}`);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
});

// GET /api/auth/admin/me
// Returns session validation status for the frontend app initialization
router.get('/admin/me', requireAdmin, (req: Request, res: Response) => {
    // If it passes requireAdmin, the cookie is valid
    res.json({ 
        isLoggedIn: true,
        user: { role: 'admin' }
    });
});

// POST /api/auth/admin/logout
router.post('/admin/logout', (req: Request, res: Response) => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie('admin_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
    });
    
    logger.info('Admin logged out.');
    res.json({ message: 'Logged out successfully' });
});

export default router;
