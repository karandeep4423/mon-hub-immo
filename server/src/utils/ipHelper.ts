import { Request } from 'express';

/**
 * Extracts client IP address with proper proxy handling
 * Requires Express 'trust proxy' setting to be enabled
 */
export const getClientIp = (req: Request): string => {
	// Try req.ip first (works when trust proxy is set)
	if (req.ip) {
		return req.ip;
	}

	// Try X-Forwarded-For header (proxy environments)
	const forwardedFor = req.headers['x-forwarded-for'];
	if (forwardedFor) {
		const ips = Array.isArray(forwardedFor)
			? forwardedFor[0]
			: forwardedFor;
		return ips.split(',')[0].trim();
	}

	// Fallback to socket remote address
	return req.socket.remoteAddress || 'unknown';
};
