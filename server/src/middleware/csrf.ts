import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 * Uses csrf-csrf package with double-submit cookie pattern
 */

const CSRF_SECRET =
	process.env.CSRF_SECRET || 'csrf-secret-change-in-production';

// In production, set cookie domain for cross-subdomain support (api.monhubimmo.fr <-> monhubimmo.fr)
const isProduction = process.env.NODE_ENV === 'production';
const cookieDomain = isProduction ? '.monhubimmo.fr' : undefined;

const {
	generateCsrfToken: generateToken,
	doubleCsrfProtection,
	invalidCsrfTokenError,
} = doubleCsrf({
	getSecret: () => CSRF_SECRET,
	// Use a stable identifier - the auth cookie or a fallback
	// Using req.ip is unreliable behind proxies/load balancers
	getSessionIdentifier: (req) => {
		// Use the refresh token cookie as session identifier (stable across requests)
		// Fall back to a constant if no cookie (for initial token fetch)
		return req.cookies?.refreshToken || 'anonymous-session';
	},
	cookieName: '_csrf',
	cookieOptions: {
		httpOnly: true,
		secure: isProduction,
		// Use 'lax' instead of 'strict' for cross-subdomain support
		sameSite: 'lax',
		maxAge: 3600000, // 1 hour
		// Set domain for cross-subdomain cookie sharing in production
		...(cookieDomain && { domain: cookieDomain }),
	},
	getCsrfTokenFromRequest: (req: Request) =>
		req.headers['x-csrf-token'] as string,
});

// Create CSRF protection middleware
export const csrfProtection = doubleCsrfProtection;

/**
 * CSRF Token Generation Endpoint
 * Provides CSRF token to client for subsequent requests
 */
export const generateCsrfToken = (req: Request, res: Response) => {
	try {
		const token = generateToken(req, res);
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
	if (err === invalidCsrfTokenError) {
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
