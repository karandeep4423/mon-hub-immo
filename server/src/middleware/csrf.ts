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
 * Extract userId from JWT without verifying expiration
 * This ensures consistent session identifier even when token is expired
 * but the user is still authenticated (will be refreshed)
 */
const extractUserIdFromToken = (token: string): string | null => {
	try {
		// First try to verify normally (handles signature validation)
		const decoded = jwt.verify(token, JWT_SECRET) as { userId?: string };
		if (decoded?.userId) {
			return decoded.userId;
		}
	} catch (error) {
		// If expired but signature is valid, we can still use the userId
		// This handles the race condition where token expires between CSRF generation and use
		if (error instanceof jwt.TokenExpiredError) {
			try {
				// Decode without verification to get userId (signature was already validated above)
				const decoded = jwt.decode(token) as { userId?: string } | null;
				if (decoded?.userId) {
					return decoded.userId;
				}
			} catch {
				// Decode failed, fall through to null
			}
		}
		// For other errors (invalid signature, malformed), return null
	}
	return null;
};

/**
 * Middleware to clear stale CSRF cookies that might conflict with the new ones
 * This handles the case where users have old cookies from previous deployments
 * with different domain/sameSite settings
 */
export const clearStaleCsrfCookies = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Only run in production where domain issues can occur
	if (!isProduction) {
		return next();
	}

	// Clear any _csrf cookie without domain (api.monhubimmo.fr specific)
	// This ensures we only use the .monhubimmo.fr scoped cookie
	res.clearCookie('_csrf', {
		path: '/',
		// No domain = clears the host-specific cookie (api.monhubimmo.fr)
	});

	// Also clear with sameSite strict in case that was set before
	res.clearCookie('_csrf', {
		path: '/',
		sameSite: 'strict',
	});

	next();
};

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
	// Use extractUserIdFromToken to handle expired tokens consistently
	const accessToken = req.cookies?.accessToken;
	if (accessToken) {
		const userId = extractUserIdFromToken(accessToken);
		if (userId) {
			// Authenticated user found - no session cookie needed
			return next();
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
	// - Authenticated users: User ID from JWT (even if expired, signature must be valid)
	// - Anonymous users: Session cookie (unique per browser session)
	// This prevents token sharing between different users/sessions
	// IMPORTANT: ensureCsrfSession middleware MUST run before this to set the session cookie
	//
	// CRITICAL FIX: We extract userId even from expired tokens to maintain
	// consistent session identifier. This prevents CSRF failures when the
	// access token expires between token generation and validation.
	// The JWT signature is still verified, only expiration is ignored for session ID.
	getSessionIdentifier: (req: Request) => {
		// For authenticated users, extract user ID from JWT (even if expired)
		const accessToken = req.cookies?.accessToken;
		if (accessToken) {
			const userId = extractUserIdFromToken(accessToken);
			if (userId) {
				return `user-${userId}`;
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
		// Get diagnostic info for debugging
		const csrfCookie = req.cookies?.['_csrf'];
		const csrfHeader = req.headers['x-csrf-token'] as string | undefined;
		const accessToken = req.cookies?.accessToken;

		// Try to get session identifier for debugging
		let sessionId = 'unknown';
		if (accessToken) {
			const userId = extractUserIdFromToken(accessToken);
			if (userId) {
				sessionId = `user-${userId}`;
			}
		}
		if (sessionId === 'unknown') {
			const sessionCookie = req.cookies?.['_csrf_session'];
			if (sessionCookie) {
				sessionId = `session-${sessionCookie.substring(0, 8)}...`;
			}
		}

		logger.warn('[CSRF] Invalid CSRF token', {
			method: req.method,
			path: req.path,
			ip: req.ip,
			sessionId,
			hasCsrfCookie: !!csrfCookie,
			hasCsrfHeader: !!csrfHeader,
			cookieLength: csrfCookie?.length,
			headerLength: csrfHeader?.length,
			// Log prefixes for debugging (not full values for security)
			cookiePrefix: csrfCookie?.substring(0, 20),
			headerPrefix: csrfHeader?.substring(0, 20),
			// Check if there are multiple _csrf values in raw cookie header
			rawCookieHeader: req.headers.cookie?.includes('_csrf')
				? 'contains _csrf'
				: 'no _csrf',
			cookieCount: (req.headers.cookie?.match(/_csrf=/g) || []).length,
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
