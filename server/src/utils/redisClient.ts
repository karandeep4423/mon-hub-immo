import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Get or create Redis client
 */
export const getRedisClient = async (): Promise<RedisClientType | null> => {
	// Skip Redis if URL not configured (development without Redis)
	if (!process.env.REDIS_URL) {
		console.warn('⚠️ REDIS_URL not configured - token revocation disabled');
		return null;
	}

	if (redisClient && isConnected) {
		return redisClient;
	}

	try {
		redisClient = createClient({
			url: process.env.REDIS_URL,
		});

		redisClient.on('error', (err) => {
			console.error('❌ Redis Client Error:', err);
			isConnected = false;
		});

		redisClient.on('connect', () => {
			console.log('✅ Redis connected');
			isConnected = true;
		});

		await redisClient.connect();
		return redisClient;
	} catch (error) {
		console.error('❌ Redis connection failed:', error);
		redisClient = null;
		isConnected = false;
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
		console.warn(
			'⚠️ Redis unavailable - token not blacklisted:',
			token.substring(0, 20),
		);
		return;
	}

	try {
		const key = `blacklist:${token}`;
		await client.setEx(key, expiresInSeconds, 'revoked');
		console.log(`🚫 Token blacklisted (TTL: ${expiresInSeconds}s)`);
	} catch (error) {
		console.error('❌ Failed to blacklist token:', error);
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
		// If Redis is unavailable, allow the request (graceful degradation)
		return false;
	}

	try {
		const key = `blacklist:${token}`;
		const result = await client.get(key);
		return result === 'revoked';
	} catch (error) {
		console.error('❌ Failed to check token blacklist:', error);
		// On error, allow the request (fail open for availability)
		return false;
	}
};

/**
 * Close Redis connection (for graceful shutdown)
 */
export const closeRedisConnection = async (): Promise<void> => {
	if (redisClient && isConnected) {
		try {
			await redisClient.quit();
			console.log('✅ Redis connection closed');
			isConnected = false;
		} catch (error) {
			console.error('❌ Error closing Redis connection:', error);
		}
	}
};
