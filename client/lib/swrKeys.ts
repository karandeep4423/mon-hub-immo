/**
 * SWR Cache Keys
 * Centralized key management for consistent caching
 */

export const swrKeys = {
	// Collaborations
	collaborations: {
		list: (userId?: string) =>
			userId ? ['collaborations', 'list', userId] : null,
		detail: (id: string) => ['collaborations', 'detail', id],
		byProperty: (propertyId: string) => [
			'collaborations',
			'property',
			propertyId,
		],
		bySearchAd: (searchAdId: string) => [
			'collaborations',
			'searchAd',
			searchAdId,
		],
	},

	// Properties
	properties: {
		all: ['properties', 'all'],
		list: (userId?: string) =>
			userId ? ['properties', 'list', userId] : null,
		myProperties: (userId?: string, options?: Record<string, unknown>) =>
			userId ? ['properties', 'my-properties', userId, options] : null,
		stats: (userId?: string) =>
			userId ? ['properties', 'stats', userId] : null,
		detail: (id: string) => ['properties', 'detail', id],
		filtered: (filters: Record<string, unknown>) => [
			'properties',
			'filtered',
			filters,
		],
	},

	// Search Ads
	searchAds: {
		all: ['searchAds', 'all'],
		list: (filters?: Record<string, unknown>) => [
			'searchAds',
			'list',
			filters,
		],
		myAds: (userId?: string) =>
			userId ? ['searchAds', 'my-ads', userId] : null,
		detail: (id: string) => ['searchAds', 'detail', id],
	},

	// Appointments
	appointments: {
		myAppointments: (userId?: string) =>
			userId ? ['appointments', 'my-appointments', userId] : null,
		detail: (id: string) => ['appointments', 'detail', id],
		availability: (agentId: string) => [
			'appointments',
			'availability',
			agentId,
		],
	},

	// Dashboard
	dashboard: {
		stats: (userId?: string) =>
			userId ? ['dashboard', 'stats', userId] : null,
	},

	// User
	user: {
		current: () => ['user', 'current'],
		profile: (id: string) => ['user', 'profile', id],
	},

	// Favorites
	favorites: {
		list: (userId?: string) =>
			userId ? ['favorites', 'list', userId] : null,
	},

	// Chat
	chat: {
		conversations: (userId?: string) =>
			userId ? ['chat', 'conversations', userId] : null,
		messages: (peerId: string, userId?: string) =>
			userId ? ['chat', 'messages', peerId, userId] : null,
	},

	// Admin
	admin: {
		stats: ['admin', 'stats'],
		users: (filters?: Record<string, unknown>) => [
			'admin',
			'users',
			filters,
		],
		collaborations: ['admin', 'collaborations'],
		properties: (filters?: Record<string, unknown>) => [
			'admin',
			'properties',
			filters,
		],
	},
} as const;
