import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { getClientIp } from '../utils/ipHelper';
import { LoginAttempt } from '../models/LoginAttempt';

const rateLimitingEnabled = process.env.ENABLE_RATE_LIMITING !== 'false';

const WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ATTEMPTS = 5;

// Log login rate limiter status
if (rateLimitingEnabled) {
	logger.info(
		`[LoginRateLimiter] Login rate limiting is ENABLED (${MAX_ATTEMPTS} attempts per ${WINDOW_MS / 60000} minutes) - MongoDB persistence`,
	);
} else {
	logger.warn('[LoginRateLimiter] Login rate limiting is DISABLED');
}

/**
 * Creates a unique identifier for IP + Email combination
 */
const createIdentifier = (ip: string, email: string): string => {
	return `${ip}:${email.toLowerCase()}`;
};

/**
 * Tracks failed login attempts (called after failed login)
 * Stores in MongoDB for production persistence
 */
export const trackFailedLogin = async (
	ip: string,
	email: string,
): Promise<void> => {
	try {
		const identifier = createIdentifier(ip, email);
		const now = new Date();
		const resetAt = new Date(now.getTime() + WINDOW_MS);

		const attempt = await LoginAttempt.findOne({ identifier });

		if (attempt) {
			// Check if window expired
			if (now > attempt.resetAt) {
				// Reset counter
				attempt.attemptCount = 1;
				attempt.resetAt = resetAt;
				await attempt.save();
				logger.debug(
					`[FailedLoginTracker] ${identifier}: Reset counter to 1 (window expired)`,
				);
			} else {
				// Increment counter
				attempt.attemptCount++;
				await attempt.save();
				logger.warn(
					`[FailedLoginTracker] ${identifier}: ${attempt.attemptCount} failed attempts`,
				);
			}
		} else {
			// Create new record
			await LoginAttempt.create({
				identifier,
				ip,
				email: email.toLowerCase(),
				attemptCount: 1,
				resetAt,
			});
			logger.debug(
				`[FailedLoginTracker] ${identifier}: First failed attempt`,
			);
		}
	} catch (error) {
		logger.error(
			'[FailedLoginTracker] Error tracking failed login:',
			error,
		);
		// Don't throw - gracefully degrade if DB is unavailable
	}
};

/**
 * Checks if IP+Email combination has exceeded failed login limit
 */
export const isRateLimited = async (
	ip: string,
	email: string,
): Promise<boolean> => {
	try {
		const identifier = createIdentifier(ip, email);
		const now = new Date();

		const attempt = await LoginAttempt.findOne({ identifier });

		if (!attempt) {
			return false;
		}

		// Check if window expired
		if (now > attempt.resetAt) {
			// Clean up expired record
			await LoginAttempt.deleteOne({ identifier });
			return false;
		}

		return attempt.attemptCount >= MAX_ATTEMPTS;
	} catch (error) {
		logger.error('[FailedLoginTracker] Error checking rate limit:', error);
		// Fail open - allow login if DB check fails
		return false;
	}
};

/**
 * Gets remaining time until rate limit expires (in minutes)
 */
export const getRateLimitRemainingTime = async (
	ip: string,
	email: string,
): Promise<number> => {
	try {
		const identifier = createIdentifier(ip, email);
		const attempt = await LoginAttempt.findOne({ identifier });

		if (!attempt) {
			return 0;
		}

		const now = new Date();
		const remainingMs = attempt.resetAt.getTime() - now.getTime();
		return Math.ceil(remainingMs / (60 * 1000));
	} catch (error) {
		logger.error(
			'[FailedLoginTracker] Error getting remaining time:',
			error,
		);
		return 0;
	}
};

/**
 * Clears failed attempts for an IP+Email combination
 * Called after successful login or password reset
 */
export const clearFailedAttempts = async (
	ip: string,
	email: string,
): Promise<void> => {
	try {
		const identifier = createIdentifier(ip, email);
		await LoginAttempt.deleteOne({ identifier });
		logger.info(
			`[FailedLoginTracker] Cleared rate limit for ${identifier}`,
		);
	} catch (error) {
		logger.error(
			'[FailedLoginTracker] Error clearing failed attempts:',
			error,
		);
		// Don't throw - this is not critical
	}
};

/**
 * Clears all failed attempts for a specific email across all IPs
 * Useful when user resets password - clear all IPs
 */
export const clearFailedAttemptsForEmail = async (
	email: string,
): Promise<void> => {
	try {
		const result = await LoginAttempt.deleteMany({
			email: email.toLowerCase(),
		});
		logger.info(
			`[FailedLoginTracker] Cleared rate limits for email ${email} (${result.deletedCount} records)`,
		);
	} catch (error) {
		logger.error(
			'[FailedLoginTracker] Error clearing failed attempts for email:',
			error,
		);
	}
};

/**
 * Middleware to check rate limit before processing login
 * Checks both IP and email combination for precise rate limiting
 */
export const checkLoginRateLimit = async (
	req: Request,
	res: Response,
	next: NextFunction,
): Promise<void> => {
	if (!rateLimitingEnabled) {
		next();
		return;
	}

	const ip = getClientIp(req);
	const email = req.body.email;

	if (!email) {
		// If no email in request, skip rate limiting check
		next();
		return;
	}

	logger.debug(
		`[LoginRateLimiter] Checking rate limit for IP: ${ip}, Email: ${email}`,
	);

	try {
		const isLimited = await isRateLimited(ip, email);

		if (isLimited) {
			const remainingMinutes = await getRateLimitRemainingTime(ip, email);
			logger.warn(
				`[LoginRateLimiter] Rate limit BLOCKED for IP ${ip}, Email: ${email} - ${remainingMinutes} minutes remaining`,
			);

			res.status(429).json({
				success: false,
				message: `Trop de tentatives de connexion. Veuillez réessayer dans ${remainingMinutes} minutes.`,
			});
			return;
		}

		next();
	} catch (error) {
		logger.error(
			'[LoginRateLimiter] Error in rate limit middleware:',
			error,
		);
		// Fail open - allow request if rate limit check fails
		next();
	}
};
