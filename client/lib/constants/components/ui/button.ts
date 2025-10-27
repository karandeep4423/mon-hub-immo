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
		'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-600 shadow-lg hover:shadow-xl',
	secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
	outline:
		'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-brand-600',
	ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
	danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600 shadow-lg hover:shadow-xl',
	success:
		'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600 shadow-lg hover:shadow-xl',
} as const;

// ============================================================================
// SIZE CLASSES
// ============================================================================

export const BUTTON_SIZE_CLASSES = {
	sm: 'px-4 py-2 text-sm h-10',
	md: 'px-6 py-3 text-base h-12',
	lg: 'px-8 py-4 text-lg h-14 sm:h-12 sm:text-base',
	xl: 'px-10 py-5 text-xl h-16',
} as const;

// ============================================================================
// BASE CLASSES
// ============================================================================

export const BUTTON_BASE_CLASSES =
	'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95' as const;

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
