/**
 * Filter Input Validation Utilities
 * Functions for validating and sanitizing filter inputs
 */

import { FILTER_DEFAULTS } from '@/lib/constants/filters';

/**
 * Validate and sanitize number input
 * Ensures the value is within min/max bounds and handles invalid inputs
 *
 * @param value - Input value as string
 * @param min - Minimum allowed value (default: 0)
 * @param max - Maximum allowed value (default: Infinity)
 * @returns Validated number within bounds
 *
 * @example
 * validateNumberInput('100', 0, 1000) // 100
 * validateNumberInput('-50', 0, 1000) // 0
 * validateNumberInput('abc', 0, 1000) // 0
 * validateNumberInput('2000', 0, 1000) // 1000
 */
export const validateNumberInput = (
	value: string,
	min = 0,
	max = Infinity,
): number => {
	const parsed = parseInt(value, 10);

	// Handle invalid input
	if (isNaN(parsed)) {
		return min;
	}

	// Clamp value within bounds
	return Math.max(min, Math.min(max, parsed));
};

/**
 * Validate price range ensuring min is not greater than max
 *
 * @param min - Minimum price
 * @param max - Maximum price
 * @returns Validated price range object
 *
 * @example
 * validatePriceRange(100000, 500000) // { min: 100000, max: 500000 }
 * validatePriceRange(500000, 100000) // { min: 100000, max: 500000 } (swapped)
 * validatePriceRange(-1000, 500000) // { min: 0, max: 500000 }
 */
export const validatePriceRange = (
	min: number,
	max: number,
): { min: number; max: number } => {
	// Ensure values are within absolute bounds
	const validMin = Math.max(FILTER_DEFAULTS.PRICE_MIN, Math.min(min, max));
	const validMax = Math.min(FILTER_DEFAULTS.PRICE_MAX, Math.max(min, max));

	return {
		min: validMin,
		max: validMax,
	};
};

/**
 * Validate surface range ensuring min is not greater than max
 *
 * @param min - Minimum surface area
 * @param max - Maximum surface area
 * @returns Validated surface range object
 *
 * @example
 * validateSurfaceRange(50, 200) // { min: 50, max: 200 }
 * validateSurfaceRange(200, 50) // { min: 50, max: 200 } (swapped)
 * validateSurfaceRange(-10, 200) // { min: 0, max: 200 }
 */
export const validateSurfaceRange = (
	min: number,
	max: number,
): { min: number; max: number } => {
	// Ensure values are within absolute bounds
	const validMin = Math.max(FILTER_DEFAULTS.SURFACE_MIN, Math.min(min, max));
	const validMax = Math.min(FILTER_DEFAULTS.SURFACE_MAX, Math.max(min, max));

	return {
		min: validMin,
		max: validMax,
	};
};

/**
 * Validate and sanitize price input field
 * Handles both min and max price fields with proper validation
 *
 * @param value - Input value as string
 * @param type - Type of field ('min' or 'max')
 * @param currentRange - Current price range object
 * @returns New validated price range
 *
 * @example
 * validatePriceInput('250000', 'min', { min: 0, max: 1000000 })
 * // { min: 250000, max: 1000000 }
 */
export const validatePriceInput = (
	value: string,
	type: 'min' | 'max',
	currentRange: { min: number; max: number },
): { min: number; max: number } => {
	// If empty string, use default for max or 0 for min
	if (value === '' || value.trim() === '') {
		if (type === 'min') {
			return validatePriceRange(
				FILTER_DEFAULTS.PRICE_MIN,
				currentRange.max,
			);
		} else {
			return validatePriceRange(
				currentRange.min,
				FILTER_DEFAULTS.PRICE_MAX,
			);
		}
	}

	const validated = validateNumberInput(
		value,
		FILTER_DEFAULTS.PRICE_MIN,
		FILTER_DEFAULTS.PRICE_MAX,
	);

	if (type === 'min') {
		return validatePriceRange(validated, currentRange.max);
	} else {
		return validatePriceRange(currentRange.min, validated);
	}
};

/**
 * Validate and sanitize surface input field
 * Handles both min and max surface fields with proper validation
 *
 * @param value - Input value as string
 * @param type - Type of field ('min' or 'max')
 * @param currentRange - Current surface range object
 * @returns New validated surface range
 *
 * @example
 * validateSurfaceInput('100', 'min', { min: 0, max: 500 })
 * // { min: 100, max: 500 }
 */
export const validateSurfaceInput = (
	value: string,
	type: 'min' | 'max',
	currentRange: { min: number; max: number },
): { min: number; max: number } => {
	// If empty string, use default for max or 0 for min
	if (value === '' || value.trim() === '') {
		if (type === 'min') {
			return validateSurfaceRange(
				FILTER_DEFAULTS.SURFACE_MIN,
				currentRange.max,
			);
		} else {
			return validateSurfaceRange(
				currentRange.min,
				FILTER_DEFAULTS.SURFACE_MAX,
			);
		}
	}

	const validated = validateNumberInput(
		value,
		FILTER_DEFAULTS.SURFACE_MIN,
		FILTER_DEFAULTS.SURFACE_MAX,
	);

	if (type === 'min') {
		return validateSurfaceRange(validated, currentRange.max);
	} else {
		return validateSurfaceRange(currentRange.min, validated);
	}
};

/**
 * Check if a string value is a valid number
 *
 * @param value - Value to check
 * @returns True if value is a valid number
 */
export const isValidNumber = (value: string): boolean => {
	if (!value || value.trim() === '') return false;
	const num = parseFloat(value);
	return !isNaN(num) && isFinite(num);
};

/**
 * Format number input for display (removes leading zeros, etc.)
 *
 * @param value - Value to format
 * @returns Formatted value
 */
export const formatNumberInput = (value: string | number): string => {
	if (value === '' || value === 0) return '';
	return String(value).replace(/^0+(?=\d)/, '');
};
