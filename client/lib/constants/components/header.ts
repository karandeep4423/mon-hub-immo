/**
 * Header Component Constants
 * Main navigation header
 */

// ============================================================================
// BRANDING
// ============================================================================

export const HEADER_BRANDING = {
	name: 'monhubimmo',
	parts: {
		prefix: 'mon',
		suffix: 'hubimmo',
	},
	logo: {
		alt: 'MonHubImmo Logo',
		width: 180,
		height: 40,
	},
} as const;

// ============================================================================
// NAVIGATION LINKS (PUBLIC)
// ============================================================================

export const HEADER_NAV_PUBLIC = [
	{
		label: 'Accueil',
		href: '/',
		icon: '🏠',
	},
	{
		label: 'Trouver un agent',
		href: '/monagentimmo',
		icon: '👤',
	},
	{
		label: 'Recherches',
		href: '/search-ads',
		icon: '🔍',
	},
] as const;

// ============================================================================
// NAVIGATION LINKS (AUTHENTICATED)
// ============================================================================

export const HEADER_NAV_AUTHENTICATED = [
	{
		label: 'Tableau de bord',
		href: '/dashboard',
		icon: '📊',
	},
	{
		label: 'Messages',
		href: '/chat',
		icon: '💬',
		badge: 'unread', // Shows unread count
	},
	{
		label: 'Rendez-vous',
		href: '/dashboard?tab=appointments',
		icon: '📅',
	},
] as const;

// ============================================================================
// USER MENU
// ============================================================================

export const HEADER_USER_MENU = {
	profile: {
		label: 'Mon profil',
		href: '/profile',
		icon: '👤',
	},
	dashboard: {
		label: 'Tableau de bord',
		href: '/dashboard',
		icon: '📊',
	},
	settings: {
		label: 'Paramètres',
		href: '/settings',
		icon: '⚙️',
	},
	logout: {
		label: 'Déconnexion',
		icon: '🚪',
	},
} as const;

// ============================================================================
// AUTH BUTTONS
// ============================================================================

export const HEADER_AUTH_BUTTONS = {
	login: {
		label: 'Se connecter',
		variant: 'primary',
		className:
			'px-4 py-2 rounded-md bg-[#6AD1E3] text-white text-sm hover:bg-[#59c4d8]',
	},
	signup: {
		label: 'Nous rejoindre',
		variant: 'secondary',
		className:
			'px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200',
	},
} as const;

// ============================================================================
// MOBILE MENU
// ============================================================================

export const HEADER_MOBILE_MENU = {
	toggleLabel: 'Toggle menu',
	closeLabel: 'Fermer le menu',
	openIcon: '☰',
	closeIcon: '✕',
	className: 'md:hidden bg-white border-t border-gray-200 shadow-lg',
	itemClassName:
		'block px-4 py-3 text-gray-700 hover:bg-gray-50 border-b border-gray-100',
} as const;

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export const HEADER_NOTIFICATIONS = {
	label: 'Notifications',
	emptyMessage: 'Aucune notification',
	viewAll: 'Voir tout',
	markAllRead: 'Tout marquer comme lu',
	badge: {
		max: 99,
		format: (count: number) => (count > 99 ? '99+' : count.toString()),
	},
} as const;

// ============================================================================
// SEARCH
// ============================================================================

export const HEADER_SEARCH = {
	placeholder: 'Rechercher...',
	label: 'Recherche',
	shortcut: '⌘K',
	noResults: 'Aucun résultat',
	categories: {
		agents: 'Agents',
		properties: 'Biens',
		searchAds: 'Recherches',
	},
} as const;

// ============================================================================
// STYLES
// ============================================================================

export const HEADER_STYLES = {
	container: 'bg-white shadow-lg relative z-10',
	wrapper: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
	content: 'flex justify-between items-center py-4',
	brandColor: '#6AD1E3',
	brandColorHover: '#59c4d8',
} as const;

// ============================================================================
// ACCESSIBILITY
// ============================================================================

export const HEADER_A11Y = {
	nav: 'Navigation principale',
	userMenu: 'Menu utilisateur',
	mobileMenu: 'Menu mobile',
	notifications: 'Notifications',
	profile: 'Profil utilisateur',
} as const;
