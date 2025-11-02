import crypto from 'crypto';

/**
 * Timing-safe comparison utilities
 * Prevents timing attacks by ensuring constant-time comparisons
 */

/**
 * Compare two strings in constant time to prevent timing attacks
 * Useful for comparing verification codes, tokens, etc.
 *
 * @param a - First string to compare
 * @param b - Second string to compare
 * @returns true if strings match, false otherwise
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
	// If lengths don't match, still do comparison to prevent timing leak
	// Pad the shorter string to match the longer one
	const maxLength = Math.max(a.length, b.length);
	const bufferA = Buffer.alloc(maxLength);
	const bufferB = Buffer.alloc(maxLength);

	bufferA.write(a);
	bufferB.write(b);

	try {
		return crypto.timingSafeEqual(bufferA, bufferB);
	} catch {
		// crypto.timingSafeEqual throws if buffers have different lengths
		// This shouldn't happen with our padding, but handle it just in case
		return false;
	}
};

/**
 * Compare two strings in constant time (alternative implementation)
 * This version manually ensures constant time without crypto module
 */
export const constantTimeStringEqual = (a: string, b: string): boolean => {
	if (typeof a !== 'string' || typeof b !== 'string') {
		return false;
	}

	// Normalize to same length
	const len = Math.max(a.length, b.length);
	let result = a.length === b.length ? 0 : 1;

	for (let i = 0; i < len; i++) {
		// Use XOR to compare characters
		// If strings differ in length, compare with empty char (0)
		const charA = i < a.length ? a.charCodeAt(i) : 0;
		const charB = i < b.length ? b.charCodeAt(i) : 0;
		result |= charA ^ charB;
	}

	return result === 0;
};

/**
 * Safely compare verification codes (6-digit codes, tokens, etc.)
 * Includes input validation and sanitization
 */
export const compareVerificationCode = (
	providedCode: string | undefined | null,
	storedCode: string | undefined | null,
): boolean => {
	// Validate inputs
	if (
		!providedCode ||
		!storedCode ||
		typeof providedCode !== 'string' ||
		typeof storedCode !== 'string'
	) {
		return false;
	}

	// Trim whitespace
	const cleanProvided = providedCode.trim();
	const cleanStored = storedCode.trim();

	// Use timing-safe comparison
	return timingSafeEqual(cleanProvided, cleanStored);
};

/**
 * Hash a code before storing (optional additional security layer)
 * Useful for storing verification codes in database
 */
export const hashCode = (code: string): string => {
	return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * Compare a code with its hashed version
 */
export const compareCodeWithHash = (code: string, hash: string): boolean => {
	const codeHash = hashCode(code);
	return timingSafeEqual(codeHash, hash);
};
