/**
 * Search Ads List Page Constants
 * Search ads listing page at "/search-ads"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const SEARCH_ADS_LIST_PAGE = {
	title: 'Recherches en cours',
	description: "Découvrez les recherches actives d'apporteurs d'affaires",
	path: '/search-ads',
} as const;

// ============================================================================
// HEADER
// ============================================================================

export const SEARCH_ADS_LIST_HEADER = {
	title: 'Annonces de recherche',
	subtitle: 'Trouvez des clients pour vos biens',
	createButton: 'Créer une recherche',
	mySearchAdsButton: 'Mes recherches',
} as const;

// ============================================================================
// FILTERS
// ============================================================================

export const SEARCH_ADS_LIST_FILTERS = {
	title: 'Filtres',
	clearAll: 'Effacer tout',
	apply: 'Appliquer',
	location: {
		label: 'Localisation',
		placeholder: 'Ville ou code postal',
	},
	propertyType: {
		label: 'Type de bien',
		all: 'Tous types',
	},
	budget: {
		label: 'Budget',
		min: 'Min',
		max: 'Max',
		placeholder: 'Budget',
	},
	surface: {
		label: 'Surface',
		min: 'Min',
		max: 'Max',
		unit: 'm²',
	},
	rooms: {
		label: 'Pièces',
		any: 'Indifférent',
	},
	priority: {
		label: 'Priorité',
		all: 'Toutes',
		urgent: 'Urgent',
		high: 'Haute',
		medium: 'Moyenne',
		low: 'Basse',
	},
	status: {
		label: 'Statut',
		all: 'Tous',
		active: 'Actif',
		paused: 'En pause',
		fulfilled: 'Satisfait',
	},
} as const;

// ============================================================================
// SORT OPTIONS
// ============================================================================

export const SEARCH_ADS_LIST_SORT = {
	label: 'Trier par',
	options: {
		recent: 'Plus récents',
		oldest: 'Plus anciens',
		priority: 'Priorité',
		budgetHigh: 'Budget décroissant',
		budgetLow: 'Budget croissant',
		relevant: 'Pertinence',
	},
} as const;

// ============================================================================
// RESULTS
// ============================================================================

export const SEARCH_ADS_LIST_RESULTS = {
	resultsCount: (count: number) =>
		`${count} recherche${count !== 1 ? 's' : ''} trouvée${count !== 1 ? 's' : ''}`,
	noResults: 'Aucune recherche trouvée',
	noResultsDescription:
		'Aucune recherche ne correspond à vos critères. Essayez de modifier vos filtres.',
	loading: 'Chargement des recherches...',
	loadingMore: 'Chargement de plus de résultats...',
	endOfResults: 'Vous avez vu toutes les recherches',
} as const;

// ============================================================================
// CARD ACTIONS
// ============================================================================

export const SEARCH_ADS_LIST_CARD_ACTIONS = {
	viewDetails: 'Voir les détails',
	propose: 'Proposer un bien',
	contact: 'Contacter',
	share: 'Partager',
	favorite: {
		add: 'Ajouter aux favoris',
		remove: 'Retirer des favoris',
	},
} as const;

// ============================================================================
// CARD INFO
// ============================================================================

export const SEARCH_ADS_LIST_CARD = {
	budget: 'Budget',
	location: 'Localisation',
	propertyType: 'Type',
	surface: 'Surface',
	rooms: 'Pièces',
	priority: 'Priorité',
	status: 'Statut',
	postedBy: 'Publié par',
	postedOn: 'Publié le',
	expiresOn: 'Expire le',
	views: 'vues',
	proposals: 'propositions',
	radius: 'Rayon',
	km: 'km',
} as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const SEARCH_ADS_LIST_PAGINATION = {
	previous: 'Précédent',
	next: 'Suivant',
	page: 'Page',
	of: 'sur',
	itemsPerPage: 'Résultats par page',
	goToPage: 'Aller à la page',
} as const;

// ============================================================================
// CONFIG
// ============================================================================

export const SEARCH_ADS_LIST_CONFIG = {
	itemsPerPage: 20,
	itemsPerPageOptions: [10, 20, 50, 100],
	maxItemsPerPage: 100,
	loadMoreThreshold: 3, // Load more when 3 items from bottom
} as const;

// ============================================================================
// EMPTY STATES
// ============================================================================

export const SEARCH_ADS_LIST_EMPTY = {
	noSearchAds: {
		title: 'Aucune recherche disponible',
		description:
			"Il n'y a actuellement aucune recherche active. Revenez bientôt !",
		ctaText: 'Créer une recherche',
		ctaLink: '/search-ads/create',
	},
	noResults: {
		title: 'Aucun résultat',
		description:
			'Aucune recherche ne correspond à vos critères. Essayez de modifier vos filtres.',
		ctaText: 'Effacer les filtres',
	},
	error: {
		title: 'Erreur de chargement',
		description:
			'Impossible de charger les recherches. Veuillez réessayer.',
		retryButton: 'Réessayer',
	},
} as const;

// ============================================================================
// VIEW MODES
// ============================================================================

export const SEARCH_ADS_LIST_VIEW = {
	grid: {
		label: 'Grille',
		icon: 'grid',
	},
	list: {
		label: 'Liste',
		icon: 'list',
	},
	map: {
		label: 'Carte',
		icon: 'map',
	},
} as const;

// ============================================================================
// MAP VIEW
// ============================================================================

export const SEARCH_ADS_LIST_MAP = {
	title: 'Carte des recherches',
	cluster: (count: number) => `${count} recherches`,
	showList: 'Afficher la liste',
	hideList: 'Masquer la liste',
	zoomIn: 'Zoomer',
	zoomOut: 'Dézoomer',
	centerMap: 'Centrer la carte',
} as const;
