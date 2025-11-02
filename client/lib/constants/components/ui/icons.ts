/**
 * Icon Component Constants
 * Reusable icon sizing and styling
 */

// ============================================================================
// ICON SIZES
// ============================================================================

export const ICON_SIZES = {
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type IconSize = (typeof ICON_SIZES)[keyof typeof ICON_SIZES];

// ============================================================================
// ICON SIZE CLASSES
// ============================================================================

export const ICON_SIZE_CLASSES = {
	xs: 'w-3 h-3',
	sm: 'w-4 h-4',
	md: 'w-5 h-5',
	lg: 'w-6 h-6',
	xl: 'w-8 h-8',
} as const;

// ============================================================================
// CHECKMARK ICON
// ============================================================================

export const CHECKMARK_ICON = {
	ariaLabel: 'Completed',
	strokeWidth: 2,
	viewBox: '0 0 24 24',
	path: 'M5 13l4 4L19 7',
} as const;
