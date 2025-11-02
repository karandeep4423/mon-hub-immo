import validator from 'validator';

/**
 * Unified Sanitization Utilities
 * Protects against XSS attacks and NoSQL injection
 */

// ==================== XSS Prevention ====================

/**
 * Sanitize a single string input
 * Removes leading/trailing whitespace and escapes HTML entities
 */
export const sanitizeString = (input: string | undefined | null): string => {
	if (!input || typeof input !== 'string') return '';
	return validator.escape(validator.trim(input));
};

/**
 * Sanitize an email address
 * Normalizes and validates email format
 */
export const sanitizeEmail = (email: string | undefined | null): string => {
	if (!email || typeof email !== 'string') return '';
	const trimmed = validator.trim(email.toLowerCase());
	return validator.normalizeEmail(trimmed) || trimmed;
};

/**
 * Sanitize a phone number
 * Removes all non-numeric characters except + at the start
 */
export const sanitizePhone = (
	phone: string | undefined | null,
): string | undefined => {
	if (!phone || typeof phone !== 'string') return undefined;
	const trimmed = validator.trim(phone);
	// Keep only digits and + at start
	return trimmed.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
};

/**
 * Sanitize an object with multiple string fields
 * Recursively sanitizes all string values
 */
export const sanitizeObject = <T extends Record<string, unknown>>(
	obj: T,
): T => {
	const sanitized: Record<string, unknown> = {};

	for (const [key, value] of Object.entries(obj)) {
		if (typeof value === 'string') {
			sanitized[key] = sanitizeString(value);
		} else if (
			value &&
			typeof value === 'object' &&
			!Array.isArray(value)
		) {
			sanitized[key] = sanitizeObject(value as Record<string, unknown>);
		} else if (Array.isArray(value)) {
			sanitized[key] = value.map((item) =>
				typeof item === 'string'
					? sanitizeString(item)
					: typeof item === 'object' && item !== null
						? sanitizeObject(item as Record<string, unknown>)
						: item,
			);
		} else {
			sanitized[key] = value;
		}
	}

	return sanitized as T;
};

/**
 * Sanitize user input data for signup/profile updates
 */
export const sanitizeUserInput = (data: {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	[key: string]: unknown;
}) => {
	return {
		...data,
		firstName: data.firstName ? sanitizeString(data.firstName) : undefined,
		lastName: data.lastName ? sanitizeString(data.lastName) : undefined,
		email: data.email ? sanitizeEmail(data.email) : undefined,
		phone: data.phone ? sanitizePhone(data.phone) : undefined,
	};
};

// ==================== NoSQL Injection Prevention ====================

/**
 * Sanitize user input to prevent NoSQL injection
 * Removes MongoDB operators like $gt, $ne, etc.
 */
export const sanitizeInput = (input: unknown): unknown => {
	if (input === null || input === undefined) {
		return input;
	}

	// Handle arrays
	if (Array.isArray(input)) {
		return input.map((item) => sanitizeInput(item));
	}

	// Handle objects
	if (typeof input === 'object') {
		const sanitized: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(input)) {
			// Remove keys starting with $ (MongoDB operators)
			if (
				!key.startsWith('$') &&
				key !== '__proto__' &&
				key !== 'constructor'
			) {
				sanitized[key] = sanitizeInput(value);
			}
		}
		return sanitized;
	}

	// Primitives are safe
	return input;
};

/**
 * Escape special regex characters to prevent ReDoS attacks
 */
export const escapeRegex = (str: string): string => {
	return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Sanitize MongoDB query filters
 * Use this before passing user input to MongoDB queries
 */
export const sanitizeMongoQuery = (
	query: Record<string, unknown>,
): Record<string, unknown> => {
	return sanitizeInput(query) as Record<string, unknown>;
};

/**
 * Create safe regex for search queries
 */
export const createSafeRegex = (searchTerm: string): RegExp => {
	const escaped = escapeRegex(searchTerm);
	return new RegExp(escaped, 'i');
};

/**
 * Validate and sanitize MongoDB ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
	return /^[a-f\d]{24}$/i.test(id);
};
