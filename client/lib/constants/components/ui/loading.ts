/**
 * Loading Component Constants
 * Loading states, spinners, and skeletons
 */

// ============================================================================
// SPINNER SIZES
// ============================================================================

export const LOADING_SPINNER_SIZES = {
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type LoadingSpinnerSize =
	(typeof LOADING_SPINNER_SIZES)[keyof typeof LOADING_SPINNER_SIZES];

// ============================================================================
// SPINNER SIZE CLASSES
// ============================================================================

export const LOADING_SPINNER_SIZE_CLASSES = {
	xs: 'w-3 h-3',
	sm: 'w-4 h-4',
	md: 'w-8 h-8',
	lg: 'w-12 h-12',
	xl: 'w-16 h-16',
} as const;

// ============================================================================
// SPINNER COLORS
// ============================================================================

export const LOADING_SPINNER_COLORS = {
	brand: 'text-brand',
	white: 'text-white',
	gray: 'text-gray-600',
	primary: 'text-brand',
	secondary: 'text-gray-600',
} as const;

export type LoadingSpinnerColor = keyof typeof LOADING_SPINNER_COLORS;

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const LOADING_MESSAGES = {
	default: 'Chargement...',
	page: 'Chargement de la page...',
	data: 'Chargement des données...',
	saving: 'Enregistrement...',
	uploading: 'Téléchargement...',
	processing: 'Traitement en cours...',
	deleting: 'Suppression...',
	sending: 'Envoi...',
	loading: 'Chargement...',
} as const;

// ============================================================================
// OVERLAY
// ============================================================================

export const LOADING_OVERLAY = {
	className:
		'fixed inset-0 bg-white/90 backdrop-blur-md flex items-center justify-center z-50',
	spinnerSize: LOADING_SPINNER_SIZES.lg,
	message: LOADING_MESSAGES.default,
} as const;

// ============================================================================
// SKELETON
// ============================================================================

export const LOADING_SKELETON = {
	baseClassName: 'animate-shimmer bg-gray-200 rounded',
	variants: {
		text: 'h-4 w-full',
		title: 'h-6 w-3/4',
		avatar: 'h-12 w-12 rounded-full',
		image: 'h-48 w-full',
		button: 'h-10 w-24 rounded-xl',
		card: 'h-64 w-full rounded-2xl',
	},
} as const;

// ============================================================================
// INLINE LOADER
// ============================================================================

export const LOADING_INLINE = {
	className: 'inline-flex items-center gap-2 text-sm text-gray-600',
	spinnerSize: LOADING_SPINNER_SIZES.sm,
} as const;

// ============================================================================
// BUTTON LOADER
// ============================================================================

export const LOADING_BUTTON = {
	className: 'mr-2',
	spinnerSize: LOADING_SPINNER_SIZES.sm,
	color: LOADING_SPINNER_COLORS.white,
} as const;
