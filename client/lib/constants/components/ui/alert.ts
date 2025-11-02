/**
 * Alert Component Constants
 * Alert and notification styling
 */

// ============================================================================
// ALERT TYPES
// ============================================================================

export const ALERT_TYPES = {
	info: 'info',
	success: 'success',
	warning: 'warning',
	error: 'error',
} as const;

export type AlertType = (typeof ALERT_TYPES)[keyof typeof ALERT_TYPES];

// ============================================================================
// ALERT TYPE CLASSES
// ============================================================================

export const ALERT_TYPE_CLASSES = {
	info: 'bg-info-light border-info text-info',
	success: 'bg-green-50 border-green-200 text-green-800',
	warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
	error: 'bg-red-50 border-red-200 text-red-800',
} as const;

// ============================================================================
// ALERT ICON COLORS
// ============================================================================

export const ALERT_ICON_COLORS = {
	info: 'text-info',
	success: 'text-green-400',
	warning: 'text-yellow-400',
	error: 'text-red-400',
} as const;

// ============================================================================
// ALERT BASE
// ============================================================================

export const ALERT_BASE_CLASSES = 'border rounded-lg p-4 flex gap-3' as const;
