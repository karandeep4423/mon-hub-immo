/**
 * Search Ads Feature Constants
 * All search-ad-related constants: statuses, routes, messages, UI text
 */

// ============================================================================
// SEARCH AD STATUSES
// ============================================================================

export const SEARCH_AD_STATUSES = {
	ACTIVE: 'active',
	PAUSED: 'paused',
	FULFILLED: 'fulfilled',
	SOLD: 'sold',
	RENTED: 'rented',
	ARCHIVED: 'archived',
} as const;

export type SearchAdStatus =
	(typeof SEARCH_AD_STATUSES)[keyof typeof SEARCH_AD_STATUSES];

/**
 * Search Ad Status Configuration
 */
export interface StatusConfig {
	label: string;
	variant: 'success' | 'warning' | 'error' | 'info' | 'default';
	className: string;
}

export const SEARCH_AD_STATUS_CONFIG: Record<string, StatusConfig> = {
	active: {
		label: 'Active',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	paused: {
		label: 'En pause',
		variant: 'warning',
		className: 'bg-yellow-100 text-yellow-800',
	},
	fulfilled: {
		label: 'Satisfaite',
		variant: 'info',
		className: 'bg-blue-100 text-blue-800',
	},
	sold: {
		label: 'Vendue',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	rented: {
		label: 'Louée',
		variant: 'info',
		className: 'bg-blue-100 text-blue-800',
	},
	archived: {
		label: 'Archivée',
		variant: 'default',
		className: 'bg-gray-100 text-gray-800',
	},
} as const;

// ============================================================================
// UI TEXT
// ============================================================================

export const SEARCH_AD_UI_TEXT = {
	// Page titles
	title: 'Annonces de recherche',
	mySearchAds: 'Mes annonces de recherche',
	createSearchAd: 'Créer une annonce de recherche',
	editSearchAd: "Modifier l'annonce",

	// Actions
	create: 'Créer',
	edit: 'Modifier',
	delete: 'Supprimer',
	pause: 'Mettre en pause',
	resume: 'Réactiver',
	archive: 'Archiver',
	view: 'Voir les détails',
	collaborate: 'Collaborer',

	// Status messages
	loading: 'Chargement des annonces...',
	noSearchAds: 'Aucune annonce de recherche pour le moment',
	createFirst: 'Créez votre première annonce de recherche',

	// Form labels
	propertyType: 'Type de bien',
	location: 'Localisation',
	budget: 'Budget',
	description: 'Description',
	criteria: 'Critères',
	priorities: 'Priorités',
	mustHaves: 'Indispensables',
	niceToHaves: 'Souhaités',
	dealBreakers: 'Rédhibitoires',

	// Empty states
	noActiveSearchAds: 'Aucune annonce active',
	noPausedSearchAds: 'Aucune annonce en pause',
	noArchivedSearchAds: 'Aucune annonce archivée',

	// Card Labels
	urgentLabel: 'Urgent',
	budgetLabel: 'Budget',
	surfaceLabel: 'Surface',
	roomsLabel: 'Pièces',
	timingLabel: 'Délai',
	clientComment: 'Commentaire du client',
	lookingForLabel: 'Recherche',
	publishedBy: 'Publié par',
	publishedOn: 'publié le',
} as const;

// ============================================================================
// TOAST MESSAGES
// ============================================================================

export const SEARCH_AD_TOAST_MESSAGES = {
	// CRUD operations
	FETCH_ERROR: 'Impossible de charger les annonces',
	CREATE_SUCCESS: 'Annonce de recherche créée avec succès',
	CREATE_ERROR: "Erreur lors de la création de l'annonce",
	UPDATE_SUCCESS: 'Annonce mise à jour avec succès',
	UPDATE_ERROR: "Erreur lors de la mise à jour de l'annonce",
	DELETE_SUCCESS: 'Annonce supprimée avec succès',
	DELETE_ERROR: "Erreur lors de la suppression de l'annonce",

	// Status changes
	STATUS_UPDATE_SUCCESS: "Statut de l'annonce mis à jour",
	STATUS_UPDATE_ERROR: 'Erreur lors de la mise à jour du statut',
	PAUSE_SUCCESS: 'Annonce mise en pause',
	RESUME_SUCCESS: 'Annonce réactivée',
	ARCHIVE_SUCCESS: 'Annonce archivée',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

export const SEARCH_AD_ENDPOINTS = {
	LIST: '/search-ads',
	CREATE: '/search-ads',
	GET_BY_ID: (id: string) => `/search-ads/${id}`,
	UPDATE: (id: string) => `/search-ads/${id}`,
	DELETE: (id: string) => `/search-ads/${id}`,
	UPDATE_STATUS: (id: string) => `/search-ads/${id}/status`,
	MY_SEARCH_ADS: '/search-ads/my-search-ads',
	SEARCH: '/search-ads/search',
	NEARBY: '/search-ads/nearby',
} as const;

// ============================================================================
// ROUTES
// ============================================================================

export const SEARCH_AD_ROUTES = {
	LIST: '/search-ads',
	CREATE: '/search-ads/create',
	EDIT: (id: string) => `/search-ads/edit/${id}`,
	DETAIL: (id: string) => `/search-ads/${id}`,
	MY_ADS: '/mesannonces',
	MY_SEARCH_ADS: '/dashboard/my-search-ads',
} as const;

// ============================================================================
// BUDGET RANGES
// ============================================================================

export const BUDGET_RANGES = [
	{ label: 'Moins de 100 000 €', value: '0-100000' },
	{ label: '100 000 € - 200 000 €', value: '100000-200000' },
	{ label: '200 000 € - 300 000 €', value: '200000-300000' },
	{ label: '300 000 € - 400 000 €', value: '300000-400000' },
	{ label: '400 000 € - 500 000 €', value: '400000-500000' },
	{ label: '500 000 € - 750 000 €', value: '500000-750000' },
	{ label: '750 000 € - 1 000 000 €', value: '750000-1000000' },
	{ label: 'Plus de 1 000 000 €', value: '1000000+' },
] as const;

// ============================================================================
// ROOM OPTIONS
// ============================================================================

export const ROOM_OPTIONS = [
	{ label: '1 pièce', value: 1 },
	{ label: '2 pièces', value: 2 },
	{ label: '3 pièces', value: 3 },
	{ label: '4 pièces', value: 4 },
	{ label: '5+ pièces', value: 5 },
] as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const SEARCH_AD_ERRORS = {
	NOT_FOUND: 'Recherche introuvable',
	LOADING_FAILED: 'Erreur lors du chargement de la recherche',
	SAVE_FAILED: "Erreur lors de l'enregistrement de la recherche",
	DELETE_FAILED: 'Erreur lors de la suppression de la recherche',
} as const;

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const SEARCH_AD_LOADING = {
	PAGE: 'Chargement des recherches...',
	DETAILS: 'Chargement des détails...',
	SAVING: 'Enregistrement en cours...',
} as const;

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

export const SEARCH_AD_CONFIRMATION_DIALOGS = {
	// Delete Search Ad
	DELETE_TITLE: 'Êtes-vous sûr de vouloir supprimer cette recherche ?',
	DELETE_DESCRIPTION:
		'Cette action est irréversible et supprimera définitivement cette recherche.',
	DELETE_CONFIRM: 'Supprimer',
	DELETE_CANCEL: 'Annuler',
} as const;

// ============================================================================
// FORM PLACEHOLDERS
// ============================================================================

export const SEARCH_AD_PLACEHOLDERS = {
	// Client Info Form
	CLIENT_NAME: 'Nom et prénom du client',
	PROFESSION: 'Profession du client',
	AVAILABILITY_PREFERENCE:
		'Ex: En semaine après 18h, le samedi toute la journée...',
	MOVE_IN_DATE: 'MM/YYYY',

	// Location
	LOCATION_SEARCH: 'Rechercher et ajouter des villes...',
} as const;

// ============================================================================
// FORM SECTION TITLES
// ============================================================================

export const SEARCH_AD_FORM_SECTIONS = {
	BASIC_INFO: 'Informations générales',
	LOCATION: 'Localisation',
	BUDGET: 'Budget & financement',
	CHARACTERISTICS: 'Caractéristiques',
	SEARCH_CRITERIA: 'Critères de recherche du bien',
	PRIORITIES: 'Priorités personnelles',
	BADGES: "Badges pour l'annonce",
} as const;

// ============================================================================
// BADGE OPTIONS
// ============================================================================

export const SEARCH_AD_BADGE_OPTIONS = [
	'Urgent',
	'Premier achat',
	'Investissement',
	'Famille nombreuse',
	'Proche des écoles',
	'Proche des transports',
	'Calme et verdure',
	'Centre-ville',
	'Vue dégagée',
	'Lumineux',
	'Travaux acceptés',
	'Prêt à emménager',
	'Avec jardin',
	'Avec terrasse',
	'Avec balcon',
	'Avec parking',
	'Avec cave',
	'Animaux acceptés',
	'Accessible PMR',
	'Coup de cœur',
] as const;
