/**
 * Common/Shared Constants
 * Cross-cutting constants used throughout the application
 */

// ============================================================================
// NAVIGATION TEXT
// ============================================================================

export const NAV_TEXT = {
	forSale: 'En vente',
	favorites: 'Favoris',
	dashboard: 'Tableau de bord',
	logout: 'Déconnexion',
} as const;

// ============================================================================
// FORM TEXT
// ============================================================================

export const FORM_TEXT = {
	save: 'Enregistrer',
	cancel: 'Annuler',
	submit: 'Valider',
	loading: 'Chargement...',
	saving: 'Enregistrement...',
	delete: 'Supprimer',
	edit: 'Modifier',
	create: 'Créer',
	update: 'Mettre à jour',
	confirm: 'Confirmer',
	close: 'Fermer',
	back: 'Retour',
	next: 'Suivant',
	finish: 'Terminer',
	skip: 'Passer',
} as const;

// ============================================================================
// NOTIFICATION MESSAGES
// ============================================================================

export const NOTIFICATIONS = {
	success: {
		saved: 'Enregistré avec succès',
		deleted: 'Supprimé avec succès',
		updated: 'Mis à jour avec succès',
		created: 'Créé avec succès',
		sent: 'Envoyé avec succès',
		propertySaved: 'Annonce enregistrée avec succès',
		propertyDeleted: 'Annonce supprimée avec succès',
		messageSent: 'Message envoyé',
	},
	error: {
		generic: 'Une erreur est survenue',
		saveError: "Erreur lors de l'enregistrement",
		deleteError: 'Erreur lors de la suppression',
		loadingError: 'Erreur lors du chargement',
		networkError: 'Erreur de connexion',
		propertyError: "Erreur lors de la sauvegarde de l'annonce",
		unauthorized: 'Non autorisé',
		notFound: 'Non trouvé',
	},
	loading: {
		loading: 'Chargement...',
		saving: 'Enregistrement...',
		deleting: 'Suppression...',
		loadingProperties: 'Chargement des biens...',
		savingProperty: 'Enregistrement en cours...',
		deletingProperty: 'Suppression en cours...',
	},
	info: {
		noData: 'Aucune donnée disponible',
		noResults: 'Aucun résultat trouvé',
		pleaseWait: 'Veuillez patienter...',
	},
} as const;

// ============================================================================
// TIMING CONSTANTS (milliseconds)
// ============================================================================

/**
 * Debounce delays for various input types
 */
export const DEBOUNCE = {
	/** Standard debounce delay for search inputs (500ms) */
	SEARCH: 500,
	/** Fast debounce delay for autocomplete suggestions (300ms) */
	AUTOCOMPLETE: 300,
	/** Minimal debounce delay for scroll events (100ms) */
	SCROLL: 100,
	/** Debounce delay for window resize events (150ms) */
	RESIZE: 150,
	/** Debounce delay for form inputs (400ms) */
	INPUT: 400,
} as const;

/**
 * UI animation and transition durations
 */
export const ANIMATION = {
	/** Fast animations (150ms) */
	FAST: 150,
	/** Standard animations (300ms) */
	NORMAL: 300,
	/** Slow animations (500ms) */
	SLOW: 500,
	/** Modal/overlay transitions (200ms) */
	MODAL: 200,
	/** Toast notification display duration (3000ms) */
	TOAST: 3000,
	/** Tooltip delay (500ms) */
	TOOLTIP: 500,
} as const;

/**
 * Polling and refresh intervals
 */
export const POLLING = {
	/** Fast polling for real-time updates (5s) */
	FAST: 5000,
	/** Standard polling interval (30s) */
	NORMAL: 30000,
	/** Slow polling for background updates (60s) */
	SLOW: 60000,
	/** Session check interval (5 minutes) */
	SESSION_CHECK: 300000,
} as const;

/**
 * Timeout values
 */
