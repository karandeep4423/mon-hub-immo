import zxcvbn from 'zxcvbn';

/**
 * Password validation utility using zxcvbn for strength checking
 * Prevents common weak passwords and enforces strong password policies
 */

/**
 * Minimum password strength score (0-4)
 * 0: too guessable
 * 1: very guessable
 * 2: somewhat guessable
 * 3: safely unguessable (RECOMMENDED MINIMUM)
 * 4: very unguessable
 */
const MIN_PASSWORD_STRENGTH = 3;

/**
 * Common password patterns to explicitly reject
 */
const FORBIDDEN_PATTERNS = [
	/^password\d*$/i,
	/^123456/,
	/^qwerty/i,
	/^abc123/i,
	/^letmein/i,
	/^welcome/i,
	/^monkey/i,
	/^dragon/i,
	/^master/i,
	/^sunshine/i,
];

/**
 * Validate password strength using zxcvbn
 * Returns { isValid: boolean, message?: string, score: number, suggestions: string[] }
 */
export const validatePasswordStrength = (
	password: string,
	userInputs: string[] = [],
) => {
	// Check for forbidden patterns first
	for (const pattern of FORBIDDEN_PATTERNS) {
		if (pattern.test(password)) {
			return {
				isValid: false,
				message: 'This password is too common and easily guessable',
				score: 0,
				suggestions: [
					'Choose a more unique password',
					'Avoid common words and patterns',
				],
			};
		}
	}

	// Run zxcvbn analysis
	const result = zxcvbn(password, userInputs);

	// Check minimum strength requirement
	if (result.score < MIN_PASSWORD_STRENGTH) {
		return {
			isValid: false,
			message:
				result.feedback.warning ||
				'Password is too weak. Please choose a stronger password.',
			score: result.score,
			suggestions: result.feedback.suggestions || [
				'Use a mix of uppercase and lowercase letters',
				'Include numbers and special characters',
				'Make it at least 12 characters long',
				'Avoid common words and patterns',
			],
		};
	}

	return {
		isValid: true,
		score: result.score,
		suggestions: [],
	};
};

/**
 * Get password strength label for UI display
 */
export const getPasswordStrengthLabel = (score: number): string => {
	const labels = [
		'Very Weak',
		'Weak',
		'Fair',
		'Strong',
		'Very Strong',
	] as const;
	return labels[score] || 'Unknown';
};

/**
 * Check if password meets basic requirements
 * (Use this before zxcvbn for faster rejection of obviously invalid passwords)
 */
export const meetsBasicRequirements = (
	password: string,
): {
	isValid: boolean;
	errors: string[];
} => {
	const errors: string[] = [];

	if (password.length < 12) {
		errors.push('Password must be at least 12 characters long');
	}

	if (password.length > 128) {
		errors.push('Password must not exceed 128 characters');
	}

	if (!/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (!/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (!/\d/.test(password)) {
		errors.push('Password must contain at least one digit');
	}

	if (!/[@$!%*?&_\-+=]/.test(password)) {
		errors.push(
			'Password must contain at least one special character (@$!%*?&_-+=)',
		);
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};
