/**
 * Centralized status configurations for all entities
 * Ensures consistent badge styling and labels across the application
 */

export type BadgeVariant =
	| 'success'
	| 'warning'
	| 'error'
	| 'info'
	| 'default'
	| 'primary';

export interface StatusConfig {
	label: string;
	variant: BadgeVariant;
	className: string;
}

/**
 * Badge variant color mappings
 * These provide consistent Tailwind classes for each variant
 */
export const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
	success: 'bg-green-100 text-green-800',
	warning: 'bg-yellow-100 text-yellow-800',
	error: 'bg-red-100 text-red-800',
	info: 'bg-blue-100 text-blue-800',
	default: 'bg-gray-100 text-gray-800',
	primary: 'bg-cyan-100 text-cyan-800',
} as const;

/**
 * Property status configurations
 */
export const PROPERTY_STATUS_CONFIG: Record<string, StatusConfig> = {
	active: {
		label: 'Actif',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	draft: {
		label: 'Brouillon',
		variant: 'default',
		className: 'bg-gray-100 text-gray-800',
	},
	sold: {
		label: 'Vendu',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
	rented: {
		label: 'Loué',
		variant: 'info',
		className: 'bg-blue-100 text-blue-800',
	},
	archived: {
		label: 'Archivé',
		variant: 'warning',
		className: 'bg-yellow-100 text-yellow-800',
	},
} as const;

/**
 * Appointment status configurations
 */
export const APPOINTMENT_STATUS_CONFIG: Record<string, StatusConfig> = {
	pending: {
		label: 'En attente',
		variant: 'warning',
		className: 'bg-yellow-100 text-yellow-800',
	},
	confirmed: {
		label: 'Confirmé',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	cancelled: {
		label: 'Annulé',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
	completed: {
		label: 'Terminé',
		variant: 'info',
		className: 'bg-blue-100 text-blue-800',
	},
	rejected: {
		label: 'Refusé',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
} as const;

/**
 * Collaboration status configurations
 */
export const COLLABORATION_STATUS_CONFIG: Record<string, StatusConfig> = {
	pending: {
		label: 'En attente',
		variant: 'warning',
		className: 'bg-yellow-100 text-yellow-800',
	},
	active: {
		label: 'Active',
		variant: 'success',
		className: 'bg-green-100 text-green-800',
	},
	completed: {
		label: 'Terminée',
		variant: 'info',
		className: 'bg-blue-100 text-blue-800',
	},
	cancelled: {
		label: 'Annulée',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
	terminated: {
		label: 'Résiliée',
		variant: 'error',
		className: 'bg-red-100 text-red-800',
	},
} as const;

/**
 * Search Ad status configurations
 */
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

/**
 * Combined status configurations for all entity types
 */
export const STATUS_CONFIGS = {
	property: PROPERTY_STATUS_CONFIG,
	appointment: APPOINTMENT_STATUS_CONFIG,
	collaboration: COLLABORATION_STATUS_CONFIG,
	searchAd: SEARCH_AD_STATUS_CONFIG,
} as const;

/**
 * Type definitions for status values
 */
export type PropertyStatus = keyof typeof PROPERTY_STATUS_CONFIG;
export type AppointmentStatus = keyof typeof APPOINTMENT_STATUS_CONFIG;
export type CollaborationStatus = keyof typeof COLLABORATION_STATUS_CONFIG;
export type SearchAdStatus = keyof typeof SEARCH_AD_STATUS_CONFIG;

/**
 * Entity type for StatusBadge component
 */
export type EntityType = keyof typeof STATUS_CONFIGS;

/**
 * Helper function to get status configuration
 * @param entityType - Type of entity (property, appointment, etc.)
 * @param status - Status value
 * @returns Status configuration or undefined
 */
export function getStatusConfig(
	entityType: EntityType,
	status: string,
): StatusConfig | undefined {
	return STATUS_CONFIGS[entityType][
		status as keyof (typeof STATUS_CONFIGS)[typeof entityType]
	];
}

/**
 * Status value constants for type-safe comparisons
 * Use these instead of hardcoded strings
 */
export const COLLABORATION_STATUSES = {
	PENDING: 'pending' as const,
	ACCEPTED: 'accepted' as const,
	ACTIVE: 'active' as const,
	COMPLETED: 'completed' as const,
	REJECTED: 'rejected' as const,
	CANCELLED: 'cancelled' as const,
};

export const APPOINTMENT_STATUSES = {
	PENDING: 'pending' as const,
	CONFIRMED: 'confirmed' as const,
	CANCELLED: 'cancelled' as const,
	COMPLETED: 'completed' as const,
	REJECTED: 'rejected' as const,
};

export const SEARCH_AD_STATUSES = {
	ACTIVE: 'active' as const,
	PAUSED: 'paused' as const,
	FULFILLED: 'fulfilled' as const,
	SOLD: 'sold' as const,
	RENTED: 'rented' as const,
	ARCHIVED: 'archived' as const,
};

export const PROPERTY_STATUSES = {
	ACTIVE: 'active' as const,
	DRAFT: 'draft' as const,
	SOLD: 'sold' as const,
	RENTED: 'rented' as const,
	ARCHIVED: 'archived' as const,
};