export const TIMEOUT = {
	/** API request timeout (30s) */
	API_REQUEST: 30000,
	/** Authentication timeout (10s) */
	AUTH: 10000,
	/** File upload timeout (60s) */
	UPLOAD: 60000,
	/** Notification auto-dismiss (5s) */
	NOTIFICATION: 5000,
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION = {
	DEFAULT_PAGE_SIZE: 10,
	PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
	MAX_PAGE_SIZE: 100,
} as const;

// ============================================================================
// FILE UPLOAD
// ============================================================================

export const FILE_UPLOAD = {
	MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
	MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
	ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
	ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
	MAX_FILES_PER_UPLOAD: 10,
} as const;

// ============================================================================
// VALIDATION PATTERNS
// ============================================================================

export const VALIDATION = {
	EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	PHONE_REGEX: /^(?:\+33|0)[1-9](?:\d{2}){4}$/,
	POSTAL_CODE_REGEX: /^\d{5}$/,
	SIREN_REGEX: /^\d{9}$/,
	SIRET_REGEX: /^\d{14}$/,
	URL_REGEX: /^https?:\/\/.+/,
} as const;

// ============================================================================
// STATUS COLORS
// ============================================================================

export const STATUS_COLORS = {
	success: 'text-green-600 bg-green-50 border-green-200',
	error: 'text-red-600 bg-red-50 border-red-200',
	warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
	info: 'text-info bg-info-light border-info',
	neutral: 'text-gray-600 bg-gray-50 border-gray-200',
	pending: 'text-orange-600 bg-orange-50 border-orange-200',
	active: 'text-green-600 bg-green-50 border-green-200',
	inactive: 'text-gray-600 bg-gray-50 border-gray-200',
} as const;

export type StatusColor = keyof typeof STATUS_COLORS;

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

export const BUTTON_VARIANTS = {
	primary: 'bg-primary-600 hover:bg-primary-700 text-white',
	secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
	success: 'bg-green-600 hover:bg-green-700 text-white',
	danger: 'bg-red-600 hover:bg-red-700 text-white',
	warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
	outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700',
	ghost: 'hover:bg-gray-100 text-gray-700',
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

// ============================================================================
// STEP INDICATOR COLORS
// ============================================================================

export const STEP_INDICATOR_COLORS = {
	completed: 'bg-green-500 text-white',
	active: 'bg-primary-600 text-white',
	current: 'bg-primary-600 text-white', // Same as active
	pending: 'bg-gray-200 text-gray-600',
	upcoming: 'bg-gray-200 text-gray-600', // Same as pending
	error: 'bg-red-500 text-white',
} as const;

export type StepIndicatorState = keyof typeof STEP_INDICATOR_COLORS;

// ============================================================================
// Z-INDEX LAYERS
// ============================================================================

export const Z_INDEX = {
	BASE: 0,
	DROPDOWN: 10,
	STICKY: 20,
	FIXED: 30,
	MODAL_BACKDROP: 40,
	MODAL: 50,
	POPOVER: 60,
	TOOLTIP: 70,
	NOTIFICATION: 80,
	LOADING: 90,
} as const;

// ============================================================================
// BREAKPOINTS
// ============================================================================

export const BREAKPOINTS = {
	xs: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const GEOLOCATION_TOAST_MESSAGES = {
	PERMISSION_DENIED: 'Permission de géolocalisation refusée',
	POSITION_UNAVAILABLE: 'Position indisponible',
	TIMEOUT: 'Délai de géolocalisation dépassé',
	UNKNOWN_ERROR: 'Erreur de géolocalisation inconnue',
	SUCCESS: 'Localisation mise à jour',
} as const;

export const NOTIFICATION_TOAST_MESSAGES = {
	MARK_READ_SUCCESS: 'Notification marquée comme lue',
	MARK_ALL_READ_SUCCESS: 'Toutes les notifications marquées comme lues',
	DELETE_SUCCESS: 'Notification supprimée',
	FETCH_ERROR: 'Erreur lors du chargement des notifications',
} as const;

export const FILE_UPLOAD_TOAST_MESSAGES = {
	SUCCESS: 'Fichier téléchargé avec succès',
	ERROR: 'Erreur lors du téléchargement du fichier',
	IMAGE_SUCCESS: 'Image téléchargée avec succès',
	IMAGE_ERROR: "Erreur lors du téléchargement de l'image",
	DELETE_SUCCESS: 'Fichier supprimé',
	DELETE_ERROR: 'Erreur lors de la suppression du fichier',
	SIZE_LIMIT: 'La taille du fichier dépasse la limite autorisée',
	INVALID_FORMAT: 'Format de fichier non supporté',
} as const;

export const CONTACT_TOAST_MESSAGES = {
	SEND_SUCCESS:
		'Votre message a été envoyé avec succès. Nous vous contacterons bientôt.',
	SEND_ERROR: "Erreur lors de l'envoi du message",
	VALIDATION_ERROR: 'Veuillez remplir tous les champs requis',
} as const;

export const GENERAL_TOAST_MESSAGES = {
	SUCCESS: 'Opération réussie',
	ERROR: 'Une erreur est survenue',
	SAVE_SUCCESS: 'Enregistré avec succès',
	SAVE_ERROR: "Erreur lors de l'enregistrement",
	DELETE_SUCCESS: 'Supprimé avec succès',
	DELETE_ERROR: 'Erreur lors de la suppression',
	UPDATE_SUCCESS: 'Mis à jour avec succès',
	UPDATE_ERROR: 'Erreur lors de la mise à jour',
	LOADING: 'Chargement en cours...',
	SOMETHING_WENT_WRONG: "Quelque chose s'est mal passé",
	NETWORK_ERROR: 'Erreur de connexion réseau',
	PERMISSION_DENIED: "Vous n'avez pas la permission d'effectuer cette action",
	VALIDATION_ERROR: 'Veuillez vérifier les informations saisies',
	REQUIRED_FIELDS: 'Veuillez remplir tous les champs obligatoires',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type NavTextKeys = keyof typeof NAV_TEXT;
export type FormTextKeys = keyof typeof FORM_TEXT;
export type NotificationKeys = keyof typeof NOTIFICATIONS;
export type DebounceKeys = keyof typeof DEBOUNCE;
export type AnimationKeys = keyof typeof ANIMATION;
