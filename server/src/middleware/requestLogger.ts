import { Request, Response, NextFunction } from 'express';
import { logger, sanitizeLogData } from '../utils/logger';

/**
 * Request logging middleware
 * Logs HTTP requests with sanitized data
 */
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
): void => {
	const startTime = Date.now();

	// Log request
	const requestData = {
		method: req.method,
		url: req.originalUrl,
		ip: req.ip,
		userAgent: req.get('user-agent'),
		body: sanitizeLogData(req.body),
		query: sanitizeLogData(req.query),
	};

	logger.http(`Incoming ${req.method} ${req.originalUrl}`);
	logger.debug(`Request details: ${JSON.stringify(requestData)}`);

	// Capture response
	const originalSend = res.send;
	res.send = function (data): Response {
		const responseTime = Date.now() - startTime;

		// Log response
		logger.http(
			`${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`,
		);

		// Log errors in detail
		if (res.statusCode >= 400) {
			logger.warn(`Response: ${data?.toString().slice(0, 500)}`);
		}

		return originalSend.call(this, data);
	};

	next();
};
