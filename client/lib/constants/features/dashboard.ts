/**
 * Dashboard Feature Constants
 * Centralized constants for dashboard pages (agent and apporteur)
 */

// ============================================================================
// DASHBOARD TEXT
// ============================================================================

export const DASHBOARD_UI_TEXT = {
	// Common
	overview: "Vue d'ensemble",
	myProperties: 'Mes annonces',
	myCollaborations: 'Mes collaborations',
	logout: 'Déconnexion',

	// Agent dashboard
	agentDashboard: 'Dashboard Agent',
	welcomeAgent: 'Voici votre tableau de bord monHubImmo',
	activeProperties: 'Annonces actives',
	totalViews: 'Vues totales',
	messages: 'Messages',
	manageProperties: 'Gérer mes annonces',

	// Apporteur dashboard
	apporteurDashboard: 'Dashboard Apporteur',
	successTips: 'Conseils pour réussir',
	updatePropertiesRegularly: 'Mettez à jour vos annonces régulièrement',
} as const;

// ============================================================================
// DASHBOARD TABS
// ============================================================================

export const DASHBOARD_TABS = {
	OVERVIEW: 'overview',
	PROPERTIES: 'properties',
	COLLABORATIONS: 'collaborations',
	APPOINTMENTS: 'appointments',
	SEARCH_ADS: 'searchAds',
	MESSAGES: 'messages',
} as const;

export type DashboardTab = (typeof DASHBOARD_TABS)[keyof typeof DASHBOARD_TABS];

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

export const DASHBOARD_ROUTES = {
	// Generic dashboard (redirects based on user type)
	BASE: '/dashboard',
	// Specific dashboards
	AGENT: '/dashboard-agent',
	APPORTEUR: '/dashboard-apporteur',
	// Settings & profile
	PROFILE: '/profile',
	SETTINGS: '/settings',
} as const;

// ============================================================================
// STATS LABELS
// ============================================================================

export const STATS_LABELS = {
	activeProperties: 'Annonces actives',
	totalViews: 'Vues totales',
	totalMessages: 'Messages',
	activeCollaborations: 'Collaborations actives',
	pendingAppointments: 'RDV en attente',
	confirmedAppointments: 'RDV confirmés',
	activeSearchAds: 'Recherches actives',
	propertiesShared: 'Biens partagés',
	leadsReceived: 'Leads reçus',
	commissionsEarned: 'Commissions',
} as const;

// ============================================================================
// QUICK ACTIONS
// ============================================================================

export const QUICK_ACTIONS = {
	addProperty: {
		label: 'Ajouter une annonce',
		icon: 'plus',
		href: '/dashboard-agent?tab=properties',
	},
	viewMessages: {
		label: 'Voir les messages',
		icon: 'message',
		href: '/chat',
	},
	viewCollaborations: {
		label: 'Mes collaborations',
		icon: 'users',
		href: '/dashboard-agent?tab=collaborations',
	},
	viewAppointments: {
		label: 'Mes rendez-vous',
		icon: 'calendar',
		href: '/dashboard-agent?tab=appointments',
	},
} as const;

// ============================================================================
// PROFILE COMPLETION PROMPTS
// ============================================================================

export const PROFILE_COMPLETION = {
	incomplete: {
		title: 'Complétez votre profil',
		message:
			'Renseignez vos informations pour accéder à toutes les fonctionnalités',
		action: 'Compléter mon profil',
	},
	complete: {
		title: 'Profil complet',
		message: 'Votre profil est à jour',
	},
} as const;

// ============================================================================
// EMPTY STATES
// ============================================================================

export const EMPTY_STATES = {
	noProperties: {
		title: 'Aucune annonce',
		message: 'Commencez par créer votre première annonce',
		action: 'Créer une annonce',
	},
	noCollaborations: {
		title: 'Aucune collaboration',
		message: "Explorez les biens d'autres agents pour commencer",
		action: 'Découvrir les biens',
	},
	noAppointments: {
		title: 'Aucun rendez-vous',
		message: 'Vos rendez-vous apparaîtront ici',
	},
	noSearchAds: {
		title: 'Aucune recherche',
		message: 'Créez une recherche pour trouver des biens pour vos clients',
		action: 'Créer une recherche',
	},
	noMessages: {
		title: 'Aucun message',
		message: 'Vos conversations apparaîtront ici',
	},
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type DashboardUITextKeys = keyof typeof DASHBOARD_UI_TEXT;
export type StatsLabelKeys = keyof typeof STATS_LABELS;
export type QuickActionKeys = keyof typeof QUICK_ACTIONS;
