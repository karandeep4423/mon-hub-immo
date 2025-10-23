/**
 * Timing and UI Constants
 * Centralized timing values for debouncing, delays, and other time-based configurations
 */

// ============================================================================
// DEBOUNCE DELAYS (in milliseconds)
// ============================================================================

/**
 * Standard debounce delay for search inputs
 * Used for general search functionality to reduce API calls
 */
export const DEBOUNCE_SEARCH_MS = 500;

/**
 * Fast debounce delay for autocomplete suggestions
 * Shorter delay for better UX in dropdown/autocomplete scenarios
 */
export const DEBOUNCE_AUTOCOMPLETE_MS = 300;

/**
 * Minimal debounce delay for scroll events
 * Very short delay to prevent excessive scroll handler calls
 */
export const DEBOUNCE_SCROLL_MS = 100;

/**
 * Debounce delay for window resize events
 */
export const DEBOUNCE_RESIZE_MS = 150;

/**
 * UI transition/animation delay
 * Used for brief delays after UI state changes
 */
export const UI_TRANSITION_MS = 100;

// ============================================================================
// TIMEOUTS & DELAYS
// ============================================================================

/**
 * Auto-save delay for form inputs
 * Used in components like AvailabilityManager
 */
export const AUTO_SAVE_DELAY_MS = 1000;

/**
 * Toast/notification display duration
 */
export const TOAST_DURATION_MS = 3000;

/**
 * Redirect delay after successful action
 */
export const REDIRECT_DELAY_MS = 2000;

/**
 * Animation/transition delay
 */
export const ANIMATION_DELAY_MS = 300;

// ============================================================================
// POLLING INTERVALS
// ============================================================================

/**
 * Interval for polling updates (notifications, messages, etc.)
 */
export const POLLING_INTERVAL_MS = 30000; // 30 seconds

/**
 * Fast polling interval for time-sensitive data
 */
export const POLLING_INTERVAL_FAST_MS = 5000; // 5 seconds

// ============================================================================
// TIMEOUTS
// ============================================================================

/**
 * API request timeout
 */
export const API_TIMEOUT_MS = 30000; // 30 seconds

/**
 * File upload timeout (longer for larger files)
 */
export const UPLOAD_TIMEOUT_MS = 120000; // 2 minutes

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

/**
 * Number of retry attempts for failed requests
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * Delay between retry attempts
 */
export const RETRY_DELAY_MS = 1000;

/**
 * Exponential backoff multiplier for retries
 */
export const RETRY_BACKOFF_MULTIPLIER = 2;

// ============================================================================
// CALENDAR & DATE CONSTANTS
// ============================================================================

/**
 * Days of the week configuration for availability scheduling
 * Value: ISO day number (0 = Sunday, 1 = Monday, etc.)
 */
export const DAYS_OF_WEEK = [
	{ value: 1, label: 'Lundi' },
	{ value: 2, label: 'Mardi' },
	{ value: 3, label: 'Mercredi' },
	{ value: 4, label: 'Jeudi' },
	{ value: 5, label: 'Vendredi' },
	{ value: 6, label: 'Samedi' },
	{ value: 0, label: 'Dimanche' },
] as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export const TIMING_CONSTANTS = {
	DEBOUNCE: {
		SEARCH: DEBOUNCE_SEARCH_MS,
		AUTOCOMPLETE: DEBOUNCE_AUTOCOMPLETE_MS,
		SCROLL: DEBOUNCE_SCROLL_MS,
		RESIZE: DEBOUNCE_RESIZE_MS,
	},
	DELAYS: {
		AUTO_SAVE: AUTO_SAVE_DELAY_MS,
		TOAST: TOAST_DURATION_MS,
		REDIRECT: REDIRECT_DELAY_MS,
		ANIMATION: ANIMATION_DELAY_MS,
	},
	POLLING: {
		NORMAL: POLLING_INTERVAL_MS,
		FAST: POLLING_INTERVAL_FAST_MS,
	},
	TIMEOUTS: {
		API: API_TIMEOUT_MS,
		UPLOAD: UPLOAD_TIMEOUT_MS,
	},
	RETRY: {
		MAX_ATTEMPTS: MAX_RETRY_ATTEMPTS,
		DELAY: RETRY_DELAY_MS,
		BACKOFF_MULTIPLIER: RETRY_BACKOFF_MULTIPLIER,
	},
} as const;
