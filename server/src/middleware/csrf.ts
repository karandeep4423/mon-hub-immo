import csrf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

// Create CSRF protection middleware
export const csrfProtection = csrf({
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 3600000, // 1 hour
	},
});

/**
 * CSRF Token Generation Endpoint
 * Provides CSRF token to client for subsequent requests
 */
export const generateCsrfToken = (req: Request, res: Response) => {
	try {
		const token = (
			req as Request & { csrfToken: () => string }
		).csrfToken();
		res.json({
			success: true,
			csrfToken: token,
		});
	} catch (error) {
		logger.error('[CSRF] Error generating token', error);
		res.status(500).json({
			success: false,
			message: 'Failed to generate CSRF token',
		});
	}
};

/**
 * CSRF Error Handler
 * Provides friendly error messages for CSRF failures
 */
export const csrfErrorHandler = (
	err: Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	if (err.message === 'invalid csrf token') {
		logger.warn('[CSRF] Invalid CSRF token', {
			method: req.method,
			path: req.path,
			ip: req.ip,
		});

		res.status(403).json({
			success: false,
			message:
				'Invalid CSRF token. Please refresh the page and try again.',
			code: 'CSRF_TOKEN_INVALID',
		});
		return;
	}

	// Pass to next error handler
	next(err);
};

/**
 * Optional CSRF protection for specific routes
 * Use this when you want CSRF only on certain endpoints
 */
export const conditionalCsrf = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Skip CSRF for safe methods
	if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
		return next();
	}

	// Apply CSRF protection for state-changing methods
	return csrfProtection(req, res, next);
};
