import Keyv from 'keyv';
import { logger } from './logger';

let keyvClient: Keyv | null = null;
let isInitialized = false;

/**
 * Get or create Keyv client (drop-in Redis replacement)
 * Uses MongoDB if available, otherwise in-memory
 */
export const getRedisClient = async (): Promise<Keyv | null> => {
	if (keyvClient && isInitialized) {
		return keyvClient;
	}

	try {
		// Use in-memory storage (MongoDB adapter requires @keyv/mongo package)
		// For production, install: npm install @keyv/mongo
		// Then use: process.env.MONGODB_URL

		keyvClient = new Keyv({
			namespace: 'blacklist',
		});

		keyvClient.on('error', (err) => {
			logger.error('[RedisClient] Keyv Client Error:', err);
			isInitialized = false;
		});

		keyvClient.on('disconnect', () => {
			logger.warn('[RedisClient] Keyv disconnected');
			isInitialized = false;
		});

		isInitialized = true;

		logger.info('[RedisClient] Token blacklist connected (in-memory mode)');

		return keyvClient;
	} catch (error) {
		logger.error('[RedisClient] Keyv connection failed:', error);
		keyvClient = null;
		isInitialized = false;
		return null;
	}
};

/**
 * Blacklist a token (for logout/revocation)
 * @param token - JWT token to blacklist
 * @param expiresInSeconds - TTL for the blacklist entry (should match token expiry)
 */
export const blacklistToken = async (
	token: string,
	expiresInSeconds: number,
): Promise<void> => {
	const client = await getRedisClient();
	if (!client) {
		logger.warn(
			'[RedisClient] Keyv unavailable - token not blacklisted:',
			token.substring(0, 20),
		);
		return;
	}

	try {
		// Keyv uses milliseconds, convert from seconds
		await client.set(token, 'revoked', expiresInSeconds * 1000);
		logger.debug(
			`[RedisClient] Token blacklisted (TTL: ${expiresInSeconds}s)`,
		);
	} catch (error) {
		logger.error('[RedisClient] Failed to blacklist token:', error);
	}
};

/**
 * Check if a token is blacklisted
 * @param token - JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
	const client = await getRedisClient();
	if (!client) {
		// If Keyv is unavailable, allow the request (graceful degradation)
		return false;
	}

	try {
		const result = await client.get(token);
		return result === 'revoked';
	} catch (error) {
		logger.error('[RedisClient] Failed to check token blacklist:', error);
		// On error, allow the request (fail open for availability)
		return false;
	}
};

/**
 * Close Keyv connection (for graceful shutdown)
 */
export const closeRedisConnection = async (): Promise<void> => {
	if (keyvClient && isInitialized) {
		try {
			await keyvClient.disconnect();
			logger.info('[RedisClient] Token blacklist disconnected');
		} catch (error) {
			logger.error('[RedisClient] Error closing Keyv connection:', error);
		} finally {
			keyvClient = null;
			isInitialized = false;
		}
	}
};
