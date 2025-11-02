/**
 * Filter Constants
 * Centralized configuration for all filter-related default values and limits
 */

/**
 * Default filter values for home page
 */
export const FILTER_DEFAULTS = {
	/** Minimum price value (€) */
	PRICE_MIN: 0,
	/** Maximum price value (€) */
	PRICE_MAX: 10_000_000,
	/** Minimum surface area (m²) */
	SURFACE_MIN: 0,
	/** Maximum surface area (m²) */
	SURFACE_MAX: 100_000,
	/** Default radius for location search (km) */
	RADIUS_KM: 50,
	/** Number of items per page in listings */
	PAGE_SIZE: 6,
	/** Cooldown period after restoration before allowing filter resets (ms) */
	RESTORATION_COOLDOWN_MS: 800,
	/** Default radius for agent's "Mon secteur" area (km) */
	MY_AREA_RADIUS_KM: 50,
} as const;

/**
 * Available radius options for location search (km)
 */
export const RADIUS_OPTIONS = [5, 10, 20, 30, 50] as const;

/**
 * Property type options
 */
export const PROPERTY_TYPES = [
	'Appartement',
	'Maison',
	'Terrain',
	'Local commercial',
	'Bureaux',
	'Parking',
	'Autre',
] as const;

/**
 * User profile filter options
 */
export const PROFILE_TYPES = ['agent', 'apporteur'] as const;

/**
 * Content filter types for home page
 */
export const CONTENT_FILTERS = [
	'all',
	'myArea',
	'properties',
	'searchAds',
	'favorites',
] as const;

export type ContentFilterType = (typeof CONTENT_FILTERS)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type ProfileType = (typeof PROFILE_TYPES)[number];
export type RadiusOption = (typeof RADIUS_OPTIONS)[number];
