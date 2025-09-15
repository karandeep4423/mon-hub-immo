/**
 * Environment-controlled logging utility
 * Provides structured logging with environment-based controls
 */

interface LogConfig {
	enableDebug: boolean;
	enableInfo: boolean;
	enableWarn: boolean;
	enableError: boolean;
}

// Environment-based configuration
const getLogConfig = (): LogConfig => {
	const isDev = process.env.NODE_ENV === 'development';
	const isTest = process.env.NODE_ENV === 'test';

	return {
		enableDebug: isDev && !isTest,
		enableInfo: isDev && !isTest,
		enableWarn: true,
		enableError: true,
	};
};

const config = getLogConfig();

/**
 * Structured logger with emoji prefixes and environment controls
 */
export const logger = {
	debug: (message: string, ...args: unknown[]) => {
		if (config.enableDebug) {
			console.log(`🔍 ${message}`, ...args);
		}
	},

	info: (message: string, ...args: unknown[]) => {
		if (config.enableInfo) {
			console.log(`ℹ️ ${message}`, ...args);
		}
	},

	warn: (message: string, ...args: unknown[]) => {
		if (config.enableWarn) {
			console.warn(`⚠️ ${message}`, ...args);
		}
	},

	error: (message: string, ...args: unknown[]) => {
		if (config.enableError) {
			console.error(`❌ ${message}`, ...args);
		}
	},

	success: (message: string, ...args: unknown[]) => {
		if (config.enableInfo) {
			console.log(`✅ ${message}`, ...args);
		}
	},
};

/**
 * Chat-specific logger with consistent prefixes
 */
export const chatLogger = {
	debug: (message: string, ...args: unknown[]) => {
		logger.debug(`ChatStore: ${message}`, ...args);
	},

	info: (message: string, ...args: unknown[]) => {
		logger.info(`ChatStore: ${message}`, ...args);
	},

	warn: (message: string, ...args: unknown[]) => {
		logger.warn(`ChatStore: ${message}`, ...args);
	},

	error: (message: string, ...args: unknown[]) => {
		logger.error(`ChatStore: ${message}`, ...args);
	},

	success: (message: string, ...args: unknown[]) => {
		logger.success(`ChatStore: ${message}`, ...args);
	},
};
