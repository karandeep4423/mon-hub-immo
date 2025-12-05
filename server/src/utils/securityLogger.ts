import { Request } from 'express';
import { SecurityLog, ISecurityLog } from '../models/SecurityLog';
import { logger } from './logger';

export type SecurityEventType =
	| 'login_success'
	| 'login_failure'
	| 'password_reset_request'
	| 'password_reset_success'
	| 'password_change'
	| 'account_locked'
	| 'account_blocked'
	| 'account_unblocked'
	| 'account_unlocked'
	| 'logout'
	| 'email_verified'
	| 'invite_sent'
	| 'temp_password_sent'
	| 'verification_code_sent'
	| 'account_access_granted'
	| 'account_access_revoked'
	| 'account_validated'
	| 'account_deleted'
	| 'email_send_failed'
	| 'failed_verification_attempt';

interface SecurityLogOptions {
	userId?: string; // Optional for events without authenticated user
	eventType: SecurityEventType;
	req?: Request;
	metadata?: {
		email?: string;
		reason?: string;
		attemptsRemaining?: number;
		lockedUntil?: Date;
		[key: string]: unknown;
	};
}

/**
 * Log a security event for audit trail
 * @param options - Security event options
 * @returns Promise<ISecurityLog | null>
 */
export const logSecurityEvent = async (
	options: SecurityLogOptions,
): Promise<ISecurityLog | null> => {
	try {
		const { userId, eventType, req, metadata } = options;

		// Extract IP address and user agent from request
		const ipAddress = req
			? (req.headers['x-forwarded-for'] as string) ||
				(req.headers['x-real-ip'] as string) ||
				req.socket.remoteAddress ||
				'unknown'
			: undefined;

		const userAgent = req
			? req.headers['user-agent'] || 'unknown'
			: undefined;

		// Create security log entry
		const securityLog = await SecurityLog.create({
			userId,
			eventType,
			ipAddress,
			userAgent,
			metadata: metadata || {},
		});

		logger.info(`[SecurityLog] ${eventType}`, {
			userId,
			eventType,
			ipAddress,
			metadata,
		});

		return securityLog;
	} catch (error) {
		logger.error('[SecurityLog] Failed to log security event', {
			error,
			userId: options.userId,
			eventType: options.eventType,
		});
		return null;
	}
};

/**
 * Get security logs for a user
 * @param userId - User ID to get logs for
 * @param limit - Maximum number of logs to return (default: 50)
 * @returns Promise<ISecurityLog[]>
 */
export const getUserSecurityLogs = async (
	userId: string,
	limit: number = 50,
): Promise<ISecurityLog[]> => {
	try {
		const logs = await SecurityLog.find({ userId })
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean();

		return logs;
	} catch (error) {
		logger.error('[SecurityLog] Failed to retrieve security logs', {
			error,
			userId,
		});
		return [];
	}
};

/**
 * Get recent failed login attempts for a user
 * @param userId - User ID to check
 * @param minutesAgo - Look back this many minutes (default: 15)
 * @returns Promise<number> - Count of failed attempts
 */
export const getRecentFailedLogins = async (
	userId: string,
	minutesAgo: number = 15,
): Promise<number> => {
	try {
		const since = new Date(Date.now() - minutesAgo * 60 * 1000);
		const count = await SecurityLog.countDocuments({
			userId,
			eventType: 'login_failure',
			createdAt: { $gte: since },
		});

		return count;
	} catch (error) {
		logger.error('[SecurityLog] Failed to count failed logins', {
			error,
			userId,
		});
		return 0;
	}
};
