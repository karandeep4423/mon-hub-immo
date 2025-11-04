import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const rateLimitingEnabled = process.env.ENABLE_RATE_LIMITING !== 'false';

// Log rate limiting status
if (rateLimitingEnabled) {
	logger.info('[RateLimiter] Rate limiting is ENABLED');
} else {
	logger.warn('[RateLimiter] Rate limiting is DISABLED');
}

const noOpMiddleware = (req: Request, res: Response, next: NextFunction) => {
	next();
};

/**
 * Stricter rate limiter for password reset endpoints
 */
export const passwordResetLimiter = !rateLimitingEnabled
	? noOpMiddleware
	: rateLimit({
			windowMs: 60 * 60 * 1000, // 1 hour
			max: 3,
			message: {
				success: false,
				message:
					'Trop de tentatives de réinitialisation. Veuillez réessayer dans 1 heure.',
			},
			standardHeaders: true,
			legacyHeaders: false,
			skipSuccessfulRequests: true,
			handler: (req, res) => {
				logger.warn(
					`[RateLimiter] Password reset limit exceeded for IP: ${req.ip}`,
				);
				res.status(429).json({
					success: false,
					message:
						'Trop de tentatives de réinitialisation. Veuillez réessayer dans 1 heure.',
				});
			},
		});

/**
 * Rate limiter for email verification code resend
 */
export const emailVerificationLimiter = !rateLimitingEnabled
	? noOpMiddleware
	: rateLimit({
			windowMs: 5 * 60 * 1000, // 5 minutes
			max: 3,
			message: {
				success: false,
				message:
					"Trop de demandes d'envoi de code. Veuillez réessayer dans 5 minutes.",
			},
			standardHeaders: true,
			legacyHeaders: false,
			skipSuccessfulRequests: true,
			handler: (req, res) => {
				logger.warn(
					`[RateLimiter] Email verification limit exceeded for IP: ${req.ip}`,
				);
				res.status(429).json({
					success: false,
					message:
						"Trop de demandes d'envoi de code. Veuillez réessayer dans 5 minutes.",
				});
			},
		});

/**
 * General API rate limiter for all routes
 */
export const generalLimiter = !rateLimitingEnabled
	? noOpMiddleware
	: rateLimit({
			windowMs: 1 * 60 * 1000, // 1 minute
			max: 100,
			message: {
				success: false,
				message: 'Trop de requêtes. Veuillez ralentir.',
			},
			standardHeaders: true,
			legacyHeaders: false,
			skipSuccessfulRequests: false,
			handler: (req, res) => {
				logger.warn(
					`[RateLimiter] General limit exceeded for IP: ${req.ip}`,
				);
				res.status(429).json({
					success: false,
					message: 'Trop de requêtes. Veuillez ralentir.',
				});
			},
		});
