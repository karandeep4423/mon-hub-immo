import winston from 'winston';
import path from 'path';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Define log levels
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

// Define colors for each level
const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white',
};

winston.addColors(colors);

// Define log format
const format = winston.format.combine(
	winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	winston.format.colorize({ all: true }),
	winston.format.printf(
		(info) => `${info.timestamp} ${info.level}: ${info.message}`,
	),
);

// Define transports
const transports = [
	// Console output
	new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.simple(),
		),
	}),
	// Error logs
	new winston.transports.File({
		filename: path.join('logs', 'error.log'),
		level: 'error',
		format: winston.format.combine(
			winston.format.uncolorize(),
			winston.format.json(),
		),
	}),
	// Combined logs
	new winston.transports.File({
		filename: path.join('logs', 'combined.log'),
		format: winston.format.combine(
			winston.format.uncolorize(),
			winston.format.json(),
		),
	}),
];

// Create logger instance
export const logger = winston.createLogger({
	level: isDevelopment ? 'debug' : 'info',
	levels,
	format,
	transports,
});

/**
 * Sanitize sensitive data from logs
 */
export const sanitizeLogData = (data: unknown): unknown => {
	if (!data || typeof data !== 'object') {
		return data;
	}

	const sensitiveKeys = [
		'password',
		'token',
		'accessToken',
		'refreshToken',
		'authorization',
		'cookie',
		'secret',
		'apiKey',
		'creditCard',
		'ssn',
	];

	const sanitized = { ...(data as Record<string, unknown>) };

	for (const key in sanitized) {
		const lowerKey = key.toLowerCase();

		// Check if key contains sensitive information
		if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
			sanitized[key] = '[REDACTED]';
		}
		// Recursively sanitize nested objects
		else if (
			typeof sanitized[key] === 'object' &&
			sanitized[key] !== null
		) {
			sanitized[key] = sanitizeLogData(sanitized[key]);
		}
	}

	return sanitized;
};

/**
 * Log HTTP request with sanitization
 */
export const logRequest = (
	method: string,
	url: string,
	statusCode: number,
	responseTime?: number,
	userId?: string,
): void => {
	const message = `${method} ${url} ${statusCode}${responseTime ? ` - ${responseTime}ms` : ''}${userId ? ` - User: ${userId}` : ''}`;

	if (statusCode >= 500) {
		logger.error(message);
	} else if (statusCode >= 400) {
		logger.warn(message);
	} else {
		logger.http(message);
	}
};

/**
 * Safe console replacement for development
 */
export const devLog = {
	log: (...args: unknown[]) => {
		if (isDevelopment) {
			logger.debug(args.map((arg) => JSON.stringify(arg)).join(' '));
		}
	},
	error: (...args: unknown[]) => {
		logger.error(args.map((arg) => JSON.stringify(arg)).join(' '));
	},
	warn: (...args: unknown[]) => {
		logger.warn(args.map((arg) => JSON.stringify(arg)).join(' '));
	},
	info: (...args: unknown[]) => {
		logger.info(args.map((arg) => JSON.stringify(arg)).join(' '));
	},
};
