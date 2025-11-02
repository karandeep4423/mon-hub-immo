/**
 * Form Component Constants
 * Form inputs, validation, and field configuration
 */

// ============================================================================
// INPUT TYPES
// ============================================================================

export const FORM_INPUT_TYPES = {
	text: 'text',
	email: 'email',
	password: 'password',
	number: 'number',
	tel: 'tel',
	url: 'url',
	date: 'date',
	time: 'time',
	datetime: 'datetime-local',
	search: 'search',
	textarea: 'textarea',
	select: 'select',
	checkbox: 'checkbox',
	radio: 'radio',
	file: 'file',
} as const;

export type FormInputType =
	(typeof FORM_INPUT_TYPES)[keyof typeof FORM_INPUT_TYPES];

// ============================================================================
// INPUT SIZES
// ============================================================================

export const FORM_INPUT_SIZES = {
	sm: 'sm',
	md: 'md',
	lg: 'lg',
} as const;

export type FormInputSize =
	(typeof FORM_INPUT_SIZES)[keyof typeof FORM_INPUT_SIZES];

// ============================================================================
// INPUT SIZE CLASSES
// ============================================================================

export const FORM_INPUT_SIZE_CLASSES = {
	sm: 'h-9 px-3 text-sm',
	md: 'h-11 px-4 text-base',
	lg: 'h-13 px-5 text-lg',
} as const;

// ============================================================================
// INPUT BASE CLASSES
// ============================================================================

export const FORM_INPUT_BASE_CLASSES =
	'w-full rounded-lg border border-gray-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none' as const;

// ============================================================================
// INPUT STATE CLASSES
// ============================================================================

export const FORM_INPUT_STATE_CLASSES = {
	default: 'border-gray-300',
	error: 'border-red-500 focus:border-red-500 focus:ring-red-200',
	success: 'border-green-500 focus:border-green-500 focus:ring-green-200',
	disabled: 'bg-gray-100 cursor-not-allowed opacity-60',
} as const;

// ============================================================================
// LABEL CLASSES
// ============================================================================

export const FORM_LABEL_CLASSES = {
	base: 'block text-sm font-medium text-gray-700 mb-2',
	required: 'after:content-["*"] after:ml-1 after:text-red-500',
	optional:
		'after:content-["(optionnel)"] after:ml-1 after:text-gray-500 after:text-xs after:font-normal',
} as const;

// ============================================================================
// ERROR MESSAGE
// ============================================================================

export const FORM_ERROR_MESSAGE = {
	className: 'mt-1 text-sm text-red-600',
	icon: '⚠️',
} as const;

// ============================================================================
// HELPER TEXT
// ============================================================================

export const FORM_HELPER_TEXT = {
	className: 'mt-1 text-sm text-gray-500',
} as const;

// ============================================================================
// VALIDATION MESSAGES
// ============================================================================

export const FORM_VALIDATION_MESSAGES = {
	required: 'Ce champ est obligatoire',
	email: 'Email invalide',
	minLength: (min: number) => `Minimum ${min} caractères`,
	maxLength: (max: number) => `Maximum ${max} caractères`,
	min: (min: number) => `Valeur minimale: ${min}`,
	max: (max: number) => `Valeur maximale: ${max}`,
	pattern: 'Format invalide',
	phone: 'Numéro de téléphone invalide',
	postalCode: 'Code postal invalide',
	url: 'URL invalide',
	date: 'Date invalide',
	time: 'Heure invalide',
	file: {
		size: (max: number) => `Fichier trop volumineux (max ${max}Mo)`,
		type: 'Type de fichier non autorisé',
	},
} as const;

// ============================================================================
// TEXTAREA
// ============================================================================

export const FORM_TEXTAREA = {
	minRows: 3,
	maxRows: 10,
	defaultRows: 4,
	className:
		'w-full rounded-lg border border-gray-300 p-3 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none resize-y',
} as const;

// ============================================================================
// SELECT
// ============================================================================

export const FORM_SELECT = {
	placeholder: 'Sélectionnez une option',
	emptyMessage: 'Aucune option disponible',
	searchPlaceholder: 'Rechercher...',
	className:
		'w-full rounded-lg border border-gray-300 px-4 h-11 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition-all outline-none appearance-none',
} as const;

// ============================================================================
// CHECKBOX & RADIO
// ============================================================================

export const FORM_CHECKBOX = {
	className:
		'w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-2 focus:ring-brand-500',
	labelClassName: 'ml-2 text-sm text-gray-700',
} as const;

export const FORM_RADIO = {
	className:
		'w-4 h-4 text-brand-600 border-gray-300 focus:ring-2 focus:ring-brand-500',
	labelClassName: 'ml-2 text-sm text-gray-700',
} as const;

// ============================================================================
// FILE UPLOAD
// ============================================================================

export const FORM_FILE_UPLOAD = {
	accept: {
		image: 'image/jpeg,image/png,image/gif,image/webp',
		document: 'application/pdf,.doc,.docx',
		all: '*/*',
	},
	maxSize: 10, // MB
	buttonText: 'Choisir un fichier',
	dragText: 'Glissez-déposez un fichier ici ou cliquez pour parcourir',
	selectedText: (name: string) => `Fichier sélectionné: ${name}`,
	removeText: 'Supprimer',
} as const;

// ============================================================================
// FORM ACTIONS
// ============================================================================

export const FORM_ACTIONS = {
	submit: 'Envoyer',
	cancel: 'Annuler',
	reset: 'Réinitialiser',
	save: 'Enregistrer',
	saveDraft: 'Enregistrer comme brouillon',
	next: 'Suivant',
	previous: 'Précédent',
	finish: 'Terminer',
} as const;

// ============================================================================
// FORM STATES
// ============================================================================

export const FORM_STATES = {
	submitting: 'Envoi en cours...',
	submitted: 'Formulaire envoyé',
	error: "Erreur lors de l'envoi",
	validating: 'Validation...',
} as const;

// ============================================================================
// COMMON PLACEHOLDERS
// ============================================================================

export const FORM_PLACEHOLDERS = {
	// Location Search
	LOCATION_SEARCH: 'Rechercher par ville ou code postal',
	CITY_SEARCH: 'Entrez votre ville ou code postal',

	// Generic
	SELECT: 'Choisissez...',
} as const;
