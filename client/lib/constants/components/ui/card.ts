/**
 * Card Component Constants
 * Reusable card container component styling
 */

// ============================================================================
// PADDING VARIANTS
// ============================================================================

export const CARD_PADDING = {
	none: 'none',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type CardPadding = (typeof CARD_PADDING)[keyof typeof CARD_PADDING];

// ============================================================================
// PADDING CLASSES
// ============================================================================

export const CARD_PADDING_CLASSES = {
	none: '',
	sm: 'p-3',
	md: 'p-6',
	lg: 'p-8',
	xl: 'p-10',
} as const;

// ============================================================================
// SHADOW VARIANTS
// ============================================================================

export const CARD_SHADOW = {
	none: 'none',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type CardShadow = (typeof CARD_SHADOW)[keyof typeof CARD_SHADOW];

// ============================================================================
// SHADOW CLASSES
// ============================================================================

export const CARD_SHADOW_CLASSES = {
	none: '',
	sm: 'shadow-xs',
	md: 'shadow-card',
	lg: 'shadow-card-hover',
	xl: 'shadow-xl',
} as const;

// ============================================================================
// ROUNDED VARIANTS
// ============================================================================

export const CARD_ROUNDED = {
	none: 'none',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
	'2xl': '2xl',
} as const;

export type CardRounded = (typeof CARD_ROUNDED)[keyof typeof CARD_ROUNDED];

// ============================================================================
// ROUNDED CLASSES
// ============================================================================

export const CARD_ROUNDED_CLASSES = {
	none: '',
	sm: 'rounded-sm',
	md: 'rounded-md',
	lg: 'rounded-lg',
	xl: 'rounded-xl',
	'2xl': 'rounded-2xl',
} as const;

// ============================================================================
// BASE CLASSES
// ============================================================================

export const CARD_BASE_CLASSES =
	'bg-white border border-gray-200 transition-smooth' as const;

// ============================================================================
// HOVER VARIANTS
// ============================================================================

export const CARD_HOVER = {
	none: '',
	shadow: 'hover:shadow-card-hover transition-smooth cursor-pointer',
	lift: 'hover:shadow-card-hover hover:-translate-y-1 hover:scale-102 transition-smooth cursor-pointer',
	scale: 'hover:scale-102 hover:shadow-card-hover transition-all duration-300 cursor-pointer',
} as const;

export type CardHover = keyof typeof CARD_HOVER;

// ============================================================================
// INTERACTIVE VARIANTS
// ============================================================================

export const CARD_INTERACTIVE = {
	clickable: 'cursor-pointer active:scale-95 transition-transform',
	selectable: 'cursor-pointer border-2 hover:border-brand-500',
	selected: 'border-2 border-brand-600 ring-2 ring-brand-200',
} as const;

// ============================================================================
// DEFAULTS
// ============================================================================

export const CARD_DEFAULTS = {
	padding: CARD_PADDING.md,
	shadow: CARD_SHADOW.sm,
	rounded: CARD_ROUNDED.lg,
	hover: false,
} as const;
