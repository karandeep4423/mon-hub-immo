/**
 * Dashboard Page Constants
 * Main dashboard at "/dashboard"
 */

// ============================================================================
// PAGE METADATA
// ============================================================================

export const DASHBOARD_PAGE = {
	title: 'Tableau de bord',
	description: 'Gérez votre activité immobilière',
	path: '/dashboard',
} as const;

// ============================================================================
// TAB NAVIGATION
// ============================================================================

export const DASHBOARD_TABS = {
	overview: {
		key: 'overview',
		label: "Vue d'ensemble",
		path: '/dashboard?tab=overview',
	},
	properties: {
		key: 'properties',
		label: 'Mes annonces',
		path: '/dashboard?tab=properties',
	},
	collaborations: {
		key: 'collaborations',
		label: 'Collaborations',
		path: '/dashboard?tab=collaborations',
	},
	appointments: {
		key: 'appointments',
		label: 'Rendez-vous',
		path: '/dashboard?tab=appointments',
	},
	searchAds: {
		key: 'searchAds',
		label: 'Recherches',
		path: '/dashboard?tab=searchAds',
	},
	messages: {
		key: 'messages',
		label: 'Messages',
		path: '/dashboard?tab=messages',
	},
} as const;

export type DashboardTab = keyof typeof DASHBOARD_TABS;

// ============================================================================
// STATS CARDS
// ============================================================================

export const DASHBOARD_STATS = {
	activeProperties: {
		label: 'Annonces actives',
		icon: 'home',
		color: 'blue',
	},
	totalViews: {
		label: 'Vues totales',
		icon: 'eye',
		color: 'green',
	},
	totalMessages: {
		label: 'Messages',
		icon: 'message',
		color: 'purple',
	},
	activeCollaborations: {
		label: 'Collaborations actives',
		icon: 'users',
		color: 'orange',
	},
	pendingAppointments: {
		label: 'RDV en attente',
		icon: 'calendar',
		color: 'yellow',
	},
	confirmedAppointments: {
		label: 'RDV confirmés',
		icon: 'check',
		color: 'green',
	},
} as const;

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export const DASHBOARD_QUICK_ACTIONS = {
	addProperty: {
		label: 'Ajouter une annonce',
		description: 'Créer une nouvelle annonce immobilière',
		icon: 'plus',
		href: '/dashboard?tab=properties',
		variant: 'primary',
	},
	viewMessages: {
		label: 'Voir les messages',
		description: 'Accéder à la messagerie',
		icon: 'message',
		href: '/chat',
		variant: 'secondary',
	},
	viewCollaborations: {
		label: 'Mes collaborations',
		description: 'Gérer mes collaborations',
		icon: 'users',
		href: '/dashboard?tab=collaborations',
		variant: 'secondary',
	},
	viewAppointments: {
		label: 'Mes rendez-vous',
		description: 'Consulter mon agenda',
		icon: 'calendar',
		href: '/dashboard?tab=appointments',
		variant: 'secondary',
	},
} as const;

// ============================================================================
// CONFIG
// ============================================================================

export const DASHBOARD_CONFIG = {
	refreshInterval: 30000, // 30 seconds
	maxRecentItems: 10,
	statsUpdateInterval: 60000, // 1 minute
	defaultTab: 'overview',
	itemsPerPage: 20,
} as const;

// ============================================================================
// WELCOME MESSAGES
// ============================================================================

export const DASHBOARD_WELCOME = {
	agent: {
		title: 'Bienvenue sur votre tableau de bord',
		subtitle: 'Gérez vos annonces, collaborations et rendez-vous',
	},
	apporteur: {
		title: 'Bienvenue sur votre espace apporteur',
		subtitle: 'Suivez vos recherches et collaborations',
	},
} as const;

// ============================================================================
// EMPTY STATES
// ============================================================================

export const DASHBOARD_EMPTY_STATES = {
	noProperties: {
		title: 'Aucune annonce pour le moment',
		description: 'Commencez par créer votre première annonce',
		ctaText: 'Créer une annonce',
		ctaLink: '/dashboard?tab=properties',
	},
	noCollaborations: {
		title: 'Aucune collaboration en cours',
		description: 'Explorez les annonces pour démarrer une collaboration',
		ctaText: 'Explorer les annonces',
		ctaLink: '/search-ads',
	},
	noAppointments: {
		title: 'Aucun rendez-vous programmé',
		description: 'Vos rendez-vous apparaîtront ici',
		ctaText: 'Gérer ma disponibilité',
		ctaLink: '/dashboard?tab=appointments',
	},
	noSearchAds: {
		title: 'Aucune recherche active',
		description: 'Créez une recherche pour trouver des biens',
		ctaText: 'Créer une recherche',
		ctaLink: '/search-ads/create',
	},
	noMessages: {
		title: 'Aucun message',
		description: 'Vos conversations apparaîtront ici',
		ctaText: 'Voir tous les messages',
		ctaLink: '/chat',
	},
} as const;

// ============================================================================
// SECTIONS
// ============================================================================

export const DASHBOARD_SECTIONS = {
	stats: 'stats',
	quickActions: 'quick-actions',
	recentActivity: 'recent-activity',
	overview: 'overview',
} as const;
