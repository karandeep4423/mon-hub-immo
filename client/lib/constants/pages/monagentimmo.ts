/**
 * MonAgentImmo Page Constants
 * Agent search/discovery page at "/monagentimmo"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const MONAGENTIMMO_PAGE = {
	title: 'Trouver un agent immobilier',
	description:
		'Recherchez des agents immobiliers qualifiés près de chez vous',
	path: '/monagentimmo',
} as const;

// ============================================================================
// HERO SECTION
// ============================================================================

export const MONAGENTIMMO_HERO = {
	title: 'Trouvez votre agent immobilier',
	subtitle: 'Des professionnels qualifiés près de chez vous',
	ctaText: 'Prendre rendez-vous',
	ctaSecondary: 'Voir tous les agents',
} as const;

// ============================================================================
// SEARCH SECTION
// ============================================================================

export const MONAGENTIMMO_SEARCH = {
	title: 'Rechercher un agent',
	cityPlaceholder: 'Ville',
	postalCodePlaceholder: 'Code postal',
	searchButton: 'Rechercher',
	searching: 'Recherche en cours...',
	clearSearch: 'Effacer la recherche',
} as const;

// ============================================================================
// SEARCH CONFIG
// ============================================================================

export const MONAGENTIMMO_SEARCH_CONFIG = {
	scrollAmount: 320, // Carousel scroll distance in pixels
	autoScrollDelay: 300, // Delay before auto-scroll to results
	minSearchLength: 2, // Minimum characters for search
	debounceDelay: 300, // Debounce delay for search input
} as const;

// ============================================================================
// RESULTS SECTION
// ============================================================================

export const MONAGENTIMMO_RESULTS = {
	title: 'Agents disponibles',
	resultsCount: (count: number) =>
		`${count} agent${count !== 1 ? 's' : ''} trouvé${count !== 1 ? 's' : ''}`,
	noResults: 'Aucun agent trouvé',
	noResultsDescription:
		'Essayez de modifier vos critères de recherche ou explorez tous nos agents',
	loading: 'Chargement des agents...',
	viewProfile: 'Voir le profil',
	bookAppointment: 'Prendre rendez-vous',
} as const;

// ============================================================================
// FEATURE CARDS
// ============================================================================

export const MONAGENTIMMO_FEATURES = [
	{
		key: 'expertise',
		title: 'Expertise locale',
		description: 'Des agents qui connaissent parfaitement votre secteur',
		icon: 'map',
	},
	{
		key: 'availability',
		title: 'Disponibilité',
		description: 'Prenez rendez-vous facilement selon vos disponibilités',
		icon: 'calendar',
	},
	{
		key: 'professional',
		title: 'Professionnels certifiés',
		description: 'Tous nos agents sont des professionnels qualifiés',
		icon: 'badge',
	},
] as const;

// ============================================================================
// AGENT CARD
// ============================================================================

export const MONAGENTIMMO_AGENT_CARD = {
	cityLabel: 'Ville',
	postalCodeLabel: 'Code postal',
	phoneLabel: 'Téléphone',
	emailLabel: 'Email',
	agencyLabel: 'Agence',
	experienceLabel: "Années d'expérience",
	contactButton: 'Contacter',
	bookButton: 'Prendre RDV',
	viewButton: 'Voir le profil',
	unavailable: 'Non disponible',
} as const;

// ============================================================================
// CAROUSEL NAVIGATION
// ============================================================================

export const MONAGENTIMMO_CAROUSEL = {
	previousButton: 'Précédent',
	nextButton: 'Suivant',
	scrollLeft: 'Défiler vers la gauche',
	scrollRight: 'Défiler vers la droite',
} as const;

// ============================================================================
// EMPTY STATES
// ============================================================================

export const MONAGENTIMMO_EMPTY_STATES = {
	noAgents: {
		title: 'Aucun agent disponible',
		description:
			'Nous travaillons à ajouter de nouveaux agents dans votre région',
	},
	noSearchResults: {
		title: 'Aucun résultat',
		description:
			'Aucun agent ne correspond à vos critères de recherche. Essayez une autre ville ou code postal.',
	},
	error: {
		title: 'Erreur de chargement',
		description: 'Impossible de charger les agents. Veuillez réessayer.',
		retryButton: 'Réessayer',
	},
} as const;

// ============================================================================
// SECTIONS
// ============================================================================

export const MONAGENTIMMO_SECTIONS = {
	hero: 'hero',
	search: 'search',
	features: 'features',
	results: 'results',
	carousel: 'carousel',
} as const;
