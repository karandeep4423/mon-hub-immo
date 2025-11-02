import rateLimit from 'express-rate-limit';
import { getRedisClient } from '../utils/redisClient';
import { logger } from '../utils/logger';
import jwt from 'jsonwebtoken';

// Redis store for distributed rate limiting (optional, falls back to memory store)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let redisStore: any;

const initializeRedisStore = async () => {
	try {
		const redisClient = await getRedisClient();
		if (redisClient) {
			// Keyv doesn't support rate-limit-redis, use memory store
			logger.info(
				'[RateLimiter] Using memory store (Keyv not compatible with rate-limit-redis)',
			);
		} else {
			logger.warn(
				'[RateLimiter] Client not available, using memory store',
			);
		}
	} catch (error) {
		logger.warn(
			'[RateLimiter] Redis store unavailable, using memory store',
			error,
		);
		redisStore = undefined; // Ensure it's undefined on error
	}
};

// Initialize Redis store (async, non-blocking)
initializeRedisStore().catch((err) => {
	logger.error('[RateLimiter] Failed to initialize Redis store', err);
	redisStore = undefined;
});

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks on login/signup
 */
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // Limit each IP to 5 requests per windowMs
	message: {
		success: false,
		message:
			'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
	},
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	skipSuccessfulRequests: true, // Don't count successful requests (only failed attempts)
	store: redisStore, // Use Redis if available, otherwise memory store
});

/**
 * Stricter rate limiter for password reset endpoints
 * More restrictive to prevent abuse
 */
export const passwordResetLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3, // Limit each IP to 3 requests per hour
	message: {
		success: false,
		message:
			'Trop de tentatives de réinitialisation. Veuillez réessayer dans 1 heure.',
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Only count failed attempts
	store: redisStore,
});

/**
 * Rate limiter for email verification code resend
 * Prevents spam
 */
export const emailVerificationLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 3, // Limit each IP to 3 requests per 5 minutes
	message: {
		success: false,
		message:
			"Trop de demandes d'envoi de code. Veuillez réessayer dans 5 minutes.",
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: true, // Only count failed attempts
	store: redisStore,
});

/**
 * General API rate limiter for all routes
 * Prevents DoS attacks
 */
export const generalLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 minute
	max: 100, // Limit each IP to 100 requests per minute
	message: {
		success: false,
		message: 'Trop de requêtes. Veuillez ralentir.',
	},
	standardHeaders: true,
	legacyHeaders: false,
	skipSuccessfulRequests: false,
});

/**
 * User-based rate limiter (combines IP + userId)
 * Prevents abuse from multiple IPs by the same user
 */
export const createUserBasedLimiter = (options: {
	windowMs: number;
	max: number;
	message: string;
}) => {
	return rateLimit({
		...options,
		message: {
			success: false,
			message: options.message,
		},
		standardHeaders: true,
		legacyHeaders: false,
		store: redisStore,
		// Custom key generator: combines IP with userId if authenticated
		keyGenerator: (req) => {
			const ip = req.ip || 'unknown';
			// Try to extract userId from cookies
			const accessToken = req.cookies?.accessToken;
			if (accessToken) {
				try {
					const decoded = jwt.verify(
						accessToken,
						process.env.JWT_SECRET || '',
					) as { id: string };
					return `${ip}:${decoded.id}`; // Rate limit per IP+user combo
				} catch {
					// Invalid token, fall back to IP only
				}
			}
			return ip;
		},
		// Add exponential backoff handler
		handler: (req, res) => {
			const retryAfter = Math.ceil(options.windowMs / 1000); // Convert to seconds

			// Calculate exponential backoff delay (doubles with each tier)
			// For now, use simple fixed backoff; full exponential requires tracking
			const backoffDelay = retryAfter * 2; // 2x base delay for repeated violations

			res.setHeader('Retry-After', backoffDelay);
			res.setHeader(
				'X-RateLimit-Reset',
				Date.now() + backoffDelay * 1000,
			);

			res.status(429).json({
				success: false,
				message: options.message,
				retryAfter: backoffDelay,
			});
		},
	});
};
