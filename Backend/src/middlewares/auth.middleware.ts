import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

// Extend Express Request object to include user/admin
declare global {
  namespace Express {
    interface Request {
      admin?: any;
      user?: any;
    }
  }
}

// =============================================================================
// ADMIN MIDDLEWARE (HTTP-Only Cookie based JWT)
// =============================================================================
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.admin_token;

        if (!token) {
            return res.status(401).json({ message: 'Authentication required. No token provided.' });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            logger.error('JWT_SECRET is not configured in environment variables.');
            return res.status(500).json({ message: 'Server configuration error.' });
        }

        const decoded = jwt.verify(token, secret);
        req.admin = decoded;
        next();
    } catch (error) {
        logger.warn(`Unauthorized access attempt: ${error}`);
        return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
    }
};

// =============================================================================
// LEGACY STUBS - Required by existing routes (cart, order, product, etc.)
// Customer auth is currently open / guest-based. These are no-op pass-throughs.
// =============================================================================
export const authenticate = (req: Request, res: Response, next: NextFunction) => next();
export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction) => next();
export const authorize = (...roles: (string | string[])[]) => (req: Request, res: Response, next: NextFunction) => next();
