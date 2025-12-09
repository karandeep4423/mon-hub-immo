import { doubleCsrf } from 'csrf-csrf';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 * Uses csrf-csrf package with double-submit cookie pattern
 */

const CSRF_SECRET =
	process.env.CSRF_SECRET || 'csrf-secret-change-in-production';
const JWT_SECRET = process.env.JWT_SECRET || 'jwt-secret-change-in-production';

// Log CSRF configuration on startup (not the secret itself)
logger.info('[CSRF] Configuration loaded', {
	hasCustomSecret: !!process.env.CSRF_SECRET,
	isProduction: process.env.NODE_ENV === 'production',
});

// In production, set cookie domain for cross-subdomain support (api.monhubimmo.fr <-> monhubimmo.fr)
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Middleware to ensure CSRF session identifier exists in cookies before CSRF library reads it
 * SECURITY: This must be unique per user/session to prevent token sharing
 */
export const ensureCsrfSession = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// For authenticated users, session ID = user ID (no cookie needed)
	const accessToken = req.cookies?.accessToken;
	if (accessToken) {
		try {
			const decoded = jwt.verify(accessToken, JWT_SECRET) as {
				userId?: string;
			};
			if (decoded?.userId) {
				// Authenticated - no session cookie needed
				return next();
			}
		} catch {
			// Token invalid/expired, fall through to session cookie
		}
	}

	// For anonymous users, ensure session cookie exists
	const existingSessionId = req.cookies?.['_csrf_session'];
	if (existingSessionId && typeof existingSessionId === 'string') {
		// Session cookie already exists
		return next();
	}

	// Generate new session ID for anonymous user
	const newSessionId = crypto.randomUUID();

	// Set session cookie (separate from CSRF cookie)
	const sessionCookieOptions = {
		httpOnly: true,
		secure: isProduction,
		sameSite: (isProduction ? 'none' : 'lax') as 'none' | 'lax',
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
		domain: isProduction ? '.monhubimmo.fr' : undefined,
		path: '/',
	};

	res.cookie('_csrf_session', newSessionId, sessionCookieOptions);

	// CRITICAL: Update req.cookies so the CSRF library can read it immediately
	if (!req.cookies) {
		req.cookies = {};
	}
	req.cookies['_csrf_session'] = newSessionId;

	next();
};

const {
	generateCsrfToken: generateToken,
	doubleCsrfProtection,
	invalidCsrfTokenError,
} = doubleCsrf({
	getSecret: () => CSRF_SECRET,
	// SECURITY: Use unique session identifier per user/session
	// - Authenticated users: User ID from JWT (unique per user)
	// - Anonymous users: Session cookie (unique per browser session)
	// This prevents token sharing between different users/sessions
	// IMPORTANT: ensureCsrfSession middleware MUST run before this to set the session cookie
	getSessionIdentifier: (req: Request) => {
		// For authenticated users, use user ID from JWT
		const accessToken = req.cookies?.accessToken;
		if (accessToken) {
			try {
				const decoded = jwt.verify(accessToken, JWT_SECRET) as {
					userId?: string;
				};
				if (decoded?.userId) {
					return `user-${decoded.userId}`;
				}
			} catch {
				// Token invalid, use session cookie
			}
		}

		// For anonymous users, use session cookie (ensureCsrfSession ensures it exists)
		const sessionCookie = req.cookies?.['_csrf_session'];
		if (sessionCookie && typeof sessionCookie === 'string') {
			return sessionCookie;
		}

		// This should never happen if ensureCsrfSession middleware ran
		logger.error(
			'[CSRF] No session identifier found - ensureCsrfSession may not have run',
		);
		throw new Error('CSRF session not initialized');
	},
	cookieName: '_csrf',
	cookieOptions: {
		httpOnly: true,
		secure: isProduction,
		// Use 'none' for cross-origin cookie support (api.monhubimmo.fr -> www.monhubimmo.fr)
		// This is safe because we also have secure: true in production
		sameSite: isProduction ? 'none' : 'lax',
		maxAge: 3600000, // 1 hour
		// Set domain for cross-subdomain cookie sharing in production
		domain: isProduction ? '.monhubimmo.fr' : undefined,
		// Ensure path is set to root
		path: '/',
	},
	getCsrfTokenFromRequest: (req: Request) =>
		req.headers['x-csrf-token'] as string,
});

// Create CSRF protection middleware
export const csrfProtection = doubleCsrfProtection;

/**
 * CSRF Token Generation Endpoint
 * Provides CSRF token to client for subsequent requests
 * NOTE: ensureCsrfSession middleware must run before this
 */
export const generateCsrfToken = (req: Request, res: Response) => {
	try {
		const token = generateToken(req, res);
		// Prevent caching of CSRF token responses
		res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
		res.setHeader('Pragma', 'no-cache');
		res.setHeader('Vary', 'Cookie');

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
