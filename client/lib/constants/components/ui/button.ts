/**
 * Button Component Constants
 * Reusable button component styling and variants
 */

// ============================================================================
// VARIANTS
// ============================================================================

export const BUTTON_VARIANTS = {
	primary: 'primary',
	secondary: 'secondary',
	outline: 'outline',
	ghost: 'ghost',
	danger: 'danger',
	success: 'success',
	accent: 'accent',
} as const;

export type ButtonVariant =
	(typeof BUTTON_VARIANTS)[keyof typeof BUTTON_VARIANTS];

// ============================================================================
// SIZES
// ============================================================================

export const BUTTON_SIZES = {
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type ButtonSize = (typeof BUTTON_SIZES)[keyof typeof BUTTON_SIZES];

// ============================================================================
// VARIANT CLASSES
// ============================================================================

export const BUTTON_VARIANT_CLASSES = {
	primary:
		'bg-brand text-white hover:bg-brand-600 focus:ring-brand shadow-brand hover:shadow-brand-lg',
	secondary:
		'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg',
	outline:
		'border-2 border-brand text-brand hover:bg-brand-50 focus:ring-brand',
	ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
	danger: 'bg-error text-white hover:bg-[#ff5252] focus:ring-error shadow-md hover:shadow-lg',
	success:
		'bg-success text-white hover:bg-[#40c057] focus:ring-success shadow-md hover:shadow-lg',
	accent: 'bg-accent text-white hover:bg-[#ff5252] focus:ring-accent shadow-md hover:shadow-lg',
} as const;

// ============================================================================
// SIZE CLASSES
// ============================================================================

export const BUTTON_SIZE_CLASSES = {
	sm: 'px-4 py-2 text-sm h-10 rounded-lg',
	md: 'px-6 py-3 text-base h-12 rounded-xl',
	lg: 'px-8 py-4 text-lg h-14 rounded-xl sm:h-12 sm:text-base',
	xl: 'px-10 py-5 text-xl h-16 rounded-2xl',
} as const;

// ============================================================================
// BASE CLASSES
// ============================================================================

export const BUTTON_BASE_CLASSES =
	'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98' as const;

// ============================================================================
// STATES
// ============================================================================

export const BUTTON_STATES = {
	loading: {
		text: 'Chargement...',
		disabled: true,
	},
	disabled: {
		opacity: 'opacity-50',
		cursor: 'cursor-not-allowed',
	},
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const BUTTON_A11Y = {
	loadingLabel: 'Chargement en cours',
	disabledLabel: 'Bouton désactivé',
} as const;

// ============================================================================
// BUTTON TEXT
// ============================================================================

export const BUTTON_TEXT = {
	// Common Actions
	edit: 'Modifier',
	delete: 'Supprimer',
	cancel: 'Annuler',
	confirm: 'Confirmer',
	add: 'Ajouter',
	save: 'Enregistrer',
	close: 'Fermer',

	// Specific Actions
	editProfile: 'Modifier mon profil',
	editProperty: 'Modifier le bien',
	editSearch: 'Modifier la recherche',
	editStatus: 'Modifier le statut',
	addActivity: 'Ajouter une activité',
	confirmReschedule: '✓ Confirmer la reprogrammation',
} as const;
